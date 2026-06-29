import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CafesService } from './providers/cafes.service';
import { FilterCafesDto } from './dtos/filter-cafes.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cafes')
@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List cafes with filters' })
  findAll(@Query() filter: FilterCafesDto) {
    return this.cafesService.findAll(filter);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get cafe detail' })
  findOne(@Param('id') id: string) {
    return this.cafesService.findOne(id);
  }

  @ApiBearerAuth()
  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle cafe favorite' })
  toggleFavorite(@Param('id') cafeId: string, @CurrentUser('sub') userId: string) {
    return this.cafesService.toggleFavorite(userId, cafeId);
  }

  @ApiBearerAuth()
  @Get('my/favorites')
  @ApiOperation({ summary: 'Get my favorite cafes' })
  getFavorites(@CurrentUser('sub') userId: string) {
    return this.cafesService.getFavorites(userId);
  }
}
