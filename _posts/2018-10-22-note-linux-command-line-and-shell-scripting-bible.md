---
title: "笔记 - Linux 命令行与 Shell 脚本编程大全"
layout: post
category: note
tags: [shell, linux]
excerpt: "阅读书籍 «Linux 命令行与 shell 脚本编程大全 (第三版)»; 后整理的笔记,
也算一个简明的 shell 脚本教程及参考. 包含了 shell 基础用法, 变量, 控制语句, 输入
输出以及脚本运行控制等内容. 这里面没有包含 linux 基础以及 sed 和 awk 部分, 它们
因为内容较多, 后续会单独整理."

---

本文是我阅读书籍 [Linux 命令行与 shell 脚本编程大全](https://u.jd.com/otqnldV)
的笔记整理而成. 不应作为入门教程, 更多是为了快速参考用.

(文中的示例代码, 如果有命令提示符 `$`, 则代表是在往终端中输入. 否则即代表脚本内
容.)

# 基础

Shell 脚本的**关键在于**输入多个命令并处理每个命令的结果, 甚至需要将一个命令的结
果传给另一个命令.

有几种编写方式可以编写脚本:

1. 直接在终端使用多个命令, 同一行的多个命令用 `;` 分开. 每行不能超过最大命令行字
   符数 *255*. 这种方式缺点在于脚本不能重用.
2. 创建并运行 shell 脚本文件. 使用这种方法要注意:
  - 文件第一行指定要使用的 shell, 如 `#!/bin/bash`
  - 必须让 shell 能找到脚本. 可以将 shell 脚本文件所处目录添加到 PATH 环境变量中,也
    可以在提示符中用绝对或相对文件路径来引用脚本文件
  - 还需要正确设置脚本权限, 让其可运行: `chmod u+x script.sh`

## 注释

以 `#` 开始的行是注释行.

## 输出消息

用 `echo msg` 显示消息, echo 的 -n 选项如 `echo -n msg` 用于不换行地显示消息.

## 使用变量

用户变量**区分大小写**.

变量赋值: `var=10`, 注意等号两边 **不能有空格**.

数组:

- 定义数组变量: `arr=(one two three)`
- 引用数组元素: `echo ${arr[0]}`
- 显示整个数组: `echo ${arr[*]}`
- 删除数组元素: `unset arr[0]`

引用变量时必须使用 `$` 符号, 如 `echo $var`.

`''` 或 `""` 可以划分一个字符串. `""` 中的变量会被解析, 如 `echo "var is $var"`.
要输出`$`, 需要转义 `\$`.

## 命令替换

**命令替换**就是将命令输出作为值赋给变量. 这是 shell 脚本最有用的特性之一.

有两种方式进行命令替换:

1. 使用反引号 \` (不推荐):

    ```sh
    var=`cmd`
    ```

2. 使用 `$()`:

    ```sh
    var=$(cmd)
    ```

使用 `./` 运行命令时也会创建子 shell, 命令替换时也会创建子 shell, 因此, "..." 和
$(...) 是可以嵌套的, 因为一旦在 $(...) 子 shell 之内, 双引号从头解析. 比如下面这
样是没有问题的:

```sh
date="$(normdate "$@")"
```

## 输入输出重定向

将输出覆盖到文件: `cmd > file`.

将输出追加到文件: `cmd >> file`.

将文件内容输入到命令: `cmd < file`.

使用**内联输入重定向**, 可以无需使用文件, 直接在命令行输入, marker 标识输入的起
始: `cmd << marker`,如:

```
$ wc << EOF
> test string 1
> test string 2
> test string 3
> EOF
    3   9   42
```

使用 `|` (**管道**) 可将前一个命令的输入作为后一个命令的输出, 如 `rpm -qa | sort
| less`.

Linux 会**同时** (而非依次) 执行管道中的命令, 不会用到任何中间文件或缓冲区. 由于
管道操作是实时运行的, 所以只要 `rpm` 命令一输出数据, `sort` 命令就会立即对其进行
排序. 等到 `rpm` 命令输出完成, `sort` 命令就已经将数据排好序并显示了在显示器上.

管道最流行的用法之一是将命令产生的大量输出通过传送给 `more` 或者 `less` 以分屏输
出.

## 数学运算

### 使用 `expr`

如 `expr 1 + 5`.

但在脚本中使用 `expr` 很麻烦, 因为:

* 某些操作符在脚本或命令行上需要转义, 如乘号 * 必须写成 `\*`: `expr 5 \* 2`.
* 要将算式结果赋给变量, 需要使用命令替换: `var=$(expr 10 / 20)`.

### 使用 `$[]`

如 `$[1 + 5]`.

这种方式有两个缺点:

* 缺少 `expr` 中对字符串匹配的运算操作, 如 match, substr 等.
* 而且**只支持整数运算**, 如 `$[100 / 45]` 结果将为 2.

如果需要浮点运算, 可以考虑 zsh, 或者 `bc`.

### 使用 bc

`bc` 计算器实际上是 _一种编程语言_, 它能够识别:

* 数字 (整数和浮点数)
* 变量 (简单变量和数组)
* 注释 (#, `/* */`)
* 表达式
* 编程语句 (if-then 等)
* 函数

浮点运算精度由内建变量 `scale` 控制, 其默认值为 0. 必须将这个值**设置为期望的计
算结果中保留的小数位数**.

```
$ bc -q
3.44 / 5
0
scale=4
3.44 / 5
.6880
quit
```

在脚本中使用 `bc` 时, 如果是较短的运算, 可以使用下面形式:

```sh
var=$(echo "scale=4; 3.44 / 5" | bc)
```

如果需要大量运算, 最好的办法则是使用内联输入重定向 (注意到 `bc` 中的赋值等号两边
可以为空格):

```sh
var=$(bc << EOF
scale = 4
3.44 / 5
EOF
)
```

## 退出脚本

`$?` 保存了上次执行命令的 **退出状态码**, 惯例状态码如下:

    状态码     描述
    ---------------------------------------
    0         成功
    1         未知错误
    2         不适合的 shell 命令
    126       命令不可执行
    127       没找到命令
    128       无效的退出参数
    128+x     与 Linux 信号 x 相关的严重错误
    130       通过 ctrl+c 终止
    255       其他

脚本默认以**最后一个命令的退出状态码退出**. 但可以使用 `exit code` 自己指定退出
状态码, 指定的状态码最大为 255, 大于 255 的会自动模 255.

Bash 中不能正常运行的命令**不会**导致 shell 终止.

默认所有命令的输出都会显示到终端.

# 条件测试

## 基础: test 命令和测试表达式 `[ ]`

在一般编程语言中, 条件分支是否执行以逻辑表达式是否为 true 决定. 但 shell 不同于
一般编程语言,它**根据命令返回的退出状态码**决定是否执行, 退出状态码为 0 则执行.
如果你想以类似其他变成语言中的 if-then 语句的方式工作, 可以使用 test 命令或者使
用测试表达式 `[ ]`.

test 命令格式为: `if test condition`. 如果不写 condition 部分, test 命令会以非零
退出状态码退出. 如果加入 condition, test 命令则会测试该条件.

测试表达式 `[ condition ]` 实际上是 `test` 的别名. 注意 condition 两边的**空格是
必须的**.

使用 test 和 `[ ]` 可以判断三类条件: 数值比较, 字符串比较和文件测试.

1. 数值比较.

可用运算符如下:

    比较         描述
    ---------------------
    n1 -eq n2   相等
    n1 -ge n2   大于或等于
    n1 -gt n2   大于
    n1 -le n2   小于或等于
    n1 -lt n2   小于
    n1 -ne n2   不等于

记住, **bash shell 只能处理整数**, 所以下例会报错:

```sh
var=5.555
if [ $var -gt 5 ]; then
    echo "The test value $var is greater than 5"
fi
```

2. 字符串比较.

可用运算符如下:

    比较              描述
    ---------------------
    str1 = str2       相同
    str1 != str2      不同
    str1 < str2       小于
    str1 > str2       大于
    -n str1           长度非 0
    -z str1           长度是 0

注意, 必须**正确转义 > 和 <**, 否则 shell 会将其解释为重定向. 另外, 大写字母被认
为大于小写字母, 这和 `sort` 相反.

```sh
if [ "baseball" \> "hockey" ]; then
    echo "baseball is greater than hocky"
fi
```

3. 文件比较.

可用运算符如下:

    比较                 描述
    ---------------------------------------------------------
    -d file             是否存在且是目录
    -e file             是否存在
    -f file             是否存在且是文件
    -r file             是否存在且可读
    -s file             是否存在且非空
    -w file             是否存在且可写
    -x file             是否存在且可执行
    -O file             是否存在且属于当前用户所有
    -G file             是否存在且**默认组**(只比较默认组)与当前用户相同
    file1 -nt file2     file1 较 file2 新
    file1 -ot file      file1 较 file2 旧

test 命令和 `[]` 测试表达式用标准的数学比较符号来表示字符串比较, 而用文本代码表
示数值比较, **不要记反了**. 如果对数值使用了数学运算符号, shell 会将它们当成字符
串值进行比较.

使用 `&&`, `||` 还可以进行**复合条件测试**:

```sh
# 注意不要写成 [ ... && ... ]
if [ -d $HOME ] && [ -w $HOME/testing ]; then
    echo "file eixsts and can write to it"
fi
```

## 高级: `(( ))` 和 `[[ ]]`

`(( ))` 用于测试数学表达式. 除了 test 中的标准运算符, `(( ))` 还支持以下运算符:

    ++   --  !   ~   **  <<  >>  &   |   &&  ||

与 test 不同的是, `(( ))` 的相等比较为 ==, = 则为赋值, 且无需转义.

```sh
var1=10
if (( $var1 ** 2 > 90 )); then
    (( var2 = $var1 ** 2 ))
    echo "The square of $var1 is $var2"
fi
```

---

`[[ ]]` 用于字符串比较 (不是所有 shell 都支持). 除了支持 test 的标准字符串比较,
`[[ ]]` 还提供**模式匹配**功能.

```sh
if [[ $UERR == r* ]]; then
    echo "Hello $USER"
fi
```

# 分支选择语句

if-then

```shell
# 不同于其他编程语言, 条件分支是否执行以逻辑表达式是否为 true 决定 -- 在 shell 中, 会根据命
# 令返回的退出状态码, 为 0 则执行.
if cmd; then
    statments
elif cmd; then
    statments
else
    statments
fi
```

case

```sh
case var in
    ## 两个分号!
    pattern1 | pattern2) cmd;;
    pattern3) cmd;;
    *) default;;
esac
```

# 循环语句

for

```sh
# 1. 语法
#
# list 可以为自定义, 如 `a b c`;
# 也可以为命令替换, 如 `$(cat file)`;
# 也可以为通配符, 支持多个, 如 `/home/.b* /home/.c*`.
#
# 记住, for 循环假定每个值都用 IFS 环境变量定义的分隔符分隔, 默认是空格, 制表符和换行符.
# 如果没有指定 in list, 则默认为 "$@".
for var in list; do
    cmd
done

# 2. 错误示例
for test in I don't know if this'll work; do
    echo "word: $test"
done
# 会输出:
# word: I
# word: dont know if thisll
# word: work
#
# 因为列表值中的两个单引号中间部分被 shell 解释为一个单独的数据值. 可以用以下方式解决:
#
# * 转义单引号: I don\'t know if this\'ll work
# * 使用双引号包围: "I don't know if this'll work"

# 3. 从变量读取列表
list="Alabama Alaska Arizona"
# 字符串拼接
list=$list" Arkansas"
for state in $list; do
    echo "state: $state"
done

# 4. 从命令读取值
file="states"
for state in $(cat file); do
    echo "state: $state"
done

# 5. 用通配符读取目录
# 可列出多个目录通配符, 结果将合并进同一个 for 语句中
for file in /home/me/* /home/you/*; do
    # 目录或文件名中可能包含空格, 故需将 $file 用双引号括起来
    if [ -d "$file" ]; then
        echo "$file is directory"
    fi
done

# 6. 更改 IFS
IFS.OLD=$IFS
# 注意 $
# 如需指定多个字符, 只要串起来就行, 如 IFS=$'\n':;"
IFS=$'\n'
IFS=$IFS.OLD
```

for (C 风格)

```sh
# 注意:
# * 变量赋值可以有空格
# * 条件中的变量引用不用 $ 符
# * 迭代算式不用 expr 命令格式
# * 可同时使用多个变量, 如 `(( a=1, b=10; a <= 10; a++, b-- ))`
for (( var assign; condition; iteration )); do
    cmd
done
```

while

```sh
while cmd; do
    cmd
done

var=10
# while 命令允许定义多个测试命令, 只有最后一个测试命令的退出状态码会被用来决定是否结束循环.
#
# 使用多个测试命令要注意:
#
# * 每次迭代中所有测试命令都会被执行, 包括测试命令失败的最后一次迭代. 故这段脚本最后输出 -1.
# * 指定多个测试命令时, 每个测试命令都出现在单独一行上.
while echo $var; [ $var -ge 0 ]; do
    # while 命令的关键在于所指定的测试命令的退出状态码必须随着循环中运行的命令而改变.
    var=$[ $var - 1 ]
done
```

until

```sh
# 同 while, until 也支持多个测试命令, 且最后一条命令决定是否循环.
until cmd; do
    cmd
done
```

break/continue

```sh
# n 默认为 1, 代表要跳出当前循环
break n
continue n
```

---

**可以把循环的输出使用管道或进行重定向**.

```sh
for file in /home/me/*; do
    echo "$file"
done | sort > output.txt
```

# 使用函数

函数在被使用之前必须先定义.

函数名必须唯一, 否则同名函数后者**会覆盖**前者.

函数的默认退出状态码是其最后一条语句的退出状态码, 所以一般不要用函数的默认退出状
态码, 因为你不知道其他命令是否执行成功.

下面例子演示如何定义和调用函数:

```sh
# 形式 1: 使用 function 关键字.
function func1 {
    read -p "Enter a value: " val
    echo $[ $val * 2 ]

    # 可以使用 return 语句, 返回必须是 0~255 的状态码.
    # 可以使用 $? 得到状态码.
    return 1
}

# 函数中的标准输出可以下面方式获取. 注意 read -p 消息不会被混淆进去
result=$(func1)

# 形式 2: 使用 ().
func2() {
    # 可以通过标准参数环境变量获取传入的参数.
    # 但这样一来, 函数便无法直接获取脚本在命令行中的参数值, 必须手动传给它:
    echo $1, $2, $3, $#

    # 可以在函数内访问函数外定义的全局变量, 但最好不要这么做. 使用 local 可以定义局部变量.
    local var
}

# 调用函数并传参. 注意这里手动传入了命令行参数 $1.
func2 a b $1
```

使用数组.

如果你试图将数组变量作为函数参数, 函数**只会取到数组变量的第一个值**. 要解决这个
问题, 必须先打散数组, 传给函数, 然后在函数内部重组函数.

```sh
function double {
    # 所有元素乘以二
    local origin
    local new
    local n
    local i
    origin=($(echo "$@")) # echo "$@" 将数组打散, 外围的 () 则将其重组.
    new=($(echo "$@"))
    n=$[ $# - 1 ] # 遍历.
    for (( i = 0; i <= $n; i++ )) {
        new[$i]=$[ ${origin[$i]} * 2 ]
    }
    # 返回数组也类似, 通过 echo 出每一个元素, 让调用方重组数组.
    echo ${new[*]}
}

arr=(1 2 3 4)
# 打散数组, 传入, 并将结果重组到 result
result=($(double ${arr[*]}))
echo ${result[*]}
```

## 函数库

可以把函数定义到文件中, 通过 `source` 或 `.` 命令引入, 以便重用功能.

如果将库文件的函数添加到 `.bashrc` 中, 则启动 shell 时, 所定义的函数便都可使用了.
更好的是, shell 还会将定义好的函数传给子 shell 进程.

# 处理用户输入

## 命令行参数

**位置参数**使用数字引用传入命令的参数:

* `$0` 脚本名
* `$1`...`$9` 第 1...9 个参数
* `${10}` 10 以上的必须加 `{}`

```sh
# $0 中可能包含路径, 可用 basename 提取出脚本名.
script=$(basename $0)
# 在使用参数前一定要检查其中是否存在数据.
if [ -n "$1" ]; then
    echo "$script welcome $1"
done
```

**特殊参数变量**:

* `$#` 参数个数
* `${!#}` 最后一个参数
* `$*` 所有参数 (视为单项)
* `$@` 所有参数 (视为列表)

```sh
count=1
# 使用 $*, 所有参数合并到一个字符串, 故只会输出一次.
for param in "$*"; do
    echo $param
done

# 使用 $@, 每个参数都会输出.
for param in "$@"; do
    echo $param
done
```

shift n 会将每个参数变量向左移动 n(默认 1) 个位置. 可以使用 shift 遍历参数, 尤其
在不知道参数有多少个的时候.

```sh
while [ -n "$1" ]; do
    echo "$1"
    shift
done
```

## 处理选项

**选项**是跟在单破折线后面的单个字母, 它能改变命令的行为. 选项和参数并无特殊之处,
也可以像处理参数一样处理选项.

* 使用 case 处理选项.

    ```sh
    while [ -n "$1" ]; do
        case "$1" in
            -a) # 处理选项 -a
            -b) param="$2" # 处理带值的选项 -b
                shift ;;
            --) shift # -- 一般用于表明选项列表结束
                break ;;
             *) # 其他
        esac
        shift
    done
    ```

    这种方式不支持多值的选项, 也不支持合并选项.

* 使用 getopt 处理选项.

    getopt 命令接受一系列任意形式的命令行选项和参数, 并自动将它们转换成适当的格
    式. 命令格式如下:

    `getopt opstring parameters`

    其中 opstring 是关键, 它定义了命令行有效的选项字母, 还**使用冒号**定义了哪些
    选项字母需要参数值.

    而在脚本中使用 getopt 的关键, **是使用 set 命令将其格式化后的版本替换已有的
    命令行选项和参数**.

    ```sh
    # set 命令的 -- 选项能将命令行参数替换成 set 命令的命令行值.
    set -- $(getopt -q ab:cd "$@") # getopt 的 -q 选项用于抑制错误消息.

    while [ -n "$1" ]; do
        case "$1" in
            -a) echo "Found the -a option" ;;
            -b) param="$2"
                echo "Found the -b option with value $param"
                shift ;;
            -c) echo "Found the -c option" ;;
            --) shift
                break ;;
             *) echo "$1 is not an option" ;;
        esac
        shift
    done
    ```

    getopt 不擅长处理带空格和引号的参数值, 如对于 `-d "foo bar"`, getopt 会将空
    格作为分隔符, 当做两个参数.

* 使用 getopts (注意多了 `s`).

    与 getopt 不同, 前者将命令行上选项和参数处理后只生成一个输出. 而 getopts 则
    是, 每次调用它时, 它一次只处理命令行上检测到的一个参数, 并且如果选项需要参数
    值, OPTARG 环境变量会保存这个值, OPTIND 环境变量则保存了参数列表中 getopts
    正在处理的参数位置. 处理完所有参数后,它会退出并返回一个大于 0 的退出状态码.
    这让它非常**适合用于解析命令行所有参数的循环中**.

    getopts 命令格式如下: `getopts opstring variable`.

    其中 opstring 同 getopt 的 opstring. 如想去掉错误消息, 可在 opstring 前加一
    个冒号.

    ```sh
    while getopts :ab:c opt; do
        case "$opt" in
            # 注意与 getopt 例中不同, 这里是 a 而非 -a.
            a) echo "found -a option" ;;
            b) echo "found -b option with value $OPTARG" ;; # OPTARG 保存选项值.
            c) echo "found -c option" ;;
            *) echo "unknown option $opt" ;;
        esac
    done

    # 处理剩余参数.
    shift $[ $OPTIND - 1 ] # OPTIND 保存 getopts 正处理的参数位置, 此语句把所有选项都 shift 掉.
    count=1
    for param in "$@"; do
        echo "Parameter $count: $param"
        count=$[ $count + 1 ]
    done
    ```

---

定义选项时, 最好遵循一些标准化的含义. 以下是一些常见选项含义:

    选项                  描述
    -------------------------------------------
    -a                  显示所有
    -c                  生成计数
    -d                  指定目录
    -e                  扩展
    -f                  读入数据的文件
    -h                  显示帮助
    -i                  忽略大小写
    -l                  输出长格式版本
    -n                  使用非交互模式 (批处理)
    -o                  输出重定向到指定的输出文件
    -q, -s              安静模式
    -r                  递归处理
    -v                  详细输出
    -x                  排除
    -y                  对所有问题回答 yes

## 获得用户输入

read 命令可以从标准输入或另一个文件描述符中接受输入, 并将数据放进一个变量.

```sh
# 配合 echo.
echo -n "Enter name: "
read name

# 使用 -p 指定提示符及变量.
read -p "Enter age, year: " age year

# 如果没有指定变量, 则自动保存在 REPLY 中.
read -p "Enter anything: "
echo $name, $age, $year, $REPLY

# -t 可以指定超时秒数, 超时则返回非零退出状态码.
if read -t 3 -p "Counting down..." input; then
    echo "Get input $input"
else
    echo "Too slow...: $input"
fi

# -n 指定读入多少个字符.
read -n1 -p "Do you want to continue [y/n]? " answer

# -s 可隐藏输入, 这在提示用户输入敏感信息时很有用.
read -s -p "Eneter your password: " pass

# 从文件读取作为输入.
cat file | while read line; do
    echo "Line: $line"
done
```

# 呈现数据

## 文件描述符

Linux 用**文件描述符(FD)**标识每个文件对象. FD 是一个非负整数, 每个进程最多有
**9**个FD, 有三个预定义的 FD:

* 0, STDIN: 标准输入, 对于终端界面来说, 就是键盘
* 1, STDOUT: 标准输出, 对于终端界面来说, 就是显示器
* 2, STDERR: 标准错误, shell 对于错误消息的处理是跟普通输出分开的, 默认情况下错
  误消息也输出到显示器

## 在命令行中重定向

使用输入重定向符号 < 时, Linux 会用重定向指定的文件替换标准输入文件描述符, 它会
读取文件并提取数据,就如同它是键盘上输入的. 你可以**使用这种技术将数据输入到任何
能从 STDIN 接受数据的 shell 命令中**:

```sh
# cat 默认从 STDIN 接受输入. 输入一行, cat 就显示一行.
$ cat
this is a test
this is a test

# 通过 STDIN 重定向符号强制 cat 接受来自非 STDIN 文件的输入.
$ cat < testfile
This is the line from testfile
```

常见的重定向技巧:

* 只重定向错误: `2> err`.
* 重定向错误和数据, 必须用两个重定向符号: `2> err 1> out`.
* 如果将错误和数据重定向到同一个文件, 可以使用特殊的重定向符号 `&> errout`. 注意,
  shell 自动赋予了错误消息更高的优先级, 所以**错误会优先于数据集中输出在前面**.

## 在脚本中重定向

重定向输出到文件描述符时, 必须在文件描述符数字前加一个 &.

* 临时重定向.

    ```sh
    # 临时输出消息到标准错误
    echo "error message" >&2
    ```

* 永久重定向.

    ```sh
    # 将所有数据输出到 outfile.
    exec 1> outfile

    # 将所有错误输出到 errfile.
    exec 2> errfile

    # 从 infile 中读取输入.
    exec 0< infile
    ```

* 创建自己的重定向: 其他 6 个(3 ~ 8) FD 均可用作重定向, 可将其分配给文件, 在脚本
  中使用.

    ```sh
    # 创建 FD3.
    exec 3> fd3file; echo "to fd3" >&3

    # 追加写, 而非覆盖.
    exec 3>> fd3file

    # 可以用一个 FD 对同一个文件读写. 要小心使用.
    exec 3<>fd3file

    # 关闭 FD3. 关闭之后就不能再往其中写入数据, 否则会报 "Bad file descriptor" 错误.
    exec 3>&-
    ```

---

临时重定向输出, 然后恢复默认输出.

```sh
# FD3 重定向到 FD1 的当前位置, 即 STDOUT. 如果此时将输出发送给 FD3, 仍会显示在显示器上.
exec 3>&1
# STDOUT 重定向到 outfile
exec 1> outfile

echo "to outfile"
echo "to monitor" >&3

# 恢复 STDOUT 到显示器: STDOUT 重定向到 FD3 当前位置, 即显示器.
exec 1>&3

echo "back to normal"
```

临时重定向输入, 然后恢复默认输入.

```sh
exec 6<&0 # STDIN 保存在 FD6
exec 0< infile # infile 到 STDIN
exec 0<&6 # 恢复
```

忽略错误输出: `2> /dev/null`.

快速清空文件内容: `cat /dev/null > file`.

---

使用 lsof 命令可查看打开的 FD.

## 临时文件

Linux 使用 /tmp 目录来存放临时文件. 大多数发行版配置了系统在启动时自动删除 /tmp
目录的所有文件.

使用 mktemp 命令会在本地目录创建一个临时文件, 只要指定一个文件名模板就行. 如运行
`mktemp tmp.XXXXXX`,系统会自动创建模板为 `tmp.XXXXXX` 且文件名唯一的文件 (如
`tmp.UfIi13`).

* -t 选项指定在临时目录 (一般为 `/tmp`) 中创建: `mktemp -t tmp.XXXXXX`.
* -d 选项则用来创建临时目录.

```sh
tempdir=$(mktemp -d dir.XXXXXX)
cd $tempdir
tempfile1=$(mktemp temp.XXXXXX)
tempfile2=$(mktemp temp.XXXXXX)
```

## 记录消息

为了将输出同时发送到显示器和日志文件, 可以使用 tee 命令. `tee file` 将从 STDIN
过来的数据同时发往 STDOUT 和指定的 file. 选项 -a 则会让 tee 追加到文件, 而非覆盖.

```sh
tempfile=teefile
echo "This line goes to stdout and teefile" | tee $tempfile
```

## 实例

```sh
# 从第一个参数中指定的文件中读取 csv 格式数据, 生成相应的 sql 语句, 保存到 member.sql 中.
# (注意这个脚本中对重定向的运用.)
outfile='members.sql'
IFS=','
while read lname fname address city state zip; do
    cat >> $outfile << EOF
    insert into members (lname, fname, address, city, state, zip) values
    ('$lname', '$fname', '$address', '$city', '$state', '$zip');
EOF
done < ${1}
```

# 控制脚本

## 信号

Linux 利用**信号**与进程通信, 以下是常见的系统信号:

    信号      值           描述                          触发
    ---------------------------------------------------------------------------
    1       SIGHUP      挂起进程
    2       SIGINT      终止进程                        ctrl+C
    3       SIGQUIT     停止进程
    9       SIGKILL     无条件终止进程
    15      SIGTERM     尽可能终止进程
    17      SIGSTOP     无条件停止进程, 但不是终止进程
    18      SIGTSTP     停止或暂停进程, 但不终止进程     ctrl+Z
    19      SIGCONT     继续运行停止的进程

使用 `trap cmd signal` 可以**捕获**并处理信号.

```sh
# 捕获 SIGINT 信号. 这会阻止用户用 ctrl+C 停止程序.
trap "echo 'trapped ctrl-c'" SIGINT

# 修改信号捕获, 5 秒之后的 ctrl+C 将被这句捕获.
sleep 5
trap "echo 'I modified the trap!'" SIGINT

# 捕获 EXIT 信号, 可以在脚本完成任务时执行特定命令.
trap "echo 'done'" EXIT

# 删除已设置好的捕获, 只需要与希望恢复默认行为的信号列表之间加上两个破折号.
trap -- SIGINT
```

## 后台模式

在命令后加一个 & 即可以**后台模式**运行脚本. 如 `./myscript.sh &`. 注意:

* 当后台进程运行时, 仍然会使用终端显示器显示 STDOUT 和 STDERR 消息.
* 所以最好是将后台运行的脚本的 STDOUT 和 STDERR 进行重定向, 避免杂乱.
* 如果终端退出的话, 后台进程也会随之退出.

为了避免后台进程退出, 可以使用 `nohup` 命令: `nohup ./myscript.sh &`. 注意:

* nohup 会自动将 STDOUT 和 STDERR 消息重定向到 nohup.out 文件中.
* 在同一个目录中使用 nohup 运行多个命令, 所有输出都会叠加到 nohup.out 中.

## 作业控制

使用 jobs 命令, 可以查看正在处理的作业. jobs 命令参数如下:

    参数     描述
    ---------------------------------------------------------
    -l      列出 PID 及作业号
    -n      只列出上次 shell 发出的通知后改变了状态的作业
    -p      只列出作业的 PID
    -r      只列出运行中的作业
    -s      只列出已停止的作业

```sh
# jobs 输出中, 带加号的作业会被作为默认作业, 当前默认作业完成处理之后, 带减号的作业成为下一个默认作业.
$ jobs -l [1]+ 1897 Stopped ./test10.sh [2]- 191 Runnig ./test11.sh

# 使用 kill 向默认进程发送 SIGHUP 信号, 终止该作业.
$ kill 191

# 使用 bg 可以以后台模式重启一个作业, 可用 bg 命令加上作业号.
$ bg 2

# 要以前台模式重启作业, 可用带有作业号的 fg 命令.
$ fg 2
```

## 调整谦让度

Linux 中进程的**调度优先级**是一个整数值, 从 -20 (最高优先级) 到 +19 (最低优先级).
默认是 0.

```sh
# 使用 nice 可以以指定的优先级运行命令, 但 nice 命令会阻止普通用户提高命令优先级.
$ nice -n 10 ./test.sh > test.out &

# 想改变已运行命令的优先级, 可以使用 renice.
$ renice -n 10 -p 5055
```

## 定时运行

使用 at 可以定时运行作业: `at [-f filename] time`. at 可以识别多种时间格式, 如:

    10:15
    10:15 pm
    now, noon, midnight, teatime (4 pm)
    mmddyy, mm/dd/yy, dd.mm.yy
    Jul 4, Dec 25
    +25min, tomorrow 10:15pm, 10:15+7days

它的守护进程 atd 会以后台模式运行, 默认每 60 秒检查作业队列来运行作业.

针对不同的优先级, 存在 26 中不同的作业队列, 通常用 a~z 和 A~Z 来指代. 字母排序越
高, 作业优先级越低.

默认作业会被提交到 a 作业队列, 如果想以更高优先级运行作业, 可以用 -q 参数指定不
同的队列字母.

使用 at 命令时, 最好在脚本中对 STDOUT 和 STDERR 重定向.

如果不想使用邮件接收输出或重定向输出, 则最好加上 -M 选项屏蔽作业产生的输出消息.

```sh
# 使用 at 在指定时间运行命令.
$ at -M -f test.sh teatime
$ at -M -f test.sh 13:30

# 使用 atq 列出等待中的作业: 作业号, 日期和时间, 作业队列.
$ atq
20  2015-07-14 13:30 = Christine
19  2015-07-14 16:00 a Christine

# 使用 atrm 删除作业.
$ atrm 19
```

---

如果需要*重复定期*执行作业, 可以使用 `crontab`. crontab 时间格式如下:

    min hour dayofmonth month dayofweek command

```sh
# 每天 10:15.
15 10 * * * command

# 每月最后一天.
00 12 * * * if [`date +%d -d tomorrow` = 01 ]; then ; command
```

`crontab -l` 可列出已有的时间表.

`crontab -e` 可编辑时间表.

---

还可以使用 anacron, 让错过了执行时间的 (如因为关机) 作业尽快运行.

# 实例代码

这里贴一些实例代码, 以及我认为从中可以学到的技巧, 最佳实践或惯例用法.

## 根据日期和配置文件归档备份

* 用户变量用的**大写**.
* 告知详细信息, 出错, 进程, 文件行号等等...
* 用 echo 输出空行分割信息.
* 通过 `$list="$list $new_item"` 加入列表.

```sh
DATE=$(date +%y%m%d)
FILE=archive$DATE.tar.gz
# 配置文件每行为要归档的文件路径.
CONFIG_FILE=/archive/Files_To_Backup
DESTINATION=/archive/$FILE

if [ -f $CONFIG_FILE ]; then
    echo
else
    echo
    echo "$CONFIG_FILE does not exists."
    echo "Backup not completed due to missing Configuration File"
    exit
fi

FILE_NO=1
exec < $CONFIG_FILE
read FILE_NAME
while [ $? -eq 0 ]; do
    if [ -f $FILE_NAME -o -d $FILE_NAME ]; then
        FILE_LIST="$FILE_LIST $FILE_NAME"
    else
        echo
        echo "$FILE_NAME, does not exist."
        echo "It is listed on line $FILE_NO"
        echo "Continuing..."
        echo
    fi
    FILE_NO=$[$FILE_NO + 1]
    read FILE_NAME
done

echo "Starting archive..."
echo
# c create, z zip, f file
tar -czf $DESTINATION $FILE_LIST 2> /dev/null
echo "Archive completed"
echo "Resulting archive file is: $DESTINATION"
echo

exit
```

## 删除用户

* 通过在函数体外定义变量, 函数体内使用并 unset 变量使用函数.
* 通过函数让脚本语义更明确, 更清爽.
* 英语语法也很重要.
* 注释风格: 块儿, End of.
* 对不同输入的兼容, 如 Yes|yES.
* 重要操作多次询问, 多次确认.

```sh
#!/bin/bash
# Delete_User - Automates the 4 steps to remove an account
#
###################################
# Define Functions
###################################
function get_answer { unset ANSWER ASK_COUNT=0

    while [ -z "$ANSWER" ]; do
        ASK_COUNT=$[ $ASK_COUNT + 1 ]
        case $ASK_COUNT in
            2)
                echo
                echo "Please answer the question."
                echo
                ;;
            3)
                echo
                echo "One last try...please answer the question."
                echo
                ;;
            4)
                echo
                echo "Since you refuse to answer the question..."
                echo "exiting program."
                echo
                exit
                ;;
        esac

        echo

        if [ -n "$LINE2" ]; then
            echo $LINE1
            echo -e $LINE2" \c"
        else
            echo -e $LINE1" \c"
        fi
    done

    unset LINE1
    unset LINE2
} # End of get_answer function

function process_answer { case $ANSWER in y|Y|YES|Yes|yEs|yeS|YEs|yES) ;; *)
    echo echo $EXIT_LINE1 echo $EXIT_LINE2 echo exit ;; esac

    unset EXIT_LINE1
    unset EXIT_LINE2
} # Enf of process_answer function

################ Main  Script ######################
echo "Step #1 - Determine User Account name to Delete" echo LINE1="Please enter
the username of the user " LINE2="account you wish to delete from system:"
get_answer USER_ACCOUNT=$ANSWER

LINE1="Is $USER_ACCOUNT the user account " LINE2="you wish to delete from the
system? [y/n]" get_answer

EXIT_LINE1="Because the account, $USER_ACCOUNT, is not " EXIT_LINE2="the one you
wish to delete, we are leaving the script..." process_answer

USER_ACCOUNT_RECORD=$(cat /etc/passwd | grep -w $USER_ACCOUNT) if [ $? -q 1 ];
then echo echo "Account, $USER_ACCOUNT, not found. " echo "Leaving the
script..." echo exit fi

echo echo "I foun this record:" echo $USER_ACCOUNT_RECORD LINE1="Is this the
correct User Account? [y/n]" get_answer

EXIT_LINE1="Because the account, $USER_ACCOUNT, is not "
EXIT_LINE2="the one you wish to delete, we are leaving the script..."
process_answer

echo
echo "Step #2 - Find process on system belonging to user account"
echo

ps -u $USER_ACCOUNT >/dev/null
case $? in
1)
    echo "There are no processes for this account currently running."
    echo
    ;;
0)
    echo "$USER_ACCOUNT has the following processes running: "
    echo
    ps -u $USER_ACCOUNT

    LINE1="Would you like me to kill the process(es)? [y/n]"
    get_answer
    case $ANSWER in
    y|Y|YES|yes|Yes|yEs|yeS|YEs|yES)
        echo
        echo "Killing off process(es)..."
        COMMAND_1="ps -u $USER_ACCOUNT --no-heading"
        COMMAND_3="xargs -d \\n /user/bin/sudo /bin/kill -9"
        $COMMAND_1 | gawk '{print $1}' | $COMMAND_3
        echo
        echo "Process(es) killed."
        ;;
    *)
        echo
        echo "Will not kill the process(es)"
        echo
        ;;
    esac
esac

echo
echo "Step #3 - Find files on system belonging to user account"
echo
echo "Creating a report of all files owned by $USER_ACCOUNT."
echo
echo "It is recommended that you backup/archive these files,"
echo "and then do one of two things:"
echo "  1) Delete the files"
echo "  2) Change the files' ownership to a current user account."
echo
echo "Please wait. This may take a while..."

REPORT_DATE=$(date +%y%m%d)
REPORT_FILE=$USER_ACCOUNT"_Files_"$REPORT_DATE".rpt"
find / -user $USER_ACCOUNT > $REPORT_FILE 2>/dev/null
echo
echo "Report is complete."
echo "Name of report:   $REPORT_FILE"
echo "Location of report: $(pwd)"
echo

echo
echo "Step #4 - Remove user account"
echo

LINE1="Remove $USER_ACCOUNT's account from system? [y/n]"
get_answer
EXIT_LINE1="Since you do not wish to remove the user account,"
EXIT_LINE2="$USER_ACCOUNT at this time, exiting the script..."
process_answer

userdel $USER_ACCOUNT
echo
echo "User account, $USER_ACCOUNT, has been removed"
echo

exit
```

## 报告十名大容量目录, 生成报告文件

* `exec <` 读取配置文件.
* `exec >` 生成运行报告.
* 管道连接风格: `|` 放到最后, 然后另起一行.

```sh
CHECK_DIRECTORIES=" /var/log /home"
DATE=$(date '+%m%d%y')

exec > disk_space_$DATE.rpt

echo "Top Ten Disk Space Usage"
echo "for $CHECK_DIRECTORIES Directories"

for DIR_CHECK in $CHECK_DIRECTORIES; do
    echo ""
    echo "The $DIR_CHECK Directory:"
    du -S $DIR_CHECK 2>/dev/null |
    sort -rn |
    sed '{11,$D; =}' |
    sed 'N; s/\n/ /' |
    gawk '{print $1 ":" "\t" $2 "\t" $3 "\n"}'
done

exit
```

## 从网站抓取天气信息

* 使用 `$(which cmd)` 查询程序是否可用.
* 使用 `tmpfile`.

```sh
URL="http://weather.yahoo.com/united-states/illinois/chicago-2379574/"
LYNX=$(which lynx)
TMPFILE=$(mktemp tmpXXXXXX)
$LYNX -dump $URL > $TMPFILE
conditions=$(cat $TMPFILE | sed -n '/IL, United States/{ n; p }')
temp=$(cat $TMPFILE | sed -n -f '/Feels Like/{p}' | awk '{print $4}')
rm -f $TMPFILE
echo "Current conditions: $conditions"
echo The current temp outside is: $temp
```

## 编造借口

```sh
# textbelt not availabel anymore
phone="15369997084"
SMSrelay_url=http://textbelt.com/text
text_message="System Code Red"

curl -s $SMSrelay_url -d \
number=$phone \
-d "message=$text_message" > /dev/null

exit
```
