import { User } from 'src/domain/user';
import { UserDetails } from 'src/domain/userDetails';
import { UserDto } from 'src/dto/userDto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      nickname: user.nickname,
      address: user.address,
    };
  }

  static toDetails(user: User): UserDetails {
    return UserDetails.create({
      id: user.id,
      nickname: user.nickname,
      address: user.address,
    }).getValue();
  }
}
