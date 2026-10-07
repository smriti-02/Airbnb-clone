const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace specific known strings
    content = content.replace(/>\$\{/g, '>₹{'); // e.g. <span>${quote.total}</span> -> <span>₹{quote.total}</span>
    content = content.replace(/\$10/g, '₹10');
    content = content.replace(/\(\$\)/g, '(₹)');
    content = content.replace(/Total: \$/g, 'Total: ₹');
    content = content.replace(/underline">\$\{/g, 'underline">₹{');
    content = content.replace(/font-semibold">\$\{/g, 'font-semibold">₹{');
    content = content.replace(/text-\[color:var\(--color-airbnb-text\)]">\$\{/g, 'text-[color:var(--color-airbnb-text)]">₹{');
    
    // specific to HostDashboardClient line 79:
    content = content.replace(/>\$\{l.price_per_night}/g, '>₹{l.price_per_night}');

    fs.writeFileSync(file, content, 'utf8');
});
console.log("Currency replaced safely.");
