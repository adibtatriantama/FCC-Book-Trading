<script>
	import { ToastContainer, FlatToast } from 'svelte-toasts';
	import '../app.css';
</script>

<div class="max-w-7xl mx-auto px-8 sm:px-6">
	<slot />
</div>

<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer>
