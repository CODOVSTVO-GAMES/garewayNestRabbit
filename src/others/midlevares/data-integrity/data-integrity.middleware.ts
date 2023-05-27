import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { CryptoService } from 'src/others/crypto/crypto.service';

@Injectable()
export class DataIntegrityMiddleware implements NestMiddleware {
    @Inject(CryptoService)
    private readonly cryptoService: CryptoService

    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    use(req: Request, res: Response, next: NextFunction) {
        let data = {}
        let dataHash = ''
        try {
            if (typeof req.headers.datahash == 'string') {
                dataHash = req.headers.datahash
            }

            if (req.method == "POST") {
                data = req.body
            }
            else if (req.method == "GET") {
                if (typeof req.query.dto == 'string') {
                    const json = JSON.parse(req.query.dto)
                    data = json.data
                }
            }
        } catch {
            this.monitoringService.sendLog('gateway-data-integrity-midlevare', 'parsing', 403, 'bad', req.body)
            res.status(403).send()
            return
        }

        if (this.cryptoService.isHashBad(dataHash, data)) {
            this.monitoringService.sendLog('gateway-data-integrity-midlevare', 'validator', 403, 'bad', req.body)
            console.log("hash bad")
            console.log(dataHash)
            console.log(data)
            res.status(403).send()
            return
        }
        next();
    }
}
