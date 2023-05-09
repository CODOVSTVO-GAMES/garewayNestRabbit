
import { Inject, Injectable } from '@nestjs/common';
import { SessionDto } from './dto/sessionDto';
import * as crypto from 'crypto';
import { Response } from 'express';

import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { timeout } from 'rxjs';


@Injectable()
export class SessionService {

    constructor(
        @Inject('session-module') private readonly client: ClientProxy,
    ) { }

    async sessionWorker(sessionDto: SessionDto, res: Response) {
        const startDate = Date.now()

        const hash = sessionDto.hash;
        const data = sessionDto.data;

        if (this.isHashBad(hash, data) == true) {
            res.status(400).send()
            return
        }

        const rabbitResponse = await this.rabbitResponseLogic(data)

        const status = rabbitResponse['status']
        const resData = await JSON.parse(JSON.stringify(rabbitResponse['data']))

        const toClient = { "sessionId": '', "hash": '' }
        if (status == 200) {//server response done
            toClient.sessionId = resData.sessionId
            toClient.hash = resData.hash
        }
        else if (status == 403) {//server response error
            console.log("status " + resData.status + resData.msg)
            //log error
        }
        else {
            console.log("status " + resData.status + resData.msg)
            //log error
        }

        const deltaTime = Date.now() - startDate
        console.log("Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
         
        res.status(status).json({"data" : toClient})
        return
    }

    responseObjectGenerator() : string {
        return ''
    }

    async rabbitResponseLogic(data : string) {
        const responseObj = {"status" : 200, "data" : ''}

        try {
            const response = await this.client.send("user_created", data,).pipe(timeout(5000)).toPromise()

            responseObj.data = response
            responseObj.status = response['status']
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                responseObj.status = 408
                console.log("TIMEOUT")
            }
            else if (e.err.code == 'ECONNREFUSED') {
                responseObj.status = 408
                this.client.close()
                console.log("ECONNREFUSED")
            } else {
                responseObj.status = 400
                console.log("Ошибка не обрабатывается")
                console.log(e)
            }
        }
        return responseObj
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

}
