import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Elektronika', description: 'Kateqoriya adı' })
  @IsString({ message: 'Kateqoriya adı mətn formatında olmalıdır' })
  @IsNotEmpty({ message: 'Kateqoriya adı boş ola bilməz' })
  name: string;
}
