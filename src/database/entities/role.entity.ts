import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';

@Entity()
export class Role extends BaseEntityWithTimestamps {
  

  @Column()
  name: string; // e.g., "admin", "staff"

  @Column('array')
  permissionIds: ObjectId[]; // List of permission ObjectIds
}