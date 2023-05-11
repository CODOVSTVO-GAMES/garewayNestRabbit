import { Injectable, Inject } from '@nestjs/common';
import { timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { RequestServiceDTO } from 'src/dto/RequestServiceDTO';
import { ResponseServiceDTO } from 'src/dto/ResponseServiceDTO';

@Injectable()
export class RabbitMQService {

    constructor(
        @Inject('session-module') private readonly client: ClientProxy,
    ) { }

    async questioner(data: RequestServiceDTO, queue: string) : Promise<ResponseServiceDTO> {
        try {
            const response = await this.client.send(queue, data).pipe(timeout(5000)).toPromise()

            const json = JSON.parse(JSON.stringify(response))

            return new ResponseServiceDTO(json.status, json.data)
        } catch (e) {
            if (e.message == 'Timeout has occurred') {
                throw "timeout"
            }
            else if (e.err.code == 'ECONNREFUSED') {
                this.client.close()
                throw "ECONNREFUSED"
            } else {
                console.log("Ошибка не обрабатывается")
                console.log(e)
                throw "unkown"
            }
        }
    }
}
