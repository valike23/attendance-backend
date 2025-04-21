/* eslint-disable prettier/prettier */
// holiday.entity.ts
import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

export enum HolidayType {
  NATIONAL = 'Public Holiday',
  OBSERVANCE = 'Observance',
  SEASON = 'Season',
}

@Entity()
export class Holiday {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  date: string; // ISO format: "2025-12-25"

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: false, nullable: false })
  urlId: string; // Unique identifier for the holiday

  @Column()
  type: HolidayType;
}
