import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Ödəniş üsulu enum-u
enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

// Satış içindəki hər bir məhsul elementi üçün DTO
export class SaleItemDto {
  @ApiProperty({ description: 'Məhsulun ID-si' })
  @IsNotEmpty({ message: 'Məhsul ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Məhsul ID-si mətn formatında olmalıdır' })
  productId: string;

  @ApiProperty({ description: 'Satılan miqdar' })
  @IsNotEmpty({ message: 'Miqdar mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Miqdar rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Miqdar 0-dan kiçik ola bilməz (Hədiyyə və ya 0 ola bilər)' })
  quantity: number;

  @ApiProperty({ description: 'Məhsulun satış qiyməti' })
  @IsNotEmpty({ message: 'Qiymət mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Qiymət rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Qiymət 0-dan kiçik ola bilməz' })
  price: number;

  @ApiPropertyOptional({ description: 'Məhsula tətbiq olunan endirim', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Endirim rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Endirim 0-dan kiçik ola bilməz' })
  discount?: number;
}

// Yeni satış yaratmaq üçün əsas DTO (fiziki kassa sistemi - onlayn ödəniş yoxdur)
export class CreateSaleDto {
  @ApiProperty({ description: 'Ümumi endirim məbləği', default: 0 })
  @IsNotEmpty({ message: 'Endirim məbləği mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Endirim rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Endirim 0-dan kiçik ola bilməz' })
  discount: number;

  @ApiProperty({
    description: 'Ödəniş üsulu (CASH - nağd, CARD - kart)',
    enum: PaymentMethod,
  })
  @IsNotEmpty({ message: 'Ödəniş üsulu mütləq seçilməlidir' })
  @IsEnum(PaymentMethod, { message: 'Ödəniş üsulu CASH və ya CARD olmalıdır' })
  paymentMethod: PaymentMethod;


  @ApiProperty({
    description: 'Satılan məhsulların siyahısı',
    type: [SaleItemDto],
  })
  @IsArray({ message: 'Məhsul siyahısı massiv formatında olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ description: 'Ödənilən məbləğ', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Ödənilən məbləğ rəqəm formatında olmalıdır' })
  paidAmount?: number;

  @ApiPropertyOptional({ description: 'Qaytarılan qalıq (para üstü)', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Qalıq (para üstü) rəqəm formatında olmalıdır' })
  changeAmount?: number;
}
