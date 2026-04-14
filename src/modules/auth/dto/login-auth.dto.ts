import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'admin', description: 'Istifadəçi adı' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  password: string;
}