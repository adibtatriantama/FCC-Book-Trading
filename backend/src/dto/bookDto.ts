import { BookProps } from 'src/domain/book';
import { UserDto } from './userDto';

export type BookDto = Omit<
  BookProps,
  'owner' | 'createdAt' | 'updatedAt' | 'addedAt'
> & {
  id: string;
  owner: UserDto;
  createdAt: string;
  updatedAt: string;
  addedAt: string;
};
