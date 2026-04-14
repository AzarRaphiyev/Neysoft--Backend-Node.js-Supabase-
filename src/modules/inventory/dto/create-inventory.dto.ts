import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Qaiməyə daxil olan hər bir məhsul elementi üçün DTO
export class InventoryItemDto {
  @ApiProperty({ description: 'Məhsulun ID-si' })
  @IsNotEmpty({ message: 'Məhsul ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Məhsul ID-si mətn formatında olmalıdır' })
  productId: string;

  @ApiProperty({ description: 'Daxil olan miqdar' })
  @IsNotEmpty({ message: 'Miqdar mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Miqdar rəqəm formatında olmalıdır' })
  @Min(1, { message: 'Miqdar ən azı 1 olmalıdır' })
  quantity: number;

  @ApiProperty({ description: 'Məhsulun alış qiyməti' })
  @IsNotEmpty({ message: 'Alış qiyməti mütləq daxil edilməlidir' })
  @IsNumber({}, { message: 'Alış qiyməti rəqəm formatında olmalıdır' })
  @Min(0, { message: 'Alış qiyməti 0-dan kiçik ola bilməz' })
  purchasePrice: number;
}

// Yeni qaimə (anbara mal daxil etmə) yaratmaq üçün əsas DTO
export class CreateInventoryDto {
  @ApiProperty({ description: 'Təchizatçı (Supplier) ID-si' })
  @IsNotEmpty({ message: 'Təchizatçı ID-si mütləq daxil edilməlidir' })
  @IsString({ message: 'Təchizatçı ID-si mətn formatında olmalıdır' })
  supplierId: string;

  @ApiProperty({
    description: 'Daxil olan məhsulların siyahısı',
    type: [InventoryItemDto],
  })
  @IsArray({ message: 'Məhsul siyahısı massiv formatında olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  items: InventoryItemDto[];
}
