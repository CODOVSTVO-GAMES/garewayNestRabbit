import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { TypesQueue } from 'src/TypesQueue';
import { MasterResponseService } from 'src/master-response/master-response.service';

@Injectable()
export class UserService {
    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly masterResponse: MasterResponseService
    ) { }

    async userResponser(body: object, res: Response) {
        const mres = await this.masterResponse.get(body, this.userLogic.bind(this), "user-get")
        res.status(mres.status).json(mres.resDto)
    }

    private async userLogic(data: object): Promise<ResponseServiceDTO> {
        const responseServiceDTO = await this.rabbitService.questionerUser(data, TypesQueue.USER_GET)
        if (responseServiceDTO.status != 200) {
            console.log('session servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
}
