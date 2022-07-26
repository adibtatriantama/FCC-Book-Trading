import { Book } from 'src/domain/book';
import { Trade } from 'src/domain/trade';
import { UserDetails } from 'src/domain/userDetails';
import {
  DB_METADATA,
  DB_TRADE,
  DB_TRADE_BOOK_OWNER_PREFIX,
  DB_TRADE_BOOK_TRADER_PREFIX,
  DB_TRADE_ITEM_PREFIX,
  DB_TRADE_PREFIX,
} from '../constant';
import {
  DbTrade,
  DbTradeItem,
  DbTradeMetadata,
  DbTradeUser,
} from '../model/dbTrade';

export class DbTradeMapper {
  static toEntity(dbModel: {
    metadata: Record<string, any>;
    tradeItems: Record<string, any>[];
    bookOwner: Record<string, any>;
    bookTrader: Record<string, any>;
  }): Trade {
    const owner = UserDetails.create({
      id: dbModel.bookOwner.userId,
      nickname: dbModel.bookOwner.nickname,
      address: dbModel.bookOwner.address,
    }).getValue();

    const trader = UserDetails.create({
      id: dbModel.bookTrader.userId,
      nickname: dbModel.bookTrader.nickname,
      address: dbModel.bookTrader.address,
    }).getValue();

    const ownerBooksModel = dbModel.tradeItems.filter(
      (item) => item.ownerId === owner.id,
    );

    const traderBooksModel = dbModel.tradeItems.filter(
      (item) => item.ownerId === trader.id,
    );

    const ownerBooks = ownerBooksModel.map((item) => {
      return Book.create(
        {
          title: item.title,
          author: item.author,
          description: item.description,
          owner,
        },
        item.bookId,
      ).getValue();
    });

    const traderBooks = traderBooksModel.map((item) => {
      return Book.create(
        {
          title: item.title,
          author: item.author,
          description: item.description,
          owner: trader,
        },
        item.bookId,
      ).getValue();
    });

    const metadata = dbModel.metadata;

    return Trade.create(
      {
        owner,
        trader,
        ownerBooks,
        traderBooks,
        status: metadata.status,
        createdAt: new Date(metadata.createdAt),
        acceptedAt: metadata.acceptedAt ? new Date(metadata.acceptedAt) : null,
      },
      metadata.id,
    ).getValue();
  }

  static toDbModel(entity: Trade): DbTrade {
    const metadata: DbTradeMetadata = {
      PK: DB_TRADE_PREFIX + entity.id,
      SK: DB_METADATA,
      GSI1PK: entity.status === 'accepted' ? DB_TRADE : undefined,
      GSI1SK:
        entity.status === 'accepted'
          ? DB_TRADE_PREFIX +
            entity.status +
            '#' +
            entity.acceptedAt?.toISOString()
          : undefined,
      kind: 'Trade',
      id: entity.id,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      acceptedAt: entity.acceptedAt
        ? entity.acceptedAt.toISOString()
        : undefined,
    };

    const bookOwner: DbTradeUser = {
      PK: DB_TRADE_PREFIX + entity.id,
      SK: DB_TRADE_BOOK_OWNER_PREFIX + entity.owner.id,
      GSI1PK: DB_TRADE_BOOK_OWNER_PREFIX + entity.owner.id,
      GSI1SK: DB_TRADE_PREFIX + entity.id,
      kind: `Trade's Book Owner`,
      userId: entity.owner.id,
      tradeId: entity.id,
      nickname: entity.owner.nickname,
      address: entity.owner.address,
    };

    const bookTrader: DbTradeUser = {
      PK: DB_TRADE_PREFIX + entity.id,
      SK: DB_TRADE_BOOK_TRADER_PREFIX + entity.trader.id,
      GSI1PK: DB_TRADE_BOOK_TRADER_PREFIX + entity.trader.id,
      GSI1SK: DB_TRADE_PREFIX + entity.id,
      kind: `Trade's Book Trader`,
      userId: entity.trader.id,
      tradeId: entity.id,
      nickname: entity.trader.nickname,
      address: entity.trader.address,
    };
    const tradeItems = [
      ...entity.ownerBooks.map((book): DbTradeItem => {
        return {
          PK: DB_TRADE_PREFIX + entity.id,
          SK: DB_TRADE_ITEM_PREFIX + book.id,
          GSI1PK: DB_TRADE_ITEM_PREFIX + book.id,
          GSI1SK: DB_TRADE_PREFIX + entity.id,
          kind: 'Trade Item',
          bookId: book.id,
          ownerId: book.owner.id,
          tradeId: entity.id,
          title: book.title,
          author: book.author,
          description: book.description,
        };
      }),
      ...entity.traderBooks.map((book): DbTradeItem => {
        return {
          PK: DB_TRADE_PREFIX + entity.id,
          SK: DB_TRADE_ITEM_PREFIX + book.id,
          GSI1PK: DB_TRADE_ITEM_PREFIX + book.id,
          GSI1SK: DB_TRADE_PREFIX + entity.id,
          kind: 'Trade Item',
          bookId: book.id,
          ownerId: book.owner.id,
          tradeId: entity.id,
          title: book.title,
          author: book.author,
          description: book.description,
        };
      }),
    ];

    return {
      metadata,
      tradeItems,
      bookOwner,
      bookTrader,
    };
  }
}
