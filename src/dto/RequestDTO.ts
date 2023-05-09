export class RequestDTO {
    data: string;
    hash: string;
    constructor(data: string, hash: string) {
      this.data = data;
      this.hash = hash;
    }
  }
  