import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { buildMockBookRepo } from 'src/test/helper';
import { FindBookById } from './findBookById';

const dummyUser = UserDetails.create({
  id: 'testerId',
  nickname: 'tester',
}).getValue();

const dummyBook = Book.create({
  title: 'title',
  author: 'author',
  description: 'descr',
  owner: dummyUser,
}).getValue();

let useCase: FindBookById;
let mockBookRepo: BookRepo;

describe('FindBookById', () => {
  beforeEach(() => {
    mockBookRepo = buildMockBookRepo({
      findById: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
    });

    useCase = new FindBookById(mockBookRepo);
  });

  it('should return dto', async () => {
    const request = {
      bookId: 'bookId',
    };

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when entity not found', () => {
    beforeEach(() => {
      mockBookRepo = buildMockBookRepo({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new FindBookById(mockBookRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const request = {
        bookId: 'bookId',
      };

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find the entity', () => {
    beforeEach(() => {
      mockBookRepo = buildMockBookRepo({
        findById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindBookById(mockBookRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = {
        bookId: 'bookId',
      };

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
