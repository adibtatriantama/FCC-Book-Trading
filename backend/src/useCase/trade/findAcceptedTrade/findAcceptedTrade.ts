import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from 'src/repo/tradeRepo';

export type FindAcceptedTradeResponse = Either<UseCaseError, TradeDto[]>;

export class FindAcceptedTrade
  implements UseCase<void, FindAcceptedTradeResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(): Promise<FindAcceptedTradeResponse> {
    const findResult = await this.tradeRepo.findAcceptedTrade();

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const trades = findResult.getValue();

    return right(trades.map(TradeMapper.toDto));
  }
}
