import { IsString, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
