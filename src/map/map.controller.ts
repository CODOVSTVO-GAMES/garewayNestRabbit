import { Controller, Res, Get, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { Response } from 'express';

@Controller('map')
export class MapController {

    constructor(private readonly mapService: MapService) { }

    @Get()
    dataGetStorage(@Query('dto') params: string, @Res() res: Response) {
        console.log(res.header)
        console.log(JSON.stringify(res.header))
        return this.mapService.getMapResponser(params, res)
    }
}
