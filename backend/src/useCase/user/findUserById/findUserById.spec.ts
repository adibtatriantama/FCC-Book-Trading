import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { EntityNotFoundError, UnexpectedError } from 'src/core/useCaseError';
import { User } from 'src/domain/user';
import { UserRepo } from 'src/repo/userRepo';
import { createMock } from 'ts-auto-mock';
import { FindUserById } from './findUserById';

const dummyEntity = User.create(
  {
    nickname: 'tester',
    email: 'tester@mail.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'userId',
);

let useCase: FindUserById;
let mockUserRepo: UserRepo;

describe('FindUserById', () => {
  beforeEach(() => {
    mockUserRepo = createMock<UserRepo>({
      findById: jest.fn().mockResolvedValue(Result.ok(dummyEntity)),
    });

    useCase = new FindUserById(mockUserRepo);
  });

  it('should return dto', async () => {
    const request = 'userId';

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  describe('when entity not found', () => {
    beforeEach(() => {
      mockUserRepo = createMock<UserRepo>({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });

      useCase = new FindUserById(mockUserRepo);
    });

    it('should return EntityNotFoundError', async () => {
      const request = 'userId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('when unable to find the entity', () => {
    beforeEach(() => {
      mockUserRepo = createMock<UserRepo>({
        findById: jest.fn().mockResolvedValue(Result.fail('any')),
      });

      useCase = new FindUserById(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const request = 'userId';

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value).toBeInstanceOf(UnexpectedError);
    });
  });
});
