import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Şablonun adı' })
  @IsNotEmpty({ message: 'Şablon adı mütləq daxil edilməlidir' })
  @IsString({ message: 'Şablon adı mətn formatında olmalıdır' })
  name: string;

  @ApiProperty({ description: 'Kateqoriya ID-si' })
  @IsNotEmpty({ message: 'Kateqoriya ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Kateqoriya ID-si mətn formatında olmalıdır' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'Rəng ID-si' })
  @IsOptional()
  @IsString({ message: 'Rəng ID-si mətn formatında olmalıdır' })
  colorId?: string;

  @ApiPropertyOptional({ description: 'Ölçü ID-si' })
  @IsOptional()
  @IsString({ message: 'Ölçü ID-si mətn formatında olmalıdır' })
  sizeId?: string;
}
