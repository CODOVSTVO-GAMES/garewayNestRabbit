import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {

    @Inject(SessionService)
    private readonly sessionServise: SessionService

    async use(req: Request, res: Response, next: NextFunction) {
        let sessionId = 0;
        let sessionHash = '';

        if (req.method == "POST") {
            try {
                sessionId = req.body.sessionId
                sessionHash = req.body.sessionHash
            } catch (e) {
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
                res.status(403).send("parsing error")
                return
            }
        }

        if (!await this.sessionServise.isSessionValid(sessionId, sessionHash)) {
            console.log('session')
            res.status(403).send("session bad")
            return
        }

        next();
    }
}
