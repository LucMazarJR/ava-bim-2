import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../decorators/jwt_public.decorator';
import { map } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Post()
  create(@Body() body: unknown) {
    return this.httpService
      .post<unknown>(`${process.env.USER_SERVICE_URL}/user`, body)
      .pipe(map((response) => response.data));
  }

  @Get()
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user`)
      .pipe(map((response) => response.data));
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user/email/${email}`)
      .pipe(map((response) => response.data));
  }

  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user/id/${id}`)
      .pipe(map((response) => response.data));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.httpService
      .patch<unknown>(`${process.env.USER_SERVICE_URL}/user/${id}`, body)
      .pipe(map((response) => response.data));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.USER_SERVICE_URL}/user/${id}`)
      .pipe(map((response) => response.data));
  }
}
