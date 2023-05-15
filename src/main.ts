
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync('./secrets/privkey.pem'),
        cert: fs.readFileSync('./secrets/fetchain'),
    }

    const app = await NestFactory.create(AppModule, { httpsOptions });
    await app.listen(9600);
}
bootstrap();