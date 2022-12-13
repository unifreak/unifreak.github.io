---
title: "Sed 简明教程和参考 - 高级篇"
layout: post
category: note
tags: [shell, sed]

excerpt: "内容总结自学习书籍 <Linux 命令行与 Shell 脚本编程大全>. 基础篇包含如何在命令行和使用文件运行 sed 脚本,
进行常见的单行匹配, 打印, 编辑, 替换和删除等操作. 高级篇涉及多行文本操作, 保持空间, 模式替代等相关内容."
---

_本文内容总结自书籍 [Linux 命令行与 shell 脚本编程大全](https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BANYJK1olXwUAU11UD0sRBV8IGVsdVQICUm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYAVFZVDEsRHDZNRwYlFUJnCSkrFg11YDNcez9uHGECMT0pXkcbM244GFoVXQEKUl9VCXsnA2g4STXN67Da8e9B3OGY1uefK1olXQEEVVZeAEIQAmoJEmsSXQ8yMAEFfwhDUzU4K2sWbQECXUpbegpFF2l6K2sVbQUyFjBUDR4fV2YOElNGCFEHB11ZWEIWBm8MTlgWVQ5WAF0IXXsVAm4MEmsl)_

## 多行命令

### 移动到下一行

格式: `n`

```sh
# 删除匹配 /header/ 的行之后的行
$sed '/header/{
> n
> d
> }' data.txt
```

### 合并下一行

格式: `N`

```sh
# 将匹配 /first/ 行的下一行与当前行合并为一行
$ cat data.txt
This is the first line.
This is the second line.
$ sed '/first/{
> N
> s/\n/ /
> }' data.txt
This is the first line. This is the second line.
```

- `D` 删除多行组中的**第一行**.
- `P` 打印多行组中的**第一行**.

## 保持空间命令

`h` 将模式空间复制到保持空间
`H` 将模式空间附加到保持空间
`g` 将保持空间复制到模式空间
`G` 将保持空间附加到模式空间
`x` 交换模式空间和保持空间

## 改变流程

- `!` 排除命令, 如 `$!N` 除了第一行都执行 N

- 分支命令 `[address]b [label]`: address 行会跳转到 label, 没有指定 label 默认跳到脚本结尾
使用 `:label` 指定标签. 可以往后跳, 也可以往前

```sh
echo "This, is, a, test, to, remove, commas." | sed -n '{
:start
s/,//1p
/,/b start
}'
```

- 测试命令 `[address]t [label]`: 根据**替换命令**结果, 成功则跳到 label

```sh
echo "This, is, a, test, to, remove, commas." | sed -n '{
:start
s/,//1p
t start
}'
```

- `q` 退出脚本

# 模式替代

`&` 代表替换命令中匹配的模式: `echo "The cat sleeps in his hat." | sed 's/.at/"&"/g'`

`\数字` 代表**用圆括号**指定的**子模式**, 从 `\1` 开始

```sh
# 这个脚本给每三个数字加逗号
# .*[0-9] 用于寻找用数字结尾的任意长度字符
# [0-9]{3} 寻找若干组三位数字
# t 用于遍历这个数字, 知道放置好所有逗号
# 注意其中的 \ 转移: (, ), {, }
echo "1234567" | sed '{
:start
s/\(.*[0-9]\)\([0-9]\{3\}\)/\1,\2/
t start
}'
```

# Snippets

- 删除特定行前的空白行: `sed '/^$/{N ; /pattern/D}' file`

- 跨行替换

注意这个脚本: 带空格的单行命令在 N 前, 带换行符 \n 的多行命令在 N 后.
这样做是为了避免到了最后一行, 因为 N 命令没有下一行可读, 就会终止执行.
如果要匹配的文本刚好在最后一行, 命令不会发现要匹配的数据

```sh
sed '
s/from pattern/to content/
N
s/from\npattern/to\ncontent/
' file
```

- 反序所有行 `sed -n '{1!G ; h ; $p }' file`, 当然也可以直接用 `tac` 命令

- 加倍行间距

```sh
# 技巧的关键在于保持空间的默认值是 **空行**
# /^$/d 用于处理原有的空行
# $! 用于排除最后一行
sed '/^$/d ; $!G' file
```

- 给文件中的行编号

```sh
# = 输出行号, 然后把单独一行的行号和下一行合并
sed '=' file | sed 'N; s/\n/ /'
```

- 打印末尾 5 行, **重点**理解 `6,$D` 的判断效果

```sh
# $q 若为最后一行则退出脚本
# N 否则加入下一行到模式空间
# 6,$D 如果模式空间达到 6 行, 则 D 删除第一行
# b 循环
sed '{
    :start
    $q; N; 6,$D
    b start
}' file
```

- 删除连续空白行

```sh
# /./,/^$/ 匹配任何含有至少一个字符的行
# !d 这种行不会被删除. 那么被删除的肯定就是连续空白行了
sed '/./,/^$/!d' file
```

- 删除开头的空白行

```sh
# /./,$ 从有字符的行到末尾行
# !d 都不会被删除. 那么被删除的肯定就是开头空白行了
sed '/./,$!d' file
```

- 删除结尾空白行

```sh
# 注意大括号可以嵌套
# /^\n*$/ 匹配文本结尾处($)的多个连续(*)空行(^\n)
# $d 如果是最后一行则删除
# N 否则就加入到模式空间
# b start 然后循环
sed '{
    :start
    /^\n*$/{
        $d; N; b start
    }
}' file
```

- 删除 HTML 标签

```sh
# 注意 [^>]* 的使用, 以避免删除标签内的文本
sed 's/<[^>]*>//g' file
```

