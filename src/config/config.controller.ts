import { Body, Controller, Post, Res, Get, Query } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {

    constructor(private readonly configService: ConfigService) { }

    @Get()
    config(@Query('dto') params: string, @Res() res: Response) {
        console.log('1')
        return this.configService.configGetResponser(params, res)
    }
}
