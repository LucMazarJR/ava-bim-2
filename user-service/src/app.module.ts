import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UserModule, MongooseModule.forRoot(process.env.MONGODB_URI ?? '')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
