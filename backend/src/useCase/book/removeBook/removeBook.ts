import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';

export type RemoveBookRequest = {
  userId: string;
  bookId: string;
};

export class UnableToRemoveBookError extends UseCaseError {
  constructor(message: string) {
    super(`Unable to remove book, ${message}`);
  }
}

export type RemoveBookResponse = Either<UseCaseError, void>;

export class RemoveBook
  implements UseCase<RemoveBookRequest, RemoveBookResponse>
{
  constructor(
    private readonly bookRepo: BookRepo,
    private readonly tradeRepo: TradeRepo,
  ) {}

  async execute(request: RemoveBookRequest): Promise<RemoveBookResponse> {
    const findBookResult = await this.bookRepo.findById(request.bookId);
    const findPendingTradeCountResult =
      await this.tradeRepo.findPendingTradeCountByBookId(request.bookId);

    if (findBookResult.isFailure) {
      switch (findBookResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    console.log(findPendingTradeCountResult);
    if (findPendingTradeCountResult.isFailure) {
      return left(new UnexpectedError());
    }

    const pendingTradeCount = findPendingTradeCountResult.getValue();

    if (pendingTradeCount > 0) {
      return left(
        new UnableToRemoveBookError(
          'Book is involved in pending trades, please cancel or reject the trades first',
        ),
      );
    }

    const book = findBookResult.getValue();

    if (book.owner.id !== request.userId) {
      return left(
        new UnableToRemoveBookError('You are not the owner of the book'),
      );
    }

    const removeResult = await this.bookRepo.remove(book);

    if (removeResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(undefined);
  }
}
