---
title: "GCC 基本使用教程 - part 1"
layout: post
category: tutorial
tags: [gcc]
excerpt: "这是我阅读 «An Introduction to GCC» 的笔记. 这篇文章介绍如何使用 gcc 编译 c 文件, 以及编译相关的概念和选项等. 下一篇将介绍如何使用预处理器, 如何为了调试或性能优化进行编译已经常用的相关工具等."
---

GCC (GNU Compiler Collection) 除了编译 C/C++, GCC 本身还有着这些特性:

- 可移植: 它能运行在绝大多数平台上, 支持不仅包括个人电脑的处理器, 还支持单片机, 数字信号处理器等
- 既支持本地编译, 又支持 _交叉编译_ (为不同与本地系统的的其他目标系统编译)
- 支持多种语言, 除了最常见的 C/C++, 也支持 Object C, ADA, Fortran, Go 等等

# 编译器基本工作原理

gcc 把源文件转换为可执行文件, 基本要经历四个阶段, 每个阶段都会用到特定的工具.

1. 预处理器进行预处理 (cpp): 对源文件中的宏定义进行扩展, 把源文件中引用的头文件中的代码包含进去

    这个阶段中, 使用的预处理器是 cpp. 由于 cpp 默认不保存结果, 所以我们必须使用重定向,
    或者传入 `-save-temps` 选项以保存结果, 比如:

        $ cpp hello.c > hello.i

    经过 cpp 预处理后的 C 源码, 一般以后缀 `.i` 命名. 而 C++ 则一般以 `.ii` 为后缀.

2. 编译 (gcc -S): 把源码转换为汇编代码

    使用 `-S` 选项, 可以让 gcc 只产生汇编代码 (文件名后缀 `.s`) 而不产生目标文件 (文件名后缀 `.o`).

        $ gcc -S hello.i

    运行上面结果, 会生成 `hello.s` 文件, 其中包含了转换后的汇编代码.

3. 汇编 (as -o): 把汇编代码转换为机器指令

    这个阶段使用的汇编器是 as. 比如运行

        $ as hello.s -o hello.o

    将会产生目标文件 `hello.o`. 目标文件以 `.o` 为后缀.

    注意: 这个阶段产生的目标文件中, 对于外部函数和变量的调用地址是没有定义的.
    下一步的链接器负责填充这些丢失的地址.

4. 链接 (ld / gcc): 生成最终的可执行文件

    这个阶段使用的链接器是 ld, 调用 gcc 时它会在幕后调用 ld, 比如:

        $ gcc hello.o

    最终会产生默认命名为 `a.out` 的可执行文件.

# 编译 C 语言

## 单个文件的编译

    gcc -Wall main.c -o hello

- `-Wall` 选项见[编译警告][warning])
- `-o hello` 指定产生的可执行文件名称. 默认为 a.out

## 多个文件的编译

这里我们假设 main.c 用到了 (依赖于) hello_fn.c.

### 一块儿编译

被依赖的源文件置于后面:

    gcc -Wall main.c hello_fn.c -o newhello

### 单独编译:

1. 首先使用 `-c` 选项单独编译每个文件. `-c` 选项告诉 gcc 只生成目标文件, 而不生成可执行文件:

        $ gcc -Wall -c main.c
        $ gcc -Wall -c hello_fn.c

    执行后会产生两个目标文件: main.o 和 hello_fn.o

2. 然后链接刚刚产生的多个目标文件:

        $ gcc main.o hello.o -o hello

    gcc 会使用 ld 链接器进行链接, 生成 `-o` 指定的可执行文件 hello.

    注意这里 _不用_ 再重复指定 `-Wall` 选项, 而且被依赖的文件在后面.

## 链接外部函数库

如果你不了解静态库和共享库的概念, 可以读一下我的另一篇文章 (@todo). 这篇文章里我们把焦点放到 gcc 的使用上.

我们假设 calc.c 需要链接用于数学计算的 math 静态库 (静态库文件以 `.a` 为后缀), 一般 math 这样的系统库相关的文件会放到这些目录中:
- 库文件位于 /usr/lib/ 或/lib/ 目录下. 比如 /usr/lib/libm.a
- 库文件对应的头文件位于 /usr/include/ 目录下. 比如 /usr/include/math.h

> C 标准库一般位于 /usr/lib/libc.a

为了将程序链接到 libm.a, 我们可以指定静态库的完整路径:

    $ gcc -Wall calc.c /usr/lib/libm.a -o calc

也可以通过 `-l` 选项指定:

    $ gcc -Wall calc.c -lm -o calc

这里的 `-lm` 指示 gcc 寻找并链接 `libm.a`. 注意 gcc 自动补上了 `lib`, 而且这里指定的顺序也很重要:
被依赖的库位于右边.

# 编译选项

## 库搜索路径

上文提到, gcc 需要找到指定的库文件然后链接, 那么它怎么知道库文件在哪儿呢?

gcc 会默认按照如下顺序搜索被指定的库文件, 我们把这些目录叫做**库路径**:
1. /usr/local/lib/
2. /usr/lib/

gcc 也需要知道库对应的头文件的位置. 头文件的默认搜索顺序如下, 我们把这些目录叫做**包含路径**:
1. /usr/local/include/
2. /usr/include/

这里假设我们的程序 dbmain.c 依赖于 gdbm 库. 并且它被我们安装到了非标准路径 /opt/gdbm-1.8.3/ 下面,
目录结构如下:

    $ tree /opt/gdbm-1.8.3/
    /opt/gdbm-1.8.3/
    |-- lib/                    # 库目录
    |   |-- libgdbm.a           # 静态库
    |   |-- libgdbm.so          # 动态库
    |-- include/                # 包含目录
    |   |-- gdbm.h              # 头文件

如何让 gcc 找到它呢? 有两种方法:

我们可以使用 `-I` 选项指定额外的包含路径, 使用 `-L` 指定额外的库路径:

    gcc -Wall -I/opt/gdbm-1.8.3/include dbmain.c -L/opt/gdbm-1.8.3/lib -lgdbm

或者通过设置环境变量来告知 gcc 额外的搜索路径. 使用 `LIBRARY_PATH` 指定额外要搜索的库路径. 使用 `C_INCLUDE_PATH`
或 `CPLUS_INCLUDE_PATH` 分别定义 c 或 c++ 额外的包含路径:

    $ C_INCLUDE_PATH=/opt/gdbm-1.8.3/include
    $ export C_INCLUDE_PATH
    $ LIBRARY_PATH=/opt/gdbm-1.8.3/lib
    $ export LIBRARY_PATH
    $ gcc -Wall dbmain.c -lgdbm

> 设置环境变量时, 可以使用 `:` 分隔符, 同时指定多个路径.

使用选项和环境变量这两种方式也可以混用. 在这种情况下, gcc 按照以下顺序搜索:
1. 先根据选项中从左到右的顺序搜索
2. 然后是环境变量中指定的路径
3. 最后是我们一开始讲的默认路径

> 在日常使用中, 我们一般通过使用选项的方式来指定.

## 共享库的加载路径

按照上文所讲链接库文件之后, 虽然能编译通过了, 但是尝试 _运行_ 可执行文件时, 依然会报 "找不到文件" 错误:

    $ ./a.out
    ./a.out: error while loading shared libraries:
    libgdbm.so.3: cannot open shared object file:
    No such file or directory

这是因为, 对于使用 `-l` 选项链接的外部库, gcc 实际上会**先尝试搜索并链接可用的共享库**.
而对于链接了共享库的程序, 当它运行时, 动态链接器 ld 必须找到这个共享库, 把它加载到内存中.

所以这里又涉及一个动态链接器 ld 需要搜索的**加载路径**, 默认会搜索以下加载路径 (同库路径):
- /usr/local/lib
- /usr/lib

而这两个目录中都没有要找的 `libgdbm.so`, 所以报错了.

为了解决这个问题, 我们可以在编译时使用 `-static` 选项强制 gcc 链接静态库. 这样就不会需要运行时的动态链接了:

    gcc -Wall -static -I/opt/gdbm-1.8.3/include/ -L/opt/gdbm-1.8.3/lib/ dbmain.c -lgdbm

也可以通过 `LD_LIBRARY_PATH` 变量指定额外的加载路径让 ld 找到对应的共享库文件.

还可以在 ld 的配置文件中定义额外的加载路径.

## 指定 C 标准

gcc 默认使用 GNU C 标准来编译, GNU C 在 ANSI/ISO 标准上增加了诸如嵌套函数和可变长数组等特性.

但是我们也可以通过以下选项更改编译时的标准:
- `-ansi`: 禁用 GNU 扩展 (asm, inline, typeof, unix, vax...)
- `-ansi -pedantic`: 禁用所有 GNU 扩展, 即使那些兼容 ANSI 标准的特性
- `-std=c89`: 指定为 c89, iso9899:199409, c99, gnu89, gnu99 等

## 编译警告
<div id="warning"></div>

`-Wall` 包含了以下警告:

- `-Wcomment`: 嵌套函数
- `-Wformat`: 不正确的使用格式字符串 (比如在 `printf()` 中)
- `-Wunused`: 没有用到的变量
- `-Wimplicit`: 未声明的函数
- `-Wreturn-type`: 没有定义返回值类型也没有指定返回类型为 void 的函数

以下没有包含在 `-Wall` 中:

- `-W`: 常见编程错误, 如函数没有返回值, 有符号和无符号比较等. 一般和 `-Wall` 一块儿使用
- `-Wconversion`: 隐式类型转换
- `-Wshadow`: 在一个作用域中重复声明变量
- `-Wcast-qual`: 指针被强转后丢掉了类型限定符
- `-Wwrite-strings`: 尝试覆写字符串常量
- `-Wtraditional`: ANSI 标准和传统 C 标准 (K&R) 解释不同

注意: 所有这些警告都不会终止编译, 使用 `-Werror` 可以转换为错误, 终止编译.

---

下一篇介绍如何使用预处理器, 如何为调试或性能进行编译, 以及相关的工具简介等.


[warning]: #warning
