import { Injectable } from '@nestjs/common';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { Response } from 'express';
import { TypesQueue } from 'src/TypesQueue';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { MasterResponseService } from 'src/master-response/master-response.service';

@Injectable()
export class MapService {

    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService,
        private readonly masterResponse: MasterResponseService
    ) { }

    async getMapResponser(params: any, res: Response) {
        const mres = await this.masterResponse.get(params, this.getMapHandler.bind(this), "map-get")
        res.status(mres.status).json(mres.resDto)
    }

    async getMapHandler(params: any) {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.getMapLogic(data)
    }

    async getMapLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_GET)
        if (responseServiceDTO.status != 200) {
            console.log('map servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }

    //------------------------------------------------

    async getEnemyResponser(params: any, res: Response) {
        const mres = await this.masterResponse.get(params, this.getEnemyHandler.bind(this), "enemy-get")
        res.status(mres.status).json(mres.resDto)
    }

    async getEnemyHandler(params: any) {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.getEnemyLogic(data)
    }

    async getEnemyLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_ENEMY_GET)
        if (responseServiceDTO.status != 200) {
            console.log('map servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }

    //--------------------------------------------------------------------------------------------

    async attackStatusResponser(body: object, res: Response) {
        const mres = await this.masterResponse.get(body, this.attackStatusLogic.bind(this), "attack-status")
        res.status(mres.status).json(mres.resDto)
    }

    async attackStatusLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_ATTACK)
        if (responseServiceDTO.status != 200) {
            console.log('post attack servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }

}
