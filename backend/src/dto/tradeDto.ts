import { TradeStatus } from 'src/domain/trade';
import { BookDto } from './bookDto';
import { UserDto } from './userDto';

export type TradeDto = {
  id: string;
  decider: UserDto;
  requester: UserDto;
  deciderBooks: BookDto[];
  requesterBooks: BookDto[];
  status: TradeStatus;
  createdAt: string;
  acceptedAt?: string;
};
