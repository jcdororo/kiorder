import { IsIn } from 'class-validator';

export class UpdateGuestResponseDto {
  @IsIn(['가고있어요', '10분 늦어요'])
  response: '가고있어요' | '10분 늦어요';
}
