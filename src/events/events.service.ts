import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class EventsService {
    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async eventsResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.eventsLogic(body)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
            if (e == 'timeout') {
                console.log('Сервис не отвечает но запрос положен в очередь')
                status = 200
                //log
            }
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-events', 'save', status, msg, JSON.stringify(body), deltaTime)
        return
    }

    async eventsLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerEvents(data, TypesQueue.EVENTS_POST)
        if (responseServiceDTO.status != 200) {
            console.log('events servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
}
