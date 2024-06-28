---
title: "PHP 语法快速参考"
layout: post
category: note
tags: [php, syntax]
excerpt: "这是阅读 PHP 参考文档时做的笔记和整理. 为整个 PHP 语法提供一个简明的地
图. 在面试前或者平时浏览一遍, 以便检查自己是否遗忘了某些重要的 PHP 及基本特性"
---

# 关键字

    abstract    and          array()     as          break
    case        catch        class       clone       const
    continue    declare      default     do          else
    elseif      enddeclare   endfor      endforeach  endif
    endswitch   endwhile     extends     final       for
    foreach     function     global      goto        if
    implements  interface    instanceof  namespace   new
    or          private      protected   public      static
    switch      throw        try         use         var
    while       xor

# 起始结束标记

- 标准风格(推荐): `<?php ?>`. 如果 `?>` 后面就是文档结束, 推荐省略这个 `?>`, 否
  则在某些情况下会报错
- 短风格: `<? ?>`
- asp 风格: `<% %>`
- 长风格: `<script language="php"> </script>`
- 直接输出变量(和 `XML` 标签有冲突): `<?= $var ?>`

# 语句分隔符

    ;

- 结构定义语句: 别加
- 功能执行语句: 要加

# 注释

注释要写在代码上面或右面

- 单行注释: `//`
- 多行注释: `/* */`
- 脚本注释: `#`
- 文档注释: `/** */`

# 大小写

- 变量名, 常量名, 成员变量名__区分__大小写
- 函数名, 类名, 成员方法名__不区分__大小写

_note_: 给 `define()` 传递第三个参数 `true` 会让常量区分大小写

# 变量

## 声明 (弱类型)

```php
$varName = varValue;
$var1 = $var2 = $var3 = value;
```

## 命名

- 不能以数字开头或使用运算符
- 可以使用关键字
- 使用小驼峰命名法
- 要有意义

## 可变变量

```php
$var1 = $$var2;
```

为避免产生类似 `$$var[1]` 的困惑, 使用大括号像这样分隔

```php
${$var[1]} // 或
${$var}[1]
```

## 赋值

- 值赋值

    ```php
    $var1 = 10;
    $var2 = var1;           // 将 var1 的值赋给 var2
    $var1 = 100;            // var1 = 100; var2 = 10(不变)
    ```

- 引用赋值

    ```php
    $var1 = 10;
    $var2 = & var1;         // 使用 "&", 将 var1 地址给 var2, 此时
                            // var1 和 var2 都指向同一个地址
    $var1 = 100;            // var1 = 100; var2 = 100
    ```

## 类型

### 标量

- `int`, `integer` (4个字节)

    ```php
    $int = 10;   // 十进制
    $int = 045;  // 八进制(以0开头)
    $int = 0xff; // 十六进制(以0x开头)
    ```

- `bool`, `boolean`

- `float`, `double`, `real` (8个字节)

    ```php
    $float = 3.14E-2; // 科学计数法
    ```

- `string`

    + 单引号: `$str = 'aaa';`

        不解析变量, 不能使用转义字符(除单引号和转义字符)如非必要, 推荐使用单引号,
        因为不用解析变量, 消耗资源较少

    + 双引号: `$str = "aaa";`

        会解析变量(用`{ }`来分隔), 能使用转义字符

    + 反引号: <code>$str = `aaa`;</code>

    + `HEREDOC`

        解析变量, 定界符可以带双引号, 也可以不带, 如 `<<<HERE` 或 `<<<"HERE"`

    + `NOWDOC`

        不解析变量, 定界符必须带单引号, 如 `<<<'NOW'`, 但结尾定界符不用单引号

        结尾定界符必须顶行, 并且以 `;` + `换行` 或 `换行` 结尾

    _note_: `String` 类型中的单个字符可以用 `{}` 或 `[]` 访问, 如:

    ```php
    $str = 'str';
    echo $str{0}; // 或 $str[0]
    ```

### 复合

- `array`: 数组
- `object`: 对象

### 特殊

- `resource`: 代表要操作的资源(文件, 图片等)本身
- `null`: 如果一个变量值为 `null`, 则代表这个变量不存在, `isset()` 返回 `false`

## 转换

### 强制

- 会改变原变量类型: `setType($var, type)`
- 不会改变原变量类型:

    + `(int)`, `(integer)`, `(bool)`, `(boolean)`, `(float)`, `(double)`,
      `(real)`, `(string)`, `(binary)`, `(array)`, `(object)`, `(unset)`
    + `intval()`, `floatval()`, `strval()`, `doubleval()`

### 自动

- 转到 `BOOLEAN`

    | 从 | 转换结果|
    |----|----|
    |`FALSE` |`FALSE`|
    | `0` | `FALSE`|
    |`0.0` |`FALSE`|
    | `""` |`FALSE`|
    | `" "` |`FALSE`|
    | `"0"` |`FALSE`|
    | 空数组 |`FALSE`|
    | 空对象 |`FALSE`|
    | NULL |`FALSE`|
    |其他| `TRUE` |

- 转到 `INT`

    | 从 | 转换结果|
    |----|----|
    |布尔|`FALSE` -> `0`,  `TRUE` -> `1`|
    |浮点数|向零取整|
    |字符串|以合法的数字开始则为这个数字, 否则就是 `0`|

- 转到 `FLOAT`

    | 从 | 转换结果|
    |----|----|
    |字符串|以合法的数字开始则为这个数字, 否则就是 `0`|
    |其他|先转换为 `INT`, 再转换为 `FLOAT`|

- 转到 `STRING`

    | 从 | 转换结果|
    |----|----|
    |布尔| `FLASE` -> `""`, `TRUE` -> `"1"`|
    |数组| `"Array"`|
    |对象| `"Object"`|
    |资源| `"Resource id #n"`|
    |`NULL`| `""`|

- 转到 `ARRAY`

    | 从 | 转换结果|
    |----|----|
    |任意类型| 一个仅有一个元素的数组|

- 转到 `OBJECT`

    | 从 | 转换结果|
    |----|----|
    |从任意类型|实例化一个内置类 `stdClass` 的对象|
    |`NULL`|新的实例为空|
    |数组|键名成为属性名并具有相对应的值|
    |其它的值|名为 `scalar` 的成员变量将包含该值|

## 作用域

- 局部

    在函数内声明, 只能在自己的函数内部使用

    参数就是局部变量, 这个局部变量可以调用时赋值

- 全局

    在函数外声明, 可用于声明语句后的整个脚本

   *如果在函数内使用, 必须用 `global` 关键字包含之, 或者使用 `$GLOBALS` 超全局数
   组*

- 静态(`static`) _不要和类中的静态相混淆_

    也是局部的, 但是函数调用完毕, 其值不会丢失

    静态变量可以在同一个函数的多次调用中共用

# 常量

*常量定义后不能改变, 也不能用 `unset()` 取消*

*常量(和变量不一样)不用理会作用域的限制, 在任何地方都可以使用*

习惯使用大写

`<5.5`: 只能包含标量类型

`5.6`: 可以使用包括数值, 字符串字面量以及其他常量在内的数值表达式来定义常量, 声
明属性以及设置函数参数默认值, 也可使用 `const` 定义类型为 `array` 的常量

- 定义

    ```php
    // 1. define:
    define("CONSTANT_NAME", 'constantValue');
    // 2. const:必须处于最顶端的作用区域, <5.3: 只能用于类中
    const CONSTANT_NAME = 'constantValue';
    ```

- 获取

    ```php
    // 1. defined(): 判断常量是否定义
    defined("constantName");
    // 2. constant(): 获取常量名为 constName 的常量值
    constant('constName');
    ```

- 魔术常量

    + `__DIR__`: 当前文件完整路径
    + `__FILE__`: 当前文件完整路径及文件名
    + `__NAMESPACE__`: 当前命名空间名称
    + `__CLASS__`: 类名
    + `__METHOD__`: 类的方法名
    + `__FUNCTION__`: 函数名
    + `__LINE__`: 当前行号

- 常用预定义常量

    + `PHP_EOL`
    + `PHP_OS`
    + `PHP_VERSION`
    + `DEFAULT_INCLUDE_PATH`

# 运算符

|类型|运算符|备注|
|----|----|----|
|算数|`+ - * / % ++ -- **`|`**` 从 5.6 才有|
|连接|`.`||
|赋值|`= += -= *= /= .= %= **=`|`**=` 从 5.6 才有|
|位|<code>& | ~ ^ << >></code>||
|比较, 关系, 条件|`== === !=或<> !== > < >= <=`|`<>` aka 'pulp fiction'|
|逻辑|<code>&& || ! and or xor</code>||
|错误抑制|`@`||
|执行|<code>``</code>||
|类型|`instanceof`||
|其他|`? : => -> :: & $`|`::` aka 'paamayim nekudotayim'|

使用 `&&` 或 `||` 会发生短路, 使用 `& `或 `|` 则不会

使用短路, 也可以控制代码流程

*`&&` 与 `and`, `||` 与 `or` 的区别:*

```php
// "||" 的优先级比 "or" 高
$e = false || true; // $e 被赋值为 (false || true)，结果为 true
$f = false or true; // $f 被赋值为 false ("=" 的优先级比 "or" 高)

// "&&" 的优先级比 "and"　高
$g = true && false; // $g 被赋值为 (true && false)，结果为 false
$h = true and false; // $h 被赋值为 true ("=" 的优先级比 "and" 高)
```

# 流程控制

- 顺序结构
- 分支(条件/选择)结构
    + 单路分支

        ```php
        if() { }
        ```

    + 双路分支

        ```php
        if() { } else { }
        ```

    + 多路分支

        ```php
        if() { }... elseif() { }... else { }
        switch(变量) {      // 变量最好只用整形和字符串
            case 变量值:    // 各个 case 都是互斥的,  可以利
                code...;    // 用此特性简写一些条件判断
                break;      // 跳出循环. 可以利用 break 匹配多种情况
            case 变量值:
                code...;    // 如果 case 的语句为空, 则将控制转移到下一个
                            // case, 实现多个 case 共用一段代码
                break;
            ...
            default:        // 默认执行的语句
                code...;
        }
        foreach() { }

        if...else...        // 适用于范围条件
        switch...case       // 适用于定点值条件
        foreach...          // 适用于数组
        ```

    + 三目运算符

        ```php
        boolean ? true_value : false_value
        ```

- 循环结构

    + `while`, `do...while`: 通常用于条件循环
    + `for`: 通常用于计数循环

- `break`: 退出剩余循环

    ```php
    break 1;                // 默认, 退出一层循环
    break 2;                // 退出两层循环
                            // 以此类推
    ```

- `continue`: 跳过本次循环

    ```php
    continue 1;
    continue 2;
    // 以此类推
    ```

- *`declare (directive)`*

# 数组

## 分类

- 索引数组: 索引为整数
- 关联数组: 索引为字符串

_note_: 如果你要使用浮点作为键, 使用字符串形式如 '1.5', '1.6'. 否则 php 会向下取
整, 这样 1.5 和 1.6 便都为 1

## 声明

- 使用 `array()` 函数
- 5.4: 使用 `[]`
- 直接给元素赋值: 如果不指定索引, 则为之前最大整数索引加一; 如果指定的索引和之前
  重复, 则视为重新赋值

## 访问

- 使用 `[]`
- 使用 `{}`

## 遍历

```php
for() { ... }                                           // 有很多限制
foreach( $arr as $key => $val ) { ...  }                // 首选
while( list( $key,$val ) = each( $user ) ) { ... }      // 效率更高
```

使用 `next()` `prev()` `reset()` `end()` `current()` 可以操作数组指针

## 数组指针

- 数组赋值

    数组在赋值时, 如果赋值数组的数组指针已经指向了数组末尾则赋值之后赋值数组的数
    组指针会被重置; 如果在赋值时赋值数组的数组指针没有指向数组末尾而是指向了任何
    一个有效的数组元素, 那么在赋值之后赋值数组的数组指针是不会被重置的, 而是保留
    其原来指向的元素

- 数组传参

    如果实参内部指针的位置指向了数组末尾, 那么系统会将形参的内部指针重置, 指向形
    参数组的第一个单元; 如果实参内部指针的位置不在数组末尾, 即指向了有效的单元,
    那么系统会将形参的数组指针位置与实参的数组指针指向值相同的数组单元

# 函数

- 定义

    ```php
    function 函数名(形参, 形参 , ...) {
        函数体
        return 返回值;
    }
    ```

- 定义可变数量的参数列表

    + <5.5:

        使用 `func_num_args()`, `func_get_args()`, `func_get_arg()`

    + 5.6:

        也可以使用 `...`, 参数会以数组形式传入函数

        相应的在调用函数时, 使用 `...` 运算符, 将数组和可遍历对象展开为函数参数

        `...` 参数支持 typehint

    + 为可选的参数赋默认值, 在函数体中做判断

PHP 中的所有函数和类都具有全局作用域, 可以在内部定义外部调用, 反之亦然

PHP 不支持函数重载, 也不可能取消定义或者重定义已声明的函数

*带默认值的参数的默认值必须是常量表达式, 不能是诸如变量, 类成员, 或者函数调用等
表达式*

*当使用默认参数时, 任何默认参数必须放在任何非默认参数的右侧*

*少传参数会报错(除非少传的是有默认值的参数), 多传参数则不会*

函数不能返回多个值, 但可以通过返回一个数组来得到类似的效果; 总是返回值是一个好习
惯

从函数返回一个引用, 必须在函数声明和指派返回值给一个变量时都使用引用操作符 `&`

PHP 支持可变函数的概念. 这意味着如果一个变量名后有圆括号, PHP 将寻找与变量的值同
名的函数, 并且尝试执行它

*如果函数未执行完时就递归调用自己, 则当执行完最深一层后, 会层层回退到上一层继续
执行完*

*缺省情况下, 函数参数通过值传递(因而即使在函数内部改变参数的值, 它并不会改变函数
外部的值).*

如果希望允许函数修改它的参数值，必须通过引用传递参数

# 类与对象

## 类

### 声明

```php
class 类名        // `stdClass` 和 `__PHP_Incomplete_Class` 为 PHP 保留字
{
    成员属性      // 定义成员属性必须使用 $, 访问成员属性不用使用 $ 符号
                 *// 属性中的变量可以初始化, 但是初始化的值必须是常数
    成员方法
}
```

### 命名

命名法:

- PascalCase
- camelCase
- snake_case

一个文件包含一个类, 文件名以 `类名.class.php` 命名

### 访问控制关键字

- `public`: 可以在任何地方被访问
- `protected`: 可以被其所在类及其子类和父类访问
- `private`: 只能被其所在类访问

### 继承( PHP 是单继承的 )

- `extends` 关键字:

    子类中声明和父类相同的方法名, 会覆盖父类的方法(PHP 意义上的重载), 如果要在子
    类中访问父类中被覆盖的方法, 可以使用 `parent::方法名()`

- `final` 关键字

    父类中的方法被声明为 `final`, 则子类无法覆盖该方法

    如果一个类被声明为 `final`, 则不能被继承

### `static` 关键字: 静态属性/方法

*定义静态(类)属性和方法, 使用 `::` 访问*

*定义和访问静态属性需要使用 `$` 符号*

*静态方法访问方式:*

1. `类::方法`
2. `实例->方法`

*静态属性访问方式:*

1. `类::属性`
2. `实例::$属性`

存储于数据段中, 用于让所有该类的对象共享该成员

不用实例化类即可访问, 所以 `$this`(可以使用 `self`) 在静态方法中不可用, 也不能在
静态方法中访问非静态成员

不能通过一个对象来访问其中的静态成员(静态方法除外)

*对静态属性的改变, 会反映到所有父类和子类中*

如果所有类的对象的属性值要保持同一, 或确保方法不会使用非静态属性, 则可以声明为静
态成员

`static` 关键字应放在 3P 后面

*你可以把静态属性初始化为整型或数组, 但不能指向另一个变量或函数返回值，也不能指
向一个对象*

### `const` 关键字: 类常量

*声明类常量, 定义和使用时都不需要 `$` 符号, 使用 `<类名>::` 访问*

与静态属性的不同: 静态属性可以修改, 但类常量不可以

## 抽象类(由 `abstract` 定义, `extends` 继承)

- 至少要包含一个抽象方法(由 `abstract` 修饰, 没有方法体, 用 `;` 结束), 其他和一
  般类相同
- 不能直接被实例化, 必须先继承该抽象类, 然后再实例化子类
- 子类必须实现抽象类中的所有抽象方法, 这些方法的可见性必须和抽象类中一样或者更为
  宽松
- `abstract` 关键字应该放到 3P 前面

## 接口(由 `interface` 定义, `extends` 继承, `implements` 实现)

- 指定某个类必须实现哪些方法, 但其中定义所有的方法都是空的, 而且必须为 `public`
- *不能在接口中声明成员属性, 但可以声明接口常量
- 一个类可以实现多个接口( `,` 分开), 弥补单继承缺点
- 实现多个接口时, 接口中的方法不能有重名

## 对象

- 实例化: `$变量名 = new 类名()`

- 成员访问

    + 在对象外: `->` 操作符
    + 在对象内: `$this` 伪变量

- 序列化: `serialize()` 和 `unserialize`

    将一个对象转换为一个包含字节流的字符串或反之

    用于将对象长时间保存在数据库或文件中, 或者在多个 php 文件间传输时

- 比较

    |比较内容| `==` | `===` | |----|----|----| |引用|`true`|`true`| |有相同属性
    值的两个实例|`true`|`false`| |属性值不同的两个实例|`false`|`false`|


## 魔术方法 (不同时机自动调用以完成特定功能的系统定义方法  )

- 构造析构

    + `__construct()`: 创建新对象时先自动调用此方法, 适合在使用对象之前的初始化
      操作
    + `__destruct()`: 某个对象的所有引用都被删除或者当对象被显式销毁时执行, 一般
      用来放置关闭资源等等收尾工作

- *重载方法 (所有的重载方法都必须被声明为 `public`, 这些魔术方法的参数都不能通过
  引用传递)*

    + `__set(string $name , mixed $value)`: 给未定义或不可见的变量赋值时被调用
    + `__get(string $name)`: 读取未定义或不可见的变量的值时被调用
    + `__isset(string $name)`: 当对未定义或不可见的变量调用 `isset()` 或
      `empty()` 时被调用
    + `__unset(string $name)`: 对未定义或不可见的变量调用 `unset()` 时被调用

    - - -

    + `__call(string $name , array $arguments)`: 调用一个未定义或不可见方法时被
      调用, 用于错误处理
    + `__callStatic(string $name , array $arguments)`: 在静态方法中调用一个未定
      义或不可见的方法时被调用

    - - -

    + `__clone()`: 当使用 `clone` 复制对象时被调用, 用于对副本初始化(`$this `代
      表副本, `$that` 代表原本)操作
    + `__toString()`: 当直接以字符串形式输出对象时被调用
    + `__sleep()`: 当对象被序列化时被调用, 常用于提交未提交的数据等类似的清理操
    作或部分序列化必须返回一个包含所需序列化的对象属性数组
    + `__wakeup()`: 当对象被反序列化时被调用, 用于重新建立数据库连接等初始化操作
    + `__invoke()`: 当尝试以调用函数的方式调用一个对象时
    + `__setState()`: 当调用 `var_export()` 导出类时
    + `__debugInfo()`: 当 `var_dump()` 对象时

    - - -

    + `__autoload($class_name)`: 试图使用尚未被定义的类时自动调用, 这是唯一一个
      在类外部使用的魔术方法

## Trait

- `Trait` 为了减少单继承语言的限制, 使开发人员能够自由地在不同层次结构内独立的类
  中复用方法集
- 通过 `use` 关键字在类定义中引入 `Trait`, 优先顺序是来自当前类的成员覆盖了
  `Trait` 的方法, 而 `Trait` 则覆盖了被继承的方法
- 如果两个 `Trait` 都插入了一个同名的方法, 如果没有明确解决冲突将会产生一个致命
  错误
- 使用 `insteadof` 操作符来明确指定使用冲突方法中的哪一个, 使用 `as` 将冲突方法
  以别名方式引入
- 也可同时用 `use` 指定引入时的方法可见性(`3P`)
- 其它 `Trait` 也能够使用 `Trait`
- 为了对使用的类施加强制要求, `Trait` 支持抽象方法的使用
- `Traits` 可以定义静态成员静态方法
- 如果 `Trait` 定义了一个属性, 那类将不能定义同样名称的属性, 否则会产生一个错误

# 命名空间

只有三种类型的代码受命名空间的影响: 类, 函数和常量

- 声明

    + 使用 `namespace` 关键字
    + 必须在其他所有代码之前(除 `declare` 语句)
    + 同一个命名空间可以定义在多个文件中. 将全局的非命名空间中的代码与命名空间中
    的代码组合在一起, 只能使用大括号形式的语法. 全局代码必须用一个不带名称的
    `namespace` 语句加上大括号括起来
    + 除了开始的 `declare` 语句外, 命名空间的括号外不得有任何 PHP 代码

- 种类

    + 非限定名, 如 `foo`
    + 限定名, 如 `foo\bar`
    + 完全限定名, 如 `\foo\bar`

- 导入/别名:`use/as`

    + <5.5: 只支持命名空间和类的别名, 不支持函数和常量
    + 5.6: 支持在类中导入外部的函数和常量
    + 一行可以使用多个 `use/as` 语句, 使用 `,` 号分割

# 错误与异常

### 设置

- `php.ini`
- `httpd.conf`
- `htaccess`
- 运行时

### 级别

| 数值表示 |常量表示 |
|----------|---------|
|1 |E_ERROR|
|2 |E_WARNING|
|4 |E_PARSE|
|8 |E_NOTICE|
|16 |E_CORE_ERROR|
|32 |E_CORE_WARNING|
|256 |E_USER_ERROR|
|512 |E_USER_WARNING|
|1024 |E_USER_NOTICE|
|2048 |E_STRICT|
|4096 |E_RECOVERABLE_ERROR|
|8191 |E_ALL|

### 一般需要考虑错误处理的情况

- 连接到数据库
- 使用一个全局变量
- 打开一个文件
- 验证用户输入
- 0 除错误

### 处理方式

- 展示(适用于开发环境)

    ```php
    display_errors = on #默认为 off
    error_reporting() #默认为除了 E_NOTICE 和 E_STRICT 的所有错误
    ```

- 记录(适用于线上环境)

    ```php
    log_errors = on
    error_log = /path/to/filename #或者 error_log = syslog
    error_log()
    ```

- 抑制: `@`

- 处理

    - `die/exit`

    - 自定义错误处理函数:

        ```php
        function handleError($errno, $errstr,$error_file,$error_line)
        {
            echo "<b>Error:</b> [$errno] $errstr - $error_file:$error_line";
            echo "<br />";
            echo "Terminating PHP Script";
            die();
        }
        set_error_handler("handleError");
        trigger_error();
        ```

    - 抛出异常: `throw..try..catch`

    - 自定义异常处理函数:

        ```php
        function exception_handler($exception) {
            echo "Uncaught exception: " , $exception->getMessage(), "\n";
        }
        set_exception_handler('exception_handler');
        throw new Exception('Uncaught Exception');
        echo "Not Executed\n";
        ```

# *生成器*

生成器允许你在 `foreach` 代码块中写代码来迭代一组数据而不需要在内存中创建一个数组

相比实现 `Iterator` 来说, 生成器实现起来更简单, 也更易读

一个生成器函数看起来像一个普通的函数, 不同的是生成器可以 `yield` 生成许多它所需
要的值

当一个生成器被调用的时候, 它返回一个可以被遍历的对象

一个生成器不可以返回值, 这样做会产生一个编译错误; 然而 `return` 空是一个有效的语
法并且它将会终止生成器继续执行

除了生成简单的值

```php
yield $id;
```

你也可以在生成值的时候指定键名

```php
yield $id => $fields;
```

如果在一个表达式上下文(例如在一个赋值表达式的右侧)中使用 `yield`, 你必须使用圆括
号把 `yield` 申明包围起来

```php
$data = (yield $value);
```

或

```php
$data = (yield $key => $value);
```

`yield` 可以在没有参数传入的情况下被调用来生成一个 `NULL` 值并配对一个自动的键名

生成函数可以像使用值一样来使用引用生成

# 引用(可理解为别名, 删除别名并不会删除别名指向的变量)

- 变量的引用传递

    ```php
    $var = &$var2 // 所有对 $var 的更改将反映到 $var2
    ```

- 函数的引用传递

    ```php
    function fun(&$var) {
        // 所有对 $var 的更改将反映到 $var 指向的变量
        // 也可以用全局变量实现
    }
    ```

- 函数的引用返回

    ```php
    function &fun(){
        return ...
    }
    ```

   *此时, 如果要将函数返回作为引用赋值, 必须在赋值时加 `&`, 如 `$var =
    &fun();`函数名前面的 `&`和赋值时的 `&` 两者缺一不可*

- 对象的引用

    默认即为引用传递, 如果不想用引用, 使用 `clone` 关键字

- 用途

    如果程序比较大, 引用同一个对象的变量比较多并且希望用完该对象后手工清除它, 建
    议用 `&` 方式, 然后用 `$var = null` 的方式清除;

    对于大数组的传递, 建议用 `&` 方式, 毕竟节省内存空间使用

# 预定义

- 超全局变量

    |变量|概述|
    |----|----|
    |`$GLOBALS`|所有全局变量, 包括用户自定义的和超全局数组|
    |`$_SERVER`|服务器和当前脚本环境相关数据|
    |`$_GET`|GET 方法提交的数据|
    |`$_POST`|POST 方法提交的数据|
    |`$_FILES`|POST 方法上传文件的信息|
    |*`$_REQUEST`|GET, POST, COOKIE 提交的数据(尽量避免使用该数组)*|
    |`$_SESSION`||
    |`$_COOKIE`||
    |`$_ENV`|执行环境相关数据|
    |||
    |`php_errormsg`|错误发生的作用域的前一个错误信息(`track_errors` 配置项需开启)|
    |`$http_response_header`| 响应头|
    |`$argc`|传递给脚本的参数数目(命令行下)|
    |`$argv`|传递给脚本的参数数组(命令行下)|

- 异常

    + `Exception`
        * `::getMessage`
        * `::getPrevious`
        * `::getCode`
        * `::getFile`
        * `::getLine`
        * `::getTrace`
        * `::getTraceAsString`

    + `ErrorException`
        * `::getSeverity`

- 接口

    + `Traversable`(内部自用, 不可实现)

    + `Iterator`
        * `::current`
        * `::key`
        * `::next`
        * `::rewind`
        * `::valid`

    + `IteratorAggregate`
        * `::getIterator`

    + `ArrayAccess`
        * `::offsetExists`
        * `::offsetGet`
        * `::offsetSet`
        * `::offsetUnset`

    + `Serializable`
        * `::serialize`
        * `::unserialize`

    + `Closure`
        * `::bind`
        * `::bindTo`

    + `Generator`
        * `::current`
        * `::key`
        * `::next`
        * `::rewind`
        * `::send`
        * `::throw`
        * `::valid`

# 上下文

上下文(Context)由 `stream_context_create()` 创建

选项可通过 `stream_context_set_option()` 设置

参数可通过 `stream_context_set_params()` 设置

## 选项

- HTTP(`http://, https://`)

    + `method `
    + `header `
    + `user_agent `
    + `content `
    + `proxy `
    + `request_fulluri `
    + `follow_location `
    + `max_redirects `
    + `protocal_version `
    + `timout `
    + `ignore_errors`

- FTP(`ftp://, ftps://`)

    + `overwrite `
    + `resume_pos `
    + `proxy`

- SSL(`ssl://, tls://,` 同样适用于 `https://` 和 `ftps://` 上下文)

    + `peer_name `
    + `verify_peer `
    + `verify_peer_name `
    + `allow_self_signed `
    + `cafile `
    + `capath`
    + `local_cert `
    + `local_pk `
    + `passphrase `
    + `CN_match `
    + `verify_depth `
    + `ciphers`
    + `capture_peer_cert `
    + `capture_peer_cert_chain `
    + `SNI_enabled `
    + `SNI_server_name`
    + `disable_compression `
    + `peer_fingerprint`

- CURL

    + `method`
    + `header`
    + `user_agent`
    + `content`
    + `proxy`
    + `curl_verify_ssl_host`
    + `curl_verify_ssl_peer`

- Phar(`phar://`)

    + `compress `
    + `metadata`

- MongoDB(`mongodb://`)

    + `log_cmd_insert `
    + `log_cmd_delete `
    + `log_cmd_update `
    + `log_write_batch `
    + `log_reply`
    + `log_getmore `
    + `log_killcursor`

## 参数

- notification

# 支持的协议和封装协议

- `file://`
- `http://`
- `https://`
- `ftp://`
- `ftps://`
- `php://`
    + `php://stdin`
    + `php://stdout`
    + `php://stderr`
    + `php://input` (5.6: 可以多次打开并读取 `php://input`)
    + `php://output`
    + `php://fd`
    + `php://memory`
    + `php://temp`
- `zlib://`
- `data://`
- `glob://`
- `phar://`
- `ssh2://`
- `rar://`
- `ogg://`
- `expect://`
