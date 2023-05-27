import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Response } from 'express';
import { RequestDTO } from 'src/others/dto/RequestDTO';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post()
  session(@Body() data: object, @Res() res: Response) {
    return this.sessionService.sessionResponser(data, res);
  }
}
