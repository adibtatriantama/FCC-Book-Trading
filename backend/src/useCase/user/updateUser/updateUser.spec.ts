import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { UnexpectedError } from 'src/core/useCaseError';
import { User } from 'src/domain/user';
import { UserRepo } from 'src/repo/userRepo';
import { UpdateUser, UpdateUserRequest, UserNotFoundError } from './updateUser';

let useCase: UpdateUser;
let mockUserRepo: UserRepo;

const dummyRequest: UpdateUserRequest = {
  id: 'testerId',
  nickname: 'tester',
  address: {
    state: 'state',
    city: 'city',
  },
};

const dummyUser = User.create(
  {
    nickname: 'tester',
    email: 'tester@mail.com',
    address: {
      state: 'state',
      city: 'city',
    },
  },
  'testerId',
);

const buildMockUserRepo = (params?: Partial<UserRepo>) => {
  return {
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};

describe('UpdateUser', () => {
  beforeEach(() => {
    mockUserRepo = buildMockUserRepo({
      findById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
      save: jest.fn().mockResolvedValue(Result.ok()),
    });
    useCase = new UpdateUser(mockUserRepo);
  });

  it('should return dto', async () => {
    const response = await useCase.execute(dummyRequest);

    expect(response.isRight()).toBe(true);
    expect(response.value).toBeDefined();
  });

  it('should save the user', async () => {
    await useCase.execute(dummyRequest);

    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  describe('when user is not found', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findById: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
        save: jest.fn(),
      });
      useCase = new UpdateUser(mockUserRepo);
    });

    it('should return UserNotFoundError', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UserNotFoundError);
    });
  });

  describe('when unable to save', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findById: jest.fn().mockResolvedValue(Result.ok(dummyUser)),
        save: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
      });
      useCase = new UpdateUser(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UnexpectedError);
    });
  });

  describe('when unable to check if user with same id is already exist', () => {
    beforeEach(() => {
      mockUserRepo = buildMockUserRepo({
        findById: jest.fn().mockResolvedValue(Result.fail('other error')),
        save: jest.fn(),
      });
      useCase = new UpdateUser(mockUserRepo);
    });

    it('should return UnexpectedError', async () => {
      const response = await useCase.execute(dummyRequest);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UnexpectedError);
    });
  });
});
