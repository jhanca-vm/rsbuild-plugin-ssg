<script>
  import Counter from './counter.svelte';
  import '../styles/global.css'
  import './island-svelte?client'
</script>

<svelte:head>
  <title>svelte</title>
</svelte:head>

<h1>svelte</h1>
<island-svelte data-name="counter">
  <Counter />
</island-svelte>
