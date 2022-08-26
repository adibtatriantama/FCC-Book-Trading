import { Trade } from 'src/domain/trade';
import { BookDetails } from 'src/domain/bookDetails';
import { TradeDto } from 'src/dto/tradeDto';
import { BookMapper } from './bookMapper';
import { BookDetailsMapper } from './bookDetailsMapper';
import { UserDetailsMapper } from './userDetailsMapper';

export class TradeMapper {
  static toDto(trade: Trade): TradeDto {
    return {
      id: trade.id,
      decider: UserDetailsMapper.toDto(trade.decider),
      requester: UserDetailsMapper.toDto(trade.requester),
      deciderBooks: trade.deciderBooks.map(BookDetailsMapper.toDto),
      requesterBooks: trade.requesterBooks.map(BookDetailsMapper.toDto),
      status: trade.status,
      createdAt: trade.createdAt.toISOString(),
      updatedAt: trade.updatedAt.toISOString(),
      acceptedAt: trade.acceptedAt ? trade.acceptedAt.toISOString() : undefined,
    };
  }
}
