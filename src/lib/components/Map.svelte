<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import maplibregl from "maplibre-gl";
    import { env } from "$env/dynamic/public";
    import * as h3 from "h3-js";
    // @ts-ignore
    import * as turf from "@turf/turf";
    import ConquestModal from "./ConquestModal.svelte";
    import {
        user,
        claimTerritory,
        getTerritory,
        getAllTerritories,
        type Territory,
    } from "$lib/firebase";

    const PUBLIC_MAPTILER_API_KEY = env.PUBLIC_MAPTILER_API_KEY;

    let mapContainer: HTMLDivElement;
    let map: maplibregl.Map;
    let userMarker: maplibregl.Marker | null = null;
    let locationError = "";
    let isLoadingLocation = true;
    let userLocation: [number, number] | null = null;

    // Modal State
    let showModal = false;
    let selectedHex = "";
    let selectedDistance = 0;

    // Territories from Firebase
    let territories: Map<string, Territory> = new Map();

    // H3 Configuration
    const H3_RES = 9; // Hexagon resolution (approx 2 blocks size)

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

        // Map load event
        map.on("load", async () => {
            initializeHexGrid();
            await loadTerritories(); // Load owned territories from Firebase
        });

        // Update grid on move
        map.on("moveend", () => {
            updateHexGrid();
        });

        // Request geolocation
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocation = [longitude, latitude];
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

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        } else {
            isLoadingLocation = false;
            locationError = "Geolocation is not supported by your browser.";
        }

        return () => {
            map?.remove();
        };
    });

    function initializeHexGrid() {
        console.log("[ChillChess] Initializing hex grid...");

        // Add source for hexagons
        map.addSource("hexagons", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        console.log("[ChillChess] Hexagon source added");

        // Add fill layer (for color/opacity)
        map.addLayer({
            id: "hexagons-fill",
            type: "fill",
            source: "hexagons",
            paint: {
                "fill-color": [
                    "case",
                    ["has", "owned"], // If hex has 'owned' property
                    ["get", "color"], // Use the territory's color
                    "#00D9FF", // Otherwise default cyan
                ],
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.5, // Hover state more visible
                    [
                        "case",
                        ["has", "owned"],
                        0.6, // Owned territories highly visible
                        0.2, // Unclaimed hexagons visible but subtle
                    ],
                ],
            },
        });
        console.log("[ChillChess] Hexagon fill layer added");

        // Add line layer (for neon borders)
        map.addLayer({
            id: "hexagons-line",
            type: "line",
            source: "hexagons",
            paint: {
                "line-color": "#00D9FF",
                "line-width": 2,
                "line-opacity": 0.8, // Make borders clearly visible
            },
        });
        console.log("[ChillChess] Hexagon line layer added");

        // Add hover effect
        let hoveredStateId: string | number | null = null;
        map.on("mousemove", "hexagons-fill", (e) => {
            if (e.features && e.features.length > 0) {
                if (hoveredStateId) {
                    map.setFeatureState(
                        { source: "hexagons", id: hoveredStateId },
                        { hover: false },
                    );
                }
                hoveredStateId = e.features[0].id!;
                map.setFeatureState(
                    { source: "hexagons", id: hoveredStateId },
                    { hover: true },
                );
                map.getCanvas().style.cursor = "pointer";
            }
        });

        map.on("mouseleave", "hexagons-fill", () => {
            if (hoveredStateId) {
                map.setFeatureState(
                    { source: "hexagons", id: hoveredStateId },
                    { hover: false },
                );
            }
            hoveredStateId = null;
            map.getCanvas().style.cursor = "";
        });

        // Click handler for conquest
        map.on("click", "hexagons-fill", (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const h3Index = feature.properties.h3Index;

                // Get hexagon center for distance calculation
                const hexCenter = h3.cellToLatLng(h3Index); // returns [lat, lng]

                if (userLocation) {
                    // Turf uses [lng, lat]
                    const from = turf.point(userLocation);
                    const to = turf.point([hexCenter[1], hexCenter[0]]);
                    const distance =
                        turf.distance(from, to, { units: "kilometers" }) * 1000; // convert to meters

                    console.log(
                        `Distance to hex ${h3Index}: ${Math.round(distance)}m`,
                    );

                    if (distance < 150) {
                        // 150m range
                        selectedHex = h3Index;
                        selectedDistance = distance;
                        showModal = true;
                    } else {
                        alert(
                            `Too far to conquer! You are ${Math.round(distance)}m away. Get closer (<150m).`,
                        );
                    }
                } else {
                    alert("Waiting for GPS location...");
                }
            }
        });

        console.log("[ChillChess] Calling initial updateHexGrid...");
        updateHexGrid();
    }

    function updateHexGrid() {
        if (!map) {
            console.warn(
                "[ChillChess] updateHexGrid called but map is not initialized",
            );
            return;
        }

        const zoom = map.getZoom();
        console.log(
            `[ChillChess] Updating hex grid at zoom level: ${zoom.toFixed(2)}`,
        );

        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Get polygon for current viewport
        const viewportPolygon = [
            [sw.lng, sw.lat],
            [ne.lng, sw.lat],
            [ne.lng, ne.lat],
            [sw.lng, ne.lat],
            [sw.lng, sw.lat],
        ];

        // Generate hexagons covering the viewport
        // h3.polygonToCells requires [lat, lng] pairs
        const viewportPolygonLatLng = viewportPolygon.map((c) => [c[1], c[0]]);

        // Use polygonToCells instead of polyfill (polyfill is deprecated/legacy name in v4)
        const hexagons = h3.polygonToCells(viewportPolygonLatLng, H3_RES, true);

        console.log(
            `[ChillChess] Generated ${hexagons.length} hexagons for current viewport`,
        );

        // Limit number of hexagons to render to avoid performance issues
        if (hexagons.length > 1500) {
            console.warn(
                `[ChillChess] Too many hexagons (${hexagons.length}), zoom in to see grid (need zoom > 13)`,
            );
            const emptyGeoJson: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: [],
            };
            (map.getSource("hexagons") as maplibregl.GeoJSONSource).setData(
                emptyGeoJson,
            );
            return;
        }

        // Convert to GeoJSON features
        const features = hexagons.map((h3Index) => {
            const boundary = h3.cellToBoundary(h3Index, true); // true for GeoJSON conformant (lng, lat)
            // Close the loop
            boundary.push(boundary[0]);

            // Check if this hex is owned
            const territory = territories.get(h3Index);

            return {
                type: "Feature",
                properties: {
                    h3Index: h3Index,
                    ...(territory
                        ? {
                              owned: true,
                              color: territory.color,
                              ownerId: territory.ownerId,
                              ownerName: territory.ownerName,
                          }
                        : {}),
                },
                id: h3Index, // Important for feature-state
                geometry: {
                    type: "Polygon",
                    coordinates: [boundary],
                },
            };
        });

        const geoJson: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: features as any,
        };

        console.log(
            `[ChillChess] Setting ${features.length} hexagon features on map`,
        );

        if (map.getSource("hexagons")) {
            (map.getSource("hexagons") as maplibregl.GeoJSONSource).setData(
                geoJson,
            );
        } else {
            console.error("[ChillChess] Hexagons source not found!");
        }
    }

    async function loadTerritories() {
        console.log("[ChillChess] Loading territories from Firebase...");
        const allTerritories = await getAllTerritories();
        territories = new Map(allTerritories.map((t) => [t.h3Index, t]));
        console.log(
            `[ChillChess] Loaded ${territories.size} claimed territories`,
        );
        updateHexGrid(); // Refresh map with ownership colors
    }

    async function handleConquer() {
        if (!$user) {
            alert("You must be signed in to conquer territories");
            showModal = false;
            return;
        }

        console.log("Conquering", selectedHex);

        // Save to Firebase
        const success = await claimTerritory(
            selectedHex,
            $user.uid,
            $user.displayName || `Player ${$user.uid.slice(0, 6)}`,
        );

        if (success) {
            // Reload territories to update map
            await loadTerritories();
            alert("Territory conquered! 🎉");
        } else {
            alert("Failed to conquer territory. Check Firebase configuration.");
        }

        showModal = false;
        // TODO: Start chess game before conquest
    }
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

    <ConquestModal
        isOpen={showModal}
        h3Index={selectedHex}
        distance={selectedDistance}
        on:close={() => (showModal = false)}
        on:conquer={handleConquer}
    />
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
        background-color: #0a0e27; /* Fallback color */
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
        pointer-events: none; /* Allow clicking through if overlaid partially */
    }

    .overlay > * {
        pointer-events: auto;
    }

    .loading,
    .error {
        text-align: center;
        padding: 2rem;
        background: rgba(10, 14, 39, 0.8);
        border-radius: 1rem;
        border: 1px solid rgba(139, 92, 246, 0.3);
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
