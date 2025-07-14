import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectId } from "mongodb";
import { Attendance, AttendanceStatus } from "src/database/entities/attendance.entity";
import { Holiday, HolidayType } from "src/database/entities/holiday.entity";
import { Office } from "src/database/entities/office.entity";
import { Settings } from "src/database/entities/settings.entity";
import { MongoRepository } from "typeorm";

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

  
}
