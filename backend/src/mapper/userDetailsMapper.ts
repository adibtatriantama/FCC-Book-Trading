import { UserDetails } from 'src/domain/userDetails';
import { UserDto } from 'src/dto/userDto';

export class UserDetailsMapper {
  static toDto(userDetails: UserDetails): UserDto {
    return {
      id: userDetails.id,
      nickname: userDetails.nickname,
      address: userDetails.address,
    };
  }
}
