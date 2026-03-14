const fs = require('fs');
const path = require('path');

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
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace color classes for the HUD redesign
    content = content.replace(/text-green-([0-9]+)/g, 'text-cyan-$1');
    content = content.replace(/bg-green-([0-9]+)/g, 'bg-cyan-$1');
    content = content.replace(/border-green-([0-9]+)/g, 'border-cyan-$1');
    content = content.replace(/from-green-([0-9]+)/g, 'from-cyan-$1');
    content = content.replace(/to-green-([0-9]+)/g, 'to-cyan-$1');
    content = content.replace(/via-green-([0-9]+)/g, 'via-cyan-$1');
    content = content.replace(/shadow-green-([0-9]+)/g, 'shadow-cyan-$1');
    content = content.replace(/ring-green-([0-9]+)/g, 'ring-cyan-$1');
    content = content.replace(/decoration-green-([0-9]+)/g, 'decoration-cyan-$1');

    // Replace neon colors
    content = content.replace(/neon-text-green-strong/g, 'neon-text-cyan');
    content = content.replace(/neon-text-green/g, 'neon-text-cyan');
    
    // Convert purples/ambers to orange for contrast
    content = content.replace(/text-purple-([0-9]+)/g, 'text-orange-$1');
    content = content.replace(/bg-purple-([0-9]+)/g, 'bg-orange-$1');
    content = content.replace(/border-purple-([0-9]+)/g, 'border-orange-$1');
    content = content.replace(/neon-text-purple/g, 'neon-text-orange');

    content = content.replace(/text-amber-([0-9]+)/g, 'text-orange-$1');
    content = content.replace(/bg-amber-([0-9]+)/g, 'bg-orange-$1');
    content = content.replace(/border-amber-([0-9]+)/g, 'border-orange-$1');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    }
});
