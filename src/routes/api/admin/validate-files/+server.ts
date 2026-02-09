
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, documentId } from 'firebase/firestore';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

// Helper to check if file exists in R2
async function checkR2File(key: string): Promise<boolean> {
    if (!key) return false;

    // Clean key (remove leading slash if present)
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;

    try {
        await r2.send(new HeadObjectCommand({
            Bucket: R2_BUCKET,
            Key: cleanKey
        }));
        return true;
    } catch (e: any) {
        // 404 means file not found (broken)
        // 403 means permission issue (also effectively broken for us)
        return false;
    }
}

// Extract R2 key from URL or return as is if it looks like a key
function getKeyFromUrl(url: string | undefined): string | null {
    if (!url) return null;

    // If it's a full URL from our R2 bucket, extract path
    try {
        if (url.startsWith('http')) {
            const urlObj = new URL(url);
            // If it's our R2 domain, path is key
            if (urlObj.hostname.includes('r2.dev') || urlObj.hostname.includes('chillchess')) {
                return decodeURIComponent(urlObj.pathname.slice(1)); // remove leading /
            }
        }
    } catch (e) {
        // invalid url, treat as relative path
    }

    // Assume it's a relative path/key
    return url;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    // Admin check - simple verification for now, should be enhanced
    // Assuming this endpoint is protected by layout or middleware

    const { mode, albumIds } = await request.json();

    let albumsToCheck: any[] = [];

    try {
        if (mode === 'all') {
            const querySnapshot = await getDocs(collection(db, "albums"));
            albumsToCheck = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Also check submissions if needed? For now just albums
        } else if (Array.isArray(albumIds) && albumIds.length > 0) {
            // Fetch specific albums
            // Firestore 'in' query supports max 10/30 items, so better to fetch one by one or in batches
            // For simplicity, fetch valid ones
            // For simplicity, fetching all and filtering might be heavy if many albums
            // Let's use getDoc for each
            const promises = albumIds.map(id => getDoc(doc(db, "albums", id)));
            const snapshots = await Promise.all(promises);
            albumsToCheck = snapshots.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }));
        } else {
            return json({ error: 'Invalid request mode' }, { status: 400 });
        }

        const results = [];
        const brokenAlbums = [];

        // LIMIT CONCURRENCY to avoid overwhelming R2/Network
        // Process in chunks of 5 albums
        const CHUNK_SIZE = 5;

        for (let i = 0; i < albumsToCheck.length; i += CHUNK_SIZE) {
            const chunk = albumsToCheck.slice(i, i + CHUNK_SIZE);

            const chunkResults = await Promise.all(chunk.map(async (album) => {
                const issues: string[] = [];
                let isBroken = false;

                // 1. Check Cover
                // Covers are usually in 'covers/' or 'music/cover.jpg'
                const coverKey = getKeyFromUrl(album.cover);
                if (coverKey) {
                    const exists = await checkR2File(coverKey);
                    if (!exists) {
                        issues.push(`Cover missing: ${coverKey}`);
                        isBroken = true;
                    }
                } else if (!album.cover) {
                    // issues.push(`No cover defined`); // Optional warning
                }

                // 2. Check Tracks
                if (Array.isArray(album.tracks)) {
                    for (const track of album.tracks) {
                        // Priority: r2Key > url
                        const trackKey = track.r2Key || getKeyFromUrl(track.url);

                        if (trackKey) {
                            // Check for .wav extension (unsupported in web playback often causing specific error)
                            if (trackKey.toLowerCase().endsWith('.wav')) {
                                issues.push(`Unsupported format (.wav): ${trackKey}`);
                                isBroken = true;
                            } else {
                                const exists = await checkR2File(trackKey);
                                if (!exists) {
                                    issues.push(`Track missing (${track.title}): ${trackKey}`);
                                    isBroken = true;
                                }
                            }
                        } else {
                            issues.push(`Track has no URL/Key (${track.title})`);
                            isBroken = true; // No file reference at all
                        }
                    }
                }

                return {
                    id: album.id,
                    title: album.title,
                    artist: album.artist,
                    isBroken,
                    issues
                };
            }));

            results.push(...chunkResults);
        }

        return json({
            totalScanned: albumsToCheck.length,
            brokenCount: results.filter(r => r.isBroken).length,
            results: results.filter(r => r.isBroken) // Only return broken ones to save bandwidth
        });

    } catch (e: any) {
        console.error("Validation error:", e);
        return error(500, e.message);
    }
};
