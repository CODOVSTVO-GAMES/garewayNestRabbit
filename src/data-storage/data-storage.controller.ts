import { Body, Controller, Post, Res, Get, Query } from '@nestjs/common';
import { Response } from 'express';
import { DataStorageService } from './data-storage.service';

@Controller('data-storage')
export class DataStorageController {

    constructor(private readonly dataStorageService: DataStorageService) { }

    @Post()
    dataPostStorage(@Body() body: object, @Res() res: Response) {
        return this.dataStorageService.dataStoragePostResponser(body, res)
    }

    @Get()
    dataGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.dataStorageService.dataStorageGetResponser(params, res)
    }

}
