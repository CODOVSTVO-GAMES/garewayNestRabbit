import { Injectable } from '@nestjs/common';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { Response } from 'express';
import { TypesQueue } from 'src/TypesQueue';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';

@Injectable()
export class MapService {

    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async getMapResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.getMapHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-map', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    async getMapHandler(params: any) {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.getMapLogic(data)
    }

    async getMapLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_GET)
        if (responseServiceDTO.status != 200) {
            console.log('map servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }




    //------------------------------------------------

    async getEnemyResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.getEnemyHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-map', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    async getEnemyHandler(params: any) {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.getEnemyLogic(data)
    }

    async getEnemyLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_ENEMY_GET)
        if (responseServiceDTO.status != 200) {
            console.log('map servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }

    //--------------------------------------------------------------------------------------------

    async enemyAttckPostResponser(body: object, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.enemyAttckPostLogic(body)
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

    async enemyAttckPostLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_ATTACK)
        if (responseServiceDTO.status != 200) {
            console.log('post attack servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }

    //--------------------------------------------------------------------------------------------

    // async enemyWinPostResponser(body: object, res: Response) {
    //     const startDate = Date.now()
    //     const responseDTO = new ResponseDTO()
    //     let status = 200
    //     let msg = 'OK'

    //     try {
    //         const responseServiceDTO = await this.enemyWinPostLogic(body)
    //         responseDTO.data = responseServiceDTO.data
    //     } catch (e) {
    //         status = this.errorHandlerService.receprion(e)
    //         msg = e
    //         console.log(e)
    //         if (e == 'timeout') {
    //             console.log('Сервис не отвечает но запрос положен в очередь')
    //             status = 200
    //             //log
    //         }
    //     }

    //     res.status(status).json(responseDTO)

    //     const deltaTime = Date.now() - startDate
    //     this.monitoringService.sendLog('gateway-data', 'save', status, msg, JSON.stringify(body), deltaTime)
    //     return
    // }

    // async enemyWinPostLogic(data: object): Promise<ResponseServiceDTO> {
    //     const responseServiceDTO = await this.rabbitService.questionerMap(data, TypesQueue.MAP_ATTACK)
    //     if (responseServiceDTO.status != 200) {
    //         console.log('post attack servise send status: ' + responseServiceDTO.status)
    //         throw 403
    //     }
    //     return responseServiceDTO
    // }

}
