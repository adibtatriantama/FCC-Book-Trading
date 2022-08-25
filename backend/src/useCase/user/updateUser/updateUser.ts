import { NOT_FOUND } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import {
  UseCaseError,
  UnexpectedError,
  EntityNotFoundError,
} from 'src/core/useCaseError';
import { User, UserProps } from 'src/domain/user';
import { UserDto } from 'src/dto/userDto';
import { UserMapper } from 'src/mapper/userMapper';
import { UserRepo } from 'src/repo/userRepo';

export type UpdateUserRequest = Omit<UserProps, 'email'> & { id: string };

export type UpdateUserResponse = Either<UseCaseError, UserDto>;

export class UpdateUser
  implements UseCase<UpdateUserRequest, UpdateUserResponse>
{
  constructor(private readonly userRepo: UserRepo) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const findExistingUserResult = await this.userRepo.findById(request.id);

    if (findExistingUserResult.isFailure) {
      switch (findExistingUserResult.getErrorValue()) {
        case NOT_FOUND:
          return left(new EntityNotFoundError());
        default:
          return left(new UnexpectedError());
      }
    }

    const existingUser = findExistingUserResult.getValue();

    const user = User.create(
      {
        nickname: request.nickname ?? existingUser.nickname,
        email: existingUser.email,
        address: request.address ?? existingUser.address,
        createdAt: existingUser.createdAt,
        updatedAt: new Date(),
      },
      request.id,
    ).getValue();

    const saveResult = await this.userRepo.save(user);

    if (saveResult.isFailure) {
      return left(new UnexpectedError());
    }

    return right(UserMapper.toDto(user));
  }
}
