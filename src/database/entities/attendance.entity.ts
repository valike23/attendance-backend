

import { Entity, Column, ObjectId } from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
    LATE = 'late',
    ABSENT = 'absent',
    ON_LEAVE = 'on-leave',
    ON_GOING = 'on-going',
}

@Entity()
export class Attendance extends BaseEntityWithTimestamps {
  @Column('objectId')
  userId: ObjectId;

  @Column()
  date: Date; // stored in WAT timezone

  @Column({ nullable: true })
  resumptionTime?: Date;

  @Column({ nullable: true })
  breakTime?: Date;

  @Column({ nullable: true })
  endTime?: Date;

  @Column({ default: AttendanceStatus.ON_GOING })
  status: AttendanceStatus;
}
