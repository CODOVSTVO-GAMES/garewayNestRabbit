import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CryptoService } from 'src/others/crypto/crypto.service';

@Injectable()
export class DataIntegrityMiddleware implements NestMiddleware {
    @Inject(CryptoService)
    private readonly cryptoService: CryptoService

    use(req: Request, res: Response, next: NextFunction) {
        let hash = ''
        let data = {}

        if (req.method == "POST") {
            try {
                hash = req.body.hash
                data = req.body.data
            } catch (e) {
                res.status(403).send("parsing error1")
                return
            }
        }
        else if (req.method == "GET") {
            if (typeof req.query.dto == 'string') {
                const json = JSON.parse(req.query.dto)
                hash = json.hash;
                data = json.data
            } else {
                res.status(403).send("parsing error get 1")
                return
            }
        }

        if (this.cryptoService.isHashBad(hash, data)) {
            console.log("hash bad1")
            res.status(403).send("hash bad")
            return
        }
        next();
    }
}
