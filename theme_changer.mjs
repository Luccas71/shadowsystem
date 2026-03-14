import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        const replacements = [
            [/text-green-([0-9]+)/g, 'text-cyan-$1'],
            [/bg-green-([0-9]+)/g, 'bg-cyan-$1'],
            [/border-green-([0-9]+)/g, 'border-cyan-$1'],
            [/from-green-([0-9]+)/g, 'from-cyan-$1'],
            [/to-green-([0-9]+)/g, 'to-cyan-$1'],
            [/via-green-([0-9]+)/g, 'via-cyan-$1'],
            [/shadow-green-([0-9]+)/g, 'shadow-cyan-$1'],
            [/ring-green-([0-9]+)/g, 'ring-cyan-$1'],
            [/decoration-green-([0-9]+)/g, 'decoration-cyan-$1'],
            
            [/text-emerald-([0-9]+)/g, 'text-cyan-$1'],
            [/bg-emerald-([0-9]+)/g, 'bg-cyan-$1'],
            [/border-emerald-([0-9]+)/g, 'border-cyan-$1'],
            [/shadow-emerald-([0-9]+)/g, 'shadow-cyan-$1'],
            [/from-emerald-([0-9]+)/g, 'from-cyan-$1'],
            [/to-emerald-([0-9]+)/g, 'to-cyan-$1'],
            [/via-emerald-([0-9]+)/g, 'via-cyan-$1'],
            
            [/neon-text-green-strong/g, 'neon-text-cyan'],
            [/neon-text-green/g, 'neon-text-cyan'],
            
            [/text-purple-([0-9]+)/g, 'text-orange-$1'],
            [/bg-purple-([0-9]+)/g, 'bg-orange-$1'],
            [/border-purple-([0-9]+)/g, 'border-orange-$1'],
            [/neon-text-purple/g, 'neon-text-orange'],
        
            [/text-amber-([0-9]+)/g, 'text-orange-$1'],
            [/bg-amber-([0-9]+)/g, 'bg-orange-$1'],
            [/border-amber-([0-9]+)/g, 'border-orange-$1'],
            
            [/text-lime-([0-9]+)/g, 'text-orange-$1'],
            [/bg-lime-([0-9]+)/g, 'bg-orange-$1'],
            [/border-lime-([0-9]+)/g, 'border-orange-$1']
        ];

        replacements.forEach(([regex, replacement]) => {
            content = content.replace(regex, replacement);
        });

        if (content !== original) {
            fs.writeFileSync(file, content);
            console.log(`Updated: ${file}`);
        }
    } catch (e) {
        console.error(`Skipping ${file} due to error:`, e.message);
    }
});
console.log('Script completed.');
