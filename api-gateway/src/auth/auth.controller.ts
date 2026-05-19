import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../decorators/jwt_public.decorator';
import { map } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Post('login')
  login(@Body() body: unknown) {
    return this.httpService
      .post<unknown>(`${process.env.AUTH_SERVICE_URL}/auth/login`, body)
      .pipe(map((response) => response.data));
  }
}
