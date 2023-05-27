---
star: 5
date: 2021-12-19
title: Book Review - The Little Schemer (4th Edition)
tags: [schemer, lisp]
---

书很薄, 但绝非 "轻读物". 如果真想从中学到 "递归", 建议不要泛泛读过,
应该自己写出里面提到的每个 lambda 的实现, 理解每个 Commandment
对于递归的实现的指导意义和应用.

第一次读这种对话形式的技术书, 效果和阅读体验超出我的预期. 这种形式看起来文字很少,
却很能引发读者字里行间的主动独立的思考和总结, 信息量是不小的. 这也是说它不是 "轻读物"
的原因.

书的编排也是由浅入深的, 基本上得从头到尾的读. 它从一些 "原语" 和基本的数据结构,
讲到递归设计, 实现, 跟踪调试, 测试和简化等技巧, 提出了十个相关的 "原则"
(Commandment), 讲到递归的本质 y combinator,
最后以一个解释器的实现完结本书. 如果你只对递归技巧感兴趣, 可以只看到第八章. y
combinator 那一章我有点晕, 还需复读. 总之, 阅读本书无需 Schemer
的前提知识, Schemer 甚至也不是重点; 这本书耐心读也并不大吃力,
我没有觉得 "后面突然变得很难懂".

这本书也是很有趣的. 很多对话都不厌其烦的让人发笑: (如果你读了, 会 get 到笑点儿的)

```
What is the next question?
else
Is else true?
Yes
else
Of course
```

还有:

```
Is this healthy?
Looks like lots of salt
```

与之相关的另两本书, 一本是 The Seasoned Schemer, 重点在讲计算理论, 一本是
The Reasoned Schemer, 重点再讲逻辑. 可以作为后续读物.

这本书末尾的推荐 "消遣" 读物也十分硬核. 如果想转而深入学 Lisp 的话, 还是参考一下
The Seasoned Schemer 后面的读物推荐吧.