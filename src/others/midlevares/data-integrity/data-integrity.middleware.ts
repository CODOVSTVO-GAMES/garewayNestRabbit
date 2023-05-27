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
        let hash = ''
        let data = {}
        console.log(typeof req.headers)
        console.log(req.headers)

        let header

        try {
            header = JSON.parse(JSON.stringify(req.headers))
        } catch { console.log('parse headerError') }

        console.log(header.sessionid)
        console.log(header.sessionhash)
        console.log(header.datahash)

        console.log(req.headers['sessionid'])
        console.log(req.headers['sessionhash'])
        console.log(req.headers['datahash'])
        console.log('---------------------')

        if (req.method == "POST") {
            try {
                hash = req.body.hash
                data = req.body.data
            } catch (e) {
                this.monitoringService.sendLog('gateway-data-integrity-midlevare', 'post', 403, 'parsing error', req.body)
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
                this.monitoringService.sendLog('gateway-data-integrity-midlevare', 'get', 403, 'parsing error', req.body)
                res.status(403).send("parsing error get 1")
                return
            }
        }

        if (this.cryptoService.isHashBad(hash, data)) {
            this.monitoringService.sendLog('gateway-data-integrity-midlevare', 'hash-validator', 403, 'hash bad', req.body)
            console.log("hash bad1")
            console.log(hash)
            console.log(data)
            res.status(403).send("hash bad")
            return
        }
        next();
    }
}
