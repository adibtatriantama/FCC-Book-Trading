import { Result } from 'src/core/result';
import { Trade } from 'src/domain/trade';

export interface TradeRepo {
  findById(tradeId: string): Promise<Result<Trade>>;

  save(trade: Trade): Promise<Result<Trade>>;
  remove(trade: Trade): Promise<Result<void>>;
}
