import { IsString, IsInt, Min } from 'class-validator';

export class CreateWaitingDto {
  @IsString()
  phone!: string;

  @IsInt()
  @Min(1)
  partySize!: number;
}
