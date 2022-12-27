import { Model } from 'dynamodb-onetable';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { Trade } from 'src/domain/trade';
import {
  BookType,
  onetable,
  TradeDeciderBookType,
  TradeDeciderType,
  TradeRequesterBookType,
  TradeRequesterType,
  TradeType,
} from 'src/infra/db/onetable';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from '../tradeRepo';

export class DynamoDbTradeRepo implements TradeRepo {
  private tradeModel: Model<TradeType>;
  private tradeRequesterModel: Model<TradeRequesterType>;
  private tradeDeciderModel: Model<TradeDeciderType>;
  private tradeRequesterBookModel: Model<TradeRequesterBookType>;
  private tradeDeciderBookModel: Model<TradeDeciderBookType>;
  private bookModel: Model<BookType>;
  private isDev: boolean;

  constructor() {
    this.tradeModel = onetable.getModel<TradeType>('Trade');
    this.tradeRequesterModel =
      onetable.getModel<TradeRequesterType>('TradeRequester');
    this.tradeDeciderModel =
      onetable.getModel<TradeDeciderType>('TradeDecider');
    this.tradeRequesterBookModel =
      onetable.getModel<TradeRequesterBookType>('TradeRequesterBook');
    this.tradeDeciderBookModel =
      onetable.getModel<TradeDeciderBookType>('TradeDeciderBook');
    this.bookModel = onetable.getModel<BookType>('Book');

    this.isDev = process.env.NODE_ENV !== 'production';
  }

  async findById(
    tradeId: string,
    options = { consistentRead: false },
  ): Promise<Result<Trade>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const result = await onetable.fetch(
        [
          'Trade',
          'TradeRequester',
          'TradeDecider',
          'TradeRequesterBook',
          'TradeDeciderBook',
        ],
        { PK: `t#${tradeId}` },
        { consistent: options.consistentRead, stats },
      );

      if (stats) {
        console.log(stats);
      }

      if (
        !(
          result.Trade?.length > 0 ||
          result.TradeRequester?.length > 0 ||
          result.TradeDecider?.length > 0
        )
      ) {
        return Result.fail(NOT_FOUND);
      }

      const metadata = result.Trade[0] as TradeType;
      const requester = result.TradeRequester[0] as TradeRequesterType;
      const decider = result.TradeDecider[0] as TradeDeciderType;
      const requesterBooks = (result.TradeRequesterBook ??
        []) as TradeRequesterBookType[];
      const deciderBooks = (result.TradeDeciderBook ??
        []) as TradeDeciderBookType[];

      const trade = TradeMapper.toTrade({
        metadata,
        requester,
        decider,
        requesterBooks,
        deciderBooks,
      });

      return Result.ok(trade);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByOwnerId(
    ownerId: string,
    options = { consistentRead: false },
  ): Promise<Result<Trade[]>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const tradeIds = (
        await this.tradeDeciderModel.find(
          {
            userId: ownerId,
          },
          {
            index: 'GSI1',
            consistent: options.consistentRead,
            reverse: true,
            stats,
          },
        )
      ).map((item) => item.tradeId);

      if (stats) {
        console.log(stats);
      }

      const findTradeResults = await Promise.all(
        tradeIds.map((id) => this.findById(id)),
      );

      const trades = findTradeResults
        .filter((result) => result.isSuccess)
        .map((result) => result.getValue());

      return Result.ok(trades);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByTraderId(
    traderId: string,
    options = { consistentRead: false },
  ): Promise<Result<Trade[]>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const tradeIds = (
        await this.tradeRequesterModel.find(
          {
            userId: traderId,
          },
          {
            index: 'GSI1',
            reverse: true,
            consistent: options.consistentRead,
            stats,
          },
        )
      ).map((item) => item.tradeId);

      if (stats) {
        console.log(stats);
      }

      const findTradeResults = await Promise.all(
        tradeIds.map((id) => this.findById(id)),
      );

      const trades = findTradeResults
        .filter((result) => result.isSuccess)
        .map((result) => result.getValue());

      return Result.ok(trades);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByBookId(
    bookId: string,
    options = { consistentRead: false },
  ): Promise<Result<Trade[]>> {
    try {
      let next;
      const tradeIds: string[] = [];

      do {
        const stats = this.isDev ? {} : undefined;
        const items = await onetable.fetch(
          ['TradeRequesterBook', 'TradeDeciderBook'],
          { GSI1PK: `b#${bookId}` },
          {
            index: 'GSI1',
            consistent: options.consistentRead,
            reverse: true,
            next,
            stats,
          },
        );

        if (stats) {
          console.log(stats);
        }

        tradeIds.push(
          ...[...items.TradeRequesterBook, ...items.TradeDeciderBook].map(
            (item) => item.tradeId,
          ),
        );

        next = items.next;
      } while (next);

      const findTradeResults = await Promise.all(
        tradeIds
          // Sort alphabetically descending
          .sort((a, b) => {
            if (a < b) {
              return 1;
            }
            if (a > b) {
              return -1;
            }
            return 0;
          })
          .map((id) => this.findById(id)),
      );

      const trades = findTradeResults
        .filter((result) => result.isSuccess)
        .map((result) => result.getValue());

      return Result.ok(trades);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findPendingTradeCountByBookId(
    bookId: string,
    options = { consistentRead: false },
  ): Promise<Result<number>> {
    const tradesResult = await this.findTradeByBookId(bookId, options);

    if (tradesResult.isFailure) {
      console.error(tradesResult.getErrorValue());
      return Result.fail(tradesResult.getErrorValue());
    }

    const pendingTradeCount = tradesResult
      .getValue()
      .filter((trade) => trade.status === 'pending').length;

    return Result.ok(pendingTradeCount);
  }

  async findAcceptedTrade(
    options = { consistentRead: false },
  ): Promise<Result<Trade[]>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const tradeIds = (
        await this.tradeModel.find(
          { status: 'accepted' },
          {
            index: 'GSI1',
            consistent: options.consistentRead,
            reverse: true,
            stats,
          },
        )
      ).map((item) => item.id);

      if (stats) {
        console.log(stats);
      }

      const findTradeResults = await Promise.all(
        tradeIds.map((id) => this.findById(id)),
      );

      const trades = findTradeResults
        .filter((result) => result.isSuccess)
        .map((result) => result.getValue());

      return Result.ok(trades);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async save(trade: Trade): Promise<Result<Trade>> {
    try {
      if (trade.isNew) {
        const stats1 = this.isDev ? {} : undefined;
        const tradeTypes = TradeMapper.toTradeTypes(trade);
        const batch = {};

        await this.tradeModel.create(tradeTypes.metadata, { batch });
        await this.tradeDeciderModel.create(tradeTypes.decider, { batch });
        await this.tradeRequesterModel.create(tradeTypes.requester, { batch });

        await onetable.batchWrite(batch, {
          stats: stats1,
        });

        if (stats1) {
          console.log(stats1);
        }

        for (let i = 0; i < tradeTypes.requesterBooks.length; i += 25) {
          const bookSlice = tradeTypes.requesterBooks.slice(i, i + 25);
          const stats2 = this.isDev ? {} : undefined;
          const batch2 = {};

          for (let j = 0; j < bookSlice.length; j++) {
            await this.tradeRequesterBookModel.create(bookSlice[j], {
              batch: batch2,
            });
          }

          await onetable.batchWrite(batch2, {
            stats: stats2,
          });

          if (stats2) {
            console.log(stats2);
          }
        }

        for (let i = 0; i < tradeTypes.deciderBooks.length; i += 25) {
          const bookSlice = tradeTypes.deciderBooks.slice(i, i + 25);
          const stats2 = this.isDev ? {} : undefined;
          const batch2 = {};

          for (let j = 0; j < bookSlice.length; j++) {
            await this.tradeDeciderBookModel.create(bookSlice[j], {
              batch: batch2,
            });
          }

          await onetable.batchWrite(batch2, {
            stats: stats2,
          });

          if (stats2) {
            console.log(stats2);
          }
        }
      }

      return Result.ok(trade);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async remove(trade: Trade): Promise<Result<void>> {
    try {
      const stats1 = this.isDev ? {} : undefined;
      const tradeTypes = TradeMapper.toTradeTypes(trade);
      const batch = {};

      await this.tradeModel.remove(tradeTypes.metadata, { batch });
      await this.tradeDeciderModel.remove(tradeTypes.decider, { batch });
      await this.tradeRequesterModel.remove(tradeTypes.requester, { batch });

      await onetable.batchWrite(batch, {
        stats: stats1,
      });

      if (stats1) {
        console.log(stats1);
      }

      for (let i = 0; i < tradeTypes.requesterBooks.length; i += 25) {
        const bookSlice = tradeTypes.requesterBooks.slice(i, i + 25);
        const stats2 = this.isDev ? {} : undefined;
        const batch2 = {};

        for (let j = 0; j < bookSlice.length; j++) {
          await this.tradeRequesterBookModel.remove(bookSlice[j], {
            batch: batch2,
          });
        }

        await onetable.batchWrite(batch2, {
          stats: stats2,
        });

        if (stats2) {
          console.log(stats2);
        }
      }

      for (let i = 0; i < tradeTypes.deciderBooks.length; i += 25) {
        const bookSlice = tradeTypes.deciderBooks.slice(i, i + 25);
        const stats2 = this.isDev ? {} : undefined;
        const batch2 = {};

        for (let j = 0; j < bookSlice.length; j++) {
          await this.tradeDeciderBookModel.remove(bookSlice[j], {
            batch: batch2,
          });
        }

        await onetable.batchWrite(batch2, {
          stats: stats2,
        });

        if (stats2) {
          console.log(stats2);
        }
      }

      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }
}
