import { Trade } from 'src/domain/trade';
import { TradeDto } from 'src/dto/tradeDto';
import { BookMapper } from './bookMapper';
import { UserDetailsMapper } from './userDetailsMapper';

export class TradeMapper {
  static toDto(trade: Trade): TradeDto {
    return {
      id: trade.id,
      owner: UserDetailsMapper.toDto(trade.owner),
      trader: UserDetailsMapper.toDto(trade.trader),
      ownerBooks: trade.ownerBooks.map(BookMapper.toDto),
      traderBooks: trade.traderBooks.map(BookMapper.toDto),
      status: trade.status,
    };
  }
}
