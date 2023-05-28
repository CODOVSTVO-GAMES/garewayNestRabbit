import { Inject, Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class UserService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    @Inject(ErrorhandlerService)
    private readonly errorHandlerService: ErrorhandlerService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async userResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.userLogic(body)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
            console.log(e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-user', 'get', status, msg, JSON.stringify(body), deltaTime)
        return
    }

    private async userLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerUser(data, TypesQueue.USER_GET)
        if (responseServiceDTO.status != 200) {
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
