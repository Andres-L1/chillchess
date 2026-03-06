import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/tomih/.gemini/antigravity/ChillChess/ChillChess/src/routes/invoice/+page.svelte';

let content = fs.readFileSync(filePath, 'utf-8');

// The classes to inline
const classes = {
    'card': 'bg-slate-900/70 backdrop-blur border border-slate-700/40 rounded-2xl',
    'section-title': 'flex items-center gap-2 text-base font-bold text-white',
    'label': 'flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2',
    'input': 'w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all',
    'btn-secondary': 'flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-lg border border-slate-700/50 transition-all'
};

// Inline classes. Note we're looking for class="..." where these might appear.
// A safe way is to regex replace exact matches or add to existing class attributes.
// Let's replace `class="card"` with `class="card bg-slate..."` or just replace `card` if it's a standalone class.
// Since these are custom classes, they are likely mixed with others.
Object.entries(classes).forEach(([cls, twClasses]) => {
    // Regex to match the class inside a class string
    const regex = new RegExp(`(?<=class="[^"]*\\b)${cls}(?=\\b[^"]*")`, 'g');
    content = content.replace(regex, twClasses);
});

// Remove the <style> block at the end
content = content.replace(/<style>[\s\S]*?<\/style>/, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Invoice CSS styles inlined and <style> block removed.');
