import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI ?? ''), MenuModule],
})
export class AppModule {}
