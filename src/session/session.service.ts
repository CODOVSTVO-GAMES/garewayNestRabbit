
import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { RequestDTO } from 'src/others/dto/RequestDTO';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { TypesQueue } from 'src/TypesQueue';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { MonitoringService } from 'src/monitoring/monitoring.service';


@Injectable()
export class SessionService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService
    
    constructor(private readonly rabbitService: RabbitMQService) { }

    async sessionResponser(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.sessionHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error2' || e == 'hash bad') {
                status = 403//перезагрузить клиент
                msg = e
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
                msg = e
            } else {
                status == 400//хз че делать
                msg = 'Неизвестная ошибка. Статус: '+ status
            }
            console.log("Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        // console.log("session update Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        this.monitoringService.sendLog('gateway-session', 'update', status, msg, JSON.stringify(requestDTO), deltaTime)
        return
    }

    private async sessionHandler(requestDTO: RequestDTO): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = requestDTO.data;
        } catch {
            throw "parsing error"
        }

        return this.sessionLogic(data)
    }

    private async sessionLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerSession(new RequestServiceDTO(data), TypesQueue.SESSION_UPDATER)
        if (responseServiceDTO.status != 200) {
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }

    //------------Перенести в другой сервис!!!------------>

    async isSessionValid(sessionId: number, sessionHash: string): Promise<boolean> {
        const startDate = Date.now()

        const requestServiceDTO = new RequestServiceDTO({ userId: '', sessionHash: sessionHash, sessionId: sessionId })
        const response = await this.rabbitService.questionerSession(requestServiceDTO, TypesQueue.SESSION_VALIDATOR)//кэш ускорит обработку
        let resStatus = false
        if (response.status == 200) {
            resStatus = true
        }

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-session', 'validator', response.status, 'no valid', JSON.stringify(response), deltaTime)
        return resStatus
    }

}
