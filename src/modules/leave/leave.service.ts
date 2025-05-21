import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { LeaveRequest, LeaveStatus } from 'src/database/entities/leave-request.entity';
import { CreateLeaveRequestDto, LeaveDashboardDto, ReviewLeaveRequestDto } from 'src/database/schemas/dtos/leave.dto';
import { MongoRepository } from 'typeorm';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: MongoRepository<LeaveRequest>
  ) { }

async getDashboardStats(userId: string): Promise<LeaveDashboardDto> {
    const userObjectId = new ObjectId(userId);
    console.log("the sum user is", userId, userObjectId);
    const [leaves, approved, pending, rejected] = await Promise.all([
      // total requests for this user
      this.leaveRepo.count({ where: { userId: userObjectId } }),

      // approved for this user
      this.leaveRepo.count({
        where: { userId: userObjectId, status: LeaveStatus.APPROVED },
      }),

      // pending for this user
      this.leaveRepo.count({
        where: { userId: userObjectId, status: LeaveStatus.PENDING },
      }),

      // rejected for this user
      this.leaveRepo.count({
        where: { userId: userObjectId, status: LeaveStatus.REJECTED },
      }),
    ]);

    return { leaves, approved, pending, rejected };
  }
  async applyForLeave(userId: string, dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    console.log('the created app here', dto);
    const leave = this.leaveRepo.create({
      userId: new ObjectId(userId),
      reason: dto.reason,
      leaveType: dto.leaveType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: LeaveStatus.PENDING,
    });
    return this.leaveRepo.save(leave);
  }

  async reviewLeaveRequest(id: string, adminId: string, dto: ReviewLeaveRequestDto): Promise<LeaveRequest> {
    const leave = await this.leaveRepo.findOne({ where: { _id: new ObjectId(id) } });
    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== 'pending') throw new BadRequestException('Already reviewed');

    leave.status = dto.status;
    leave.reviewedBy = new ObjectId(adminId);
    leave.reviewedAt = new Date();

    if (dto.status === LeaveStatus.REJECTED) {
      if (!dto.rejectionReason) throw new BadRequestException('Rejection reason required');
      leave.rejectionReason = dto.rejectionReason;
    }

    return this.leaveRepo.save(leave);
  }


}
