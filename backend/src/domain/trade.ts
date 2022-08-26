import { Result } from 'src/core/result';
import { ulid } from 'ulid';
import { BookDetails } from './bookDetails';
import { UserDetails } from './userDetails';

export type TradeProps = {
  decider: UserDetails;
  requester: UserDetails;
  deciderBooks: BookDetails[];
  requesterBooks: BookDetails[];
  status?: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
};

export type TradeStatus = 'pending' | 'accepted' | 'rejected';

export class Trade {
  isNew = false;
  isBookOwnershipChanged = false;

  private constructor(private _props: TradeProps, public readonly id: string) {
    if (!id) {
      this.isNew = true;
      this.id = ulid();
    }
  }

  static create(props: TradeProps, id?: string): Result<Trade> {
    if (props.deciderBooks.length === 0 || props.requesterBooks.length === 0) {
      return Result.fail('Trade must have at least one book');
    }

    const status = props.status || 'pending';

    return Result.ok(
      new Trade(
        {
          ...props,
          status,
        },
        id,
      ),
    );
  }

  get decider(): UserDetails {
    return this._props.decider;
  }

  get requester(): UserDetails {
    return this._props.requester;
  }

  get deciderBooks(): BookDetails[] {
    return this._props.deciderBooks;
  }

  get requesterBooks(): BookDetails[] {
    return this._props.requesterBooks;
  }

  get status(): TradeStatus {
    return this._props.status;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  get acceptedAt(): Date {
    return this._props.acceptedAt;
  }

  accept(): Result<void> {
    if (this.status !== 'pending') {
      return Result.fail('Unable to accept trade, trade status is not pending');
    }

    this._props.status = 'accepted';

    const date = new Date();

    this._props.updatedAt = date;
    this._props.acceptedAt = date;

    this.transferBooksOwnership();

    return Result.ok();
  }

  private transferBooksOwnership(): void {
    this.isBookOwnershipChanged = true;
  }

  reject(): Result<void> {
    if (this.status !== 'pending') {
      return Result.fail('Unable to reject trade, trade status is not pending');
    }

    const date = new Date();

    this._props.updatedAt = date;
    this._props.status = 'rejected';

    return Result.ok();
  }
}
