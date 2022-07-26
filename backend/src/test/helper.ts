import { BookRepo } from 'src/repo/bookRepo';
import { TradeRepo } from 'src/repo/tradeRepo';
import { UserRepo } from 'src/repo/userRepo';

export const buildMockTradeRepo = (params?: Partial<TradeRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    remove: params?.remove ?? jest.fn(),
    findTradeByOwnerId: params?.findTradeByOwnerId ?? jest.fn(),
    findTradeByTraderId: params?.findTradeByTraderId ?? jest.fn(),
    findTradeByBookId: params?.findTradeByBookId ?? jest.fn(),
    findPendingTradeCountByBookId:
      params?.findPendingTradeCountByBookId ?? jest.fn(),
    findAcceptedTrade: params?.findAcceptedTrade ?? jest.fn(),
  };
};

export const buildMockBookRepo = (params?: Partial<BookRepo>) => {
  return {
    save: params?.save ?? jest.fn(),
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    findByUserId: params?.findByUserId ?? jest.fn(),
    findRecent: params?.findRecent ?? jest.fn(),
    remove: params?.remove ?? jest.fn(),
  };
};

export const buildMockUserRepo = (params?: Partial<UserRepo>) => {
  return {
    findById: params?.findById ?? jest.fn(),
    batchFindById: params?.batchFindById ?? jest.fn(),
    save: params?.save ?? jest.fn(),
  };
};
