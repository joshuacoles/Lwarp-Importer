const {JSDOM} = require('jsdom');
const Turndown = require('turndown');
const globby = require('globby');
const fs = require('fs/promises')
const path = require("path");
const prettier = require("prettier");

// Replace escape
Turndown.prototype.escape = s => s;
const turndown = new Turndown();

const gbRoot = '/Users/joshuacoles/Documents/University/NotesSnaps/people.bath.ac.uk/rm257/MA20219/notes';
const htmls = globby.sync(path.posix.join(gbRoot, '*.html'));
const images = globby.sync(path.posix.join(gbRoot, '**/*.{png,jpeg,jpg,svg}'));

const pageIdMap = new Map();

(async () => {
    await fs.mkdir('./attachments', { recursive: true });
    for (let img of images) await fs.copyFile(img, path.join('./attachments', path.basename(img)))

    for (let html of htmls) {
        const doc = (await JSDOM.fromFile(html)).window.document;
        const inner = doc.querySelector('.page-inner');

        let md = turndown.turndown(inner);
        md = md.replaceAll('\\(', '$')
            .replaceAll('\\)', '$')
            .replaceAll('\\[', '\n$$$$\n')
            .replaceAll('\\]', '\n$$$$\n');

        md = prettier.format(md, {parser: 'markdown'});

        pageIdMap.set(path.basename(html, '.html'), md);
    }

    const toc = (await JSDOM.fromFile(htmls[0])).window.document.querySelector('.summary');

    for (let [k, v] of pageIdMap.entries()) {
        const li = toc.querySelector(`li.chapter[data-path = "${k}.html"]`);
        const topLevelId = (li.dataset.level || '').split('.')[0]
        const p = path.join('./mds', topLevelId, k + '.md');

        await fs.mkdir('./mds/' + topLevelId, { recursive: true })
        await fs.writeFile(p, v);
    }
})()
