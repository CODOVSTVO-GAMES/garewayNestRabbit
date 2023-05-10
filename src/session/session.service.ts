
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';

import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { timeout } from 'rxjs';
import { RequestDTO } from 'src/dto/RequestDTO';
import { ResponseDTO } from 'src/dto/ResponseDTO';
import { RequestServiceDTO } from 'src/dto/RequestServiceDTO';
import { ResponseServiceDTO } from 'src/dto/ResponseServiceDTO';


@Injectable()
export class SessionService {

    constructor(
        @Inject('session-module') private readonly client: ClientProxy,
    ) { }

    async sessionWorker(requestDTO: RequestDTO, res: Response) {
        const startDate = Date.now()

        let hash = '';
        let data = '';
        try {
            hash = requestDTO.hash;
            data = requestDTO.data;
        } catch {
            console.log('Ошибка парсинга')
            res.status(400).send('parsing error')
            return
        }

        if (this.isHashBad(hash, data) == true) {
            res.status(400).send()
            return
        }

        const responseDTO = await this.rabbitResponseLogic(new RequestServiceDTO(data))

        const deltaTime = Date.now() - startDate
        console.log("Запрос выполнен за " + deltaTime + " ms. status: " + responseDTO.status)//cтатус

        res.status(responseDTO.status).json(responseDTO)
        return
    }

    responseObjectGenerator(): string {
        return ''
    }

    async rabbitResponseLogic(data: RequestServiceDTO): Promise<ResponseDTO> {
        const responseDTO = new ResponseDTO();

        try {
            const response = await this.client.send("to_session_service", data).pipe(timeout(5000)).toPromise()

            const json = JSON.parse(JSON.stringify(response))

            const responseServiceDTO = new ResponseServiceDTO(json.status, json.data)

            responseDTO.data = responseServiceDTO.data
            responseDTO.status = responseServiceDTO.status
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                responseDTO.status = 408
                console.log("TIMEOUT")
            }
            else if (e.err.code == 'ECONNREFUSED') {
                responseDTO.status = 408
                this.client.close()
                console.log("ECONNREFUSED")
            } else {
                responseDTO.status = 400
                console.log("Ошибка не обрабатывается")
                console.log(e)
            }
        }
        return responseDTO
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

        if ((await this.requestValidSession(requestServiceDTO)).status == 200){
            true
        }
        return false
    }

    async requestValidSession(data: RequestServiceDTO) : Promise<ResponseDTO>{ //вынести 
        const responseDTO = new ResponseDTO();

        try {
            const response = await this.client.send("validate_session", data).pipe(timeout(5000)).toPromise()

            const json = JSON.parse(JSON.stringify(response))

            const responseServiceDTO = new ResponseServiceDTO(json.status, json.data)

            responseDTO.data = responseServiceDTO.data
            responseDTO.status = responseServiceDTO.status
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                responseDTO.status = 408
                console.log("TIMEOUT")
            }
            else if (e.err.code == 'ECONNREFUSED') {
                responseDTO.status = 408
                this.client.close()
                console.log("ECONNREFUSED")
            } else {
                responseDTO.status = 400
                console.log("Ошибка не обрабатывается")
                console.log(e)
            }
        }
        return responseDTO
    }

}
