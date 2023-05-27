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


        try {
            if (typeof req.headers.sessionid == 'string') {
                sessionId = Number.parseInt(req.headers.sessionid)
            }

            if (typeof req.headers.sessionhash == 'string') {
                sessionHash = req.headers.sessionhash
            }
        } catch {
            this.monitoringService.sendLog('gateway-session-validator', 'validate', 403, 'bad', '')
            res.status(403).send()
            return
        }

        if (!await this.sessionServise.isSessionValid(sessionId, sessionHash)) {
            console.log('session error')
            // this.monitoringService.sendLog('gateway-session-validator', 'is-session-valid', 403, 'session error', req.body)//дублирует лог в сервисе сессий
            res.status(403).send("session bad")
            return
        }

        next();
    }
}
