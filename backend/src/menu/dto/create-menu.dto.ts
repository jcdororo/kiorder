import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
