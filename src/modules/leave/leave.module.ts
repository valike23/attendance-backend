import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from 'src/database/entities/leave-request.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/helpers/auth.helper';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, Role, Permission]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService, JwtService, AuthHelper]
})
export class LeaveModule {}
