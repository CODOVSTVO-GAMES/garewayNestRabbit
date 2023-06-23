import { Controller, Res, Get, Query, Post, Body } from '@nestjs/common';
import { MapService } from './map.service';
import { Response } from 'express';

@Controller('map')
export class MapController {

    constructor(private readonly mapService: MapService) { }

    @Get('enemy')//получить врагов
    enemyGetStorage(@Query('dto') params: string, @Res() res: Response) {
        console.log(params)
        return this.mapService.getEnemyResponser(params, res)
    }

    @Post('enemy')//изменить статус боя
    enemyAttackStatus(@Body() body: object, @Res() res: Response) {
        return this.mapService.attackStatusResponser(body, res)
    }

    @Get()
    mapGetStorage(@Query('dto') params: string, @Res() res: Response) {
        return this.mapService.getMapResponser(params, res)
    }
}
