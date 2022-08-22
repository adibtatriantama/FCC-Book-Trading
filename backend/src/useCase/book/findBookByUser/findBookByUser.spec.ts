import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { createMock } from 'ts-auto-mock';
import { FindBookByUser, FindBookByUserRequest } from './findBookByUser';

const dummyUser = UserDetails.create({
  nickname: 'tester',
  id: 'testerId',
}).getValue();

const dummyBook = Book.create({
  title: 'title',
  author: 'author',
  description: 'descr',
  owner: dummyUser,
}).getValue();

let useCase: FindBookByUser;
let mockBookRepo: BookRepo;

let request: FindBookByUserRequest;

beforeEach(() => {
  mockBookRepo = createMock<BookRepo>({
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
      mockBookRepo = createMock<BookRepo>({
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
