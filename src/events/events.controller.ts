import { Body, Controller, Post, Res } from '@nestjs/common';
import { RequestDTO } from 'src/others/dto/RequestDTO';
import { Response } from 'express';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {

    constructor(private readonly eventsService : EventsService){}
    
    @Post()
    eventsPost(@Body() requestDTO: RequestDTO, @Res() res: Response){
        return this.eventsService.eventsResponser(requestDTO, res)
    }
}
