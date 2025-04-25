// src/common/entities/base.entity.ts
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ObjectIdColumn, ObjectId } from 'typeorm';

export abstract class BaseEntityWithTimestamps {

  @ObjectIdColumn()
  _id: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
