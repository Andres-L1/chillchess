/**
 * Upload file to R2 via server proxy
 * This bypasses CORS issues by uploading through the server instead of directly to R2
 */
export async function uploadToR2(file: File, folderPath: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folderPath);

    const res = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        let errorMsg = 'Failed to upload file';
        try {
            const err = await res.json();
            errorMsg = err.error || err.message || errorMsg;
        } catch (e) {
            // ignore json parse error
        }
        throw new Error(errorMsg);
    }

    const { url } = await res.json();
    return url;
}
