import { Trade } from 'src/domain/trade';
import { TradeDto } from 'src/dto/tradeDto';
import { BookMapper } from './bookMapper';
import { UserMapper } from './userMapper';

export class TradeMapper {
  static toDto(trade: Trade): TradeDto {
    return {
      id: trade.id,
      owner: UserMapper.toDto(trade.owner),
      trader: UserMapper.toDto(trade.trader),
      ownerBooks: trade.ownerBooks.map(BookMapper.toDto),
      traderBooks: trade.traderBooks.map(BookMapper.toDto),
      status: trade.status,
    };
  }
}
