import {
    Controller,
    Post,
    Body,
    Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    user(@Body() body: object, @Res() res: Response) {
        return this.userService.userResponser(body, res);
    }
}
