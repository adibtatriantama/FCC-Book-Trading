import { TradeStatus } from 'src/domain/trade';
import { BookDto } from './bookDto';
import { UserDto } from './userDto';

export type TradeDto = {
  id: string;
  owner: UserDto;
  trader: UserDto;
  ownerBooks: BookDto[];
  traderBooks: BookDto[];
  status: TradeStatus;
};
