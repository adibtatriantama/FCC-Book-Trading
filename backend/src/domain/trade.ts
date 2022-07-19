import { Result } from 'src/core/result';
import { ulid } from 'ulid';
import { Book } from './book';
import { UserDetails } from './userDetails';

export type TradeProps = {
  owner: UserDetails;
  trader: UserDetails;
  ownerBooks: Book[];
  traderBooks: Book[];
  status?: TradeStatus;
  createdAt: Date;
};

export type TradeStatus = 'pending' | 'accepted' | 'rejected';

export class Trade {
  private constructor(private _props: TradeProps, public readonly id: string) {}

  static create(props: TradeProps, id?: string): Result<Trade> {
    if (props.ownerBooks.length === 0 || props.traderBooks.length === 0) {
      return Result.fail('Trade must have at least one book');
    }

    const status = props.status || 'pending';

    return Result.ok(
      new Trade(
        {
          ...props,
          status,
        },
        id ?? ulid(),
      ),
    );
  }

  get owner(): UserDetails {
    return this._props.owner;
  }

  get trader(): UserDetails {
    return this._props.trader;
  }

  get ownerBooks(): Book[] {
    return this._props.ownerBooks;
  }

  get traderBooks(): Book[] {
    return this._props.traderBooks;
  }

  get status(): TradeStatus {
    return this._props.status;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  accept(): Result<void> {
    if (this.status !== 'pending') {
      return Result.fail('Unable to accept trade, trade status is not pending');
    }

    this._props.status = 'accepted';

    this.transferBooksOwnership();

    return Result.ok();
  }

  private transferBooksOwnership(): void {
    for (const book of this.ownerBooks) {
      book.transferOwnership(this.trader);
    }

    for (const book of this.traderBooks) {
      book.transferOwnership(this.owner);
    }
  }

  reject(): Result<void> {
    if (this.status !== 'pending') {
      return Result.fail('Unable to reject trade, trade status is not pending');
    }

    this._props.status = 'rejected';

    return Result.ok();
  }
}
