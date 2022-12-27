import { Model } from 'dynamodb-onetable';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';
import { BookType, onetable } from 'src/infra/db/onetable';
import { BookMapper } from 'src/mapper/bookMapper';
import { BookRepo } from '../bookRepo';

export class DynamoDbBookRepo implements BookRepo {
  private bookModel: Model<BookType>;
  private isDev: boolean;

  constructor() {
    this.bookModel = onetable.getModel<BookType>('Book');

    this.isDev = process.env.NODE_ENV !== 'production';
  }

  async findById(
    bookId: string,
    options = { consistentRead: false },
  ): Promise<Result<Book>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const result = await this.bookModel.get(
        { id: bookId },
        { consistent: options.consistentRead, stats },
      );

      if (stats) {
        console.log(stats);
      }

      if (!result) {
        return Result.fail(NOT_FOUND);
      }

      const book = BookMapper.toBook(result);

      return Result.ok(book);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async batchFindById(
    bookIds: string[],
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    try {
      const stats = this.isDev ? {} : undefined;
      const books: Book[] = [];

      // Map Entries: Maximum number of 100 items. https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
      for (let i = 0; i < bookIds.length; i += 100) {
        const bookIdsSlice = bookIds.slice(i, i + 100);
        const batch = {};

        for (const userId of bookIdsSlice) {
          await this.bookModel.get({ id: userId }, { batch });
        }

        const result = await onetable.batchGet(batch, {
          consistent: options.consistentRead,
          stats,
        });

        if (stats) {
          console.log(stats);
        }

        books.push(...(result as BookType[]).map(BookMapper.toBook));
      }

      return Result.ok(books);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async findByUserId(
    userId: string,
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    const books: Book[] = [];
    let next: any;

    try {
      do {
        const stats = this.isDev ? {} : undefined;
        const items = await this.bookModel.find(
          { ownerId: userId },
          {
            index: 'GSI1',
            reverse: true,
            consistent: options.consistentRead,
            stats,
            next,
          },
        );

        if (stats) {
          console.log(stats);
        }

        books.push(...items.map(BookMapper.toBook));

        next = items.next;
      } while (next);

      return Result.ok(books);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findRecent(
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    const books: Book[] = [];
    let next: any;

    try {
      do {
        const stats = this.isDev ? {} : undefined;
        const items = await this.bookModel.find(
          {},
          {
            index: 'GSI2',
            reverse: true,
            consistent: options.consistentRead,
            stats,
            next,
          },
        );

        if (stats) {
          console.log(stats);
        }

        books.push(...items.map(BookMapper.toBook));

        next = items.next;
      } while (next);

      return Result.ok(books);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async save(book: Book): Promise<Result<Book>> {
    try {
      const stats = this.isDev ? {} : undefined;

      const result = await this.bookModel.create(BookMapper.toBookType(book), {
        stats,
      });

      if (stats) {
        console.log(stats);
      }

      const createdBook = BookMapper.toBook(result);

      return Result.ok(createdBook);
    } catch (error) {
      console.error(error);
      return Result.fail('unexpected error');
    }
  }

  async remove(book: Book): Promise<Result<void>> {
    try {
      const stats = this.isDev ? {} : undefined;

      await this.bookModel.remove(
        {
          id: book.id,
        },
        {
          stats,
        },
      );

      if (stats) {
        console.log(stats);
      }
      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }
}
