<script lang="ts">
	import type { TradeDto } from '$lib/dto/tradeDto';
	import { acceptTrade, getTradebyBookOwner, rejectTrade } from '$lib/helper/apiHelper';
	import { toastError, toastSuccess } from '$lib/helper/toastHelper';
	import { userStore } from '$lib/store/authStore';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const allTrade = writable<TradeDto[]>([]);

	onMount(() => {
		return userStore.subscribe((user) => {
			if (user) {
				loadTradeRequest(user.id);
			}
		});
	});

	const loadTradeRequest = async (userId: string) => {
		const getMyTradeResult = await getTradebyBookOwner(userId);

		if (getMyTradeResult.isSuccess) {
			allTrade.set(getMyTradeResult.getValue());
		} else {
			toastError(getMyTradeResult.getErrorValue());
		}
	};

	const accept = async (tradeId: string) => {
		const acceptTradeTesult = await acceptTrade(tradeId);

		if (acceptTradeTesult.isSuccess) {
			toastSuccess('Trade request accepted');

			const savedTrade = acceptTradeTesult.getValue();

			allTrade.set(
				$allTrade.map((trade) => {
					if (trade.id === tradeId) {
						return savedTrade;
					} else return trade;
				})
			);
		} else {
			toastError(acceptTradeTesult.getErrorValue());
		}
	};

	const reject = async (tradeId: string) => {
		const rejectTradeTesult = await rejectTrade(tradeId);

		if (rejectTradeTesult.isSuccess) {
			toastSuccess('Trade request rejected');

			const savedTrade = rejectTradeTesult.getValue();

			allTrade.set(
				$allTrade.map((trade) => {
					if (trade.id === tradeId) {
						return savedTrade;
					} else return trade;
				})
			);
		} else {
			toastError(rejectTradeTesult.getErrorValue());
		}
	};
</script>

<main>
	<section class="container flex justify-center mx-auto mt-16">
		<div class="flex flex-col">
			<h2 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-800 text-center">
				Trade Request for Me
			</h2>
			<div class="flex flex-col gap-8">
				{#each $allTrade as trade}
					<div class="mt-8">
						<p class="text-lg font-medium text-gray-500 text-center">
							Status: {trade.status}
						</p>
						<p class="text-lg font-medium text-gray-500 text-center">
							CreatedAt: {trade.createdAt.toString()}
						</p>
						{#if trade.status === 'accepted'}
							<p class="text-lg font-medium text-gray-500 text-center">
								AcceptedAt: {trade.acceptedAt?.toString()}
							</p>
						{/if}
						{#if trade.status === 'pending'}
							<button
								class="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-full"
								on:click={() => accept(trade.id)}
							>
								accept
							</button>
							<button
								class="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-full"
								on:click={() => accept(trade.id)}
							>
								reject
							</button>
						{/if}
						<p class="text-lg font-medium text-gray-700 text-center mt-2 mb-4">Books Wanted</p>
						<div class="w-full">
							<div class="border-b border-gray-200 shadow mt-4">
								<table class="divide-y divide-gray-300 ">
									<thead class="bg-gray-50">
										<tr>
											<th class="px-6 py-2 text-xs text-gray-500"> Title </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Author </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Description </th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-300">
										{#each trade.ownerBooks as book}
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
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
						<p class="text-lg font-medium text-gray-700 text-center mt-2 mb-4">
							Books from {trade.owner.nickname}, {#if trade.owner.address.state && trade.owner.address.city}
								{trade.owner.address.state}, {trade.owner.address.city}
							{:else}
								<span class="text-gray-400">No address</span>
							{/if})
						</p>
						<div class="w-full">
							<div class="border-b border-gray-200 shadow mt-4">
								<table class="divide-y divide-gray-300 ">
									<thead class="bg-gray-50">
										<tr>
											<th class="px-6 py-2 text-xs text-gray-500"> Title </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Author </th>
											<th class="px-6 py-2 text-xs text-gray-500"> Description </th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-300">
										{#each trade.traderBooks as book}
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
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<div style="height: 300px;" />
</main>
