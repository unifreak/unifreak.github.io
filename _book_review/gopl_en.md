---
stars: 5
date: 2021-09-11
title: Book Review -- The Go Programming Langauge (gopl)
tags: [golang, book]
---

<a href="https://www.amazon.com/Programming-Language-Addison-Wesley-Professional-Computing/dp/0134190440?_encoding=UTF8&pd_rd_w=3MJIa&content-id=amzn1.sym.716a1ed9-074f-4780-9325-0019fece3c64&pf_rd_p=716a1ed9-074f-4780-9325-0019fece3c64&pf_rd_r=J3TDRT4SMEC28E3C5FJX&pd_rd_wg=kAtom&pd_rd_r=4380781d-7e1c-4e5c-a54a-167d05abd959&linkCode=li3&tag=unifreak-20&linkId=a5b66da9f578363b55cfb9a06c97e4cd&language=en_US&ref_=as_li_ss_il" target="_blank"><img border="0" src="//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=0134190440&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=unifreak-20&language=en_US" ></a><img src="https://ir-na.amazon-adsystem.com/e/ir?t=unifreak-20&language=en_US&l=li3&o=1&a=0134190440" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />

Reading this book gives me the same pleasure as the classic C book <K&R>.

Both books have similar style. they explains things fluently and clearly. There
are so much tech book either written as blog post lack of some inner flow, or
trying to explain things but make it more confusing.

This book take a iterative approach, it first teach essential concepts and
components in golang to get readers going, then add more details and depth into
things we already familiar with in each chapters later. At last, you find
yourself learnt most things in Go Spec, in detail.

The most valuable thing in this book is that it focus on realistic requirement
to code for, and the code example is both interesting and enlightening.

For learner who already familiar with programming in other language, I recommend
this book as the first book to read when going for golang.

Although this book organize contents roughly by golang's feature, but it also
has topics cross the whole book. This is what I learnt from it:

- Golang's language syntax, traps to avoid
- Idiomatic go, design principles, patterns and best practices
- Common packages' api and usage
- Common algorithms and how to implement it with go (tree, sorting, bitmaps, etc.)
- How things work internally, and why work like that

With Go 1.9 come out, this book may seems old (it use go 1.5), so there are
something missing, the most noticeable is feature like module, workspace,
generics. As for reflection and CGO, as the author thinks that for regular
scenarios they should be avoided, hence both lack details, not as extensive as
other topics in this book.

How I read this book:

- Download the source, but try code them by self first
- Do the practice
- Go through the package mentioned in this book with go doc

Some related links:

- Errata: <http://gopl.ip/errata.html>
- Go Specification: <https://golang.org/ref/spec>
- Go Proverbs: <http://go-proverbs.github.io>
- Answer of exercise (not official): <https://github.com/torbiak/gopl>, <https://github.com/ray-g/gopl>