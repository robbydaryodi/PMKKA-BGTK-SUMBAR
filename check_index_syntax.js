const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Extract script content from index.html
const scriptMatches = indexHtml.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];

console.log(`Found ${scriptMatches.length} script tags in index.html.`);

let inlineScriptCount = 0;
scriptMatches.forEach((s, idx) => {
    // If inline script
    if (!s.includes('src=')) {
        inlineScriptCount++;
        const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
        console.log(`\n--- Auditing Inline Script #${inlineScriptCount} (${code.length} chars) ---`);
        try {
            new Function(code);
            console.log(`✅ Script #${inlineScriptCount} syntax is VALID!`);
        } catch (e) {
            console.error(`❌ Script #${inlineScriptCount} SYNTAX ERROR:`, e.message);
            
            // Print surrounding error lines
            const lines = code.split('\n');
            console.error("Script excerpt around error:");
            lines.slice(Math.max(0, lines.length - 30)).forEach((l, i) => console.log(l));
        }
    }
});
