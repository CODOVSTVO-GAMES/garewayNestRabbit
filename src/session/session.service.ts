
import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { TypesQueue } from 'src/TypesQueue';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';


@Injectable()
export class SessionService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    @Inject(ErrorhandlerService)
    private readonly errorHandlerService: ErrorhandlerService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async sessionResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.sessionHandler(body)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
            console.log(e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-session', 'update', status, msg, JSON.stringify(body), deltaTime)
        return
    }

    private async sessionHandler(body: object): Promise<ResponseServiceDTO> {
        return this.sessionLogic(body)
    }

    private async sessionLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerSession(data, TypesQueue.SESSION_UPDATER)
        if (responseServiceDTO.status != 200) {
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }

    //------------Перенести в другой сервис!!!------------>

    async isSessionValid(sessionId: number, sessionHash: string): Promise<boolean> {
        const startDate = Date.now()

        const data = { accountId: '', sessionHash: sessionHash, sessionId: sessionId }
        const response = await this.rabbitService.questionerSession(data, TypesQueue.SESSION_VALIDATOR)//кэш ускорит обработку
        let resStatus = false
        let msg = 'no valid'
        if (response.status == 200) {
            resStatus = true
            msg = 'OK'
        }

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-session', 'validator', response.status, msg, JSON.stringify(data), deltaTime)
        return resStatus
    }

}
