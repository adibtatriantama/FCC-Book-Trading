import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { Book } from 'src/domain/book';
import { UserDetails } from 'src/domain/userDetails';
import { BookRepo } from 'src/repo/bookRepo';
import { UserRepo } from 'src/repo/userRepo';
import { AddBook, AddBookRequest } from './addBook';

let useCase: AddBook;
let mockBookRepo: BookRepo;
let mockUserRepo: UserRepo;

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

const dummyRequest: AddBookRequest = {
  title: 'title',
  author: 'author',
  description: 'descr',
  ownerId: 'testerId',
};

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

const buildMockUserRepo = (params?: Partial<UserRepo>) => {
  return {
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};

describe('AddBook', () => {
  beforeEach(() => {
    mockBookRepo = buildMockBookRepo({
      save: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
    });
    mockUserRepo = buildMockUserRepo({
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
      mockBookRepo = buildMockBookRepo({
        save: jest.fn().mockResolvedValue(Result.fail('error')),
      });
      mockUserRepo = buildMockUserRepo({
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
      mockBookRepo = buildMockBookRepo({
        save: jest.fn().mockResolvedValue(Result.ok(dummyBook)),
      });

      mockUserRepo = buildMockUserRepo({
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
