import { Module } from '@nestjs/common';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from 'src/database/entities/office.entity';
import { User } from 'src/database/entities/user.entity';
import { Hub } from 'src/database/entities/hub.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { Attendance } from 'src/database/entities/attendance.entity';
import { Settings } from 'src/database/entities/settings.entity';
import { Holiday } from 'src/database/entities/holiday.entity';
import { LeaveRequest } from 'src/database/entities/leave-request.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Office, User, Hub,
     Attendance,Settings, Holiday, LeaveRequest])],
  controllers: [OfficeController],
  providers: [OfficeService, AttendanceService]
})
export class OfficeModule {}
