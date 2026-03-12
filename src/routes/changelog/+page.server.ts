import { readFileSync } from 'fs';
import { resolve } from 'path';

export const load = async () => {
    try {
        // Read CHANGELOG.md from the root of the project
        const changelogPath = resolve(process.cwd(), 'CHANGELOG.md');
        const content = readFileSync(changelogPath, 'utf-8');
        
        return {
            content
        };
    } catch (error) {
        console.error('Error reading CHANGELOG.md:', error);
        return {
            content: '# Error\nNo se pudo cargar las notas del parche.'
        };
    }
};
