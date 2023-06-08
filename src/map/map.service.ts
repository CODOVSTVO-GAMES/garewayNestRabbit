import { Injectable } from '@nestjs/common';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { Response } from 'express';
import { TypesQueue } from 'src/TypesQueue';

@Injectable()
export class MapService {

    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async getMapResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.getMapHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-map', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
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

    //---------------------------

    async getMyCoordsResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.getMyCoordsHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-map', 'get-coords', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    async getMyCoordsHandler(params: any) {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.getMyCoordsLogic(data)
    }

    async getMyCoordsLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_GET_MY_COORDS)
        if (responseServiceDTO.status != 200) {
            console.log('map servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
