import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { MonitoringService } from 'src/monitoring/monitoring.service';

@Injectable()
export class EventsService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async eventsResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.eventsHandler(body)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
                msg = e
            } else if (e == 'ECONNREFUSED') {
                status = 408//повторить запрос
                msg = e
            } else if (e == 'timeout') {
                console.log('Сервис не отвечает но запрос положен в очередь')
                msg = e
                //log
            } else {
                status == 400//хз че делать
                msg = 'Неизвестная ошибка. Статус: ' + status
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        // console.log("event Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        this.monitoringService.sendLog('gateway-events', 'save', status, msg, JSON.stringify(body), deltaTime)
        return
    }

    async eventsHandler(body: object): Promise<ResponseServiceDTO> {
        return this.eventsLogic(body)
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
