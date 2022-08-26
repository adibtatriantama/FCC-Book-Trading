import { TradeStatus } from 'src/domain/trade';
import { BookDetailsDto } from './bookDetailsDto';
import { UserDto } from './userDto';

export type TradeDto = {
  id: string;
  decider: UserDto;
  requester: UserDto;
  deciderBooks: BookDetailsDto[];
  requesterBooks: BookDetailsDto[];
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
};
