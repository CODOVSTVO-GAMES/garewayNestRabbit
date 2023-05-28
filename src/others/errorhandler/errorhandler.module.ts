import { Module } from '@nestjs/common';
import { ErrorhandlerService } from './errorhandler.service';

@Module({
  providers: [ErrorhandlerService],
  exports: [ErrorhandlerService],
})
export class ErrorhandlerModule {}
