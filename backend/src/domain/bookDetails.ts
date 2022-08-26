import { UserDetails } from './userDetails';

export type BookDetailsProps = {
  id: string;
  title: string;
  author: string;
  description: string;
  owner: UserDetails;
};

export class BookDetails {
  private constructor(private _props: BookDetailsProps) {}

  static create(props: BookDetailsProps): BookDetails {
    return new BookDetails(props);
  }

  get id(): string {
    return this._props.id;
  }

  get title(): string {
    return this._props.title;
  }

  get author(): string {
    return this._props.author;
  }

  get description(): string {
    return this._props.description;
  }

  get owner(): UserDetails {
    return this._props.owner;
  }
}
