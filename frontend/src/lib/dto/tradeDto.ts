import type { BookDto } from './bookDto';
import type { UserDto } from './userDto';

export type TradeDto = {
	id: string;
	owner: UserDto;
	trader: UserDto;
	ownerBooks: BookDto[];
	traderBooks: BookDto[];
	status: string;
	createdAt: string;
	acceptedAt?: string;
};
