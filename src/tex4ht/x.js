const vfile = require('to-vfile')
const unified = require('unified')

let rehypeParse = require('rehype-parse');
let rehypeToRemark = require('rehype-remark');
let z = require('remark-stringify');
let g = require('remark-gfm');
//
// const markdown = require('remark-parse')
const math = require('remark-math')
const rhm = require('rehype-math')
// const remark2rehype = require('remark-rehype')
// const katex = require('rehype-katex')
const stringify = require('rehype-stringify')

unified()
    .use(rehypeParse)
    .use(rhm)
    .use(rehypeToRemark)
    .use(g)
    .use(math)
    // .use(remark2rehype)
    // .use(katex)
    // .use(stringify)
    .use(z)
    .process(vfile.readSync('/Users/joshuacoles/checkouts/jc3091/lwarp-importer/tex4ht/mds/1-MA10209-webse1.html'), function (err, file) {
        if (err) throw err
        console.log(String(file))
    })
