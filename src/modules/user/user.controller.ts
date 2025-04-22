/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from 'src/database/schemas/dtos/login.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}
    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.userService.login(body.email, body.password);
    }
}
