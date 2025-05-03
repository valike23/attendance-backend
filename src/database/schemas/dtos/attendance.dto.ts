
import { Matches } from "class-validator";

export class CheckWorkingDayDto {
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Mongo ObjectId' })
    officeId: string;
  
  }