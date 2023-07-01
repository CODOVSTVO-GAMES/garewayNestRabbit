/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { MasterResponseService } from 'src/master-response/master-response.service';

@Injectable()
export class DataStorageService {
    constructor(private readonly rabbitService: RabbitMQService,
        private readonly masterResponse: MasterResponseService
    ) { }

    async dataStoragePostResponser(body: object, res: Response) {
        const mres = await this.masterResponse.get(body, this.dataStorageGetHandler.bind(this), "data-post")
        res.status(mres.status).json(mres.resDto)
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
        const mres = await this.masterResponse.get(params, this.dataStorageGetHandler.bind(this), "data-get")
        res.status(mres.status).json(mres.resDto)
    }

    async dataStorageGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }
        console.log('123 проверка')
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