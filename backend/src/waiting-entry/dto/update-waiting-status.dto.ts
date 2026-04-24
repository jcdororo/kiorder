import { IsString } from 'class-validator';

export class UpdateWaitingStatusDto {
  @IsString()
  status!: string;
}
