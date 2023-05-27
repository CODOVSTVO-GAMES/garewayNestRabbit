import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {

    constructor(private readonly eventsService : EventsService){}
    
    @Post()
    eventsPost(@Body() body: object, @Res() res: Response){
        return this.eventsService.eventsResponser(body, res)
    }
}
