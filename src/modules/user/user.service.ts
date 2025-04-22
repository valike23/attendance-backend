/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { config } from 'src/config';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { LoginDto } from 'src/database/schemas/dtos/login.dto';
import { ProLoginResp } from 'src/database/types/user.types';
import { MongoRepository, ObjectId, Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Permission)
        private permissionRepo: MongoRepository<Permission>,
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        private readonly jwtService: JwtService 
    ) { }


    async login(email: string, password: string): Promise<{}> {
        let user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            const proUser = await this.getUserFromPro(email, password);
            if (!proUser) {
                throw new UnauthorizedException('Invalid credentials');
            }
            console.log(proUser.data?.user);
            const data = await this.userRepo.insert({
                department: proUser.data?.user.department,
                email: proUser.data?.user.email,
                name: proUser.data?.user.name,
                phone: proUser.data?.user.phone,
                role: proUser.data?.user.role,
                password,

            });

            console.log(data);

            user = await this.userRepo.findOne({ where: { email } });
            if (!user) {
                throw new InternalServerErrorException('User not found after creation');
            }


        }

        if (!user || user.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const permissions = await this.getEffectivePermissions(user);
        user.customPermissionIds = permissions.map(permission => permission.id);
        const payload = {
            sub: user.id.toString(), // Mongo ObjectId
            email: user.email,
            role: user.role,
          };
        
          const token = await this.jwtService.signAsync(payload);

        const { password: userPassword, ...userWithoutPassword } = user;
        console.log(userPassword);
        return { user: userWithoutPassword, permissions, token };
    }

    async getEffectivePermissions(user: User): Promise<Permission[]> {
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const role = await this.roleRepo.findOneBy({ id: user.roleId });

        const allPermissionIds = [
            ...(role?.permissionIds || []),
            ...(user.customPermissionIds || []),
        ];

        const uniquePermissionIds = Array.from(
            new Set(allPermissionIds.map(id => id.toString()))
        ).map(id => new ObjectId(id));

        return this.permissionRepo.find({
            where: {
                id: { $in: uniquePermissionIds }
            }
        });
    }




    private async getUserFromPro(email: string, password: string): Promise<Partial<ProLoginResp>> {
        try {
            const resp = await axios.post<LoginDto, AxiosResponse<ProLoginResp>>(config.GWXPRO.url + '/api/v1/auth/login', { email, password });

            if (resp.status === 200) {
                return resp.data;
            } else {
                throw new UnauthorizedException('Invalid credentials');
            }
        } catch (error) {
            console.error('Error connecting to Pro API:', error);
            throw new InternalServerErrorException('Error connecting to Pro API');
        }

    }
}
