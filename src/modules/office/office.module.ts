import { Module } from '@nestjs/common';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from 'src/database/entities/office.entity';
import { User } from 'src/database/entities/user.entity';
import { Hub } from 'src/database/entities/hub.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Office, User, Hub])],
  controllers: [OfficeController],
  providers: [OfficeService]
})
export class OfficeModule {}
