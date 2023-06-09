import { Controller, Get, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('products')
    products(@Query('dto') params: string, @Res() res: Response) {
        this.paymentsService.productsGetResponser(params, res);
    }

    @Get('okCallback')
    okCallback(@Query() params: string, @Res() res: Response) {
        this.paymentsService.okKallbackGetResponser(params, res)
    }

}
