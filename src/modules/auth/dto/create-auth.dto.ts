import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAuthDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin@neysoft.az' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: Role.CASHIER,
    enum: Role,
    required: false,
    description: 'İstifadəçi rolu (CASHIER, MANAGER bəzi icazələrlə)',
    default: Role.CASHIER
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CASHIER;
}