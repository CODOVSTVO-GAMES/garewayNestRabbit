import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {

    @Inject(SessionService)
    private readonly sessionServise: SessionService

    @Inject(MonitoringService)
    private readonly monitoringService: MonitoringService

    async use(req: Request, res: Response, next: NextFunction) {
        let sessionId = 0;
        let sessionHash = '';

        if (req.method == "POST") {
            try {
                sessionId = req.body.sessionId
                sessionHash = req.body.sessionHash
            } catch (e) {
                this.monitoringService.sendLog('gateway-session-validator', 'post', 403, 'parsing error', req.body)
                res.status(403).send("parsing error")
                return
            }
        }
        else if (req.method == "GET") {
            if (typeof req.query.dto == 'string') {
                const json = JSON.parse(req.query.dto)
                sessionId = json.sessionId;
                sessionHash = json.sessionHash
            } else {
                console.log('parsing')
                this.monitoringService.sendLog('gateway-session-validator', 'get', 403, 'parsing error', req.body)
                res.status(403).send("parsing error")
                return
            }
        }

        if (!await this.sessionServise.isSessionValid(sessionId, sessionHash)) {
            console.log('session error')
            this.monitoringService.sendLog('gateway-session-validator', 'is-session-valid', 403, 'session error', req.body)
            res.status(403).send("session bad")
            return
        }

        next();
    }
}
