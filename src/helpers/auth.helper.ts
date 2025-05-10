import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectId } from "mongodb";
import { Permission } from "src/database/entities/permission.entity";
import { Role } from "src/database/entities/role.entity";
import { User } from "src/database/entities/user.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class AuthHelper {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: MongoRepository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepo: MongoRepository<Permission>
    ){}

     async getEffectivePermissions(user: User): Promise<Permission[]> {
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const role = await this.roleRepo.findOneBy({ _id: user.roleId });
        const allPermissionIds = [
            ...(role?.permissionIds || []),
            ...(user.customPermissionIds || []),
        ];

        console.log("total ids available", allPermissionIds);

        const uniquePermissionIds = Array.from(
            new Set(allPermissionIds.map(id => id.toString()))
        ).map(id => new ObjectId(id));

        console.log("unique ids ", uniquePermissionIds);
        const permissions = await this.permissionRepo.find({
            where: {
                _id: { $in:  uniquePermissionIds }
            }
        });
        console.log("my permissions", permissions);
        return permissions
    }
}