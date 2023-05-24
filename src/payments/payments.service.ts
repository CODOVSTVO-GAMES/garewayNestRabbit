import { Inject, Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { RequestServiceDTO } from 'src/others/dto/RequestServiceDTO';
import { TypesQueue } from 'src/TypesQueue';

@Injectable()
export class PaymentsService {

    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async productsGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.productsGetHandler()
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
                msg = e
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
                msg = e
            } else {
                status == 400//хз че делать
                msg = 'Неизвестная ошибка. Статус: ' + status
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-payments', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    private async productsGetHandler(): Promise<ResponseServiceDTO> {
        return this.productsGetLogic()
    }

    private async productsGetLogic() {
        const responseServiceDTO = await this.rabbitService.questionerPayments(new RequestServiceDTO({}), TypesQueue.PRODUCTS_GET)
        if (responseServiceDTO.status != 200) {
            console.log('payments servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
    //-----------------------------------

    async okKallbackGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 200
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.okKallbackGetHandler(params)
            responseDTO.data = responseServiceDTO.data
        } catch (e) {//прописать разные статусы
            if (e == 403 || e == 'parsing error') {
                status = 403//перезагрузить клиент
                msg = e
            } else if (e == 'timeout' || e == 'ECONNREFUSED') {
                status = 408//повторить запрос
                msg = e
            } else {
                status == 400//хз че делать
                msg = 'Неизвестная ошибка. Статус: ' + status
            }
            console.log("--->Ошибка " + e)
        }

        res.status(status).json(responseDTO)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-okCallback', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    private async okKallbackGetHandler(params: any): Promise<ResponseServiceDTO> {
        let data = {};
        try {
            console.log(params)
            const json = JSON.parse(params)
            data = json;
        } catch {
            throw "parsing error"
        }
        return this.okKallbackGetLogic(data)
    }

    private async okKallbackGetLogic(data: object) {
        const responseServiceDTO = await this.rabbitService.questionerPayments(new RequestServiceDTO(data), TypesQueue.OK_CALLBACK)
        if (responseServiceDTO.status != 200) {
            console.log('okCalback servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return responseServiceDTO
    }
}
