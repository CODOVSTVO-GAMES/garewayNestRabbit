import {
  Controller,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Response } from 'express';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post()
  session(@Body() body: object, @Res() res: Response) {
    return this.sessionService.sessionResponser(body, res);
  }
}
