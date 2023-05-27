import {
    Controller,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    Query,
} from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    user(@Body() data: object, @Res() res: Response, @Query() params: string) {
        console.log("user header" + JSON.stringify(params))
        return this.userService.userResponser(data, res);
    }
}
