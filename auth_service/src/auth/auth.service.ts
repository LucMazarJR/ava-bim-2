import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async validate(loginDto: LoginDto) {
    let user: UserDto;

    try {
      const response = await firstValueFrom(
        this.httpService.get<UserDto>(
          `${process.env.USER_SERVICE_URL}/user/email/${loginDto.email}`,
        ),
      );

      user = response.data;
    } catch {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException();
    return user;
  }
}
