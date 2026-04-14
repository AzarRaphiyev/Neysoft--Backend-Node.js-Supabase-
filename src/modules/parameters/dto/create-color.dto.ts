import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({ example: 'Qırmızı', description: 'Rəng adı' })
  @IsString({ message: 'Rəng adı mətn formatında olmalıdır' })
  @IsNotEmpty({ message: 'Rəng adı boş ola bilməz' })
  name: string;
}
