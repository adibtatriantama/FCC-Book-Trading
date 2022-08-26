import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { TradeRepo } from 'src/repo/tradeRepo';

export type RemoveTradeRequest = {
  userId: string;
  tradeId: string;
};

export class UnableToRemoveTradeError extends UseCaseError {
  constructor(message: string) {
    super('Unable to remove trade, ' + message);
  }
}

export type RemoveTradeResponse = Either<UseCaseError, void>;

export class RemoveTrade
  implements UseCase<RemoveTradeRequest, RemoveTradeResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(request: RemoveTradeRequest): Promise<RemoveTradeResponse> {
    const getTradeResult = await this.tradeRepo.findById(request.tradeId);

    if (getTradeResult.isFailure) {
      switch (getTradeResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const trade = getTradeResult.getValue();

    if (trade.requester.id !== request.userId) {
      return left(
        new UnableToRemoveTradeError('You are not the one proposing the trade'),
      );
    }

    if (trade.status !== 'pending') {
      return left(new UnableToRemoveTradeError('Trade is not pending'));
    }

    const removeResult = await this.tradeRepo.remove(trade);

    if (removeResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(undefined);
  }
}
