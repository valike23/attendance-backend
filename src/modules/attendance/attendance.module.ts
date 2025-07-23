import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from 'src/database/entities/holiday.entity';
import { Attendance } from 'src/database/entities/attendance.entity';
import { Office } from 'src/database/entities/office.entity';
import { Settings } from 'src/database/entities/settings.entity';
import { User } from 'src/database/entities/user.entity';
import { LeaveRequest } from 'src/database/entities/leave-request.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Holiday, Attendance, Office, Settings, User, LeaveRequest])],
  controllers: [AttendanceController],
  providers: [AttendanceService]
})
export class AttendanceModule {}
