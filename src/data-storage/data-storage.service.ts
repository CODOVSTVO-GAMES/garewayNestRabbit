/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { RequestDTO } from 'src/dto/RequestDTO';
import { ResponseDTO } from 'src/dto/ResponseDTO';
import * as crypto from 'crypto';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/rabbit/rabbit.servicve';
import { RequestServiceDTO } from 'src/dto/RequestServiceDTO';
import { TypesQueue } from 'src/TypesQueue';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class DataStorageService {
    @Inject(SessionService)
    private readonly sessionServise : SessionService

    constructor(private readonly rabbitService: RabbitMQService){}



    async dataStoragePostResponser(requestDTO: RequestDTO, res: Response){
        // console.log(requestDTO)
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200

        try{
            const responseServiceDTO = await this.dataStoragePostHandler(requestDTO)
            responseDTO.data = responseServiceDTO.data
        }catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error' || e == 'hash bad' || e == 'session bad'){
                status = 403//перезагрузить клиент
            }else if (e == 'timeout' || e == 'ECONNREFUSED'){
                status = 408//повторить запрос
            }else{
                status == 400//хз че делать
            }
            console.log("--->Ошибка " + e)
        }
        
        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("data post Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async dataStoragePostHandler(requestDTO: RequestDTO) : Promise<ResponseServiceDTO> {
        let hash = '';
        let sessionId = 0;
        let sessionHash = '';
        let data = {};
        try {
            hash = requestDTO.hash;
            data = requestDTO.data;
            sessionHash = requestDTO.sessionHash;
            sessionId = requestDTO.sessionid
        } catch {
            console.log('Ошибка парсинга')
            throw "parsing error"
        }

        if(!await this.isSessionValid(sessionId,sessionHash)){
            throw "session bad"
        }

        if (this.isHashBad(hash, data) == true) {
            throw "hash bad"
        }
        return this.dataStoragePostLogic(data)
    }

    async dataStoragePostLogic(data: object){
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(new RequestServiceDTO(data), TypesQueue.DATA_POST)
        if (responseServiceDTO.status != 200){
            console.log('dataStorage servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }


    //----------------------------------


    async dataStorageGetResponser(params: any, res: Response){
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200

        try{
            const responseServiceDTO = await this.dataStorageGetHandler(params)
            responseDTO.data = responseServiceDTO.data
        }catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error' || e == 'hash bad' || e == 'session bad'){
                status = 403//перезагрузить клиент
            }else if (e == 'timeout' || e == 'ECONNREFUSED'){
                status = 408//повторить запрос
            }else{
                status == 400//хз че делать
            }
            console.log("--->Ошибка " + e)
        }
        
        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        console.log("data get Запрос выполнен за " + deltaTime + " ms. status: " + status)//cтатус
        return
    }

    async dataStorageGetHandler(params: any) : Promise<ResponseServiceDTO> {
        let hash = '';
        let sessionId = 0;
        let sessionHash = '';
        let data = {};
        try {
            const json = JSON.parse(params)
            hash = json.hash;
            data = json.data;
            sessionId = json.sessionId
            sessionHash = json.sessionHash
            
        } catch {
            console.log('Ошибка парсинга')
            throw "parsing error"
        }

        if(!await this.isSessionValid(sessionId,sessionHash)){
            throw "session bad"
        }

        if (this.isHashBad(hash, data) == true) {
            throw "hash bad"
        }
        return this.dataStorageGetLogic(data)
    }

    async dataStorageGetLogic(data: object){
        const responseServiceDTO = await this.rabbitService.questionerDataStorage(new RequestServiceDTO(data), TypesQueue.DATA_GET)
        if (responseServiceDTO.status != 200){
            console.log('dataStorage servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }


    //----------------------------------


    async isSessionValid(sessionId: number, sessionHash: string): Promise<boolean>{
        // return true
        return await this.sessionServise.isSessionValid(sessionId, sessionHash)
    }


    //----------------------------------


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

}
