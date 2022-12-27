import { UserDetails } from 'src/domain/userDetails';
import { UserDto } from 'src/dto/userDto';
import { UserType } from 'src/infra/db/onetable';

export class UserDetailsMapper {
  static toDto(userDetails: UserDetails): UserDto {
    return {
      id: userDetails.id,
      nickname: userDetails.nickname,
      address: userDetails.address,
    };
  }

  static toUserDetails(
    userDetailsType: Omit<UserType, 'createdAt' | 'updatedAt' | 'email'>,
  ): UserDetails {
    return UserDetails.create({
      id: userDetailsType.id,
      nickname: userDetailsType.nickname,
      address: {
        city: userDetailsType.address.city,
        state: userDetailsType.address.state,
      },
    }).getValue();
  }
}
