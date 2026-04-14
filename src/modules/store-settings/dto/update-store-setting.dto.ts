import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

// Mağaza tənzimləmələrini yeniləmək üçün DTO (bütün sahələr optional)
export class UpdateStoreSettingDto {
  @ApiPropertyOptional({ description: 'Mağazanın adı' })
  @IsOptional()
  @IsString({ message: 'Mağaza adı mətn formatında olmalıdır' })
  name?: string;

  @ApiPropertyOptional({ description: 'Mağazanın ünvanı' })
  @IsOptional()
  @IsString({ message: 'Ünvan mətn formatında olmalıdır' })
  address?: string;

  @ApiPropertyOptional({ description: 'Mağazanın telefon nömrəsi' })
  @IsOptional()
  @IsString({ message: 'Telefon nömrəsi mətn formatında olmalıdır' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Mağazanın logo URL-i' })
  @IsOptional()
  @IsString({ message: 'Logo URL mətn formatında olmalıdır' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Valyuta (məs: AZN, USD)', default: 'AZN' })
  @IsOptional()
  @IsString({ message: 'Valyuta mətn formatında olmalıdır' })
  currency?: string;
}
