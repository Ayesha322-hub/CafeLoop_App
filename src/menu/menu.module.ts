import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './providers/menu.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
