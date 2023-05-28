import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorhandlerService {

    receprion(error: any): number {
        let status = 0
        if (error == 'timeout' || error == 'ECONNREFUSED') {//выдается раббитом
            status = 408//повторить запрос
        }
        else if (error == "parsing error") {
            status == 400
        }
        else {
            status == 403
            console.log('Неизвестная ошибка.' + error)
        }
        console.log('ErrorhandlerService- ' + error)
        return status
    }

}
