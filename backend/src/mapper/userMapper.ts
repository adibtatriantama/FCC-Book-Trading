import { User } from 'src/domain/user';
import { UserDto } from 'src/dto/userDto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      nickname: user.nickname,
      address: user.address,
    };
  }
}
