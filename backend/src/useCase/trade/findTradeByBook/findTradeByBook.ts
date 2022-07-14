import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { TradeDto } from 'src/dto/tradeDto';
import { TradeMapper } from 'src/mapper/tradeMapper';
import { TradeRepo } from 'src/repo/tradeRepo';

export type FindTradeByBookRequest = {
  bookId: string;
};

export type FindTradeByBookResponse = Either<UseCaseError, TradeDto[]>;

export class FindTradeByBook
  implements UseCase<FindTradeByBookRequest, FindTradeByBookResponse>
{
  constructor(private readonly tradeRepo: TradeRepo) {}

  async execute(
    request: FindTradeByBookRequest,
  ): Promise<FindTradeByBookResponse> {
    const findResult = await this.tradeRepo.findTradeByBookId(request.bookId);

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const trades = findResult.getValue();

    return right(trades.map(TradeMapper.toDto));
  }
}
