import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';

export interface BookRepo {
  save(book: Book): Promise<Result<Book>>;
}
