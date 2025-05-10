import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectId } from "mongodb";
import { Permission } from "src/database/entities/permission.entity";
import { User } from "src/database/entities/user.entity";
import { CreatePermissionDto } from "src/database/schemas/dtos/login.dto";
import { MongoRepository } from "typeorm";


@Injectable()

export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepo: MongoRepository<Permission>,
        @InjectRepository(User)
        private readonly userRepo: MongoRepository<User>,
    ) { }

     async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepo.create(dto);
    return await this.permissionRepo.save(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepo.find();
  }

  // user.service.ts
async assignPermissionsToUser(userId: string, permissionIds: string[]) {
  const user = await this.userRepo.findOne({ where: { _id: new ObjectId(userId) } });
  if (!user) throw new NotFoundException('User not found');

  // merge and deduplicate
  const updatedPermissions = Array.from(
    new Set([...(user.customPermissionIds || []), ...permissionIds.map(id => new ObjectId(id))])
  );

  user.customPermissionIds = updatedPermissions;
  await this.userRepo.save(user);

  return { message: 'Permissions assigned successfully', user };
}

}