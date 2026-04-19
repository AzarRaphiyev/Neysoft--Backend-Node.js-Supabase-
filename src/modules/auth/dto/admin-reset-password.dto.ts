import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({ description: 'Şifrəsi dəyişdiriləcək istifadəçinin ID-si' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Yeni şifrə', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır' })
  newPassword: string;
}
