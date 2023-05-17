import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
