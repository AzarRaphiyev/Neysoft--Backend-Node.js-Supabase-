import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoreSettingsService } from './store-settings.service';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('store-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  // Mağaza tənzimləmələrini gətirmək
  @Get()
  @ApiOperation({ summary: 'Mağaza tənzimləmələrini gətir (yoxdursa avtomatik yaradılır)' })
  getSettings() {
    return this.storeSettingsService.getSettings();
  }

  // Mağaza tənzimləmələrini yeniləmək
  @Patch()
  @ApiOperation({ summary: 'Mağaza tənzimləmələrini yenilə' })
  updateSettings(@Body() updateStoreSettingDto: UpdateStoreSettingDto) {
    return this.storeSettingsService.updateSettings(updateStoreSettingDto);
  }
}
