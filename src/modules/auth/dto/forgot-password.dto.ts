import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ornek@email.com', description: 'Kayıtlı email adresiniz' })
  email: string;
}