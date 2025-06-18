import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Office } from 'src/database/entities/office.entity';
import { User } from 'src/database/entities/user.entity';
import { CreateOfficeDto, OfficeWithUsersDto } from 'src/database/schemas/dtos/office.dto';
import { DataSource,  MongoRepository,  Repository } from 'typeorm';

@Injectable()
export class OfficeService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Office)
        private officeRepo: Repository<Office>,
        @InjectRepository(User)
        private userRepo: MongoRepository<User>,
    ) { }

    async createOffice(office: CreateOfficeDto): Promise<Office> {
        const newOffice = this.officeRepo.create(office);
        return this.officeRepo.save(newOffice);
    }

    async createorUpdate(office: CreateOfficeDto): Promise<Office> {
      const myOffice = await this.officeRepo.findOne({where:{name: office.name}});
      if(!myOffice){
         const newOffice = this.officeRepo.create(office);
        return this.officeRepo.save(newOffice);
      }
      else {
      const resp = await this.officeRepo.update({hub: myOffice.hub}, {address: office.address, latitude: office.latitude, longitude: office.longitude});
      return {_id: myOffice._id,address: office.address, 
        longitude: office.longitude, name: myOffice.name,updatedAt: new Date(),
        latitude: office.latitude, createdAt: myOffice.createdAt}
      }
      
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

    async addUsersToOffice(officeId: string, userIds: string[]): Promise<Office> {
        const office = await this.officeRepo.findOne({
          where: { _id: new ObjectId(officeId) },
        });
      
        if (!office) {
          throw new NotFoundException('Office not found');
        }
      
        const objectIds = userIds.map(id => new ObjectId(id));
      
        const foundUsers = await this.userRepo.find({
            where: {
              _id: { $in: objectIds }, // MongoDB query to match user IDs
            },
          });
        
      
        if (foundUsers.length !== objectIds.length) {
          throw new BadRequestException('Some users were not found');
        }
      
        const updatedUserIds = Array.from(new Set([
          ...(office.userIds || []).map(id => id.toString()),
          ...objectIds.map(id => id.toString()),
        ])).map(id => new ObjectId(id));
      
        office.userIds = updatedUserIds;
        await this.officeRepo.save(office);
      
        await Promise.all(
          foundUsers.map(user => {
            user.officeId = new ObjectId(officeId);
            return this.userRepo.save(user);
          }),
        );
      
        return office;
      }
      
      
      
}
