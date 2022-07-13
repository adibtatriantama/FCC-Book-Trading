import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { Book, BookProps } from 'src/domain/book';
import { BookDto } from 'src/dto/bookDto';
import { BookMapper } from 'src/mapper/bookMapper';
import { BookRepo } from 'src/repo/bookRepo';
import { UserRepo } from 'src/repo/userRepo';

export type AddBookRequest = Omit<BookProps, 'owner'> & { ownerId: string };

export type AddBookResponse = Either<UseCaseError, BookDto>;

export class AddBook implements UseCase<AddBookRequest, AddBookResponse> {
  constructor(
    private readonly bookRepo: BookRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async execute(request: AddBookRequest): Promise<AddBookResponse> {
    const getUserResult = await this.userRepo.findById(request.ownerId);

    if (getUserResult.isFailure) {
      return left(new UnexpectedError());
    }

    const owner = getUserResult.getValue();

    const book = Book.create({
      owner,
      ...request,
    }).getValue();

    const saveResult = await this.bookRepo.save(book);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    const savedBook = saveResult.getValue();

    return right(BookMapper.toDto(savedBook));
  }
}
