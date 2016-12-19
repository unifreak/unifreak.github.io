---
title: "Martin Fowler: 控制反转"
layout: post
category: translation
tags: [pattern]
excerpt: "Martin Fowler 针对 '控制反转' 这个概念给出了自己的解释, 以澄清当下对该概念的迷思. 以及常用的实现方式和示例"
---
_原文在 2005/06/26 发表于 <http://martinfowler.com/bliki/InversionOfControl.html>_

在使用框架的时候, 经常会遇到 '控制反转', 它也的确是框架的一个典型特征.

举个简单的例子, 假如我正在写一个命令行程序, 用于获取用户信息. 我可能会这样做:

```ruby
  #ruby
  puts 'What is your name?'
  name = gets
  process_name(name)
  puts 'What is your quest?'
  quest = gets
  process_quest(quest)
```

在这样的交互中, 我的代码处于控制地位: 它决定什么时候询问用户, 什么时候读取用户响应, 什么时候去处理响应.

但是, 如果是在图形界面中做同样的事情的话, 我则会配置一个视窗:

```ruby
  require 'tk'
  root = TkRoot.new()
  name_label = TkLabel.new() {text "What is Your Name?"}
  name_label.pack
  name = TkEntry.new(root).pack
  name.bind("FocusOut") {process_name(name)}
  quest_label = TkLabel.new() {text "What is Your Quest?"}
  quest_label.pack
  quest = TkEntry.new(root).pack
  quest.bind("FocusOut") {process_quest(quest)}
  Tk.mainloop()
```

可以发现这两种方式有一个重要的区别: 它们的控制流不同 - 尤其是对 `process_name` 和 `process_quest` 这两个方法在何时被调用的控制上. 在命令行的程序里, 我自己控制这些方法何时被调用, 但是在图形界面中则不是这样. 我把控制权交给了视窗系统(`Tk.mainloop` 命令). 然后它根据我创建表单时的绑定关系来决定何时调用我的方法. 控制权被反转了 - 框架来调用我而不是我去调用框架了. 这个现象就是 '控制反转' (也被称为 '好莱坞法则' - '不要打电话(调用)给我们, 我们会给你打').


>对于框架来说, 一个重要的特性就是, 扩展框架的用户代码经常被框架自身在内部调用, 而非在用户应用代码. 框架经常扮演着协调并同步应用活动的主程序. '控制反转' 让框架有能力作为一个可扩展的骨架提供服务, 而用户则通过自己写的方法去修改和定制框架已有的功能.
>
>-- Ralph Johnson and Brian Foote

'控制反转' 是区分框架和库的关键所在. 一个库基本上就是你可以调用的一系列方法(一般被组织进类里面). 每个方法在被调用时做一些事情然后把控制权移交给客户代码.

而框架则包含了更多的抽象设计, 有更多的内置行为. 使用框架, 你得通过子类继承或者通过插入自己的类, 以把你想要的行为放到框架中的各个地方, 然后框架负责适时调用你的代码.

有很多方式插入你自己的代码. 在上面的 Ruby 示例中, 我们使用 `text entry field` 的 `bind` 方法, 给其传入一个事件名称和一个匿名函数. 每当 `text entry box` 检测到该事件时, 就会调用匿名函数中的代码. 像这样使用匿名函数很方便, 但可以很多语言都不支持这种方式.

另一种方式是, 由框架定义事件, 并让客户端代码订阅这些事件. .NET 是该方式的一个很好的例子, 它允许我们在 widgets 上声明事件, 然后我们便可以通过委托来绑定一个方法到某个事件.

上面两种方式(实际上两个并无实质区别)对于特定案例来说能很好的工作, 但有时候, 你希望能在单个扩展中组合调用多个方法. 对于这种情况, 框架可以为这些相关调用定义一个接口, 让客户端代码去实现.

EJB 即是如此. 你在开发一个 session bean 的时候, 可以实现很多方法让 EJB 容器在各个生命周期点调用. 比如, Session Bean 接口定义了 ejbRemove, ejbPassivate(存储到二级存储), 和 ejbActivate(从钝态恢复). 你只能控制他们做什么, 但无法控制何时去做. 容器调用我们, 而非反之.

上述都是比较复杂的 '控制反转' 情景, 但是你也可能在更简单的情境中遇到 '控制反转'. 模板方法即为一例: 超类定义控制流, 子类通过覆写或实现抽象方法来扩展超类. 比如在 JUnit 中, 框架去调用 setUp 和 tearDown 方法, 为你创建或者清理文本夹具. JUnit 框架去调用, 你的代码去响应 - 控制再次被反转了.

随着 IoC(Inversion of Control) 容器的兴起, 现在出现了很多对 '控制反转' 的误解: 有些人把这里所讲的一般原则和某种容器的特殊实现(如依赖注入)相混淆. 名字本身也有些混淆视听(和令人啼笑皆非), 因为 IoC 容器一般被当做 EJB 的竞争对手, 然而 EJB 本身实际上也用了很多(或更多) '控制反转'.

__语源__: 我能记起最早的 '控制反转' 的出处是 Johnson 和 Foote 在 1988 年出版于 _The Journal of Object-Oriented Programming_ 的一篇论文. 它正是那种历久弥新的论文之一 - 即使十五年之后的今天也值得一读. 他们觉得自己是从别的地方借用了这个名词(但是忘了具体哪里了). 之后 '控制反转' 便潜入面向对象社区, 出现在 GoF 的书中. 至于更有趣的 '好莱坞法则' 则貌似发源于 Richard Sweet 在 1983 年发表于 _Mesa_ 杂志的一篇文章. 在某个设计目标列表中他写道: "不要打电话给我们, 我们会给你打 (好莱坞法则): 如果用户想要针对某个事件和工具进行交流, Tajo 会去通知工具, 工具只要做好准备就行. 而非去实现一种类似 '询问用户意图然后执行' 的模型." John Vlissider 也在为 C++ 写的一篇报道中很好的解释了 '好莱坞法则' 背后的概念. (感谢 Brian Foote 和 Ralph Johnson 为此词源提供的帮助.)