
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync(__dirname + '/secrets/privkey.pem'),
        cert: fs.readFileSync(__dirname + '/secrets/fetchain.pem')
    }

    const app = await NestFactory.create(AppModule, { httpsOptions });
    app.enableCors()

    await app.listen(9600);
}
bootstrap();