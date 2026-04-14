import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAuthDto {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin@neysoft.az' })
  email: string;

  @ApiProperty({ example: 'password123' })
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