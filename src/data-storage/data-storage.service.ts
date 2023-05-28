import { Inject, Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class DataStorageService {
    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    @Inject(ErrorhandlerService)
    private readonly errorHandlerService: ErrorhandlerService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async dataStoragePostResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.dataStoragePostLogic(body)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
            console.log(e)
            if (e == 'timeout') {
                console.log('Сервис не отвечает но запрос положен в очередь')
                status = 200
                //log
            }
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-data', 'save', status, msg, JSON.stringify(body), deltaTime)
        return
    }

    async dataStoragePostLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(data, TypesQueue.DATA_POST)
        if (responseServiceDTO.status != 200) {
            console.log('dataStorage servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }


    //----------------------------------


    async dataStorageGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.dataStorageGetHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            status = this.errorHandlerService.receprion(e)
            msg = e
            console.log(e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-data', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    async dataStorageGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.dataStorageGetLogic(data)
    }

    async dataStorageGetLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(data, TypesQueue.DATA_GET)
        if (responseServiceDTO.status != 200) {
            console.log('dataStorage servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
