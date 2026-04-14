import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'Məhsulun unikal barkodu (məsələn: 1234567890123)' })
  @IsNotEmpty({ message: 'Barkod mütləq daxil edilməlidir' })
  @IsString({ message: 'Barkod mətn formatında olmalıdır' })
  barcode?: string;

  @ApiProperty({ description: 'Məhsulun adı' })
  @IsNotEmpty({ message: 'Məhsulun adı mütləq daxil edilməlidir' })
  @IsString({ message: 'Məhsulun adı mətn formatında olmalıdır' })
  name: string;

  @ApiPropertyOptional({ description: 'Məhsulun stok miqdarı', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Stok miqdarı rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Stok miqdarı 0-dan kiçik ola bilməz' })
  stockQuantity?: number;

  @ApiProperty({ description: 'Məhsulun alış qiyməti' })
  @IsNotEmpty({ message: 'Alış qiyməti mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Alış qiyməti rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Alış qiyməti 0-dan kiçik ola bilməz' })
  purchasePrice: number;

  @ApiProperty({ description: 'Məhsulun satış qiyməti' })
  @IsNotEmpty({ message: 'Satış qiyməti mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Satış qiyməti rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Satış qiyməti 0-dan kiçik ola bilməz' })
  salePrice: number;

  @ApiPropertyOptional({ description: 'Kateqoriya ID-si' })
  @IsOptional()
  @IsString({ message: 'Kateqoriya ID mətn formatında olmalıdır' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Rəng ID-si' })
  @IsOptional()
  @IsString({ message: 'Rəng ID mətn formatında olmalıdır' })
  colorId?: string;

  @ApiPropertyOptional({ description: 'Ölçü ID-si' })
  @IsOptional()
  @IsString({ message: 'Ölçü ID mətn formatında olmalıdır' })
  sizeId?: string;

  @ApiPropertyOptional({ description: 'Təchizatçı ID-si' })
  @IsOptional()
  @IsString({ message: 'Təchizatçı ID mətn formatında olmalıdır' })
  supplierId?: string;
}
