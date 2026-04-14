import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '1234abcd-56ef...', description: 'Maile gelen sıfırlama tokeni' })
  token: string;

  @ApiProperty({ example: 'YeniSifrem123!', description: 'Yeni şifreniz' })
  newPassword: string;
}