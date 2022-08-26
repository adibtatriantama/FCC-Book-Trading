import { Trade } from 'src/domain/trade';
import { TradeDto } from 'src/dto/tradeDto';
import { BookMapper } from './bookMapper';
import { UserDetailsMapper } from './userDetailsMapper';

export class TradeMapper {
  static toDto(trade: Trade): TradeDto {
    return {
      id: trade.id,
      decider: UserDetailsMapper.toDto(trade.decider),
      requester: UserDetailsMapper.toDto(trade.requester),
      deciderBooks: trade.deciderBooks.map(BookMapper.toDto),
      requesterBooks: trade.requesterBooks.map(BookMapper.toDto),
      status: trade.status,
      createdAt: trade.createdAt.toISOString(),
      updatedAt: trade.updatedAt.toISOString(),
      acceptedAt: trade.acceptedAt ? trade.acceptedAt.toISOString() : undefined,
    };
  }
}
