import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TypesQueue } from 'src/TypesQueue';
import { MasterResponseService } from 'src/master-response/master-response.service';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';

@Injectable()
export class ConfigService {
    constructor(private readonly rabbitService: RabbitMQService,
        private readonly masterResponse: MasterResponseService
    ) { }

    async configGetResponser(params: any, res: Response) {
        const mres = await this.masterResponse.get(params, this.configGetHandler.bind(this), "config-get")
        res.status(mres.status).json(mres.resDto)
    }

    async configGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            data = JSON.parse(params)
        } catch {
            throw "parsing error"
        }

        return this.configGetLogic(data)
    }

    async configGetLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerConfig(data, TypesQueue.START_CONFIG_GET)
        if (responseServiceDTO.status != 200) {
            console.log('config servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
