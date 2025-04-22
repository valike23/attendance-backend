// office.entity.ts
import { Entity, Column, ObjectId} from 'typeorm';
import { BaseEntityWithTimestamps } from './base.entity';

@Entity()
export class Office extends BaseEntityWithTimestamps {


  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column({ nullable: true })
  hub?: string;

  @Column('array', { nullable: true })
  userIds?: ObjectId[];
}
