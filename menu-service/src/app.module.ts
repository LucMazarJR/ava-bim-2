import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuModule } from './menu/menu.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MenuModule, MongooseModule.forRoot(process.env.MONGODB_URI ?? '')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
