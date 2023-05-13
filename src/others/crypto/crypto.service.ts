import { Global, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Global()
@Injectable()
export class CryptoService {
    private hashGenerator(str: string): string {
        const hash = crypto.createHash('md5').update(str).digest('hex')
        return hash
    }

    isHashBad(hash: string, data: object): boolean {
        const str = "data_" + JSON.stringify(data)
        if (hash != this.hashGenerator(str)) {
            console.log('Нарушена целостность данных')
            return true
        }
        else {
            return false
        }
    }
}
