import { Injectable } from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
import { Response } from 'express';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';

@Injectable()
export class EventsService {

    constructor(private readonly rabbitService: RabbitMQService) { }

    async eventsResponser(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200

        try {
            const responseServiceDTO = await this.eventsHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
            } else if (e == 'ECONNREFUSED') {
                status = 408//повторить запрос
            } else if (e == 'timeout') {
                console.log('Сервис не отвечает но запрос положен в очередь')
                //log
            } else {
                status == 400//хз че делать
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("event Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
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
        const responseServiceDTO = await this.rabbitService.questionerEvents(new RequestServiceDTO(data), TypesQueue.EVENTS_POST)
        if (responseServiceDTO.status != 200) {
            console.log('events servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
}
