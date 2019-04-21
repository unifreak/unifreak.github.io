---
title: "Go 语言学习笔记 (01)"
layout: post
category: note
tags: [go]
excerpt: "本文包含了 Go 语言的简介, 环境搭建, 以及基本语法中的变量, 函数, 包等相关内容"
---

# 简介

## 参考
- 官方文档: <https://golang.org/doc/>
- go 命令参考: <https://golang.org/cmd/>
- 教程: <https://tour.golang.org/list>
- 在线运行环境: <https://play.golang.org/>

## Go 语言特点
- 并发
- 新颖的类型系统
- 垃圾回收
- 运行时反射机制
- 快速, 静态类型, 编译

## 环境搭建
1. 下载: <https://golang.org/dl/>
2. 安装
3. sublime text 构建配置

```json
{
    "cmd": ["go run '${file}'"],
    "selector": "source.go",
    "path": "/usr/local/go/bin",
    "shell": true
}
```

## 有趣链接
- go playground 内部: <http://blog.golang.org/playground>
- 为什么类型名在变量名之后: <https://blog.golang.org/gos-declaration-syntax>
- defer: <https://blog.golang.org/defer-panic-and-recover>

# 语法

## 包

定义一个包

```go
package main // 程序从 `main` 包中开始运行
```

导入包

1. 分别导入

```go
import "fmt"
import "math"
```


2. `打包` 导入 (更好)

```go
import (
    "fmt"
    "math"
)
```


`被导出的名称` 是指以大写字母开头的名称. 一个包被导入后, 只能使用其 `被导出的名称`

## 函数

参数类型在变量名之后

```go
func add(x int, y int) int {
    return x + y
}
```

若多个相连参数类型相同, 可只留最后一个类型名

```go
func add(x, y int) int {
    return x + y
}
```

可返回任意多个结果

```go
func swap(x, y string) (string, string) {
    return y, x
}
// call
a, b := swap("hello", "world")
```

"直接(naked) 返回": 不带参数的 return 语句

直接返回返回被命名的返回值. **应当只用在短函数中**

```go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return
}
```

可以向变量一样被传递

可以是闭包: 引用函数体之外变量的函数

## 变量

类型

- `bool`
- `string`
- `int`  `int8`  `int16`  `int32`  `int64`
- `uint` `uint8` `uint16` `uint32` `uint64` `uintptr`
- `byte` (alias for `uint8`)
- `rune` (alias for `int32`, represents a Unicode code point)
- `float32` `float64`
- `complex64` `complex128`

声明

```go
package main

import "fmt"

var c, python, java bool // 包级别变量

func main() {
    var i int // 函数级别变量
    var j, k int = 1, 2 // 初始化
    f = float64(j) // 类型转换必须显式使用 `Type(var)`
    m := 3 // "简洁赋值" `:=` 只能在函数内使用
    var ( // 打包声明
        // 没有初始化的变量被赋 "零值":
        n bool // 布尔: false
        o float32 // 数字: 0
        p string // 字符串: ""
    )

    fmt.Println(i, j, k, m, n, o, p, c, python, java)
}
```

## 常量

- 使用 `const` 声明
- 不能使用 `:=`

## For 循环 (仅有的循环体)

```go
for i := 0; i < 10; i++ { } // 没有小括号, 必须有花括号

// 前置和后置语句可为空
for ; i < 10; { }

// 再去掉分号, 实际上就是 go 中的 while 语句了
for i < 10 { }

// 无限循环...
for { }
```

## If else

```go
if x < 0 { } // 同 `for`, 没有小括号, 花括号必须

if v := math.Pow(x, n); v < lim { // 可在条件之前执行一个短语句

} else { // v 在 `else` 中仍可见
    fmt.Printf("%g >= %g\n", v, lim)
}
```

## Switch


```go
// 除非 `fallthrough`, 每个 case 会自动 break
switch os := runtime.GOOS; os {
case "darwin":
    fmt.Println("OS X.")
case "linux":
    fmt.Println("Linux.")
default:
    fmt.Printf("%s.\n", os)
}

// 使用不带条件的 switch 可以更简洁的串联 if-then-else
t := time.Now()
switch {
case t.Hour() < 12:
    fmt.Println("Good morning!")
case t.Hour() < 17:
    fmt.Println("Good afternoon.")
default:
    fmt.Println("Good evening.")
}
```

## Defer

- `defer` 会延迟函数执行, 知道上层函数返回
- 但是参数会立即被解析
- 多个 `defer` 的调用顺序为后进先出 (栈)

```go
fmt.Println("counting")

for i := 0; i < 10; i++ {
    defer fmt.Println(i)
}

fmt.Println("done")
```

## 指针

- 像 C:
    + 使用 `*` 声明: `var p *int`
    + 使用 `&` 取地址: `p = &i`
    + 使用 `*` 间接引用: `*p = 21`
- 不像 C: 没有指针运算

## 结构体: 字段集合

```go
// 声明
type Vertex struct {
    X int
    Y int
}

// 初始化: 使用 {}
var (
    v = Vertex{1, 2}  // 1. 列出字段值
    w = Vertex{X: 1}  // 2. 使用 `Name:` 语法, 顺序无关
)

// 引用: 使用点号
p := &v
v.X = 4
p.Y = 5 // 即使指针也能直接用点号, 同 `(*p).Y`
fmt.Println(v.X)
```

## 数组

- 定长, 不能改变长度

```go
// 声明
var a [2]string // [n]T
primes := [6]int{2, 3, 5, 7, 11, 13} // {}

// 引用: []
a[0] = "Hello"
```

## Slice

- 零值: `nil`
- 不存储任何数据, 可视为对数组的引用
- 对 slice 的更改会影响其底层数组, 以及其他该底层数组的 slice
- 长度: 包含的元素数量
- 容量: 底层数组包含的元素数量

```go
// 声明

// 1. 从数组: []T = [low:high], 包含 low, 不包含 high
primes := [6]int{2, 3, 5, 7, 11, 13}
var a []int = primes[1:4]

// 2. 从其他 slice: low 默认为 0, high 默认为长度
c =  a[:2]

// 3. 使用字面量: []T, 会新建一个数组并从其构建 slice
d := []int{2, 3, 5, 7, 11, 13}
e := []struct {
    i int
    b bool
}{
    {2, true},
    {3, false},
}
f := [][]string{ // 可嵌套其他 slice
    []string{"_", "_", "_"},
    []string{"_", "_", "_"},
    []string{"_", "_", "_"},
}

// 4. 使用 `make`
g := make([]int, 3, 5) // 创建一个长度为 3 (0 值) 且容量为 5 的 []int 型 slice


// 长度 & 容量
len(a)
cap(a)

// 添加元素: 如果低层数组太小, 会自动创建并指向新数组
a = append(a, 1)

// 迭代
for i, v := range a {} // `range` 在每次迭代中返回一个索引和一个值
for _, v := range a {} // 使用 _ 忽略索引
for i, _ := range a {} // 使用 _ 忽略值, 等同于
for i := range a {}    // 此
```

## Maps

- 零值: `nil`

```go
type Vertex struct {
    Lat, Long float64
}

// 声明
var m map[string]Vertex
// 1. 使用 `make`
m = make(map[string]Vertex)

// 2. 使用字面量
var n = map[string]Vertex{
    "Bell Labs": Vertex{40.68433, -74.39967, },
    "Google": Vertex{37.42202, -122.08408, }, // type name `Vertex` can be omitted
}

// CURD
m["Bell Labs"] = Vertex{40.68433, -74.39967,} // 修改
v, ok := m["Bell Labs"] // 引用: v 是值, ok 是否元素在 map 中
delete(m, "BEll Labs") // 删除
```
