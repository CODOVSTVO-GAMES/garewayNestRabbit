import { Injectable } from '@nestjs/common';
import { TypesQueue } from 'src/TypesQueue';
import { MonitoringDTO } from 'src/others/dto/MonitoringDTO';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';

@Injectable()
export class MonitoringService {
    constructor(private readonly rabbitService: RabbitMQService) { }

    sendLog(service: string, requestName: string, status: number, msg: string, data: string, time = 0) {
        const monitoringDTO = new MonitoringDTO(service, requestName, status, msg, data, time)
        this.rabbitService.questionerMonitoring(new RequestServiceDTO(monitoringDTO), TypesQueue.SEND_LOG)
    }
}
