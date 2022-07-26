import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { NOT_FOUND } from 'src/constant';
import { Result } from 'src/core/result';
import { User } from 'src/domain/user';
import { UserRepo } from '../userRepo';
import { DB_METADATA, DB_USER_PREFIX } from './constant';
import { DbUserMapper } from './mapper/dbUserMapper';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbUserRepo implements UserRepo {
  async findById(
    userId: string,
    options = { consistentRead: false },
  ): Promise<Result<User>> {
    let getResult;

    try {
      getResult = await ddbDoc.get({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `${DB_USER_PREFIX}${userId}`,
          SK: DB_METADATA,
        },
        ConsistentRead: options.consistentRead,
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    const item = getResult.Item;

    if (!item) {
      return Result.fail(NOT_FOUND);
    }

    const user = DbUserMapper.toEntity(item);

    return Result.ok(user);
  }

  async batchFindById(
    userIds: string[],
    options = { consistentRead: false },
  ): Promise<Result<User[]>> {
    if (userIds.length > 100) {
      return Result.fail('Too many users');
    }

    const keys = userIds.map((userId) => ({
      PK: `${DB_USER_PREFIX}${userId}`,
      SK: DB_METADATA,
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

      const users = items.map(DbUserMapper.toEntity);

      return Result.ok(users);
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }
  }

  async save(user: User): Promise<Result<User>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: DbUserMapper.toDbModel(user),
      });
    } catch (error) {
      console.error(error);
      return Result.fail('Unexpected Error');
    }

    return Result.ok(user);
  }
}
