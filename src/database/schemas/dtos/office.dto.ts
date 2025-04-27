// create-office.dto.ts
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'typeorm';
import { Office } from 'src/database/entities/office.entity';
import { User } from 'src/database/entities/user.entity';

export class CreateOfficeDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @IsOptional()
  @IsString()
  hub?: string;


}

export class OfficeWithUsersDto extends Office {
  users: User[];
}

export class AddUsersToOfficeDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

