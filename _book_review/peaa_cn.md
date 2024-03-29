---
star: 1
date: 2021-01-19
title: 书评 -- 企业应用架构模式
tags: [ood, sysdesign]
---

这本书值得买吗? 一定要买. 这个译本呢? 千万千万别买.

读这个译本, 我相信译者被我在心里慰问了不下几十遍, 每一遍乘以 0xSB (我知道 S 超出了 F) 可能就是我被译文折磨到的次数了. 它甚至激发我想去创建一个译者黑名单, 以免众多程序员被这些傻逼卷进他们自己的智商泥潭中, 出来的时候已经说不出一句流利的中文了.

# 先说译本

这个译本到底有什么问题? 

这么说吧, 如果读原书需要的理解力是 3 (满级 5), 理解这个译本, 你需要乘以系数几?

- 80% 的译文, 十分生硬. 丝毫感觉不到你自己在读中文. 使点劲的话能读懂, 但是需要你反推原来的英文去理解. 所以算作系数 3 吧, 毕竟你又读了难懂的中文, 又要反推英文, 再来理解中文. 乘以 3 已经很稳了. 译文赏析:

> 译文 (p.57): 在等待用户去考虑一个 Web 页面时...
> 原文: Any stateful server object needs to keep all its state while waiting for a user to ponder a Web page

ponder 的确是仔细考虑的意思, 但这样翻译过来, 译者自己不憋屈么?

- 30% 的译文, 没有传达出作者的意思, 不过对于技术点的理解来说, 无伤大雅. 这已经有逻辑上的错误了, 系数 4 吧. 译文赏析:

> 译文 (p.168): 如果这两种情况都不是, 那就可以做一次区分
> 原文: If neither of those appeals, you can do a diff

原文中, 作者给先出了两种解决方案. 所以这里的意思明显是 "如果这两种方案都让你不满意的话". 也可能只是作者眼花, 把 appeals 看成了 appear. 

而把 diff 翻译成区分, 读起来也是够硬的了.

> 译文 (p.132): 创建临时对象的情形不常见
> 原文: It's not uncommon for people to create objects that are only supposed to be transient.

行吧, 权当译者又是眼花, 把 not uncommon 看成了 not common. 但是你读的越多, 可能越来越为译者的视力担忧了.


> 读权限的取得可以很灵活
> getting the reading right can be tricky 

原文在说正确的加载对象的有些棘手, 被译者认为成读权限的获取. tricky 竟然被译成 "灵活".

- 10% 的译文, 根本就完全跟作者的表达相反. 而且经常是在关键技术点上出这种毛病. 直接让你怀疑作者知不知道他自己在讲什么东西. 就感觉这作者思维怎么这么跳跃, 或者怎么前言搭不上后语, 甚至怎么前后矛盾呢? 一看原文, 不可原谅! 系数 20!. 译文赏析:

> 译文 (p.137): 如果正在使用前端控制器, 很可能会把工作单元管理打包到命令中, 而不是调用 doGet()
> 原文: If you were using Front Controller, you would be more likely to wrap Unit of Work management around your commands rather than doGet()

wrap around 翻译成打包, 直接让我以为是在做编译时的打包. 而且这主客体也弄反了, 原文明明是 "工作单元" 把 "命令" 包起来, 竟然被译者理解为 "把工作单元打包到命令中". 我开始为译者的考级考试担忧了.

> 由于它比较复杂, 因此如果有些数据库交互非常耗时的话, 你就应该尽量避免使用这种方法.
> Since it’s complicated, this is something to be used sparingly when you have laggardly bits of database inter-action

原文想表达由于解决方案的复杂性, 只应在何时少量使用, 译者直接理解为只在这时候你才应该避免. 天.

剩下的例子, 不想多说什么了, 诸位慢慢品味. 

> 其好处在于..., 也不会出现关于继承的严重错误
> the benefit is that you have only one place to go and no awkward decisions about inheritance.

> 重影最具启发性的一点是...
> The most intrusive element of ghosts is that

> ...它是后处理字节码面向方面程序设计的理想目标
> Such a need, which is annoying to remember, is an ideal target for aspect-ori- ented programming for post-processing the bytecode.

> ...设计成分别在独立的事务中对它进行访问和对其他表插入更新
> access to it is in a separate transaction from the one that updates the table you’re inserting into.

> 准备好的语句
> prepared statement

...

我这么较真的列出这些译文, 实在只是因为太 TM 痛恨这些译者了. 

来算一下吧: 3 * (0.8\*3 + 0.3\*4 + 0.1\*20) = 16.8

百分比加起来超过 100, 是因为译文这些毛病经常是交叉感染同步并行的. 

结论就是: 如果 3 块钱的东西, 卖你 16.8, 你愿意买的话, 那就买这个译本吧.

# 再来强力推荐原书

我觉得只要你开始问自己下面任何一个问题, 就代表该读读这本书:

- 问题一: 为什么一个简单的 SQL 查询搞定的事儿, 代码写这么复杂?

代表自己还不够理解系统要解决的问题的复杂性. 那么这本书能让你看到你还没看到的一些重要的设计问题.

- 问题二: 怎么解决这个复杂的问题, 还能依然保持当前系统的模块和灵活性?

代表自己在理解了复杂性之后, 找不到应对的方案. 而这本书的模式, 可能即使你在找的答案.

---

这本书的讲述结构很好.

第一部分表述, 大致讲了几个方面的重要问题 (领域逻辑组织, O/R 不一致, 分布, 并发, 会话状态). 这些问题产生的原因, 可能的方案, 相应的模式以及它们怎么配合使用等等.

然后, 主体部分就是按照这几个方面的问题, 一一介绍它们的解决方案: 模式. 针对每个模式要解决的问题, 实现中的可选项, 各个可选项的优劣以及实现中要注意的事, 等等, 都讲的很细节.

最后是一些通用的模式. 它们可以用于配合其他模式的实现.

---

虽然因为读的垃圾译本, 我读的很吃力 (已经放弃了, 打算读去英文版的). 但我觉的由于这本书涉及的问题本身的复杂性, 还是需要读者的一些经验和理解力的. 对于如何读这本书, 有几点个人总结的经验:

- 没必要通读. 但可以先把表述部分看了. 看的时候对于有兴趣的模式, 翻到后面大概了解一下再回来.
- 在看模式部分之前, 可以先把最后的通用模式看了. 因为主体中的模式, 经常会使用通用模式.
- 如果你手头带着问题来看这本书, 可能会更容易理解, 也理解的更深一点.
- GoF 的模式是前提, 对于常见的策略模式, 模板方法等模式可以先了解一下.
- 书中用的代码大部分是 C# 和 Java. 对于这两个语言的 OO 实现, 也需要了解一下.

这本书离 Web 开发很近. 我相信这本书吃透之后, 自己基本就能写一个 Web 框架了. 理解其他 Web 框架的设计也不在话下. 

# 好了, 黑名单在这儿

不好意思, 就让这两个译者打头阵进黑名单吧: 
