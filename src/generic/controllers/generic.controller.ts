import { Body, Controller, Param, Get, Post, Put, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenericService } from '../services/generic.service';
import { CreateGenericDto, UpdateGenericDto } from '../models/generic.models';
import { GenericEntity } from '../schemas/schema.entity';
import { FiltersConfig, IQueryResponse } from 'libs/nest-mongo/src';

@ApiTags('newComponent')
@Controller('api/newComponents')
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  @Get()
  @ApiOperation({ summary: 'Get all newComponent items' })
  @ApiResponse({ status: 200, description: 'Return all newComponent items.', type: [GenericEntity] })
  async findAll(): Promise<GenericEntity[]> {
    return await this.genericService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a newComponent item by id' })
  @ApiResponse({ status: 200, description: 'Return the newComponent item.', type: GenericEntity })
  async findOne(@Param('id') id: string): Promise<GenericEntity> {
    return await this.genericService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new newComponent item' })
  @ApiResponse({ status: 201, description: 'The item has been successfully created.', type: GenericEntity })
  async create(@Body() createGenericDto: CreateGenericDto): Promise<GenericEntity> {
    return await this.genericService.create(createGenericDto);
  }

  @Post('query')
  @ApiOperation({ summary: 'Create a new newComponent item' })
  @ApiResponse({ status: 201, description: 'The item has been successfully created.', type: GenericEntity })
  async query(@Body() filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.genericService.queryUsingFiltersConfig(filterConfig);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a newComponent item' })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated.', type: GenericEntity })
  async update(@Param('id') id: string, @Body() updateGenericDto: UpdateGenericDto): Promise<GenericEntity> {
    return await this.genericService.update(id, updateGenericDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a newComponent item' })
  @ApiResponse({ status: 204, description: 'The item has been successfully deleted.' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.genericService.remove(id);
  }
}
