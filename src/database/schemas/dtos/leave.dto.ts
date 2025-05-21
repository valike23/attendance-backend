import { IsDateString, IsNotEmpty } from 'class-validator';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus, LeaveType } from 'src/database/entities/leave-request.entity';
export class CreateLeaveRequestDto {
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  startDate: string;
  
   @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsDateString()
  endDate: string;
}


export class ReviewLeaveRequestDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class LeaveDashboardDto {
  leaves: number;
  approved: number;
  pending: number;
  rejected: number;
}
