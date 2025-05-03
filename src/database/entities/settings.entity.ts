

import { Entity, Column } from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';

@Entity()
export class Settings extends BaseEntityWithTimestamps {
  @Column({ default: '09:00' }) // 9 AM
  workStartTime: string; // Format: 'HH:mm'

  @Column({ default: 60 }) // 60 minutes (1 hour)
  allowedLateMinutes: number;
}
