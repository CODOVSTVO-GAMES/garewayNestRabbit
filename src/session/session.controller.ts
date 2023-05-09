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
import { SessionDto } from './dto/sessionDto';
import { Response } from 'express';
import { EventPattern } from '@nestjs/microservices';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}


  @Post()
  session(@Body() sessionDto: SessionDto, @Res() res: Response) {
    return this.sessionService.sessionWorker(sessionDto, res);
  }
}
