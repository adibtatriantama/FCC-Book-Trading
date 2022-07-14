import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { BookDto } from 'src/dto/bookDto';
import { BookMapper } from 'src/mapper/bookMapper';
import { BookRepo } from 'src/repo/bookRepo';

export type FindRecentBookRequest = void;

export type FindRecentBookResponse = Either<UseCaseError, BookDto[]>;

export class FindRecentBook
  implements UseCase<FindRecentBookRequest, FindRecentBookResponse>
{
  constructor(private readonly bookRepo: BookRepo) {}

  async execute(): Promise<FindRecentBookResponse> {
    const findResult = await this.bookRepo.findRecent();

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const books = findResult.getValue();

    return right(books.map(BookMapper.toDto));
  }
}
