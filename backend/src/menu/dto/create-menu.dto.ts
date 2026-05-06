import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { MenuItemType } from '@prisma/client';

export class CreateMenuDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(MenuItemType)
  @IsOptional()
  type?: MenuItemType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
