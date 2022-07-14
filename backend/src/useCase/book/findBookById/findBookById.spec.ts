import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { User } from 'src/domain/user';
import { BookRepo } from 'src/repo/bookRepo';
import { FindBookById } from './findBookById';

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

let useCase: FindBookById;
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

describe('FindBookById', () => {
  beforeEach(() => {
    mockBookRepo = buildMockBookRepo({
      findById: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
    });

    useCase = new FindBookById(mockBookRepo);
  });

  it('should return dto', async () => {
    const request = 'pollId';

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
      const request = 'pollId';

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
      const request = 'pollId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
