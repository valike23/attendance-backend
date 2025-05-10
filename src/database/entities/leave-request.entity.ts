import { Entity, Column, ObjectId } from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum LeaveType {
  SICK = 'sick',
  CASUAL = 'casual',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  ANNUAL = 'annual',
  BEREAVEMENT = 'bereavement',
  UNPAID = 'unpaid',
}

@Entity()
export class LeaveRequest extends BaseEntityWithTimestamps {
  @Column('objectId')
  userId: ObjectId;

  @Column()
  reason: string;

   @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: LeaveStatus.PENDING }) // pending | approved | rejected
  status: LeaveStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column('objectId')
  reviewedBy?: ObjectId;

  @Column({ nullable: true })
  reviewedAt?: Date;
}
