import { Result } from 'src/core/result';
import { Trade } from 'src/domain/trade';
import { ReadOptions } from './options';

export interface TradeRepo {
  findById(tradeId: string, options?: ReadOptions): Promise<Result<Trade>>;
  findTradeByOwnerId(
    ownerId: string,
    options?: ReadOptions,
  ): Promise<Result<Trade[]>>;
  findTradeByTraderId(
    traderId: string,
    options?: ReadOptions,
  ): Promise<Result<Trade[]>>;
  findTradeByBookId(
    bookId: string,
    options?: ReadOptions,
  ): Promise<Result<Trade[]>>;
  findPendingTradeCountByBookId(
    bookId: string,
    options?: ReadOptions,
  ): Promise<Result<number>>;
  findAcceptedTrade(options?: ReadOptions): Promise<Result<Trade[]>>;

  save(trade: Trade): Promise<Result<Trade>>;
  remove(trade: Trade): Promise<Result<void>>;
}
