export class ResponseDTO {
    data: string;
    hash: string;
    msg: string;
    constructor() {
        this.msg = 'Поле статус внутри клиента не использовать!. Использовать httpStatus'
    }
}
