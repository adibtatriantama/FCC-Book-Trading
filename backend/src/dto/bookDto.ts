import { BookProps } from 'src/domain/book';
import { UserDto } from './userDto';

export type BookDto = Omit<BookProps, 'owner'> & { id: string; owner: UserDto };
