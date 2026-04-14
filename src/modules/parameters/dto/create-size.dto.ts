import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({ example: 'XL', description: 'Ölçü adı' })
  @IsString({ message: 'Ölçü adı mətn formatında olmalıdır' })
  @IsNotEmpty({ message: 'Ölçü adı boş ola bilməz' })
  name: string;
}
