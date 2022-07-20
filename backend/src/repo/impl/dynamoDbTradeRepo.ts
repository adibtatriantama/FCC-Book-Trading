import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { Trade } from 'src/domain/trade';
import { TradeRepo } from '../tradeRepo';
import {
  DB_TRADE_BOOK_OWNER_PREFIX,
  DB_TRADE_BOOK_TRADER_PREFIX,
  DB_TRADE_ITEM_PREFIX,
  DB_TRADE_PREFIX,
} from './constant';
import { DbBookMapper } from './mapper/dbBookMapper';
import { DbTradeMapper } from './mapper/dbTradeMapper';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbTradeRepo implements TradeRepo {
  async findById(tradeId: string): Promise<Result<Trade>> {
    const items: Record<string, any>[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': DB_TRADE_PREFIX + tradeId,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        });

        items.push(...queryResult.Items);

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      if (!items || items.length === 0) {
        return Result.fail(NOT_FOUND);
      }

      const metadata = items.find((item) => /metadata/.test(item.SK));
      const bookOwner = items.find((item) => /ow#.*/.test(item.SK));
      const bookTrader = items.find((item) => /tr#.*/.test(item.SK));
      const tradeItems = items.filter((item) => /ti#.*/.test(item.SK));

      const entity = DbTradeMapper.toEntity({
        metadata,
        bookOwner,
        bookTrader,
        tradeItems,
      });

      return Result.ok(entity);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByOwnerId(ownerId: string): Promise<Result<Trade[]>> {
    const items: Record<string, any>[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression:
            'GSI1PK = :pk AND begins_with(GSI1SK, :tradePrefix)',
          ExpressionAttributeValues: {
            ':pk': DB_TRADE_BOOK_OWNER_PREFIX + ownerId,
            ':tradePrefix': DB_TRADE_PREFIX,
          },
          IndexName: 'GSI1',
          ExclusiveStartKey: lastEvaluatedKey,
        });

        items.push(...queryResult.Items);

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      const findByIdPromises = items.map((item) => {
        return this.findById(item.tradeId);
      });

      const findByIdResults = await Promise.all(findByIdPromises);

      const entities = findByIdResults.map((result) => result.getValue());

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByTraderId(traderId: string): Promise<Result<Trade[]>> {
    const items: Record<string, any>[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression:
            'GSI1PK = :pk AND begins_with(GSI1SK, :tradePrefix)',
          ExpressionAttributeValues: {
            ':pk': DB_TRADE_BOOK_TRADER_PREFIX + traderId,
            ':tradePrefix': DB_TRADE_PREFIX,
          },
          IndexName: 'GSI1',
          ExclusiveStartKey: lastEvaluatedKey,
        });

        items.push(...queryResult.Items);

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      const findByIdPromises = items.map((item) => {
        return this.findById(item.tradeId);
      });

      const findByIdResults = await Promise.all(findByIdPromises);

      const entities = findByIdResults.map((result) => result.getValue());

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findTradeByBookId(bookId: string): Promise<Result<Trade[]>> {
    const items: Record<string, any>[] = [];

    let firstLoad = true;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    try {
      while (firstLoad || lastEvaluatedKey) {
        const queryResult = await ddbDoc.query({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression:
            'GSI1PK = :pk AND begins_with(GSI1SK, :tradePrefix)',
          ExpressionAttributeValues: {
            ':pk': DB_TRADE_ITEM_PREFIX + bookId,
            ':tradePrefix': DB_TRADE_PREFIX,
          },
          IndexName: 'GSI1',
          ExclusiveStartKey: lastEvaluatedKey,
        });

        items.push(...queryResult.Items);

        firstLoad = false;
        lastEvaluatedKey = queryResult.LastEvaluatedKey;
      }

      const findByIdPromises = items.map((item) => {
        return this.findById(item.tradeId);
      });

      const findByIdResults = await Promise.all(findByIdPromises);

      const entities = findByIdResults.map((result) => result.getValue());

      return Result.ok(entities);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async findPendingTradeCountByBookId(bookId: string): Promise<Result<number>> {
    try {
      const findResult = await this.findTradeByBookId(bookId);

      if (findResult.isSuccess) {
        const entities = findResult.getValue();

        const count = entities.filter(
          (entity) => entity.status === 'pending',
        ).length;

        return Result.ok(count);
      } else {
        throw new Error(findResult.getErrorValue());
      }
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async save(trade: Trade): Promise<Result<Trade>> {
    const dbModel = DbTradeMapper.toDbModel(trade);

    // always update metadata
    const putRequests: { PutRequest: { Item: Record<string, any> } }[] = [
      {
        PutRequest: { Item: dbModel.metadata },
      },
    ];

    // write whole partition if new
    if (trade.isNew) {
      putRequests.push(
        {
          PutRequest: {
            Item: dbModel.bookOwner,
          },
        },
        {
          PutRequest: {
            Item: dbModel.bookTrader,
          },
        },
        ...dbModel.tradeItems.map((item) => {
          return {
            PutRequest: {
              Item: item,
            },
          };
        }),
      );
    }

    // if book ownership changed, update the book, book inside trade isn't changed for history
    if (trade.isBookOwnershipChanged) {
      const bookModels = [...trade.ownerBooks, ...trade.traderBooks].map(
        DbBookMapper.toDbModel,
      );

      putRequests.push(
        ...bookModels.map((item) => {
          return {
            PutRequest: {
              Item: item,
            },
          };
        }),
      );
    }

    const batchWritePromises = [];

    // max write 25 item in batchrequest
    for (let i = 0; i < putRequests.length; i += 25) {
      batchWritePromises.push(
        ddbDoc.batchWrite({
          RequestItems: {
            [process.env.TABLE_NAME]: [...putRequests.slice(i, i + 25)],
          },
        }),
      );
    }

    try {
      await Promise.all(batchWritePromises);

      return Result.ok(trade);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async remove(trade: Trade): Promise<Result<void>> {
    const dbModel = DbTradeMapper.toDbModel(trade);

    const allItems: { PK: string; SK: string }[] = [
      dbModel.metadata,
      dbModel.bookOwner,
      dbModel.bookTrader,
      ...dbModel.tradeItems,
    ];

    const deleteRequest: { DeleteRequest: { Key: Record<string, any> } }[] =
      allItems.map((item) => {
        return {
          DeleteRequest: {
            Key: {
              PK: item.PK,
              SK: item.SK,
            },
          },
        };
      });

    const batchWritePromises = [];

    // max write 25 item in batchrequest
    for (let i = 0; i < deleteRequest.length; i += 25) {
      batchWritePromises.push(
        ddbDoc.batchWrite({
          RequestItems: {
            [process.env.TABLE_NAME]: [...deleteRequest.slice(i, i + 25)],
          },
        }),
      );
    }

    try {
      await Promise.all(batchWritePromises);

      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }
}
