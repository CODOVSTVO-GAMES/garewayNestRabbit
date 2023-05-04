/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SessionDto } from './dto/sessionDto';
import * as crypto from 'crypto';
import { Response } from 'express';

import { AMQPClient } from '@cloudamqp/amqp-client'


@Injectable()
export class SessionService {
  async sessionWorker(sessionDto: SessionDto, res: Response) {
    const startDate = Date.now()

    const hash = sessionDto.hash;
    const data = sessionDto.data;
    
    //----------
    
    if(this.isHashBad(hash, data) == true){
        res.status(400).send()
        const deltaTime = Date.now()- startDate
        console.log("Запрос выполнен за " + deltaTime + " ms ")
        return
    }

    //----------
    
    const response = await this.rabbitClient(data)
    // console.log(response)

    let json = {"status": 404, "msg":"undefind3", "sessionId":0, "hash":""}
    try{
        json = JSON.parse(JSON.stringify(response))
    }
    catch{console.log("Ошибка парсинга json")}

    //----------

    const status = json['status']
    let toClient;
    if(status == 200){//server response done
        toClient = {"sessionId": json.sessionId, "hash": json.hash}
    }
    else if(status == 403){//server response error
        toClient = json.msg
    }
    else{
        console.log("status " + json.status + json.msg)
        toClient = json.msg
    }
    res.status(status).json(toClient)

    const deltaTime = Date.now()- startDate

    console.log("Запрос выполнен за " + deltaTime + " ms " + JSON.stringify(json))
    return
  }
  
  async rabbitClient(data: string){
    //отправить запрос в rabbit
    try{
        const amqp = new AMQPClient("amqp://test:test@rabbit:5672")
        const connection = await amqp.connect()
        const chanel = await connection.channel()
        const toQueue = await chanel.queue('to_session_service')
        const correlationId = this.generateUuid()

        const listenQueue = await chanel.queue('', {exclusive:true})// создаем очередь для ответа

        let serverResponse = {"status": 404, "msg":"undefind2"}

        const consumer = await listenQueue.subscribe({noAck:true}, async(msg)=>{// слушаем очередь ответа
            //получить ответ
            if(msg.properties.correlationId == correlationId){
                serverResponse = JSON.parse(msg.bodyToString() || '{"status": 404, "msg":"undefind2"}');
                consumer.cancel();
            }
        })

        toQueue.publish(JSON.stringify(data), {correlationId:correlationId, replyTo: listenQueue.name, contentType: "application/json"})// публикуем запрос

        await consumer.wait(5000) //ждем ответа в очереди ответа
        await connection.close()

        return serverResponse
    } catch (e) {
        e.connection.close()
        return {"status": 508, "msg":"rabbit error"}
    }
  }

  hashGenerator(str: string) : string {
    return crypto.createHash('md5').update(str).digest('hex')
  }  

  generateUuid() : string{
    return Math.random().toString() +
        Math.random().toString();
  }

  isHashBad(hash: string, data: string) : boolean {
    if (hash != this.hashGenerator("data_"+ JSON.stringify(data))){
        console.log('Нарушена целостность данных')
        return true
    }
    else{
        return false
    }
  }
  
}
