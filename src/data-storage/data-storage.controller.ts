import { Body, Controller, Post, Res, Get, Param, Query } from '@nestjs/common';
import { RequestDTO } from 'src/dto/RequestDTO';
import { Response } from 'express';
import { DataStorageService } from './data-storage.service';

@Controller('data-storage')
export class DataStorageController {

    constructor(private readonly dataStorageService: DataStorageService) {}

    @Post()
    dataPostStorage(@Body() requestDTO: RequestDTO, @Res() res: Response){
        return this.dataStorageService.dataStoragePostResponser(requestDTO, res)
    }

    @Get()
    dataGetStorage(@Query('dto') params : string, @Res() res: Response){
        return this.dataStorageService.dataStorageGetResponser(params, res)
    }
    
}
