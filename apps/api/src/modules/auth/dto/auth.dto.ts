import { IsString, IsOptional, IsEmail, IsEnum, MinLength, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString() @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل معتبر نیست' })
  phone: string;

  @IsOptional() @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email?: string;

  @IsString() @MinLength(8, { message: 'رمز عبور حداقل ۸ کاراکتر' })
  password: string;

  @IsString() @MinLength(2)
  fullName: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;
}

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  refreshToken: string;
}
