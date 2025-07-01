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
import { compare, hash } from 'bcryptjs';
import { MongoRepository, ObjectId, Repository } from 'typeorm';
import { Office } from 'src/database/entities/office.entity';
import { AuthHelper } from 'src/helpers/auth.helper';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Permission)
        private permissionRepo: MongoRepository<Permission>,
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        @InjectRepository(Office)
        private officeRepo: MongoRepository<Office>,
        private readonly jwtService: JwtService,
        private readonly authHelper: AuthHelper,
    ) { }

    // TODO: seed both dbs with roles and permissions
    async login(email: string, password: string): Promise<{}> {
        let user = await this.userRepo.findOne({ where: { email } });
      
        if (!user) {
          const proUser = await this.getUserFromPro(email, password);
          console.log('the prouser is', proUser);
          if (!proUser) {
            throw new UnauthorizedException('Invalid credentials 2');
          }
      
          const hashedPassword = await hash(password, config.GENERAL.salt);
          await this.userRepo.insert({
            department: proUser.data?.user.department,
            email: proUser.data?.user.email,
            name: proUser.data?.user.name,
            phone: proUser.data?.user.phone,
            role: proUser.data?.user.role,
            password: hashedPassword,
          });
      
          user = await this.userRepo.findOne({ where: { email } });
      
          if (!user) {
            throw new InternalServerErrorException('User not found after creation');
          }
        }
      
        const isPasswordMatching = await compare(password, user.password);
        if (!isPasswordMatching) throw new UnauthorizedException('Invalid credentials p');
      
        const permissions = await this.authHelper.getEffectivePermissions(user);
        user.customPermissionIds = permissions.map(permission => permission._id);
      
      
      
        const { password: userPassword, ...userWithoutPassword } = user;
      
        // 👇 Attach the Office
        let office : any= null;
        if (user.officeId) {
          office = await this.officeRepo.findOneById( user.officeId);
        }
        const payload = {
          sub: user._id.toString(),
          email: user.email,
          role: user.role,
          customPermissionIds: user.customPermissionIds,
          office
        };
      
        const token = await this.jwtService.signAsync(payload);
        return { 
          user: { 
            ...userWithoutPassword,
            office, // <=== here is the office info
          },
          permissions,
          token 
        };
      }

      async getAllUsers(){
        return this.userRepo.find();
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
