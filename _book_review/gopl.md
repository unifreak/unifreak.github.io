---
stars: 5
date: 2021-09-10
title: 书评 -- The Go Programming Langauge
tags: [go]
---

读这本书让我重新体验了一次读 K&R C 的乐趣.

两本书有着相同的语言风格, 行文流畅, 毫不繁琐, 但是把要解释的东西都解释的明明白白.
主题逐渐深入, 但是都是 "迭代" 式的把重要的细节每章逐步扩展巩固.
等到读完, 发现竟然把 Go Spec 里的细节, 连带着某些重要的低层实现细节和常见的编程场景都覆盖了.
代码例子也很实用有趣.

对于有一定编程经验的同学来说, 如果要学 Go 的话, 我推荐你第一本书就看它.

书中每章虽然都是按照 Go 特性来编排的, 但是也有着横跨全书的共通的主题.
建议阅读过程中自己把这些整理成索引, 方便以后查阅.

- 基础语法, 常见包的 API 和应用, 雷点
- 常见的算法和应用实现 (树的遍历, 排序, 拓扑排序, 位图)
- Go 特定的编程习语, 设计原则, 模式, 最佳实践
- 对某些 Go 特性的低层原理上的解释

因为 Go 语言本身也在发展, 而本书用的是 Go 1.5, 所有有些东西是没有讲到的.
比如 Go Module, Vendoring. 可以和官网 Spec 对照阅读.
至于 reflection 和 CGO, 这本书没讲那么细, 作者也坦言, 这俩东西尽量避免.

另外, 虽然为了避免踩翻译的雷, 读的是机械工业的英文版, 可想而知, 索引是被砍掉的.
我是自己打了一份索引粘到了书后. 有也想这么搞的同学, 可以在后面的链接里下载索引.

阅读建议:

- 下载源码, 但是要自己打源码并运行成功
- 做练习. 后面有我参考的练习答案 git repo
- Go doc 看一遍常用包的文档和 API

一些链接:

- 勘误: <http://gopl.ip/errata.html>
- Go specification: <https://golang.org/ref/spec>
- Go 谚语: <http://go-proverbs.github.io> 作者分享的一些 Go 谚语, 类似 "Errors are values" 之类的
- 答案参考: <https://github.com/torbiak/gopl>, <https://github.com/ray-g/gopl> 推荐后面那个, 有单元测试
- Go spec, index pdf: <https://github.com/UniFreak/learn-gopl/tree/master/reference/>