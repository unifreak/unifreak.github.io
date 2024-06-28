---
title: "PHP 7 Syntax Quick Reference"
layout: post
category: note
tags: [php, syntax]
description: quick reference of php 7 syntax
excerpt: "A note and summary of php 7 syntax, mainly from the official php online doc."
---

My notes and summary of php 7 syntax, mainly from the official php online doc.

# See

- <https://www.php.net/manual/en/appendices.php>

# New Feature

## NumEric Literal Seperator

```php
// Numeric literals can contain underscores between digits
6.674_083e-11; // float
299_792_458;   // decimal
0xCAFE_F00D;   // hexadecimal
0b0101_1111;   // binary
```


## Type Declaration (Known As `type hinting` in PHP5)

Types

```php
// type support:
// - php56: Class/interface name, `self`, `array`, `callable`
// - new: `string`, `int`, `float`, `bool`, `iterable` (array or Traversable), `object`
// - nullable
//
// nullable type:
// - prefix with `?`
// - means can be null or string, in argument or return
//
// return type:
// - use `:`
// - can be `: void`:
//   + means must use an empty return or omit return
//   + return NULL IS NOT VALID
function func(?int $i): ?string {
    // ...code
}
```

## Arrow Function

```php
$nums = array_map(fn($n) => $n * 10, [1, 2, 3, 4]);
```

## Muti Catch Exception

```php
try {
} catch (FirstException | SecondException $e) {
}
```

## Null Coalescing Operator: `??`


```php
$var ?? 'not set';  // isset $var ? $var : 'not set'

$array['key'] ??= computeDefault();
// is roughly equivalent to
if (!isset($array['key'])) {
    $array['key'] = computeDefault();
}
```

## Spaceship Operator

```php
1 <=> 1; // 0
1 <=> 2; // -1
2 <=> 1; // 1
```

## Array

Array Constant

```php
define('ANIMALS', ['dog', 'cat', 'bird']);
```

`[]` act as `list()`

```php
$data = [["id" => 1, "name" => 'Tom'], ["id" => 2, "name" => 'Fred']];
[$id1, $name1] = $data[0];
foreach ($data as [$id, $name]) { }

// can specify key now. But cannot mix with unkeyed array entries
["id" => $id1, "name" => $name1] = $data[0];
foreach ($data as ["id" => $id, "name" => $name]) { }

// also support reference assignment
[&$a, [$b, &$c]] = $d
```

Unpacking Inside Array

```php
$parts = ['apple', 'pear'];
$fruits = ['banana', 'orange', ...$parts, 'watermelon'];
```

## String

Negative string offset: `"abc"[-2]"` or `"abc"{-2}` count from end, return "b".

## OO

Anonymouse Class

```php
// can pass argument to constructor (`10`)
// can implement interface
// can extend
$app->setLogger(new class(10) extends QLogger implements Logger) {
    // can use traits
    use SomeTrait;
    public function __construct($num) { }
});

// can do nesting
class Outer {
    protected $a = 'protected';
    private $b = 'private';
    public function getObj() {
        // to use Outer class protected prop or method ($a) -> extends Outer
        // to use Outer class private prop ($b) -> pass it via constructor
        return new class($this->b) extends Outer {
            function __construct($b) {
                var_dump($this->a, $b);
            }
        };
    }
}
```

Class constant visibility And class property type declaration.

```php
class C {
    const PUBLIC_CONST_A = 1;
    public const PUBLIC_CONST_B = 2;
    protected const PROTECTED_CONST = 3;
    private const PRIVATE_CONST = 4;

    public int $id
}
```


Abstract Method Overriding

```php
abstract class A {
    abstract function test(string $s);
}
abstract class B extends A {
    // Abstract methods can now be overridden when an abstract class extends another abstract class
    // still maintaining contravariance for parameters and covariance for return
    abstract function test($s) : int;
}
```

Parameter types from overridden methods and from interface implementations may
now be omitted.

```php
interface A {
    public function Test(array $input);
}
class B implements A {
    public function Test($input){} // type omitted for $input
}
```

## Unicode Codepoint Escape Syntax

```php
// syntax: \u{}
echo "\u{aa}"; // ª
echo "\u{0000aa}"; // ª, with optional leading 0's
echo "\u{9999}"; // 香
```

## Closure

Add `::call`

```php
// more performant
// shorthand way of temporarily binding an object scope to a closure and invoking it
$getX = function() {return $this->x;};
echo $getX->call(new A);
```

Convert callable to Closure with `::fromCallable`

```php
class Test {
    public function exposeFunction() {
        return Closure::fromCallable([$this, 'privateFunction']);
    }
    private function privateFunction($param) {
        var_dump($param);
    }
}
$privFunc = (new Test)->exposeFunction();
$privFunc('some value');
```

## Group `use` declaration

```php
use some\namespace\{ClassA, ClassB, ClassC as C};
use function some\namespace\{fn_a, fn_b, fn_c};
use const some\namespace\{ConstA, ConstB, ConstC};

use Foo\Bar\{
    Foo, // can use tailing comma now
    Bar,
    Baz,
};
```

## Generator

Add return support

```php
$gen = (function() {
    yield 1;
    yield 2;

    return 3; // return by reference is not allowed
})();

foreach ($gen as $val) {
    echo $val, PHP_EOL;
}

// may only be used once the generator has finished yielding values
// simpler than check whether the final value has been yielded and handle it
echo $gen->getReturn(), PHP_EOL;
```

Add `yield from` to delegate to another generator

```php
function gen() {
    yield 1;
    yield 2;
    // can delegate to `Traversable` or `array`
    yield from gen2();
}

function gen2() {
    yield 3;
    yield 4;
}

foreach (gen() as $val) {
    echo $val; // 1234
}
```

## `Intdiv()` Function

`intdiv(10, 3)` equals 3.

## Misc

- Expectations
- Filtered `unserialize()`
- intlChar
- Support for AEAD in `ext/openssl`
- Add function `pcntl_async_signals()`
- Add HTTP/2 server push support in `ext/curl`
- Add `tcp_nodelay` stream context option
- Extension loading by name, Shared extensions no longer require their file
  extension
- The Modern Sodium cryptography library has now become a core extension
- Password hashing with Argon2
- Extended string types for PDO
- Additional emulated prepares debugging information for PDO

# Deprecated

- PHP4 style constructor (method name is the same with class name)
- Static calls to methods that are not declared static
- `password_hash()` salt option
- `capture_session_meta` SSL context option
- `ldap_sort()`
