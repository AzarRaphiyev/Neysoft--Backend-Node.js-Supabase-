import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto';

@Injectable()
export class StoreSettingsService {
  constructor(private prisma: PrismaService) {}

  // Mağaza tənzimləmələrini gətirmək (yoxdursa, varsayılan qeyd yaradılır)
  async getSettings() {
    // Verilənlər bazasında mövcud olan ilk tənzimləmə qeydini axtarırıq
    let settings = await this.prisma.storeSettings.findFirst();

    // Əgər heç bir qeyd yoxdursa, varsayılan dəyərlərlə yeni qeyd yaradırıq
    if (!settings) {
      settings = await this.prisma.storeSettings.create({
        data: {
          name: 'Neysoft Mağazası',
          currency: 'AZN',
        },
      });
    }

    return settings;
  }

  // Mağaza tənzimləmələrini yeniləmək
  async updateSettings(dto: UpdateStoreSettingDto) {
    // Mövcud tənzimləmə qeydini tapırıq
    const settings = await this.prisma.storeSettings.findFirst();

    if (!settings) {
      throw new NotFoundException('Mağaza tənzimləmələri tapılmadı');
    }

    // Tapılan qeydin ID-sinə görə yeniləyirik
    const updatedSettings = await this.prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        ...dto,
      },
    });

    return updatedSettings;
  }
}
