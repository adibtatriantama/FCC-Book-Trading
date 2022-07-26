<script lang="ts">
	import { page } from '$app/stores';
	import type { BookDto } from '$lib/dto/bookDto';
	import { userStore } from '$lib/store/authStore';
	import { createTrade, getBookById, getMyBook } from '$lib/helper/apiHelper';
	import { toastError, toastSuccess } from '$lib/helper/toastHelper';
	import { onMount } from 'svelte';
	import * as queryString from 'query-string';
	import { derived, writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	const searchTitle = writable('');
	const wantToTradeBooks = writable<BookDto[]>([]);
	const myBooks = writable<BookDto[]>([]);
	const addedBooks = writable<BookDto[]>([]);
	const filteredBooks = derived(
		[myBooks, searchTitle, addedBooks],
		([$allBooks, $searchTitle, $addedBooks]) => {
			const search = $searchTitle.toLowerCase();

			let books = $allBooks;

			if (search) {
				books = books.filter(
					(book) =>
						book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)
				);
			}

			if ($addedBooks.length > 0) {
				books = books.filter((book) => !$addedBooks.includes(book));
			}

			return books;
		}
	);

	let bookIds: string[] = [];
	let ownerId: string;

	onMount(() => {
		const isQueryParamsValid = readQueryParams();

		if (!isQueryParamsValid) {
			toastError('Invalid query params');

			goto('/book');
		} else {
			loadWantToTradeBooks();
			loadMyBooks();
		}
	});

	const readQueryParams = (): boolean => {
		const parsedQueryParams = queryString.parse($page.url.searchParams.toString());

		if (
			parsedQueryParams &&
			typeof parsedQueryParams.ownerId === 'string' &&
			parsedQueryParams.bookIds
		) {
			ownerId = parsedQueryParams['ownerId'];

			if (Array.isArray(parsedQueryParams.bookIds)) {
				for (const bookId of parsedQueryParams.bookIds) {
					if (typeof bookId === 'string') {
						bookIds.push(bookId);
					}
				}
			} else if (typeof parsedQueryParams.bookIds === 'string') {
				bookIds.push(parsedQueryParams.bookIds);
			}
		}

		if (ownerId && bookIds.length > 0) {
			return true;
		} else {
			return false;
		}
	};

	const loadWantToTradeBooks = async () => {
		let getResultPromises = [];
		for (const bookId of bookIds) {
			getResultPromises.push(getBookById(bookId));
		}

		const results = await Promise.all(getResultPromises);

		wantToTradeBooks.set(
			results.filter((result) => result.isSuccess).map((result) => result.getValue())
		);
	};

	const loadMyBooks = async () => {
		const getResult = await getMyBook();

		if (getResult.isSuccess) {
			myBooks.set(getResult.getValue());
		} else {
			toastError(getResult.getErrorValue());
		}
	};

	const cancelWantToTradeBook = (removedBook: BookDto) => {
		wantToTradeBooks.set($wantToTradeBooks.filter((book) => book.id !== removedBook.id));
	};

	const addBookToList = (book: BookDto) => {
		addedBooks.set([...$addedBooks, book]);
	};

	const removeBookFromList = (removedBook: BookDto) => {
		addedBooks.set($addedBooks.filter((book) => book.id !== removedBook.id));
	};

	const requestTrade = async () => {
		const requestTradeResult = await createTrade({
			ownerId,
			traderId: $userStore?.id ?? '',
			ownerBookIds: $wantToTradeBooks.map((book) => book.id),
			traderBookIds: $addedBooks.map((book) => book.id)
		});

		if (requestTradeResult.isSuccess) {
			toastSuccess('Trade request sent');

			goto('/me/trade-request');
		} else {
			toastError(requestTradeResult.getErrorValue());
		}
	};
</script>

<main>
	<section>
		<div class="container flex justify-center mx-auto mt-16">
			<div class="flex flex-col">
				<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
					Books I want
				</h2>
				<div class="w-full">
					{#if $wantToTradeBooks.length > 0}
						{#each $wantToTradeBooks as book}
							<p class="mt-4 text-xl text-gray-700">
								<a class="text-blue-700 underline" href={`user/${book.owner.id}`}
									>{book.owner.nickname}</a
								>
								(
								{#if book.owner.address.state && book.owner.address.city}
									{book.owner.address.state}, {book.owner.address.city}
								{:else}
									<span class="text-gray-400">No address</span>
								{/if})
							</p>
							<div class="border-b border-gray-200 shadow">
								<table class="divide-y divide-gray-300 ">
									<thead class="bg-gray-50">
										<tr>
											<th class="px-6 py-2 text-xs text-gray-500"> Title </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Author </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Description </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Action </th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-300">
										<tr class="whitespace-nowrap">
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">{book.title}</div>
											</td>
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">{book.author}</div>
											</td>
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">
													{book.description}
												</div>
											</td>
											<td class="px-6 py-4">
												<button
													on:click|preventDefault={() => {
														cancelWantToTradeBook(book);
													}}
													class="px-4 py-1 text-sm text-red-600 bg-red-200 rounded-full"
													>Cancel</button
												>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						{/each}
					{:else}
						<p class="mt-4 text-xl text-gray-700">You cancelled all of the books</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="container flex justify-center mx-auto mt-16">
			<div class="flex flex-col">
				<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
					Trade With
				</h2>
				<div class="w-full">
					{#if $addedBooks.length > 0}
						<div class="border-b border-gray-200 shadow">
							<table class="divide-y divide-gray-300 ">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-2 text-xs text-gray-500"> Title </th>
										<th class="px-6 py-2 text-xs text-gray-500"> Author </th>
										<th class="px-6 py-2 text-xs text-gray-500"> Description </th>
										<th class="px-6 py-2 text-xs text-gray-500"> Action </th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-300">
									{#each $addedBooks as book}
										<tr class="whitespace-nowrap">
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">{book.title}</div>
											</td>
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">{book.author}</div>
											</td>
											<td class="px-6 py-4">
												<div class="text-sm text-gray-700">
													{book.description}
												</div>
											</td>
											<td class="px-6 py-4">
												<button
													on:click|preventDefault={() => {
														removeBookFromList(book);
													}}
													class="px-4 py-1 text-sm text-red-600 bg-red-200 rounded-full"
													>Remove</button
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="mt-4 text-xl text-gray-700">No books added yet.</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="container flex justify-center mx-auto">
			<div class="mt-8">
				<button
					on:click|preventDefault={requestTrade}
					class="uppercase text-sm font-bold tracking-wide bg-indigo-500 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:bg-indigo-700"
					type="submit"
				>
					Request Trade
				</button>
			</div>
		</div>
	</section>

	<section class="container flex justify-center mx-auto mt-16">
		<div class="flex flex-col">
			<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
				My Books
			</h2>
			<div class="w-full">
				{#if $filteredBooks.length > 0}
					<div class="border-b border-gray-200 shadow mt-4">
						<table class="divide-y divide-gray-300 ">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-2 text-xs text-gray-500"> Title </th>
									<th class="px-6 py-2 text-xs text-gray-500"> Author </th>
									<th class="px-6 py-2 text-xs text-gray-500"> Description </th>
									<th class="px-6 py-2 text-xs text-gray-500"> Owner </th>
									<th class="px-6 py-2 text-xs text-gray-500"> Owner's Address </th>
									<th class="px-6 py-2 text-xs text-gray-500"> Action </th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-300">
								{#each $filteredBooks as book}
									<tr class="whitespace-nowrap">
										<td class="px-6 py-4">
											<div class="text-sm text-gray-700">{book.title}</div>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-gray-700">{book.author}</div>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-gray-700">
												{book.description}
											</div>
										</td>
										<td class="px-6 py-4">
											<a href={`/user/${book.owner.id}`} class="text-sm text-blue-700 underline"
												>{book.owner.nickname}</a
											>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-gray-700">
												{#if book.owner.address.state && book.owner.address.city}
													{book.owner.address.state}, {book.owner.address.city}
												{:else}
													<span class="text-gray-400">No address</span>
												{/if}
											</div>
										</td>
										<td class="px-6 py-4">
											<button
												on:click|preventDefault={() => {
													addBookToList(book);
												}}
												class="px-4 py-1 text-sm text-green-600 bg-green-200 rounded-full"
												>Add to List</button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="mt-4 text-xl text-gray-700">No books left.</p>
				{/if}
			</div>
		</div>
	</section>
</main>
