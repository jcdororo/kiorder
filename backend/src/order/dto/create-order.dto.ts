import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  menuItemId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  tableId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsOptional()
  requests?: string;
}
