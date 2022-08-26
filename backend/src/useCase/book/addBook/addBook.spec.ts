import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { UserRepo } from 'src/repo/userRepo';
import { createMock } from 'ts-auto-mock';
import { AddBook, AddBookRequest } from './addBook';

let useCase: AddBook;
let mockBookRepo: BookRepo;
let mockUserRepo: UserRepo;

const date = new Date();

const dummyUser = UserDetails.create({
  id: 'testerId',
  nickname: 'tester',
}).getValue();

const dummyBook = Book.create({
  title: 'title',
  author: 'author',
  description: 'descr',
  owner: dummyUser,
  createdAt: date,
  updatedAt: date,
  addedAt: date,
}).getValue();

const dummyRequest: AddBookRequest = {
  title: 'title',
  author: 'author',
  description: 'descr',
  ownerId: 'testerId',
};

describe('AddBook', () => {
  beforeEach(() => {
    mockBookRepo = createMock<BookRepo>({
      save: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
    });
    mockUserRepo = createMock<UserRepo>({
      findById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
    });

    useCase = new AddBook(mockBookRepo, mockUserRepo);
  });

  it('should return dto', async () => {
    const response = await useCase.execute(dummyRequest);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the poll', async () => {
    await useCase.execute(dummyRequest);

    expect(mockBookRepo.save).toHaveBeenCalled();
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        save: jest.fn().mockResolvedValue(Result.fail('error')),
      });
      mockUserRepo = createMock<UserRepo>({
        findById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
      });

      useCase = new AddBook(mockBookRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when unable to get user', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        save: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
      });

      mockUserRepo = createMock<UserRepo>({
        findById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new AddBook(mockBookRepo, mockUserRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
