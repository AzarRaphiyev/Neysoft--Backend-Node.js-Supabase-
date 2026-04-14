import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';

// Yeni xərc yaratmaq üçün DTO
export class CreateExpenseDto {
  @ApiProperty({ description: 'Xərcin adı (məs: İşçi maaşı, Yemək, Fatura)' })
  @IsNotEmpty({ message: 'Xərcin adı mütləq daxil edilməlidir' })
  @IsString({ message: 'Xərcin adı mətn formatında olmalıdır' })
  title: string;

  @ApiProperty({ description: 'Xərcin məbləği (AZN)' })
  @IsNotEmpty({ message: 'Məbləğ mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Məbləğ rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Məbləğ 0-dan kiçik ola bilməz' })
  amount: number;

  @ApiPropertyOptional({ description: 'Xərc haqqında əlavə açıqlama' })
  @IsOptional()
  @IsString({ message: 'Açıqlama mətn formatında olmalıdır' })
  description?: string;

  @ApiProperty({ description: 'Xərci əlavə edən istifadəçi/kassir ID-si' })
  @IsNotEmpty({ message: 'İstifadəçi ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'İstifadəçi ID-si mətn formatında olmalıdır' })
  userId: string;
}
