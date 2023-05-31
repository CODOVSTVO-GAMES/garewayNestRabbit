import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TypesQueue } from 'src/TypesQueue';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';

@Injectable()
export class ConfigService {
    constructor(private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async configGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.configGetHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-start-config', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    async configGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.configGetLogic(data)
    }

    async configGetLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerConfig(data, TypesQueue.START_CONFIG_GET)
        if (responseServiceDTO.status != 200) {
            console.log('config servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
