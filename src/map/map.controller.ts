import { Controller, Res, Get, Query, Headers } from '@nestjs/common';
import { MapService } from './map.service';
import { Response } from 'express';

@Controller('map')
export class MapController {

    constructor(private readonly mapService: MapService) { }

    @Get()
    mapGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.mapService.getMapResponser(params, res)
    }

    @Get()
    enemyGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.mapService.getMapResponser(params, res)
    }
}
