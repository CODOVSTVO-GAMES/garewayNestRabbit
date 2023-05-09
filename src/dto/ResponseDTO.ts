export class ResponseDTO {
    status: number; //ВНУТРИ КЛИЕНТА НЕ ИСПОЛЬЗОВАТЬ
    data: string;
    hash: string;
    msg: string;
    constructor() {
        this.status = 200
        this.msg = 'Поле статус внутри клиента не использовать!. Использовать httpStatus'
    }
}
