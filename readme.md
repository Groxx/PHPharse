There is a surplus of bad JavaScript Date parsing / string-emitting code on the web.  So I decided to fix that.

###### There may be bugs yet.  Date handling can get pretty complicated.

The name is an attempted joke at both "PHP" and how it's a fake PHP format handler - a farce, if you will.  Mash them together, and "PHPharse" is what you get!  Similarly, the date-string-emitter side of this is spelled "PHPhormat", to retain the "PHP" that the "PHParse" side has while still having "format" be pronounceable in the name.  Feel free to rename these if your funny bone is broken, my feelings won't be hurt!

Many libraries build JavaScript code via string fragments, and then `eval` it to build the parsing code.  This works, but (unless parsing truly enormous strings) is many many many times slower than pre-defined functions.  They are also usually partially-hand-minified and unnecessarily cryptic.  Then there are often a thousand little things that are not optimal on top of `eval`, and eventually the straw broke my proverbial camel's back.

I wish I had a camel.  Watch out: they spit!

The main purpose of this code is to be readable and fast - *absolute* fastest execution speed is not desired if it makes the code excessively cryptic, or if it is based too heavily on current JavaScript implementations.  This should be future-and-reader-friendly as much as possible without unnecessary compromises.

---

This should minify substantially, and I intend to annotate it for Google's Closure compiler and include a minified form of it here to make things easier.  It can be *significantly* minified further if full-length timezone names are not necessary - simply remove them, and the `reg.e` and `funcs.e` functions, and "e" will be entirely ignored when parsing.