import { User } from 'src/domain/user';
import { UserDetails } from 'src/domain/userDetails';
import { UserDto } from 'src/dto/userDto';
import { UserType } from 'src/infra/db/onetable';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      nickname: user.nickname,
      address: user.address,
    };
  }

  static toUserType(user: User): UserType {
    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toUser(userType: UserType): User {
    return User.create(
      {
        nickname: userType.nickname,
        email: userType.email,
        address: {
          city: userType.address.city,
          state: userType.address.state,
        },
        createdAt: userType.createdAt,
        updatedAt: userType.updatedAt,
      },
      userType.id,
    ).getValue();
  }

  static toDetails(user: User): UserDetails {
    return UserDetails.create({
      id: user.id,
      nickname: user.nickname,
      address: user.address,
    }).getValue();
  }
}
