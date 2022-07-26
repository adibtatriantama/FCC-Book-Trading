import { Result } from 'src/core/result';
import { ulid } from 'ulid';
import { UserDetails } from './userDetails';

export type BookProps = {
  title: string;
  author: string;
  description: string;
  owner: UserDetails;
};

export class Book {
  isOwnerChanged = false;

  private constructor(private _props: BookProps, public readonly id: string) {}

  static create(props: BookProps, id?: string): Result<Book> {
    return Result.ok(new Book(props, id ?? ulid()));
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

  transferOwnership(newOwner: UserDetails): void {
    this.isOwnerChanged = true;
    this._props.owner = newOwner;
  }
}
