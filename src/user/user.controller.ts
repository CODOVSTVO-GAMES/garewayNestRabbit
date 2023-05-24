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
    user(@Body() requestDTO: RequestDTO, @Res() res: Response,@Query() params: string) {
        console.log("user header" + params)
        return this.userService.userResponser(requestDTO, res);
    }
}
