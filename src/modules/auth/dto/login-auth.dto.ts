import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginAuthDto {
  @ApiPropertyOptional({ example: 'admin', description: 'Istifadəçi adı' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'admin@neysoft.com', description: 'Email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  @IsString()
  @IsNotEmpty()
  password: string;
}