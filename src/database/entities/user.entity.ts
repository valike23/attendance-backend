/* eslint-disable prettier/prettier */
// src/user/user.entity.ts
import { Entity, Column, ObjectId } from "typeorm";
import { BaseEntityWithTimestamps } from "./base.entity";

@Entity()
export class User extends BaseEntityWithTimestamps {
 

  @Column({unique: true})
  email: string;

  @Column()
  name: string;

  @Column()
  department: string;

  @Column()
  phone: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  pushToken?: string;

  @Column()
  password: string;

  @Column('objectId')
  officeId: ObjectId;

  @Column('array', { nullable: true })
  customPermissionIds?: ObjectId[];

  @Column('objectId')
  roleId: ObjectId; 
}
