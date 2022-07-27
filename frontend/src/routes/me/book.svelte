<script lang="ts">
	import type { BookDto } from '$lib/dto/bookDto';
	import { getMyBook, removeBook } from '$lib/helper/apiHelper';
	import { toastError, toastSuccess } from '$lib/helper/toastHelper';
	import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	const searchTitle = writable('');
	const allBooks = writable<BookDto[]>([]);
	const filteredBooks = derived([allBooks, searchTitle], ([$allBooks, $searchTitle]) => {
		const search = $searchTitle.toLowerCase();

		let books: BookDto[] = $allBooks;

		if (search) {
			books = books.filter(
				(book) =>
					book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)
			);
		}

		return books;
	});

	onMount(() => {
		loadMyBooks();
	});

	const loadMyBooks = async () => {
		const getMyBooksResult = await getMyBook();

		if (getMyBooksResult.isSuccess) {
			allBooks.set(getMyBooksResult.getValue());
		} else {
			toastError(getMyBooksResult.getErrorValue());
		}
	};

	const removeBookFromMyBook = async (book: BookDto) => {
		const removeBookResult = await removeBook(book.id);

		if (removeBookResult.isSuccess) {
			toastSuccess('Book removed');

			allBooks.set($allBooks.filter((b) => b.id !== book.id));
		} else {
			toastError(removeBookResult.getErrorValue());
		}
	};
</script>

<main>
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
											<button
												on:click|preventDefault={() => {
													removeBookFromMyBook(book);
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
					<div class="text-center">
						<div class="text-gray-600">No books found</div>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<div style="height: 300px;" />
</main>
