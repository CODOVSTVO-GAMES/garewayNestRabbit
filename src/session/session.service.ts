/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import * as crypto from 'crypto';
import { Response } from 'express';

import { AMQPClient } from '@cloudamqp/amqp-client'


@Injectable()
export class SessionService {
  async create(createSessionDto: CreateSessionDto, res: Response) {

    if (createSessionDto.hash != this.hashGenerator("data_"+ JSON.stringify(createSessionDto.data))){
      console.log('Нарушена целостность данных')
      res.status(HttpStatus.BAD_REQUEST).send()
      return
    }

    //отправить запрос в сервис
    const amqp = new AMQPClient("amqp://test:test@localhost:5672")
    const connection = await amqp.connect()
    const chanel = await connection.channel()
    const toQueue = await chanel.queue('to_session_service')

    const listenQueue = await chanel.queue('', {exclusive:true})// создаем очередь для ответа

    const correlationId = this.generateUuid()

    const consumer = await listenQueue.subscribe({noAck:false}, async(msg)=>{
      if(msg.properties.correlationId == correlationId){
        const serverResponse = JSON.parse(msg.bodyToString() || '{"status": 404, "msg":"Мы не знаем что это такое"}');

        res.status(serverResponse.status).send('{"sessionId":"' + serverResponse.sessionId + '", "hash":"' + serverResponse.hash + '"}')
        consumer.cancel();
        return
      }
      else{console.log("Пришло какое то сообщение");}

      console.log(msg.bodyToString());//debug
    })

    toQueue.publish(JSON.stringify(createSessionDto.data), {correlationId:correlationId, replyTo: listenQueue.name, contentType: "application/json"})

    await consumer.wait()
    await connection.close()

    //получить ответ

    //переслать ответ 
    res.status(HttpStatus.OK).send()
    return;
  }

  hashGenerator(str: string) : string {
    return crypto.createHash('md5').update(str).digest('hex')
  }  

  generateUuid() : string{
    return Math.random().toString() +
        Math.random().toString();
}
  
}
