import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from 'src/repo/tradeRepo';

export type FindTradeByOwnerRequest = {
  ownerId: string;
};

export type FindTradeByOwnerResponse = Either<UseCaseError, TradeDto[]>;

export class FindTradeByOwner
  implements UseCase<FindTradeByOwnerRequest, FindTradeByOwnerResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(
    request: FindTradeByOwnerRequest,
  ): Promise<FindTradeByOwnerResponse> {
    const findResult = await this.tradeRepo.findTradeByOwnerId(request.ownerId);

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const trades = findResult.getValue();

    return right(trades.map(TradeMapper.toDto));
  }
}
