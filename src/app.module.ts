/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config';
import { HolidayModule } from './modules/holiday/holiday.module';
import { UserModule } from './modules/user/user.module';
import { OfficeModule } from './modules/office/office.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: config.GENERAL.secret,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: config.MONGO.url,
      database: config.MONGO.dbName,
      synchronize: config.GENERAL.env !== 'production',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    HolidayModule,
    UserModule,
    OfficeModule,
    AttendanceModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
