import { Module, Global } from '@nestjs/common';
import { MasterResponseService } from './master-response.service';

@Global()
@Module({
  providers: [MasterResponseService],
  exports: [MasterResponseService]
})
export class MasterResponseModule { }
