---
title: "Sed 简明教程和参考 - 基础篇"
layout: post
category: note
tags: [shell, sed]

excerpt: "内容总结自学习书籍 <Linux 命令行与 Shell 脚本编程大全>. 基础篇包含如何在命令行和使用文件运行 sed 脚本,
进行常见的单行匹配, 打印, 编辑, 替换和删除等操作. 高级篇涉及多行文本操作, 保持空间, 模式替代等相关内容."
---

_本文内容总结自书籍 [Linux 命令行与 shell 脚本编程大全](https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BANYJK1olXwUAU11UD0sRBV8IGVsdVQICUm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYAVFZVDEsRHDZNRwYlFUJnCSkrFg11YDNcez9uHGECMT0pXkcbM244GFoVXQEKUl9VCXsnA2g4STXN67Da8e9B3OGY1uefK1olXQEEVVZeAEIQAmoJEmsSXQ8yMAEFfwhDUzU4K2sWbQECXUpbegpFF2l6K2sVbQUyFjBUDR4fV2YOElNGCFEHB11ZWEIWBm8MTlgWVQ5WAF0IXXsVAm4MEmsl)_

**Sed**: Stream EDitor

**流编辑器**, 区别于**交互式编辑器**, 通过预先提供的规则编辑数据流.
流编辑器要比交互式编辑器快得多.

# 基础

Sed 默认不会修改文件数据, 只是发送到 STDOUT.

## 调用 sed

格式: `sed <选项> <命令> <文件>`. **sed 命令**应放到单引号中.

`<选项>` 可为以下:
- `-i` 就地编辑
- `-e script` 将 script 中指定的命令添加到已有命令中
- `-f file` 将 file 中的命令添加到已有命令中
    `-f` 选项可以指定命令文件, 文件中的命令**不用分号**, 文件一般命名为 `.sed` 后缀
- `-n` 抑制输出, 使用 print 命令来完成输出

## 一些示例

```sh
$ echo "This is a test" | sed 's/test/big test/'
This is a big test

$ cat data.txt
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.
$ sed 's/dog/cat' data.txt
The quick brown fox jumps over the lazy cat.
The quick brown fox jumps over the lazy cat.
$ cat data.txt # sed 默认不会更改原文件内容
The quick brown fox jumps over the lazy dog.
The quick brown fox jumps over the lazy dog.

# 使用 -e 指定多条命令
# 如果写到一行, 使用 ; 分割命令
$ sed -e 's/brown/green/; s/dog/cat/' data.txt
The quick green fox jumps over the lazy cat.
The quick green fox jumps over the lazy cat.
# 也可以写到多行, 此时可以省略 ;. 但注意必须在封尾单引号所在行结束命令
$ sed -e '
> s/brown/green/
> s/fox/elephant/
> s/dog/cat' data.txt
The quick green elephant jumps over the lazy cat.
The quick green elephant jumps over the lazy cat.

# 使用 -f 指定文件, 运行其中的命令
$ cat script.sed
s/brown/green/
s/fox/elephant/
s/dog/cat
$ sed -f script.sed data.txt
The quick green elephant jumps over the lazy cat.
The quick green elephant jumps over the lazy cat.
```

# 行寻址

sed 命令默认作用于所有文本行, 可使用两种形式的**行寻址**指定行:
- 使用数字指定行: 如单行 `2`, 区间 `2,4`, 到尾行 `2,$`
- 使用文本模式过滤器指定行: 如单行 `/pattern/cmd`, 区间 `/start_pattern/,/end_pattern/cmd`, sed **只支持 BRE**.

以上两种指定形式, 可用于单个命令或命令分组:
- 应用于单个命令: `[address]cmd`
- 应用于命令分组时, 注意**必须在 `{` 后换行, 在 `}` 前换行**, 若多个命令在同一行, 可用 `;` 分割

    ```sh
    addres {
        cmd1
        cmd2
        ...
    }
    ```


# 单行命令

## 替换命令

格式: `[address]s/pattern/replacement/flags`.

分隔符如果是 `/` 的话, 必须适时对 `/` 转义. 如文件路径:
`sed s/\bin\/bash/\/bin\/csh/ /etc/passwd`. 这样比较麻烦.
可以使用除了 `/` 之外的其他字符作为分隔符, 如使用 `!`: `s!/bin/bash!/bin/csh!`.

flags 可为:
- `数字` 指定替换第几个匹配. 认**只替换每行第一次出现的匹配**.
- `g` 替换所有匹配
- `p` 打印原行, 通常配合 `-n` 选项, 以只输出替换过的行
- `w file` 写入替换后行到文件中

## 删除命令

格式: `[address]d`

- 删除全部: `d`
- 单行: `3d`
- 区间: `2,3d`, `2,$d`
- 模式匹配: `/pattern/d`
- 模式匹配区间: `/begin_pattern/,/end_pattern/d` **每次**匹配了 begin_pattern, 就会开始删除

## 插入/追加/修改

注意, 如果_在命令行中_使用这些命令, 必须在 `\` 之后另起一行指定要插入(追加)的内容.
如果要插入(附加)多行文本, 必须在每一个指定文本后使用 `\`. 最后一行不用.

```sh
# 插入命令: i
sed '[address]i\
new line\
multiple line
'

# 追加命令: a
sed '[address]a\
new line
'

# 修改命令: c
sed '[address]c\
new line
'
```

## 转换

格式: `y/inchars/outchars/`

这是唯一一个处理**单个字符**的命令, 它对 `inchars` 和 `outchars` 的值进行**一对一映射**. 如果两者长度不同, 会产生一条错误消息. 这个命令 **无法限定地址**.

## 打印

`p`: 打印文本行, 常用于配合 `-n` 打印出匹配行.

```sh
# 打印匹配 number 3 的行
$ sed -n 'number 3/p' data.txt

# 打印 2 和 3 行
$ sed -n '2,3p' data.txt

# 打印原行, 和替换之后的行
$ sed -n '/3/{
> p
> s/line/text/p
> }' data.txt
```

`=`: 打印行号

```sh
# 打印每一行行号
$ sed '=' data.txt
1
The quick brown fox jumps over the lazy dog.
2
The quick brown fox jumps over the lazy dog.

# 只打印匹配 number 4 的行号和内容
$ sed -n '/number 4/{
> =
> p
> }' data1.txt
```


`l` 打印不可打印字符. 要么打印为 \八进制, 要么打印为 C 风格命名法如 \t

```sh
$ cat data9.txt
This    line    contains        tabs.
$ sed -n 'l' data9.txt
This\tline\tcontains\t\ttabs.$
```


## 写入

格式: `[address]w file`

```sh
# 将 data6.txt 前两行打印到 test.txt 文件中
$ sed '1,2w test.txt' data6.txt
# 将匹配 Browncoat 的行打印到 Browncoats.txt 中
$ sed -n '/Browncoat/w Browncoats.txt' data1.txt
```

## 读取

格式: `[address]r file`. 读取命令允许将一个独立文件中的数据插入到数据流的指定位置后.

```sh
$ cat data.txt
This is an added line.
$ cat data1.txt
This is line number 1.
This is line number 2.
This is line number 3.
This is line number 4.

# 将 data.txt 中行插入到数据流第 3 行后
$ sed '3r data12.txt' data6.txt
This is line number 1.
This is line number 2.
This is line number 3.
This is an added line.
This is line number 4.

# 将 data.txt 中行插入到数据流匹配 /number 2/ 的行后
$ sed '/number 2/r data.txt' data1.txt
This is line number 1.
This is line number 2.
This is and added line.
This is line number 3.
This is line number 4.

# 将 data.txt 中行插入到数据流末尾
$ sed '$r data.txt' data1.txt
This is line number 1.
This is line number 2.
This is line number 3.
This is line number 4.
This is an added line.

# 配合删除命令, 实现占位套用. 将模板 notice.std 中 LIST 替换为名单
$ cat notice.std
Would the following people:
LIST
please report to the ship's captain.
$ cat list.txt
Blum, R         Browncoat
McGuiness, A    Alliance

$ sed '/LIST/{
r list.txt
d
}' notice.std
Would the following people:
Blum, R         Browncoat
McGuiness, A    Alliance
please report to the ship's captain.
```

