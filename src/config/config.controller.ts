import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get()
    dataGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.configService.configGetResponser(params, res)
    }
}
