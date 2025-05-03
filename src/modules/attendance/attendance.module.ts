import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from 'src/database/entities/holiday.entity';
import { Attendance } from 'src/database/entities/attendance.entity';
import { Office } from 'src/database/entities/office.entity';
import { Settings } from 'src/database/entities/settings.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Holiday, Attendance, Office, Settings])],
  controllers: [AttendanceController],
  providers: [AttendanceService]
})
export class AttendanceModule {}
