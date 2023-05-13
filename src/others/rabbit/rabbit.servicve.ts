/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject } from '@nestjs/common';
import { timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';

@Injectable()
export class RabbitMQService {

    constructor(
        @Inject('session-module') private readonly sessionClient: ClientProxy,
        @Inject('data-storage-module') private readonly dataStorageClient: ClientProxy,
        @Inject('events-module') private readonly eventsClient: ClientProxy,
    ) { }

    async questionerSession(data: RequestServiceDTO, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.sessionClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                throw "timeout"
            }
            else if (e.err.code == 'ECONNREFUSED') {
                this.sessionClient.close()
                throw "ECONNREFUSED"
            } else {
                console.log("Ошибка не обрабатывается")
                console.log(e)
                throw "unkown"
            }
        }
    }

    async questionerDataStorage(data: RequestServiceDTO, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.dataStorageClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                throw "timeout"
            }
            else if (e.err.code == 'ECONNREFUSED') {
                this.dataStorageClient.close()
                throw "ECONNREFUSED"
            } else {
                console.log("Ошибка не обрабатывается")
                console.log(e)
                throw "unkown"
            }
        }
    }

    async questionerEvents(data: RequestServiceDTO, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.eventsClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                throw "timeout"
            }
            else if (e.err.code == 'ECONNREFUSED') {
                this.eventsClient.close()
                throw "ECONNREFUSED"
            } else {
                console.log("Ошибка не обрабатывается")
                console.log(e)
                throw "unkown"
            }
        }
    }
}
