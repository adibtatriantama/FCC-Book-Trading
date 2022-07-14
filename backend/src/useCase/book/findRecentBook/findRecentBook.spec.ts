import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { User } from 'src/domain/user';
import { BookRepo } from 'src/repo/bookRepo';
import { FindRecentBook } from './findRecentBook';

const dummyUser = User.create(
  { nickname: 'tester', email: 'tester@mail.com' },
  'testerId',
).getValue();

const dummyBook = Book.create({
  title: 'title',
  author: 'author',
  description: 'descr',
  owner: dummyUser,
}).getValue();

let useCase: FindRecentBook;
let mockBookRepo: BookRepo;

const buildMockBookRepo = (params?: Partial<BookRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findRecent: params?.findRecent ?? jest.fn(),
    remove: params?.remove ?? jest.fn(),
  };
};

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
