import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { User } from 'src/domain/user';
import { BookRepo } from 'src/repo/bookRepo';
import { FindBookByUser, FindBookByUserRequest } from './findBookByUser';

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

let useCase: FindBookByUser;
let mockBookRepo: BookRepo;

let request: FindBookByUserRequest;

const buildMockBookRepo = (params?: Partial<BookRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findRecent: params?.findRecent ?? jest.fn(),
  };
};

beforeEach(() => {
  mockBookRepo = buildMockBookRepo({
    findByUserId: jest.fn().mockResolvedValue(Result.ok([dummyBook])),
  });

  useCase = new FindBookByUser(mockBookRepo);

  request = {
    userId: 'testerId',
  };
});

describe('FindBookByUser', () => {
  it('should return dto', async () => {
    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when unable to find books', () => {
    beforeEach(() => {
      mockBookRepo = buildMockBookRepo({
        findByUserId: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindBookByUser(mockBookRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
