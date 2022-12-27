export type ReadOptions = {
  consistentRead?: boolean;
};

export type QueryOptions = {
  lastEvaluatedKeys?: Record<string, any>;
};
