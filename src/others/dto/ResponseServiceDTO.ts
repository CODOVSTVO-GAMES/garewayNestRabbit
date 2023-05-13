export class ResponseServiceDTO {
    status: number;
    data: string;
    msg: string;
    constructor(status: number, data: string){
        this.status = status
        this.data = data
    }
  }
  