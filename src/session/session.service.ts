
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
        }catch (e) {
            status = 400
            console.log("Ошибка " + e)
        }
        
        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async sessionHandler(requestDTO: RequestDTO) : Promise<ResponseServiceDTO> {
        let hash = '';
        let data = '';
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

    async sessionLogic(data: string) : Promise<ResponseServiceDTO>{
        return await this.rabbitService.questioner(new RequestServiceDTO(data), TypesQueue.SESSION_HANDLER)
    }

    hashGenerator(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex')
    }

    isHashBad(hash: string, data: string): boolean {
        if (hash != this.hashGenerator("data_" + JSON.stringify(data))) {
            console.log('Нарушена целостность данных')
            return true
        }
        else {
            return false
        }
    }

    //------------Перенести в другой сервис!!!------------>

    async isSessionValid(sessionId: number, sessionHash: string) : Promise<boolean> {
        const requestServiceDTO = new RequestServiceDTO(JSON.stringify({ userId: '', sessionHash: sessionHash, sessionId: sessionId}))
        const response = await this.rabbitService.questioner(requestServiceDTO, TypesQueue.SESSION_VALIDATOR)
        if(response.status == 200){
            return true
        }
        return false
    }

}
