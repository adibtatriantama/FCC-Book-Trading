import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { Book } from 'src/domain/book';
import { BookRepo } from '../bookRepo';
import { DB_BOOK, DB_BOOK_PREFIX, DB_USER_PREFIX } from './constant';
import { DbBookMapper } from './mapper/dbBookMapper';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbBookRepo implements BookRepo {
  async findById(
    bookId: string,
    options = { consistentRead: false },
  ): Promise<Result<Book>> {
    try {
      const getResult = await ddbDoc.get({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: DB_BOOK,
          SK: DB_BOOK_PREFIX + bookId,
        },
        ConsistentRead: options.consistentRead,
      });

      const item = getResult.Item;

      if (!item) {
        return Result.fail(NOT_FOUND);
      }

      const entity = DbBookMapper.toEntity(item);

      return Result.ok(entity);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async batchFindById(
    bookIds: string[],
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    if (bookIds.length > 100) {
      return Result.fail('Too many books');
    }

    const keys = bookIds.map((bookId) => ({
      PK: DB_BOOK,
      SK: DB_BOOK_PREFIX + bookId,
    }));

    try {
      const batchItemGetResult = await ddbDoc.batchGet({
        RequestItems: {
          [process.env.TABLE_NAME]: {
            Keys: keys,
            ConsistentRead: options.consistentRead,
          },
        },
      });

      const items = batchItemGetResult.Responses[process.env.TABLE_NAME];

      if (!items) {
        return Result.fail(NOT_FOUND);
      }

      const entities = items.map(DbBookMapper.toEntity);

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findByUserId(
    userId: string,
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    const entities: Book[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression:
            'GSI1PK = :pk AND begins_with(GSI1SK, :bookPrefix)',
          ExpressionAttributeValues: {
            ':pk': DB_USER_PREFIX + userId,
            ':bookPrefix': DB_BOOK_PREFIX,
          },
          IndexName: 'GSI1',
          ScanIndexForward: false,
          ExclusiveStartKey: lastEvaluatedKey,
          ConsistentRead: options.consistentRead,
        });

        const items = queryResult.Items;

        entities.push(...items.map(DbBookMapper.toEntity));

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findRecent(
    options = { consistentRead: false },
  ): Promise<Result<Book[]>> {
    const entities: Book[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :bookPrefix)',
          ExpressionAttributeValues: {
            ':pk': DB_BOOK,
            ':bookPrefix': DB_BOOK_PREFIX,
          },
          ScanIndexForward: false,
          ExclusiveStartKey: lastEvaluatedKey,
          ConsistentRead: options.consistentRead,
        });

        const items = queryResult.Items;

        entities.push(...items.map(DbBookMapper.toEntity));

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async save(book: Book): Promise<Result<Book>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: DbBookMapper.toDbModel(book),
      });

      return Result.ok(book);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async remove(book: Book): Promise<Result<void>> {
    try {
      await ddbDoc.delete({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: DB_BOOK,
          SK: DB_BOOK_PREFIX + book.id,
        },
      });

      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }
}
