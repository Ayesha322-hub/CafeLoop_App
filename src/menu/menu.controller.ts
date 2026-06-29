import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './providers/menu.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Menu')
@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get('cafes/:cafeId/menu')
  @ApiOperation({ summary: 'Get cafe menu grouped by category' })
  getMenu(@Param('cafeId') cafeId: string, @Query('category') category?: string) {
    return this.menuService.getMenuByCafe(cafeId, category);
  }

  @Public()
  @Get('menu/:id')
  @ApiOperation({ summary: 'Get single menu item detail' })
  getItem(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }
}
