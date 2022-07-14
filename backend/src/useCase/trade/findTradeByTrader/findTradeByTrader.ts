import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from 'src/repo/tradeRepo';

export type FindTradeByTraderRequest = {
  traderId: string;
};

export type FindTradeByTraderResponse = Either<UseCaseError, TradeDto[]>;

export class FindTradeByTrader
  implements UseCase<FindTradeByTraderRequest, FindTradeByTraderResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(
    request: FindTradeByTraderRequest,
  ): Promise<FindTradeByTraderResponse> {
    const findResult = await this.tradeRepo.findTradeByTraderId(
      request.traderId,
    );

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const trades = findResult.getValue();

    return right(trades.map(TradeMapper.toDto));
  }
}
