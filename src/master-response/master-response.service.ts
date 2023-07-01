/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class MasterResponseService {
    constructor(
        private readonly errorHandlerService: ErrorhandlerService,
        private readonly monitoringService: MonitoringService
    ) { }

    async get(data: any, func: Function, plase: string) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await func(data)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {
            status = this.errorHandlerService.receprion(e)
            msg = e
        }

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway', plase, status, msg, JSON.stringify(data), deltaTime)

        return { status: 200, resDto: responseDTO }
    }
}
