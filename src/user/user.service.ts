import { Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class UserService {
    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async userResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            responseDTO.data = (await this.userLogic(body)).data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
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
