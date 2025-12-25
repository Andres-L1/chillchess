<script lang="ts">
    import Map from "$lib/components/Map.svelte";
</script>

<svelte:head>
    <title>ChillChess - Territory Wars</title>
    <meta name="description" content="Conquer territories by playing chess" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
</svelte:head>

<div class="container">
    <Map />
</div>

<style>
    .container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
    }
</style>
