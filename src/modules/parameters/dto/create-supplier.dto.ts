import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Təchizatçının adı', example: 'Avrora MMC' })
  @IsString({ message: 'Təchizatçı adı mətn formatında olmalıdır' })
  @IsNotEmpty({ message: 'Təchizatçı adı mütləq qeyd olunmalıdır' })
  name: string;

  @ApiPropertyOptional({ description: 'Təchizatçının əlaqə vasitəsi', example: '+994501234567' })
  @IsString({ message: 'Əlaqə vasitəsi mətn formatında olmalıdır' })
  @IsOptional()
  contact?: string;
}
