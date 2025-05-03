import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CheckWorkingDayDto } from 'src/database/schemas/dtos/attendance.dto';

// src/modules/attendance/attendance.controller.ts

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(@Req() req) {
    return this.attendanceService.clockIn(req.user.sub); // req.user.sub = userId from JWT
  }

  @Post('break')
  async logBreak(@Req() req) {
    return this.attendanceService.logBreak(req.user.sub);
  }

  @Post('clock-out')
  async clockOut(@Req() req) {
    return this.attendanceService.clockOut(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('today/:date')
  async getAttendance(@Req() req, @Param('date') date: string) {
    console.log('Getting attendance for date:', date, req.user);
    const userId = req.user.sub; 
    return this.attendanceService.getAttendance(userId, new Date(date));
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-today')
  async checkIfTodayIsValidWorkingDay(@Query() query: CheckWorkingDayDto, @Req() req) {
    console.log('Checking if today is a valid working day...', req.user);
    const { officeId } = query;
    return this.attendanceService.isTodayValidAttendanceDay(officeId);
  }
}

