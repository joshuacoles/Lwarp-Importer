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
