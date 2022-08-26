import { BookProps } from 'src/domain/book';
import { UserDto } from './userDto';

export type BookDetailsDto = Omit<
  BookProps,
  'owner' | 'createdAt' | 'updatedAt' | 'addedAt'
> & {
  id: string;
  owner: UserDto;
};
