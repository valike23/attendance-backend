import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from 'src/database/entities/office.entity';
import { User } from 'src/database/entities/user.entity';
import { CreateOfficeDto, OfficeWithUsersDto } from 'src/database/schemas/dtos/office.dto';
import { ObjectId, Repository } from 'typeorm';

@Injectable()
export class OfficeService {
    constructor(
        @InjectRepository(Office)
        private officeRepo: Repository<Office>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async createOffice(office: CreateOfficeDto): Promise<Office> {
        const newOffice = this.officeRepo.create(office);
        return this.officeRepo.save(newOffice);
    }
    async getAllOffices(): Promise<Office[]> {
        return this.officeRepo.find();
    }

    async getOfficeWithUsers(id: string): Promise<OfficeWithUsersDto> {
        const office = await this.officeRepo.findOne({
            where: { _id: new ObjectId(id) },
          });

        if (!office) throw new NotFoundException('Office not found');

        let users :User[]= [];
        if (office.userIds && office.userIds.length > 0) {
            users = await this.userRepo.findByIds(office.userIds as ObjectId[]);
        }

        return {
            ...office,
            users,
        };
    }
}
