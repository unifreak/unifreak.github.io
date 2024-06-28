---
title: "谁提交的 Git 坏的事儿?"
layout: post
category: tutorial
tags: [git]
description: git, git bisect, bad commit, git 提交追踪
excerpt: "团队协作的项目中, 经常会遇到别人的某次 git 提交, 导致项目出错的情况.
假设有个项目, 有两个团队维护开发它, 你们都通过把代码合并到 master 分支发布新版.
某天你拉了一下 master 的远程代码, 结果发现自动测试不通过了. 你看了一下 `git
log`, 发现刚刚从远程同步了有 100 多个提交. 现在的问题是: 谁提交的代码导致项目出
错了?"

---

_原文: <https://vishaltelangre.com/chasing-a-bad-commit/>_

团队协作的项目中, 经常会遇到别人的某次 git 提交, 导致项目出错的情况.

假设有个项目, 有两个团队维护开发它, 你们都通过把代码合并到 master 分支发布新版.
某天你拉了一下 master 的远程代码, 结果发现自动测试不通过了. 你看了一下 `git
log`, 发现刚刚从远程同步了有 100 多个提交.

现在的问题是: 谁提交的代码导致项目出错了?

有几个可能的解决办法:

- 选项 1: 从最后一个提交开始, 一个一个的签出上一次的提交, 运行测试看是否能通过,
  直到找到最近一次能测试通过的提交. 那么罪魁祸首肯定就是它之后的那次提交了
- 选项 2: 如果你必须得签出然后运行测试 100 多次呢? 太费劲了. 你可以把任务分成片,
  分派给不同的人同时去做
- 选项 3: 你肯定已经想到更好的方式了 --- 二分查找. 甚至可以写一个脚本自动帮你做
  二分查找的工作
- 选项 4: 也就是今天的主题: 使用 `git bisect`. 它实际上就是一个帮你做这种二分查
  找工作的工具

# Git Bisect

`git bisect` 有两种使用模式: 交互模式和自动模式. 先来看看如何在交互模式中使用

## 交互模式

开始一次 `bisect` 会话:

```shell
$ git bisect start
```

然后标记某次提交是一次 "坏提交". 所谓坏提交, 在我们的例子中, 也就是引入了 bug 之
后, 导致自动测试不通过的那些提交.

假设现在我们在 `master` 分支, 我们可以用当前的 `HEAD`, 告诉 `git bisect` 最近的
这次提交是 "坏提交"

```shell
# 确定是在 master 分支
$ git branch
* master
production

# 确定自动测试是失败的
# 注意: 虽然我们还在 bisect 会话中, 但是可以运行其他命令
$ phpunit
FAILURES!
Tests: 11, Assertions: 33, Failures: 1.

# 标记 HEAD 为坏提交
$ git bisect bad HEAD # 或直接 `git bisect bad`
```

接着, 找到一个 "好提交" (测试能通过的). 假设我们知道自己上次的提交能测试通过, 并
且被我们打了 `v12.0.1` 的标签. 我们可以先签出那次提交, 然后标记其为 good.

```shell
$ git checkout v12.0.1

# 标记为好提交
$ git bisect good
Bisecting: 46 revisions left to test after this (roughly 6 steps)
[02b0b29] Fix: fontsize
# 可以看到 bisect 的输出, 告诉我们还有 46 个提交需要检查, 大概还需要 6 步完成
# 并且自动签出了 02b0b29 这个版本, 这就是位于好提交和坏提交之间的那次提交
# bisect 自动帮我们做了二分查找
```

我们也可以看看 `bisect` 当前的进度, 使用 `git bisect view` 看一下二分查找的边界
和当前检查的提交

```shell
$ git bisect view --oneline
* 5b91861 (master, origin/master) Merge 'feature/one' branch into 'origin/master' branch
* ...
* ...
* 02b0b29 (HEAD) Fix: fontsize
* ...
* ...
* 4748ff8 (v12.0.1) Release v12.0.1
```


继续看看当前签出的提交是不是坏提交吧

```shell
# 运行测试
$ phpunit
...........                                                       11 / 11 (100%)
OK (11 tests, 32 assertions)

# 因为测试通过, 标记为好提交
$ git bisect good
Bisecting: 23 revisions left to test after this (roughly 5 steps)
[794197a] Update profile
```

反复上面的步骤 5 次之后, `git bisect` 给出了我们最早引入 bug 的提交

```shell
# 测试失败: 坏提交
$ git bisect bad
Bisecting: 11 revisions left to test after this (roughly 4 steps)
...

# 依然是坏提交
$ git bisect bad
Bisecting: 5 revisions left to test after this (roughly 3 steps)
...

# 坏提交...
$ git bisect bad
Bisecting: 2 revisions left to test after this (roughly 1 step)
...

# 测试通过: 好提交
$ git bisect good
Bisecting: 0 revisions left to test after this (roughly 1 step)
...

# 测试失败: 坏提交
$ git bisect bad
efd1083e15670fe6443e5b569b3c0be0e39e212d is the first bad commit
commit efd1083e15670fe6443e5b569b3c0be0e39e212d
Author: john  <john@somecorp.com>
Date:   Fri Jun 19 14:02:09 2020 -0400
```

总共用了 6 步, 我们找到了引入 bug 的根源所在.

工作完成, 别忘了清理一下 `git bisect` 会话.

```shell
$ git bisect reset
Previous HEAD position was efd1083
Switched to branch 'master'
Your branch is up to date with 'origin/master'.
```

## 自动模式

`git bisect` 可以运行并执行任何命令或脚本. 如果命令或脚本运行的退出码是 0, 它便
自动标记为好提交. 反之如果退出码是 1~127 (包括 127, 除去 125), 它便自动标记为坏
提交.

```shell
# 开始 bisect 会话, 同时告诉 bisect 一个好提交和一个坏提交
$ git bisect start HEAD v12.0.1
Bisecting: 46 revisions left to test after this (roughly 6 steps)
[02b0b29] Fix: fontsize
# 指定运行 phpunit 命令, 决定提交是好还是坏
$ git bisect run phpunit
running phpunit
...
Bisecting: 23 revisions left to test after this (roughly 5 steps)
running phpunit
...
Bisecting: 11 revisions left to test after this (roughly 4 steps)
running phpunit
...
Bisecting: 5 revisions left to test after this (roughly 3 steps)
running phpunit
...
Bisecting: 2 revisions left to test after this (roughly 1 step)
running phpunit
...
Bisecting: 0 revisions left to test after this (roughly 1 step)
running phpunit
...
efd1083e15670fe6443e5b569b3c0be0e39e212d is the first bad commit
commit efd1083e15670fe6443e5b569b3c0be0e39e212d
Author: john  <john@somecorp.com>
Date:   Fri Jun 19 14:02:09 2020 -0400
bisect run success
```

这是不是更快了呢?

# 结语

有时候标记某些提交是 "好" 还是 "坏" 并不合适, 比如你在找哪次提交让应用变慢了, 可
能用 "快" 和 "慢" 来标记提交更合适. `git bisect` 支持你自定义使用什么描述词. 这
里不细讲了.

更多有关内容可参见官方文档 <https://git-scm.com/docs/git-bisect>.
