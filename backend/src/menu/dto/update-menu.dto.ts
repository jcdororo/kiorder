import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
