import { Book } from 'src/domain/book';
import { BookDto } from 'src/dto/bookDto';
import { UserMapper } from './userMapper';

export class BookMapper {
  static toDto(book: Book): BookDto {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      owner: UserMapper.toDto(book.owner),
    };
  }
}
