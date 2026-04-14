import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

// Xərci yeniləmək üçün DTO (bütün sahələr optional olur)
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
