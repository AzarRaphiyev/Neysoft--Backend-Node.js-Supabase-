import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // Yeni xərc əlavə etmək
  @Post()
  @ApiOperation({ summary: 'Yeni xərc əlavə et (maaş, fatura, yemək və s.)' })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  // Bütün xərcləri gətirmək (tarix aralığı filtri ilə)
  @Get()
  @ApiOperation({ summary: 'Bütün xərcləri gətir (tarix filtri ilə)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Başlanğıc tarix (məs: 2025-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Son tarix (məs: 2025-12-31)',
  })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.findAll(startDate, endDate);
  }

  // ID-yə görə tək bir xərc gətirmək
  @Get(':id')
  @ApiOperation({ summary: 'ID-yə görə xərci gətir' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  // ID-yə görə xərci yeniləmək
  @Patch(':id')
  @ApiOperation({ summary: 'ID-yə görə xərci yenilə' })
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  // ID-yə görə xərci silmək
  @Delete(':id')
  @ApiOperation({ summary: 'ID-yə görə xərci sil' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
