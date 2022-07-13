import { UserProps } from 'src/domain/user';

export type UserDto = Omit<UserProps, 'email'>;
