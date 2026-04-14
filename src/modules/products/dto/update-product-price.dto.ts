import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

// Barkoda görə məhsulun satış qiymətini yeniləmək üçün DTO
export class UpdateProductPriceDto {
  @ApiProperty({ description: 'Məhsulun barkodu' })
  @IsNotEmpty({ message: 'Barkod mütləq daxil edilməlidir' })
  @IsString({ message: 'Barkod mətn formatında olmalıdır' })
  barcode: string;

  @ApiProperty({ description: 'Yeni satış qiyməti (AZN)' })
  @IsNotEmpty({ message: 'Yeni satış qiyməti mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Yeni satış qiyməti rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Satış qiyməti 0-dan kiçik ola bilməz' })
  newSalePrice: number;
}
