import { Injectable } from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { TypesQueue } from 'src/TypesQueue';

@Injectable()
export class DataStorageService {
    constructor(private readonly rabbitService: RabbitMQService) { }

    async dataStoragePostResponser(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200

        try {
            const responseServiceDTO = await this.dataStoragePostHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
            } else {
                status == 400//хз че делать
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("data post Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async dataStoragePostHandler(requestDTO: RequestDTO): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = requestDTO.data;
        } catch {
            console.log('Ошибка парсинга')
            throw "parsing error"
        }

        return this.dataStoragePostLogic(data)
    }

    async dataStoragePostLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(new RequestServiceDTO(data), TypesQueue.DATA_POST)
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

        try {
            const responseServiceDTO = await this.dataStorageGetHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
            } else {
                status == 400//хз че делать
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("data get Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async dataStorageGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            const json = JSON.parse(params)
            data = json.data;
        } catch {
            throw "parsing error"
        }

        return this.dataStorageGetLogic(data)
    }

    async dataStorageGetLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(new RequestServiceDTO(data), TypesQueue.DATA_GET)
        if (responseServiceDTO.status != 200) {
            console.log('dataStorage servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
}
