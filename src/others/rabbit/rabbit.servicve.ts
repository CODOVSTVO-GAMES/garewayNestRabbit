/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, Global } from '@nestjs/common';
import { timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';

@Global()
@Injectable()
export class RabbitMQService {

    constructor(
        @Inject('session-module') private readonly sessionClient: ClientProxy,
        @Inject('data-storage-module') private readonly dataStorageClient: ClientProxy,
        @Inject('events-module') private readonly eventsClient: ClientProxy,
        @Inject('monitoring-module') private readonly monitoringClient: ClientProxy,
        @Inject('user-module') private readonly userClient: ClientProxy,
        @Inject('payments-module') private readonly paymentsClient: ClientProxy,
    ) { }

    async questionerSession(data: object, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.sessionClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            throw this.errorHandler(e, this.sessionClient)
        }
    }

    async questionerDataStorage(data: object, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.dataStorageClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            throw this.errorHandler(e, this.dataStorageClient)
        }
    }

    async questionerEvents(data: object, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.eventsClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            throw this.errorHandler(e, this.eventsClient)
        }
    }

    async questionerMonitoring(data: object, queue: string) {
        try {
            await this.monitoringClient.emit(queue, data).toPromise()
        } catch (e) {
            throw this.errorHandler(e, this.monitoringClient)
        }
    }

    async questionerUser(data: object, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.userClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            throw this.errorHandler(e, this.userClient)
        }
    }

    async questionerPayments(data: object, queue: string): Promise<ResponseServiceDTO> {
        try {
            const response = await this.paymentsClient.send(queue, data).pipe(timeout(4000)).toPromise()
            const json = JSON.parse(JSON.stringify(response))
            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            throw this.errorHandler(e, this.paymentsClient)
        }
    }

    private errorHandler(error: any, client: ClientProxy): string {
        if (error.message == 'Timeout has occurred') {
            return "timeout"
        }
        else if (error.err.code == 'ECONNREFUSED') {
            client.close()
            return "ECONNREFUSED"
        } else {
            console.log("Ошибка не обрабатывается")
            console.log(error)
            return "unkown"
        }
    }
}
