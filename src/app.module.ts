/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config';
import { HolidayModule } from './modules/holiday/holiday.module';
import { UserModule } from './modules/user/user.module';
import { OfficeModule } from './modules/office/office.module';

@Module({
  imports: [
   
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: config.MONGO.url,
      database: config.MONGO.dbName,
      synchronize: config.GENERAL.env !== 'production',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    HolidayModule,
    UserModule,
    OfficeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
