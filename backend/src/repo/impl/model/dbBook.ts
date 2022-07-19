export type DbBook = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  kind: string;
  id: string;
  title: string;
  author: string;
  description: string;
  owner: {
    id: string;
    nickname: string;
    address: {
      city: string;
      state: string;
    };
  };
};
