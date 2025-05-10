// src/modules/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Role } from 'src/database/entities/role.entity';
import { CreateRoleDto } from 'src/database/schemas/dtos/login.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: MongoRepository<Role>,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepo.create({
      ...dto,
      permissionIds: dto.permissionIds?.map(id => new ObjectId(id)),
    });

    return await this.roleRepo.save(role);
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepo.find();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
}
