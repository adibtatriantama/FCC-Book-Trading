import { Result } from 'src/core/result';
import { Trade } from 'src/domain/trade';

export interface TradeRepo {
  save(trade: Trade): Promise<Result<Trade>>;
}
