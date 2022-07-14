import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { BookDto } from 'src/dto/bookDto';
import { BookMapper } from 'src/mapper/bookMapper';
import { BookRepo } from 'src/repo/bookRepo';

export type FindBookByUserRequest = {
  userId: string;
};

export type FindBookByUserResponse = Either<UseCaseError, BookDto[]>;

export class FindBookByUser
  implements UseCase<FindBookByUserRequest, FindBookByUserResponse>
{
  constructor(private readonly bookRepo: BookRepo) {}

  async execute(
    request: FindBookByUserRequest,
  ): Promise<FindBookByUserResponse> {
    const findResult = await this.bookRepo.findByUserId(request.userId);

    if (findResult.isFailure) {
      return left(new UnexpectedError());
    }

    const books = findResult.getValue();

    return right(books.map(BookMapper.toDto));
  }
}
