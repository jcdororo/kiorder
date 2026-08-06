import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 한 주문에서 같은 메뉴를 담을 수 있는 최대 수량. 서비스의 병합 후 합계 검증과 공유한다. */
export const MAX_QUANTITY_PER_MENU = 99;

export class OrderItemDto {
  @IsString()
  menuItemId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt({ message: '수량은 1개 단위로 입력해 주세요.' })
  @Min(1, { message: '수량은 1개 이상이어야 합니다.' })
  @Max(MAX_QUANTITY_PER_MENU, {
    message: `한 메뉴는 최대 ${MAX_QUANTITY_PER_MENU}개까지 주문할 수 있습니다.`,
  })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  tableId!: string;

  @IsArray()
  @ArrayNotEmpty({ message: '주문할 메뉴가 없습니다.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsOptional()
  requests?: string;
}
