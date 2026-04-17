import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Şablonun adı' })
  @IsNotEmpty({ message: 'Şablon adı mütləq daxil edilməlidir' })
  @IsString({ message: 'Şablon adı mətn formatında olmalıdır' })
  ad: string;

  @ApiProperty({ description: 'Kateqoriya ID-si (nov_id)' })
  @IsNotEmpty({ message: 'Kateqoriya ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Kateqoriya ID-si mətn formatında olmalıdır' })
  nov_id: string;

  @ApiPropertyOptional({ description: 'Rəng ID-si (reng_id)' })
  @IsOptional()
  @IsString({ message: 'Rəng ID-si mətn formatında olmalıdır' })
  reng_id?: string;

  @ApiPropertyOptional({ description: 'Ölçü ID-si (olcu_id)' })
  @IsOptional()
  @IsString({ message: 'Ölçü ID-si mətn formatında olmalıdır' })
  olcu_id?: string;
}
