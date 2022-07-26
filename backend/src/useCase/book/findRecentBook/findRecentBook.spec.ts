import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { buildMockBookRepo } from 'src/test/helper';
import { FindRecentBook } from './findRecentBook';

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

let useCase: FindRecentBook;
let mockBookRepo: BookRepo;

beforeEach(() => {
  mockBookRepo = buildMockBookRepo({
    findRecent: jest.fn().mockResolvedValue(Result.ok([dummyBook])),
  });

  useCase = new FindRecentBook(mockBookRepo);
});

describe('FindRecentBook', () => {
  it('should return dto', async () => {
    const response = await useCase.execute();

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when unable to find books', () => {
    beforeEach(() => {
      mockBookRepo = buildMockBookRepo({
        findRecent: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindRecentBook(mockBookRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute();

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
