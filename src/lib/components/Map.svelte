<script lang="ts">
    import { onMount } from "svelte";
    import maplibregl from "maplibre-gl";
    import { env } from "$env/dynamic/public";

    const PUBLIC_MAPTILER_API_KEY = env.PUBLIC_MAPTILER_API_KEY;

    let mapContainer: HTMLDivElement;
    let map: maplibregl.Map;
    let userMarker: maplibregl.Marker | null = null;
    let locationError = "";
    let isLoadingLocation = true;

    onMount(() => {
        // Initialize map
        map = new maplibregl.Map({
            container: mapContainer,
            style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
            center: [0, 0],
            zoom: 2,
            attributionControl: false,
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), "top-right");

        // Request geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    isLoadingLocation = false;

                    // Update or create user marker
                    if (!userMarker) {
                        // Create pulsing marker element
                        const el = document.createElement("div");
                        el.className = "user-marker";
                        el.innerHTML = `
							<div class="marker-outer"></div>
							<div class="marker-inner"></div>
						`;

                        userMarker = new maplibregl.Marker({ element: el })
                            .setLngLat([longitude, latitude])
                            .addTo(map);

                        // Center map on user location
                        map.flyTo({
                            center: [longitude, latitude],
                            zoom: 15,
                            duration: 2000,
                        });
                    } else {
                        // Update existing marker
                        userMarker.setLngLat([longitude, latitude]);
                    }
                },
                (error) => {
                    isLoadingLocation = false;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            locationError =
                                "Location permission denied. Please enable location access.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            locationError =
                                "Location unavailable. Please try again.";
                            break;
                        case error.TIMEOUT:
                            locationError = "Location request timed out.";
                            break;
                        default:
                            locationError = "An unknown error occurred.";
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000,
                },
            );
        } else {
            isLoadingLocation = false;
            locationError = "Geolocation is not supported by your browser.";
        }

        return () => {
            map?.remove();
        };
    });
</script>

<div class="map-wrapper">
    <div bind:this={mapContainer} class="map-container" />

    {#if isLoadingLocation}
        <div class="overlay glass">
            <div class="loading">
                <div class="spinner"></div>
                <p class="text-lg mt-4">Finding your location...</p>
            </div>
        </div>
    {/if}

    {#if locationError}
        <div class="overlay glass">
            <div class="error">
                <div class="error-icon">⚠️</div>
                <p class="text-lg font-semibold mb-2">Location Error</p>
                <p class="text-sm opacity-80">{locationError}</p>
            </div>
        </div>
    {/if}

    <!-- Branding -->
    <div class="branding glass">
        <h1 class="text-2xl font-bold text-glow">
            <span class="text-chill-cyan">Chill</span><span
                class="text-chill-pink">Chess</span
            >
        </h1>
        <p class="text-xs opacity-70 mt-1">Territory Wars</p>
    </div>
</div>

<style>
    .map-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .map-container {
        width: 100%;
        height: 100%;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .loading,
    .error {
        text-align: center;
        padding: 2rem;
    }

    .spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto;
        border: 4px solid rgba(139, 92, 246, 0.3);
        border-top-color: #8b5cf6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .branding {
        position: absolute;
        top: 1rem;
        left: 1rem;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        z-index: 100;
    }

    /* User marker styles */
    :global(.user-marker) {
        width: 40px;
        height: 40px;
        position: relative;
    }

    :global(.marker-outer) {
        position: absolute;
        width: 40px;
        height: 40px;
        background: rgba(0, 217, 255, 0.2);
        border: 2px solid #00d9ff;
        border-radius: 50%;
        animation: pulse-marker 2s ease-in-out infinite;
    }

    :global(.marker-inner) {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background: #00d9ff;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
    }

    @keyframes pulse-marker {
        0%,
        100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.6;
        }
    }
</style>
