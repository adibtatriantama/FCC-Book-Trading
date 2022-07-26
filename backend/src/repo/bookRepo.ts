import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';
import { ReadOptions } from './options';

export interface BookRepo {
  findById(bookId: string, options?: ReadOptions): Promise<Result<Book>>;
  batchFindById(
    bookIds: string[],
    options?: ReadOptions,
  ): Promise<Result<Book[]>>;
  findByUserId(userId: string, options?: ReadOptions): Promise<Result<Book[]>>;
  findRecent(options?: ReadOptions): Promise<Result<Book[]>>;

  save(book: Book): Promise<Result<Book>>;
  remove(book: Book): Promise<Result<void>>;
}
