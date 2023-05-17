import { Inject, Injectable } from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { TypesQueue } from 'src/TypesQueue';

@Injectable()
export class UserService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async userResponser(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.userHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
                msg = e
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
                msg = e
            } else {
                status == 400//хз че делать
                msg = 'Неизвестная ошибка. Статус: ' + status
            }
            console.log("Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        // console.log("session update Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        this.monitoringService.sendLog('gateway-user', 'get', status, msg, JSON.stringify(requestDTO), deltaTime)
        return
    }

    private async userHandler(requestDTO: RequestDTO): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = requestDTO.data;
        } catch {
            throw "parsing error"
        }

        return this.userLogic(data)
    }

    private async userLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerUser(new RequestServiceDTO(data), TypesQueue.USER_GET)
        if (responseServiceDTO.status != 200) {
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
}
