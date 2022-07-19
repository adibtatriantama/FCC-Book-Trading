export type DbUser = {
  PK: string;
  SK: string;
  kind: string;
  id: string;
  nickname: string;
  email: string;
  address: {
    city: string;
    state: string;
  };
};
