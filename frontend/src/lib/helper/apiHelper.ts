import { Result } from '$lib/core/result';
import type { BookDto } from '$lib/dto/bookDto';
import type { TradeDto } from '$lib/dto/tradeDto';
import type { UserDto } from '$lib/dto/userDto';

// USER
export const getUser = (): Promise<Result<UserDto>> => {
	return fetchGet('/me', true);
};

export const getUserById = (userId: string): Promise<Result<UserDto>> => {
	return fetchGet(`/user/${userId}`);
};

export const updateUser = (props: {
	nickname?: string;
	address?: {
		state: string;
		city: string;
	};
}): Promise<Result<UserDto>> => {
	return fetchPatch('/me', props, true);
};

// BOOK
export const getAllBook = (): Promise<Result<BookDto[]>> => {
	return fetchGet('/book');
};

export const addBook = (props: {
	title: string;
	author: string;
	description: string;
}): Promise<Result<BookDto>> => {
	return fetchPost('/book', props, true);
};

export const getMyBook = (): Promise<Result<BookDto[]>> => fetchGet('/me/book', true);

export const getBookByUser = (userId: string): Promise<Result<BookDto[]>> =>
	fetchGet(`/user/${userId}/book`);

export const getBookById = (bookId: string): Promise<Result<BookDto>> =>
	fetchGet(`/book/${bookId}`);

export const removeBook = (bookId: string): Promise<Result<void>> =>
	fetchDelete(`/book/${bookId}`, true);

// TRADE
export const createTrade = (props: {
	ownerId: string;
	traderId: string;
	ownerBookIds: string[];
	traderBookIds: string[];
}): Promise<Result<TradeDto>> => fetchPost(`/trade`, props, true);

export const getTradeById = (tradeId: string): Promise<Result<TradeDto>> =>
	fetchGet(`/trade/${tradeId}`);

export const getAcceptedTrade = (): Promise<Result<TradeDto[]>> => fetchGet(`/trade`);

export const removeTrade = (tradeId: string): Promise<Result<void>> =>
	fetchDelete(`/trade/${tradeId}`, true);

export const rejectTrade = (tradeId: string): Promise<Result<TradeDto>> =>
	fetchPost(`/trade/${tradeId}/reject`, undefined, true);

export const acceptTrade = (tradeId: string): Promise<Result<TradeDto>> =>
	fetchPost(`/trade/${tradeId}/accept`, undefined, true);

export const getTradeByBookId = (bookId: string): Promise<Result<TradeDto[]>> =>
	fetchGet(`/book/${bookId}/trade`);

export const getTradebyBookOwner = (userId: string): Promise<Result<TradeDto[]>> =>
	fetchGet(`/user/${userId}/tradeAsOwner`);

export const getTradebyTrader = (userId: string): Promise<Result<TradeDto[]>> =>
	fetchGet(`/user/${userId}/tradeAsTrader`);

const fetchGet = <ReturnType>(path: string, useAuth = false): Promise<Result<ReturnType>> => {
	return fetchBuilder({
		retriveToken: retriveTokenFromLocalStorage,
		removeToken: removeTokenFromLocalStorage,
		method: 'GET',
		path,
		useAuth
	});
};

const fetchPatch = <ReturnType>(
	path: string,
	body: Record<string, any>,
	useAuth = false
): Promise<Result<ReturnType>> => {
	return fetchBuilder({
		retriveToken: retriveTokenFromLocalStorage,
		removeToken: removeTokenFromLocalStorage,
		method: 'PATCH',
		path,
		body,
		useAuth
	});
};

const fetchPost = <ReturnType>(
	path: string,
	body?: Record<string, any>,
	useAuth = false
): Promise<Result<ReturnType>> => {
	return fetchBuilder({
		retriveToken: retriveTokenFromLocalStorage,
		removeToken: removeTokenFromLocalStorage,
		method: 'POST',
		path,
		body,
		useAuth
	});
};

const fetchDelete = <ReturnType>(path: string, useAuth = false): Promise<Result<ReturnType>> => {
	return fetchBuilder({
		retriveToken: retriveTokenFromLocalStorage,
		removeToken: removeTokenFromLocalStorage,
		method: 'DELETE',
		path,
		useAuth
	});
};

const retriveTokenFromLocalStorage = async (): Promise<string | null> => {
	return localStorage.getItem('token');
};

const removeTokenFromLocalStorage = (): void => {
	localStorage.removeItem('token');
};

const fetchBuilder = async <ReturnType>(params: {
	path: string;
	method: string;
	body?: Record<string, any>;
	useAuth: boolean;
	retriveToken: () => Promise<string | null>;
	removeToken: () => void;
}): Promise<Result<ReturnType>> => {
	const supportedMethods = ['POST', 'GET', 'PATCH', 'DELETE'];
	const headers: Record<string, any> = {};

	if (!supportedMethods.includes(params.method)) {
		return Result.fail(`Unsupported fetch method: ${params.method}, please contact the devs!`);
	}

	if (params.useAuth) {
		const token = await params.retriveToken();

		if (!token) {
			return Result.fail('Unauthorized, please login!');
		}

		headers['Authorization'] = `Bearer ${token}`;
	}

	if (params.method === 'POST' || params.method === 'PATCH') {
		headers['Content-type'] = 'application/json; charset=UTF-8';
	}

	let response;

	try {
		response = await fetch(import.meta.env.VITE_API_URL + params.path, {
			method: params.method,
			body: params.body ? JSON.stringify(params.body) : undefined,
			headers: Object.keys(headers).length > 0 ? headers : undefined
		});
	} catch (error) {
		console.error(error);
		if (typeof error === 'string') {
			return Result.fail(error);
		}
		return Result.fail('unexpected error');
	}
	let data;

	try {
		// if the response doesn't contain data
		data = await response.json();
	} catch (error) {
		console.error('tried to retrieve json data, but retrieve nothing');
	}

	if (response.ok) {
		return Result.ok(data);
	} else {
		if (response.status === 401) {
			params.removeToken();
		}
		return Result.fail(data.message);
	}
};
