import { Controller, Res, Get, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { Response } from 'express';

@Controller('map')
export class MapController {

    constructor(private readonly mapService: MapService) { }

    @Get()
    dataGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.mapService.getMapResponser(params, res)
    }
}
