import { Global, Module } from '@nestjs/common';
import { ErrorhandlerService } from './errorhandler.service';

@Global()
@Module({
  providers: [ErrorhandlerService],
  exports: [ErrorhandlerService],
})
export class ErrorhandlerModule { }
