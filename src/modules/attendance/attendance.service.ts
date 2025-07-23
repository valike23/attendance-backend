import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectId } from "mongodb";
import { Attendance, AttendanceStatus } from "src/database/entities/attendance.entity";
import { Holiday, HolidayType } from "src/database/entities/holiday.entity";
import { LeaveRequest } from "src/database/entities/leave-request.entity";
import { Office } from "src/database/entities/office.entity";
import { Settings } from "src/database/entities/settings.entity";
import { User } from "src/database/entities/user.entity";
import { Between, MongoRepository } from "typeorm";

  export type FlatAttendance = {
    user: string;
    date: string;
    status: any;
    resumptionTime: any;
    breakTime: any;
    endTime: any;
    isHoliday: boolean;
    onLeave: boolean;
  };

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: MongoRepository<Attendance>,
    @InjectRepository(Settings)
    private readonly settingsRepo: MongoRepository<Settings>,
    @InjectRepository(Office)
    private readonly officeRepo: MongoRepository<Office>,
    @InjectRepository(Holiday)
    private readonly holidayRepo: MongoRepository<Holiday>,
     @InjectRepository(User)
    private readonly userRepo: MongoRepository<User>,
     @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: MongoRepository<LeaveRequest>,
  ) {}

   async getTodayWATDate(): Promise<Date> {
    const nowUTC = new Date();
    const watOffsetMs = 60 * 60 * 1000; // GMT+1
    const nowWAT = new Date(nowUTC.getTime() + watOffsetMs);
    return new Date(nowWAT.getFullYear(), nowWAT.getMonth(), nowWAT.getDate());
  }

  private async getSettings() {
    let settings = await this.settingsRepo.findOne({});
   console.log("the final settings", settings);
    return settings;
  }

  async clockIn(userId: string): Promise<Attendance> {
    const today = await this.getTodayWATDate();
    const settings = await this.getSettings();
    if(!settings) throw new Error('Missing workStartTime in settings.');
    const [workHour, workMinute] = settings.workStartTime.split(':').map(Number);

    const expectedStart = new Date(today);
    expectedStart.setHours(workHour, workMinute, 0, 0);

    const now = new Date();
    const minutesLate = (now.getTime() - expectedStart.getTime()) / (1000 * 60);

    let status: AttendanceStatus;
    if (minutesLate <= settings.allowedLateMinutes) {
      status = AttendanceStatus.PRESENT;
    } else {
      status = AttendanceStatus.LATE;
    }

    let attendance = await this.attendanceRepo.findOne({
      where: { userId: new ObjectId(userId), date: today },
    });

    if (!attendance) {
      attendance = this.attendanceRepo.create({
        userId: new ObjectId(userId),
        date: today,
        resumptionTime: now,
        status,
      });
    } else {
      attendance.resumptionTime = now;
      attendance.status = status;
    }

    return this.attendanceRepo.save(attendance);
  }

  async logBreak(userId: string): Promise<Attendance> {
    const today = await this.getTodayWATDate();

    const attendance = await this.attendanceRepo.findOne({
      where: { userId: new ObjectId(userId), date: today },
    });

    if (!attendance) {
      throw new NotFoundException('Clock in first.');
    }

    attendance.breakTime = new Date();
    return this.attendanceRepo.save(attendance);
  }

  async clockOut(userId: string): Promise<Attendance> {
    const today = await this.getTodayWATDate();

    const attendance = await this.attendanceRepo.findOne({
      where: { userId: new ObjectId(userId), date: today },
    });

    if (!attendance) {
      throw new NotFoundException('Clock in first.');
    }

    attendance.endTime = new Date();
    attendance.status = AttendanceStatus.PRESENT; // or any other status you want to set
    return this.attendanceRepo.save(attendance);
  }

  async getAttendance(userId: string, date: Date): Promise<Attendance | null> {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return this.attendanceRepo.findOne({
      where: { userId: new ObjectId(userId), date: targetDate },
    });
  }

  async isTodayValidAttendanceDay(officeId: string): Promise<{ valid: boolean; reason?: string }> {
    const now = new Date();
    const watOffsetMs = 60 * 60 * 1000;
    const nowWAT = new Date(now.getTime() + watOffsetMs);
    const today = new Date(nowWAT.getFullYear(), nowWAT.getMonth(), nowWAT.getDate());

    const weekday = today.getDay(); // Sunday = 0
console.log('Today:', today, 'Weekday:', weekday, officeId);
    const office = await this.officeRepo.findOne({
      where: { _id: new ObjectId(officeId) },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }
    if(weekday === 0) {
      return { valid: false, reason: 'Sunday is not a working day' }; // Sunday is not a working day
    }
    if(weekday === 6) { 
      return { valid: false, reason: 'Saturday is not a working day' }; // Saturday is not a working day
    }
    // 1. Office-level excluded weekday
    if (office.remoteWorkDays?.includes(weekday)) {
      return { valid: false, reason: 'Office is closed on this weekday' };
    }

    // 2. Global holiday
    const globalHoliday = await this.holidayRepo.findOne({
      where: { date: today,  type: HolidayType.NATIONAL },
    });

    if (globalHoliday) {
      return { valid: false, reason: 'Global public holiday' };
    }


    return { valid: true };
  }

 async getAttendanceSummary(): Promise<Record<AttendanceStatus, number>> {
  const pipeline = [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ];

  const result = await this.attendanceRepo
    .aggregate(pipeline)
    .toArray() as unknown as { _id: string; count: number }[];

  const summary: Record<AttendanceStatus, number> = {
    [AttendanceStatus.PRESENT]: 0,
    [AttendanceStatus.LATE]: 0,
    [AttendanceStatus.ABSENT]: 0,
    [AttendanceStatus.ON_LEAVE]: 0,
    [AttendanceStatus.ON_GOING]: 0,
  };

  for (const row of result) {
    const status = row._id as AttendanceStatus;
    if (status in summary) {
      summary[status] = row.count;
    }
  }

  return summary;
}


async getUserAttendanceSummary(userId: string): Promise<Record<AttendanceStatus, number>> {
  const pipeline = [
    {
      $match: {
        userId: new ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ];

  const result = await this.attendanceRepo
    .aggregate(pipeline)
    .toArray() as unknown as { _id: string; count: number }[];

  const summary: Record<AttendanceStatus, number> = {
    [AttendanceStatus.PRESENT]: 0,
    [AttendanceStatus.LATE]: 0,
    [AttendanceStatus.ABSENT]: 0,
    [AttendanceStatus.ON_LEAVE]: 0,
    [AttendanceStatus.ON_GOING]: 0,
  };

  for (const row of result) {
    const status = row._id as AttendanceStatus;
    if (status in summary) {
      summary[status] = row.count;
    }
  }

  return summary;
}

private async getWorkingDays(start: Date, end: Date): Promise<number> {
    let count = 0;
    const current = new Date(start);

    const holidays = await this.holidayRepo.find({
      where: {
        date: Between(
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
        ),
      },
    });

    const holidayDates = new Set(holidays.map((h) => h.date));

    while (current <= end) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const isoDate = current.toISOString().split('T')[0];

      if (!isWeekend && !holidayDates.has(isoDate)) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private formatTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}


async getDashboardSummary(userId: string, dateStr?: string) {
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  const records = await this.attendanceRepo.find({
    where: {
      userId: new ObjectId(userId),
      date: {
        $gte: firstDay,
        $lte: lastDay,
      },
    },
    order: {
      date: 'DESC',
    },
  });

  const presentDays = records.filter(
    (record) => record.status === AttendanceStatus.PRESENT,
  ).length;

  const totalDays =await this.getWorkingDays(firstDay, lastDay);

  const lastCheckInTime = records[0]?.resumptionTime;

  return {
    present: presentDays,
    total: totalDays,
    lastCheckInTime: lastCheckInTime
      ? this.formatTime(lastCheckInTime)
      : null,
  };
}

async getUserAttendanceBreakdown(userId: string, dateStr?: string) {
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  const records = await this.attendanceRepo.find({
    where: {
      userId: new ObjectId(userId),
      date: {
        $gte: firstDay,
        $lte: lastDay,
      },
    },
  });

  const counts: Record<AttendanceStatus, number> = {
    present: 0,
    late: 0,
    absent: 0,
    'on-leave': 0,
    'on-going': 0,
  };

  for (const record of records) {
    const status = record.status;
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  }

  return {
    ...counts,
    total: records.length,
  };
}

async getPaginatedFlatAttendance(
  officeId: any,
  startDate: Date,
  endDate: Date,
  page = 1,
  limit = 7,
) {
 

  const allDates = this.getDateStringsInRange(startDate, endDate);
  const totalDates = allDates.length;

  const paginatedDates = allDates.slice((page - 1) * limit, page * limit);

  const users = await this.userRepo.find({ officeId });

  if (users.length === 0) return [];

  const userIds = users.map(user => user._id);

  const attendances = await this.attendanceRepo.find({
    userId: { $in: userIds },
    date: {
      $gte: new Date(paginatedDates[0]),
      $lte: new Date(paginatedDates[paginatedDates.length - 1]),
    },
  });

  const holidays = await this.holidayRepo.find({
    date: { $in: paginatedDates },
  });

  const leaves = await this.leaveRequestRepo.find({
    userId: { $in: userIds },
    status: 'approved',
    $or: [
      { startDate: { $lte: new Date(paginatedDates[paginatedDates.length - 1]) }, endDate: { $gte: new Date(paginatedDates[0]) } },
    ],
  });

  const holidayMap = new Set(holidays.map(h => h.date));
  const leaveMap = new Map();

  for (const leave of leaves) {
    const range = this.getDateStringsInRange(leave.startDate, leave.endDate);
    range.forEach(dateStr => {
      if (!leaveMap.has(leave.userId.toString())) {
        leaveMap.set(leave.userId.toString(), new Set());
      }
      leaveMap.get(leave.userId.toString()).add(dateStr);
    });
  }

  const attendanceMap = new Map(); 
  for (const a of attendances) {
    const key = `${a.userId.toString()}|${a.date.toISOString().split('T')[0]}`;
    attendanceMap.set(key, a);
  }



  const flatResults: FlatAttendance[] = [];

  for (const user of users) {
    for (const dateStr of paginatedDates) {
      const key = `${user._id.toString()}|${dateStr}`;
      const attendance = attendanceMap.get(key);

      flatResults.push({
        user: user.name,
        date: dateStr,
        status: attendance?.status || 'absent',
        resumptionTime: attendance?.resumptionTime || null,
        breakTime: attendance?.breakTime || null,
        endTime: attendance?.endTime || null,
        isHoliday: holidayMap.has(dateStr),
        onLeave: leaveMap.get(user._id.toString())?.has(dateStr) || false,
      });
    }
  }

  return {
    data: flatResults,
    meta: {
      currentPage: page,
      perPage: limit,
      totalDates,
      totalPages: Math.ceil(totalDates / limit),
    },
  };
}

private getDateStringsInRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

  
}
