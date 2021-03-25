# Lwarp Importer

Some scripts to break up and understand
the HTML output of the lwarp LaTeX utility.
 
## Rational

PDFs are a pain to work with programmatically,
however often lecturers will offer "accessible"
versions of their notes in HTML form having gone
through the [`lwarp`](https://ctan.org/pkg/lwarp?lang=en)
program.

While this output is not necessarily pretty (or even
necessarily standards conforming!), it is much easier to
work with than the PDF files themselves.

This is very heuristic based, it is messy, it is working
with formats that are not meant to be used in this way, if
anyone wants to use this I would suggest you read the code
and take inspiration. I have tried to keep the scripts clean,
but they often require the output of a previous script or worse
a previous version (of which is unlikely to be tracked here).

## Use

Mainly these are used to break out each theorem / definition / etc
into its own file so that they can be connected in an app such as
[Obsidian](https://obsidian.md). However you could also use this as a basis
to transform it into a prettier version of the HTML form, with the addition
of some CSS and HTML clean up.

## Areas for Improvement

Mainly notes for myself for when I inevitably try to do this all again next
semester,

1. Lists, both numbered and bulleted.
2. Block math and the equation environment directly in HTML?

## Post Processing

```
1176  sd '######' '###' 7\ The\ Divergence\ Theorem.md
1177  sd '######' '###' 8.md
1178  sd '######' '###' 9.md
1180  sd '\\_' '_' *.md
1181  sd '\\label ?\{[^\}]+\}' '' *.md
1182  sd '\$\\seteqnumber.+\$' '' *.md
1183  sd '######' '###' 9.md
1184  sd '######' '###' 8\ Stokes’\ Theorem.md
1185  sd '\$\\seteqnumber.+\$' '' *.md
1186  sd '\\label ?\{[^\}]+\}' '' *.md
1187  sd '\\_' '_' *.md
1189  sd '\\_' '_' *.md
1190  sd '\\label ?\{[^\}]+\}' '' *.md
1191  sd '\$\\seteqnumber.+\$' '' *.md
1192  sd '######' '###' *.md
1197  sd '^###' '' *.md
1198  sd '\\_' '_' *.md
1200  sd '\\label ?\{[^\}]+\}' '' *.md
1203  sd '\$\\seteqnumber.+\$' '' *.md
```
