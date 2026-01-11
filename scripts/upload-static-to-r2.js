/**
 * Script to upload large audio files from static/ to R2
 * Run with: node scripts/upload-static-to-r2.js
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '../.env') });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'chillchess-music';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ Missing R2 credentials in .env file');
    console.error('Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    process.exit(1);
}

// Configure R2 client
const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    }
});

// MIME type mapping
const MIME_TYPES = {
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac'
};

function getMimeType(filename) {
    const ext = filename.substring(filename.lastIndexOf('.'));
    return MIME_TYPES[ext] || 'application/octet-stream';
}

async function uploadFile(localPath, r2Key) {
    try {
        console.log(`📤 Uploading: ${r2Key}`);

        const fileBuffer = readFileSync(localPath);
        const mimeType = getMimeType(localPath);

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            Body: fileBuffer,
            ContentType: mimeType
        });

        await s3.send(command);

        const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
        console.log(`✅ Uploaded: ${r2Key} (${sizeMB} MB)`);

        return true;
    } catch (error) {
        console.error(`❌ Failed to upload ${r2Key}:`, error.message);
        return false;
    }
}

async function uploadDirectory(dirPath, r2Prefix) {
    const items = readdirSync(dirPath);
    const results = [];

    for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            // Recursive
            const subResults = await uploadDirectory(fullPath, `${r2Prefix}/${item}`);
            results.push(...subResults);
        } else if (stats.isFile()) {
            const r2Key = `${r2Prefix}/${item}`;
            const success = await uploadFile(fullPath, r2Key);
            results.push({
                localPath: fullPath,
                r2Key,
                success,
                size: stats.size
            });
        }
    }

    return results;
}

async function main() {
    console.log('🚀 Starting upload to R2...\n');
    console.log(`Bucket: ${R2_BUCKET_NAME}\n`);

    const staticDir = join(__dirname, '../static');

    const filesToUpload = [
        // Whitenoise files
        { dir: join(staticDir, 'whitenoise'), prefix: 'static/whitenoise' },
        // Audio files
        { dir: join(staticDir, 'audio'), prefix: 'static/audio' }
    ];

    let totalUploaded = 0;
    let totalFailed = 0;
    const allResults = [];

    for (const { dir, prefix } of filesToUpload) {
        console.log(`\n📁 Processing: ${dir}`);
        console.log(`   R2 prefix: ${prefix}\n`);

        const results = await uploadDirectory(dir, prefix);
        allResults.push(...results);

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        totalUploaded += successful;
        totalFailed += failed;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${totalUploaded}`);
    console.log(`❌ Failed: ${totalFailed}`);

    const totalSize = allResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`📦 Total uploaded: ${totalSizeMB} MB`);

    console.log('\n📝 Uploaded files:');
    allResults
        .filter(r => r.success)
        .forEach(r => {
            console.log(`   - ${r.r2Key}`);
        });

    if (totalFailed > 0) {
        console.log('\n❌ Failed files:');
        allResults
            .filter(r => !r.success)
            .forEach(r => {
                console.log(`   - ${r.r2Key}`);
            });
        process.exit(1);
    }

    console.log('\n✅ All files uploaded successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update code to reference R2 URLs');
    console.log('   2. Remove files from static/ folder');
    console.log('   3. Re-deploy to Cloudflare Pages');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
