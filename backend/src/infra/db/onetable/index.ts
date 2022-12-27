import Dynamo from 'dynamodb-onetable/Dynamo';
import { Table, Entity } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ONETABLE_SCHEMA } from './schema';

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});

const client = new Dynamo({
  client: ddbclient,
});

export const onetable = new Table({
  name: process.env.TABLE_NAME,
  schema: ONETABLE_SCHEMA,
  client,
});

export type UserType = Entity<typeof ONETABLE_SCHEMA.models.User>;
export type BookType = Entity<typeof ONETABLE_SCHEMA.models.Book>;
export type TradeType = Entity<typeof ONETABLE_SCHEMA.models.Trade>;
export type TradeRequesterBookType = Entity<
  typeof ONETABLE_SCHEMA.models.TradeRequesterBook
>;
export type TradeDeciderBookType = Entity<
  typeof ONETABLE_SCHEMA.models.TradeDeciderBook
>;
export type TradeRequesterType = Entity<
  typeof ONETABLE_SCHEMA.models.TradeRequester
>;
export type TradeDeciderType = Entity<
  typeof ONETABLE_SCHEMA.models.TradeDecider
>;

export type TradeTypes = {
  metadata: TradeType;
  requester: TradeRequesterType;
  decider: TradeDeciderType;
  requesterBooks: TradeRequesterBookType[];
  deciderBooks: TradeDeciderBookType[];
};
