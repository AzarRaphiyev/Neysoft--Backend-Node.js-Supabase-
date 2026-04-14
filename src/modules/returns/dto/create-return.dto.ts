import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== MÜŞTƏRİ İADƏSİ DTO-LARI ====================

// Müştəri iadəsindəki hər bir məhsul elementi üçün DTO
export class CustomerReturnItemDto {
  @ApiProperty({ description: 'İadə olunan məhsulun ID-si' })
  @IsNotEmpty({ message: 'Məhsul ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Məhsul ID-si mətn formatında olmalıdır' })
  productId: string;

  @ApiProperty({ description: 'İadə olunan miqdar' })
  @IsNotEmpty({ message: 'Miqdar mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Miqdar rəqəm formatında olmalıdır' })
  @Min(1, { message: 'Miqdar ən azı 1 olmalıdır' })
  quantity: number;

  @ApiProperty({ description: 'Geri qaytarılan məbləğ (AZN)' })
  @IsNotEmpty({ message: 'Geri qaytarılan məbləğ mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Geri qaytarılan məbləğ rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Geri qaytarılan məbləğ 0-dan kiçik ola bilməz' })
  refundAmount: number;
}

// Müştəri iadəsi yaratmaq üçün əsas DTO
export class CreateCustomerReturnDto {
  @ApiProperty({ description: 'Hansı satışdan iadə edilir (Sale ID-si)' })
  @IsNotEmpty({ message: 'Satış ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Satış ID-si mətn formatında olmalıdır' })
  saleId: string;


  @ApiPropertyOptional({ description: 'İadə səbəbi' })
  @IsOptional()
  @IsString({ message: 'İadə səbəbi mətn formatında olmalıdır' })
  reason?: string;

  @ApiProperty({
    description: 'İadə olunan məhsulların siyahısı',
    type: [CustomerReturnItemDto],
  })
  @IsArray({ message: 'Məhsul siyahısı massiv formatında olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => CustomerReturnItemDto)
  items: CustomerReturnItemDto[];
}

// ==================== TƏDARİKÇİ İADƏSİ DTO-LARI ====================

// Tədarikçi iadəsindəki hər bir məhsul elementi üçün DTO
export class SupplierReturnItemDto {
  @ApiProperty({ description: 'İadə olunan məhsulun ID-si' })
  @IsNotEmpty({ message: 'Məhsul ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Məhsul ID-si mətn formatında olmalıdır' })
  productId: string;

  @ApiProperty({ description: 'İadə olunan miqdar' })
  @IsNotEmpty({ message: 'Miqdar mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Miqdar rəqəm formatında olmalıdır' })
  @Min(1, { message: 'Miqdar ən azı 1 olmalıdır' })
  quantity: number;

  @ApiProperty({ description: 'Geri qaytarılan məbləğ (AZN)' })
  @IsNotEmpty({ message: 'Geri qaytarılan məbləğ mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Geri qaytarılan məbləğ rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Geri qaytarılan məbləğ 0-dan kiçik ola bilməz' })
  refundAmount: number;
}

// Tədarikçi iadəsi yaratmaq üçün əsas DTO
export class CreateSupplierReturnDto {
  @ApiProperty({ description: 'Hansı qaimədən iadə edilir (InventoryReceipt ID-si)' })
  @IsNotEmpty({ message: 'Qaimə ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Qaimə ID-si mətn formatında olmalıdır' })
  receiptId: string;


  @ApiPropertyOptional({ description: 'İadə səbəbi' })
  @IsOptional()
  @IsString({ message: 'İadə səbəbi mətn formatında olmalıdır' })
  reason?: string;

  @ApiProperty({
    description: 'İadə olunan məhsulların siyahısı',
    type: [SupplierReturnItemDto],
  })
  @IsArray({ message: 'Məhsul siyahısı massiv formatında olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => SupplierReturnItemDto)
  items: SupplierReturnItemDto[];
}
