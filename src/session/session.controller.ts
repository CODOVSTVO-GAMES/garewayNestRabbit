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
import { CreateSessionDto } from './dto/create-session.dto';
import { Response } from 'express';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  session(@Body() createSessionDto: CreateSessionDto, @Res() res: Response) {
    return this.sessionService.create(createSessionDto, res);
  }
}
