import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, MongooseModule.forRoot(process.env.MONGODB_URI ?? '')],
})
export class AppModule {}
