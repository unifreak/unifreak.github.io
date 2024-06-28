---
title: "PHP 8 特性预览"
layout: post
category: note
tags: [php]
description: PHP 8 syntax, feature, preview
excerpt: "PHP 将于 2020 年 11 月 26 日发布. 这篇文章简要罗列了一些其重要更新. 注
意, PHP 8 仍在开发. 此列表随时间可能变得不全."
---

_这是一个阅读 [这篇文章]('https://stitcher.io/blog/new-in-php-8') 后的简要总结._

---

PHP 将于 2020 年 11 月 26 日发布.

注意, PHP 8 仍在开发. 此列表随时间可能变得不全.

# 新特性

### 联合类型

```php
// 使用 | 指定
// 入参: 类型 Foo 或 Bar 都可接受
// 返回: 类型 int 或 float 都可接受
public function foo(Foo|Bar $input): int|float;

// 联合类型中不能有 void

// nullable
public function foo(Foo|null $foo): void;
public function bar(?Bar $bar): void;
```

### JIT 即时编译器

JIT (Just In Time) 即时编译器将带来大幅性能提升.

### `Attributes`

`Attributes` 提供了一种为类添加元信息的方式.

```php
use App\Attributes\ExampleAttribute;

@@ExampleAttribute
class Foo
{
    @@ExampleAttribute
    public const FOO = 'foo';

    @@ExampleAttribute
    public $x;

    @@ExampleAttribute
    public function foo(@@ExampleAttribute $bar) { }
}
@@Attribute
class ExampleAttribute
{
    public $value;

    public function __construct($value)
    {
        $this->value = $value;
    }
}
```

### `Match` 语句

类似 `switch` 语句, 但是:

- `break` 非必须
- 可一起指定多个匹配条件
- 使用严格类型比较
- 不做任何类型强转

```php
$result = match($input) {
    0 => "hello",
    '1', '2', '3' => "world",
};
```

### 构造器属性提升

可用于快速创建值对象或数据传输对象.

```php
class Money
{
    // 相当于:
    // $this->currency = $currency;
    // $this->amount = $amount;
    public function __construct(
        public Currency $currency,
        public int $amount,
    ) {}
}
```


### 静态返回类型

`static` 将成为合法的返回类型.

```php
class Foo
{
    public function test(): static
    {
        return new static();
    }
}
```


### `Throw` 语句

`throw` 从声明变成了语句, 这意味着可以从更多地方抛出异常.

```php
$triggerError = fn () => throw new MyError();
$foo = $bar['offset'] ?? throw new OffsetDoesNotExist('offset');
```

### `WeakMaps`

`WeakMaps` 可用于保持对象引用, 以免被自动垃圾回收. 这在 ORM 缓存中用处很大.

```php
class Foo
{
    private WeakMap $cache;

    public function getSomethingWithCaching(object $obj): object
    {
        return $this->cache[$obj]
           ??= $this->computeSomethingExpensive($obj);
    }
}
```

### 对一个对象使用 `::class`

```php
$foo = new Foo();
var_dump($foo::class); // 不必使用 get_class() 了
```

### 非捕获式 `catch`

```php
try {
    // Something goes wrong
} catch (MySpecialException) { // 不再必须指定一个变量 $e
    Log::error("Something went wrong");
}
```

### 参数列表最后的逗号

```php
public function(
    string $parameterA,
    int $parameterB,
    Foo $objectfoo, // 这个逗号合法
) {
    // …
}
```

### 其他

- 实现 `__toString()` 方法的类会自动实现 `Stringable` 接口.
- 私有方法被继承的时候, 不再需要和父类中的签名保持一致. 也不能被 final 修饰.
- 新增的 `mixed` 类型, 可用于指定参数, 属性和返回类型.


```php
str_contains('string with lots of words', 'words'); // true
str_starts_with('haystack', 'hay'); // true
str_ends_with('haystack', 'stack'); // true

fdiv($a, $b); // $b 是 0 的话不会报错, 而是返回 INF, -INF 或 NAN

get_debug_type($a); // 可获取比 gettype() 更多信息, 以便用于调试
get_resource_id($resource); // 获取资源 id, 同 `(int) $resource;`

PhpToken::getAll(); // token_get_all() 的面向对象实现

// 提供更通用的方式, 用于在 DateTime 和 DateTimeImmutable 对象之间进行转换
DateTime::createFromInterface(DateTimeInterface $other);
DateTimeImmutable::createFromInterface(DateTimeInterface $other);
```


# 破坏性更新

- 有些报警现在变为报错, 如未定义的变量
- @ 符不再能禁声致命错误
- 默认错误报告级别变为 E_ALL
- `"sum: " . $a + $b;` 中, `+` 比 `.` 优先级更高
- 对数组, 资源或对象进行算术操作或未操作将报错
- 几个反射类的方法签名更改
- 内置的排序方法都将变为稳定排序
