import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';

@Entity()
export class Permission extends BaseEntityWithTimestamps {

  @Column()
  name: string; // e.g., "create_user", "view_report"

  @Column()
  description: string;
}