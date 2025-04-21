/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config';
import { HolidayModule } from './modules/holiday/holiday.module';

@Module({
  imports: [
   
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: config.MONGO.url,
      database: config.MONGO.dbName,
      synchronize: config.GENERAL.env !== 'production',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    HolidayModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
