import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  EntityNotFoundError,
  UnexpectedError,
  UseCaseError,
} from 'src/core/useCaseError';
import { BookDto } from 'src/dto/bookDto';
import { BookMapper } from 'src/mapper/bookMapper';
import { BookRepo } from 'src/repo/bookRepo';

export type FindBookByIdRequest = string;

export type FindBookByIdResponse = Either<UseCaseError, BookDto>;

export class FindBookById
  implements UseCase<FindBookByIdRequest, FindBookByIdResponse>
{
  constructor(private readonly bookRepo: BookRepo) {}

  async execute(request: string): Promise<FindBookByIdResponse> {
    const findByIdResult = await this.bookRepo.findById(request);

    if (findByIdResult.isFailure) {
      switch (findByIdResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const poll = findByIdResult.getValue();

    return right(BookMapper.toDto(poll));
  }
}
