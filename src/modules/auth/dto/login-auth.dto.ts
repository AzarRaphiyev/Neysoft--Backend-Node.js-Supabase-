import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'admin', description: 'Istifadəçi adı' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  password: string;
}