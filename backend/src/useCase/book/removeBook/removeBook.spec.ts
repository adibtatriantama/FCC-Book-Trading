import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';
import { createMock } from 'ts-auto-mock';
import {
  RemoveBook,
  RemoveBookRequest,
  UnableToRemoveBookError,
} from './removeBook';

let useCase: RemoveBook;
let mockBookRepo: BookRepo;
let mockTradeRepo: TradeRepo;

const dummyUser = UserDetails.create({
  id: 'testerId',
  nickname: 'tester',
}).getValue();

const dummyBook = Book.create(
  {
    title: 'title',
    author: 'author',
    description: 'descr',
    owner: dummyUser,
  },
  'bookId',
).getValue();

let request: RemoveBookRequest;

beforeEach(() => {
  mockBookRepo = createMock<BookRepo>({
    findById: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
    remove: jest.fn().mockResolvedValue(Result.ok()),
  });
  mockTradeRepo = createMock<TradeRepo>({
    findPendingTradeCountByBookId: jest.fn().mockResolvedValue(Result.ok(0)),
  });

  useCase = new RemoveBook(mockBookRepo, mockTradeRepo);

  request = {
    bookId: 'bookId',
    userId: 'testerId',
  };
});

describe('RemoveBook', () => {
  it('should return ok result', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
  });

  it('should remove the book', async () => {
    await useCase.execute(request);

    expect(mockBookRepo.remove).toHaveBeenCalled();
  });

  describe('when book not found', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new RemoveBook(mockBookRepo, mockTradeRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find book', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        findById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemoveBook(mockBookRepo, mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe("when user isn't the owner", () => {
    beforeEach(() => {
      request = {
        bookId: 'bookId',
        userId: 'anotherPerson',
      };
    });

    it('should return UnableToRemoveBookError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRemoveBookError);
    });
  });

  describe('when unable to remove', () => {
    beforeEach(() => {
      mockBookRepo = createMock<BookRepo>({
        findById: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
        remove: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemoveBook(mockBookRepo, mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });

  describe('when book is involved in pending trade', () => {
    beforeEach(() => {
      mockTradeRepo = createMock<TradeRepo>({
        findPendingTradeCountByBookId: jest
          .fn()
          .mockResolvedValue(Result.ok(1)),
      });

      useCase = new RemoveBook(mockBookRepo, mockTradeRepo);
    });

    it('should return UnableToRemoveBookError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnableToRemoveBookError);
    });
  });

  describe('when unable to find pending trade count', () => {
    beforeEach(() => {
      mockTradeRepo = createMock<TradeRepo>({
        findPendingTradeCountByBookId: jest
          .fn()
          .mockResolvedValue(Result.fail('any')),
      });

      useCase = new RemoveBook(mockBookRepo, mockTradeRepo);
    });

    it('should return unexpected error', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
