import { Inject, Injectable } from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
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

    async eventsResponser(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.eventsHandler(requestDTO)
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
                msg = 'Неизвестная ошибка. Статус: '+ status
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        // console.log("event Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        this.monitoringService.sendLog('gateway-events', 'save', status, msg, JSON.stringify(requestDTO), deltaTime)
        return
    }

    async eventsHandler(requestDTO: RequestDTO): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = requestDTO.data;
        } catch {
            console.log('Ошибка парсинга')
            throw "parsing error"
        }
        return this.eventsLogic(data)
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
