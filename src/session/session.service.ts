
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';

import { RequestDTO } from 'src/dto/RequestDTO';
import { ResponseDTO } from 'src/dto/ResponseDTO';
import { RequestServiceDTO } from 'src/dto/RequestServiceDTO';
import { ResponseServiceDTO } from 'src/dto/ResponseServiceDTO';
import { TypesQueue } from 'src/TypesQueue';
import { RabbitMQService } from 'src/rabbit/rabbit.servicve';


@Injectable()
export class SessionService {
    constructor(private readonly rabbitService: RabbitMQService){}

    async sessionResponser(requestDTO: RequestDTO, res: Response){
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200

        try{
            const responseServiceDTO = await this.sessionHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        }catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error' || e == 'hash bad'){
                status = 403//перезагрузить клиент
            }else if (e == 'timeout' || e == 'ECONNREFUSED'){
                status = 408//повторить запрос
            }else{
                status == 400//хз че делать
            }
            console.log("Ошибка " + e)
        }
        
        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async sessionHandler(requestDTO: RequestDTO) : Promise<ResponseServiceDTO> {
        let hash = '';
        let data = {};
        try {
            hash = requestDTO.hash;
            data = requestDTO.data;
        } catch {
            console.log('Ошибка парсинга')
            throw "parsing error"
        }

        if (this.isHashBad(hash, data) == true) {
            throw "hash bad"
        }

        return this.sessionLogic(data)
    }

    async sessionLogic(data: object) : Promise<ResponseServiceDTO>{
        const responseServiceDTO = await this.rabbitService.questionerSession(new RequestServiceDTO(data), TypesQueue.SESSION_UPDATER)
        if (responseServiceDTO.status != 200){
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }

    hashGenerator(str: string): string {
        const hash = crypto.createHash('md5').update(str).digest('hex')
        return hash
    }

    isHashBad(hash: string, data: object): boolean {
        const str = JSON.stringify(data)
        if (hash != this.hashGenerator("data_" + str)) {
            console.log('Нарушена целостность данных')
            return true
        }
        else {
            return false
        }
    }

    //------------Перенести в другой сервис!!!------------>

    async isSessionValid(sessionId: number, sessionHash: string) : Promise<boolean> {
        const requestServiceDTO = new RequestServiceDTO({ userId: '', sessionHash: sessionHash, sessionId: sessionId})
        const response = await this.rabbitService.questionerSession(requestServiceDTO, TypesQueue.SESSION_VALIDATOR)//кэш ускорит обработку
        if(response.status == 200){
            return true
        }
        return false
    }

}
