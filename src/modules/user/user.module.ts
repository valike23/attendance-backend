/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from 'src/database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';

@Module({
   imports: [TypeOrmModule.forFeature([User, Permission, Role]),  JwtModule.register({
         secret: config.GENERAL.secret, // use env in production
         signOptions: { expiresIn: '7d' },
       }),],
  controllers: [UserController],
  providers: [UserService],
  exports: [JwtModule]
})
export class UserModule {}
