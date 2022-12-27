import { BookDetails } from 'src/domain/bookDetails';
import { Trade, TradeStatus } from 'src/domain/trade';
import { TradeDto } from 'src/dto/tradeDto';
import {
  TradeTypes,
  TradeRequesterType,
  TradeType,
  TradeDeciderType,
  TradeRequesterBookType,
  TradeDeciderBookType,
} from 'src/infra/db/onetable';
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

  static toTrade(tradeTypes: TradeTypes): Trade {
    const metadata = tradeTypes.metadata;
    const requester = UserDetailsMapper.toUserDetails(
      tradeTypes.requester.user,
    );
    const decider = UserDetailsMapper.toUserDetails(tradeTypes.decider.user);
    const requesterBooks = tradeTypes.requesterBooks.map((item) => {
      return BookDetails.create({
        owner: requester,
        ...item.book,
      });
    });
    const deciderBooks = tradeTypes.deciderBooks.map((item) => {
      return BookDetails.create({
        owner: decider,
        ...item.book,
      });
    });

    return Trade.create(
      {
        status: metadata.status as TradeStatus,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        acceptedAt: metadata.acceptedAt,
        requester,
        decider,
        requesterBooks,
        deciderBooks,
      },
      metadata.id,
    ).getValue();
  }

  static toTradeTypes(trade: Trade): TradeTypes {
    const metadata: TradeType = {
      id: trade.id,
      status: trade.status,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      acceptedAt: trade.acceptedAt,
    };

    const requester: TradeRequesterType = {
      tradeId: trade.id,
      userId: trade.requester.id,
      user: {
        id: trade.requester.id,
        nickname: trade.requester.nickname,
        address: trade.requester.address,
      },
    };

    const decider: TradeDeciderType = {
      tradeId: trade.id,
      userId: trade.decider.id,
      user: {
        id: trade.decider.id,
        nickname: trade.decider.nickname,
        address: trade.decider.address,
      },
    };

    const requesterBooks: TradeRequesterBookType[] = trade.requesterBooks.map(
      (book): TradeRequesterBookType => {
        return {
          tradeId: trade.id,
          ownerId: book.owner.id,
          bookId: book.id,
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
          },
        };
      },
    );

    const deciderBooks: TradeDeciderBookType[] = trade.deciderBooks.map(
      (book): TradeDeciderBookType => {
        return {
          tradeId: trade.id,
          ownerId: book.owner.id,
          bookId: book.id,
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
          },
        };
      },
    );

    return {
      metadata,
      requester,
      decider,
      requesterBooks,
      deciderBooks,
    };
  }
}
