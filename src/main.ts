
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {

    const certPath = __dirname + '/secrets/fetchain.pem'
    const keyPath = __dirname + '/secrets/privkey.pem'

    const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    }

    const app = await NestFactory.create(AppModule, { httpsOptions });
    app.enableCors()


    await app.listen(9600);
}
bootstrap();