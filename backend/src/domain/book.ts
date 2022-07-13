import { Result } from 'src/core/result';
import { ulid } from 'ulid';
import { User } from './user';

export type BookProps = {
  title: string;
  author: string;
  description: string;
  owner: User;
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

  get owner(): User {
    return this._props.owner;
  }

  transferOwnership(newOwner: User): void {
    this.isOwnerChanged = true;
    this._props.owner = newOwner;
  }
}
