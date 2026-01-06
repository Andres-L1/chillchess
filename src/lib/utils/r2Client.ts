
export async function uploadToR2(file: File, folderPath: string): Promise<string> {
    // 1. Get Signed URL
    const res = await fetch('/api/r2/sign-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            folder: folderPath,
        }),
    });

    if (!res.ok) {
        let errorMsg = 'Failed to get upload URL';
        try {
            const err = await res.json();
            errorMsg = err.message || errorMsg;
        } catch (e) {
            // ignore json parse error
        }
        throw new Error(errorMsg);
    }

    const { uploadUrl, key } = await res.json();

    // 2. Upload File (PUT to Signed URL)
    const upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!upload.ok) {
        throw new Error('Failed to upload file to R2');
    }

    // 3. Return Public URL
    // Ideally this domain should be in an environment variable, but for now we keep it consistent with previous code
    const PUBLIC_R2_DOMAIN = 'https://pub-e58e51867b4c44f58a32c407eb8cca7c.r2.dev';
    return `${PUBLIC_R2_DOMAIN}/${key}`;
}
