import { Book } from 'src/domain/book';
import { BookDto } from 'src/dto/bookDto';
import { UserDetailsMapper } from './userDetailsMapper';

export class BookMapper {
  static toDto(book: Book): BookDto {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      owner: UserDetailsMapper.toDto(book.owner),
    };
  }
}
