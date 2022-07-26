<script lang="ts">
	import { userStore } from '$lib/store/authStore';
	import { logout } from '$lib/store/authStore';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let showBookMenu = false;
	let bookMenu: HTMLButtonElement | null = null;
	let showTradeMenu = false;
	let tradeMenu: HTMLButtonElement | null = null;

	onMount(() => {
		const handleOutsideClick = (event) => {
			if (showBookMenu && !bookMenu?.contains(event.target)) {
				showBookMenu = false;
			}
			if (showTradeMenu && !tradeMenu?.contains(event.target)) {
				showTradeMenu = false;
			}
		};

		const handleEscape = (event) => {
			if (showBookMenu && event.key === 'Escape') {
				showBookMenu = false;
			}
			if (showTradeMenu && event.key === 'Escape') {
				showTradeMenu = false;
			}
		};

		// add events when element is added to the DOM
		document.addEventListener('click', handleOutsideClick, false);
		document.addEventListener('keyup', handleEscape, false);

		// remove events when element is removed from the DOM
		return () => {
			document.removeEventListener('click', handleOutsideClick, false);
			document.removeEventListener('keyup', handleEscape, false);
		};
	});
</script>

<div class="relative bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6">
		<div
			class="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10"
		>
			<div class="flex justify-start lg:w-0 lg:flex-1">
				<a href="#">
					<span class="sr-only">Workflow</span>
					<img
						class="h-8 w-auto sm:h-10"
						src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
						alt=""
					/>
				</a>
			</div>
			<div class="-mr-2 -my-2 md:hidden">
				<button
					type="button"
					class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
					aria-expanded="false"
				>
					<span class="sr-only">Open menu</span>
					<!-- Heroicon name: outline/menu -->
					<svg
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
			<nav class="hidden md:flex space-x-10">
				<div class="relative">
					<!-- Item active: "text-gray-900", Item inactive: "text-gray-500" -->
					<button
						bind:this={bookMenu}
						on:click={() => {
							showBookMenu = !showBookMenu;
						}}
						type="button"
						class="text-gray-500 group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						aria-expanded="false"
					>
						<span>Books</span>
						<!--
              Heroicon name: solid/chevron-down

              Item active: "text-gray-600", Item inactive: "text-gray-400"
            -->
						<svg
							class="text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					{#if showBookMenu}
						<div
							in:fly={{ duration: 200, y: -1 }}
							out:fly={{ duration: 150, y: 1 }}
							class="absolute z-10 -ml-4 mt-3 transform px-2 w-screen max-w-sm sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
						>
							<div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
								<div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
									<a href="/book" class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">Books Available to Trade</p>
										</div>
									</a>
									<a href="/me/book" class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">My Books</p>
										</div>
									</a>
									<a href="/book/add" class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">Add Books</p>
										</div>
									</a>
								</div>
							</div>
						</div>
					{/if}
				</div>
				<div class="relative">
					<!-- Item active: "text-gray-900", Item inactive: "text-gray-500" -->
					<button
						bind:this={tradeMenu}
						on:click={() => {
							showTradeMenu = !showTradeMenu;
						}}
						type="button"
						class="text-gray-500 group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						aria-expanded="false"
					>
						<span>Trades</span>
						<!--
              Heroicon name: solid/chevron-down

              Item active: "text-gray-600", Item inactive: "text-gray-400"
            -->
						<svg
							class="text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					{#if showTradeMenu}
						<div
							in:fly={{ duration: 200, y: -1 }}
							out:fly={{ duration: 150, y: 1 }}
							class="absolute z-10 -ml-4 mt-3 transform px-2 w-screen max-w-sm sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
						>
							<div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
								<div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
									<a href="/trade" class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">All Trades</p>
										</div>
									</a>
									<a
										href="/me/trade-request"
										class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
									>
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">My Trade Requests</p>
										</div>
									</a>
									<a
										href="/me/trade-request-for-me"
										class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
									>
										<div class="ml-4">
											<p class="text-base font-medium text-gray-900">Trade Requests for Me</p>
										</div>
									</a>
								</div>
							</div>
						</div>
					{/if}
				</div>
				<a href="/me" class="text-base font-medium text-gray-500 hover:text-gray-900"> Profile </a>
			</nav>
			{#if $userStore}
				<div class="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
					<p class="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
						Welcome {$userStore.nickname}
					</p>
					<button
						on:click={logout}
						class="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
					>
						Logout
					</button>
				</div>
			{:else}
				<div class="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
					<a
						href={`/login?returnTo=${$page.url.pathname}`}
						class="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
					>
						Login
					</a>
					<a
						href={`/signup?returnTo=${$page.url.pathname}`}
						class="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
					>
						Sign up
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
