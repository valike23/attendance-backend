import { Column, Entity } from "typeorm";
import { BaseEntityWithTimestamps } from "./base.entity";


@Entity()
export class Hub extends BaseEntityWithTimestamps {
 
    
      @Column()
      name: string;

      @Column()
      id: number;

      @Column()
      code: string;

}
