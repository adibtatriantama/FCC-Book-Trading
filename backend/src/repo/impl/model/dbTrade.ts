export type DbTrade = {
  metadata: DbTradeMetadata;
  tradeItems: DbTradeItem[];
  bookOwner: DbTradeUser;
  bookTrader: DbTradeUser;
};

export type DbTradeMetadata = {
  PK: string;
  SK: string;
  kind: string;
  id: string;
  status: string;
  createdAt: string;
};

export type DbTradeItem = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  kind: string;
  bookId: string;
  ownerId: string;
  tradeId: string;
  title: string;
  author: string;
  description: string;
};

export type DbTradeUser = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  kind: string;
  userId: string;
  tradeId: string;
  nickname: string;
  address: {
    city: string;
    state: string;
  };
};
