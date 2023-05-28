import { Inject, Injectable } from '@nestjs/common';
import { ResponseDTO } from 'src/others/dto/ResponseDTO';
import { Response } from 'express';
import { ResponseServiceDTO } from 'src/others/dto/ResponseServiceDTO';
import { RabbitMQService } from 'src/others/rabbit/rabbit.servicve';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { TypesQueue } from 'src/TypesQueue';
import { ErrorhandlerService } from 'src/others/errorhandler/errorhandler.service';

@Injectable()
export class PaymentsService {

    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    @Inject(ErrorhandlerService)
    private readonly errorHandlerService: ErrorhandlerService

    constructor(private readonly rabbitService: RabbitMQService) { }

    async productsGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        const responseDTO = new ResponseDTO()
        let status = 0
        let msg = 'OK'

        try {
            const responseServiceDTO = await this.productsGetHandler()
            responseDTO.data = responseServiceDTO.data
            status = 200
        } catch (e) {//прописать разные статусы
            status = this.errorHandlerService.receprion(e)
            msg = e
            console.log(e)
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
        const responseServiceDTO = await this.rabbitService.questionerPayments({}, TypesQueue.PRODUCTS_GET)
        if (responseServiceDTO.status != 200) {
            console.log('payments servise send status: ' + responseServiceDTO.status)
            throw responseServiceDTO.status
        }
        return responseServiceDTO
    }
    //-----------------------------------

    async okKallbackGetResponser(params: any, res: Response) {
        const startDate = Date.now()
        let status = 200
        let msg = 'OK'

        let responce = '<?xml version="1.0" encoding="UTF-8"?><callbacks_payment_response xmlns="http://api.forticom.com/1.0/">true</callbacks_payment_response>'

        try {
            status = await this.okKallbackGetHandler(params)
        } catch (e) {
            console.log("--->Ошибка " + e)
            msg = e
            res.header('Invocation-error', '2')
            responce = '<?xml version="1.0" encoding="UTF-8"?><ns2:error_response xmlns:ns2="http://api.forticom.com/1.0/"><error_code>2</error_code><error_msg>CALLBACK_INVALID_PAYMENT : Payment is invalid and can not be processed</error_msg></ns2:error_response>'
        }

        res.header("Content-Type", "application/xml");

        res.status(status).json(responce)

        const deltaTime = Date.now() - startDate
        this.monitoringService.sendLog('gateway-okCallback', 'get', status, msg, JSON.stringify(params), deltaTime)
        return
    }

    private async okKallbackGetHandler(params: any): Promise<number> {
        let data = {};
        try {
            data = JSON.parse(JSON.stringify(params))
        } catch {
            throw "parsing error"
        }
        return this.okKallbackGetLogic(data)
    }

    private async okKallbackGetLogic(data: object): Promise<number> {
        const responseServiceDTO = await this.rabbitService.questionerPayments(data, TypesQueue.OK_CALLBACK)
        if (responseServiceDTO.status != 200) {
            console.log('okCalback servise send status: ' + responseServiceDTO.status)
            throw 403
        }
        return 200
    }
}
