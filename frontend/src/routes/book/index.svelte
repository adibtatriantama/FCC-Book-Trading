<script lang="ts">
	import type { BookDto } from '$lib/dto/bookDto';
	import type { UserDto } from '$lib/dto/userDto';
	import { getAllBook } from '$lib/helper/apiHelper';
	import { userStore } from '$lib/store/authStore';
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	const searchTitle = writable('');
	const allBooks = writable<BookDto[]>([]);
	const addedBooks = writable<BookDto[]>([]);

	const filteredBooks = derived(
		[allBooks, searchTitle, addedBooks, userStore],
		([$allBooks, $searchTitle, $addedBooks, $userStore]) => {
			const search = $searchTitle.toLowerCase();

			let books = $allBooks;

			if ($userStore) {
				books = books.filter((book) => book.owner.id !== $userStore.id);
			}

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

	const addedBooksMappedByOwner = derived([addedBooks], ([$addedBooks]) => {
		const result: {
			[key: string]: { owner: UserDto; books: BookDto[]; tradeUrl?: string };
		} = {};

		$addedBooks.forEach((book) => {
			if (!result[book.owner.id]) {
				result[book.owner.id] = {
					owner: book.owner,
					books: []
				};
			}

			result[book.owner.id].books.push(book);
		});

		// generateurl
		for (const key in result) {
			const queryParams = new URLSearchParams();

			queryParams.append('ownerId', key);
			for (const book in result[key].books) {
				queryParams.append('bookIds', result[key].books[book].id);
			}

			result[key].tradeUrl = `/trade/create?${queryParams.toString()}`;
		}

		return result;
	});

	onMount(async () => {
		const getAllBookResult = await getAllBook();

		if (getAllBookResult.isSuccess) {
			allBooks.set(getAllBookResult.getValue());
		}
	});

	const addBookToList = (book: BookDto) => {
		addedBooks.set([...$addedBooks, book]);
	};
	const removeBookFromList = (removedBook: BookDto) => {
		addedBooks.set($addedBooks.filter((book) => book.id !== removedBook.id));
	};
</script>

<main>
	<section class="container flex justify-center mx-auto mt-16">
		<div class="flex flex-col">
			<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
				List of Books I want to trade
			</h2>
			<div class="w-full">
				{#if Object.keys($addedBooksMappedByOwner).length > 0}
					{#each Object.keys($addedBooksMappedByOwner) as userId}
						<p class="mt-4 text-xl text-gray-700">
							<a class="text-blue-700 underline" href={`user/${userId}`}
								>{$addedBooksMappedByOwner[userId].owner.nickname}</a
							>
							(
							{#if $addedBooksMappedByOwner[userId].owner.address.state && $addedBooksMappedByOwner[userId].owner.address.city}
								{$addedBooksMappedByOwner[userId].owner.address.state}, {$addedBooksMappedByOwner[
									userId
								].owner.address.city}
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
									{#each $addedBooksMappedByOwner[userId].books as book}
										<tr>
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
													>Remove from List</button
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<a
							href={$addedBooksMappedByOwner[userId].tradeUrl ?? '#'}
							class="block uppercase text-sm text-center font-bold tracking-wide bg-indigo-500 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:bg-indigo-700"
						>
							Request Trade
						</a>
					{/each}
				{:else}
					<div class="text-center">
						<p class="text-gray-600">You haven't added any book</p>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<section class="container flex justify-center mx-auto mt-16">
		<div class="flex flex-col">
			<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
				Books Available to Trade
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
									<tr>
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
				{/if}
			</div>
		</div>
	</section>
</main>
