---
title: "Basic language construction"
sort: 1
tags: [go]
excerpt: "lll"
---

# See

* https://go.dev/tour/
* https://go.dev/doc/effective_go
* https://go.dev/talks/2012/splash.article
* Book: The Go Programming Language

# Basics

The language is called Go. The "golang" moniker arose because the web site was
originally golang.org.

Go is a compiled, concurrent, garbage-collected, statically typed language
developed at Google.

Go designed with clarity and tooling in mind, and has a clean syntax.

Unlike C and Java and especially C++, Go can be parsed without type information
or a symbol table; there is no type-specific context. The grammar is easy to
reason about and therefore tools are easy to write.

Putting the visibility in the name rather than its type means that it's always
clear when looking at an identifier whether it is part of the public API. After
using Go for a while, it feels burdensome when going back to other languages
that require looking up the declaration to discover this information.

## Go and C

Go makes many small changes to C semantics, mostly in the service of robustness.
These include:

- there is no pointer arithmetic
- there are no implicit numeric conversions
- array bounds are always checked
- there are no type aliases (after type X int, X and int are distinct types not
  aliases)
- ++ and -- are statements not expressions
- assignment is not an expression
- it is legal (encouraged even) to take the address of a stack variable
- and many more

There are some much bigger changes too, stepping far from the traditional C, C++,
and even Java models. These include linguistic support for:

- concurrency
- garbage collection
- interface types
- reflection
- type switches

Go natively handles Unicode.

Go does not require semicolons. So where newlines are placed matters to proper
parsing of Go code.

Go has no comma operator.

Go does not permit unused local variables.

i++ and i-- are statements not expressions as they are in most languages in the
C family, so **j = i++ is illegal. and they are postfix only**, so --i is not
legal either.

Simply speaking, an expression represents a value and a statement represents an
operation. However, in fact, some special expressions may be composed of and
represent several values, and some statements may be composed of several sub
operations/statements. By context, some statements can be also viewed as
expressions.

## CSP

CSP was chosen partly due to familiarity (one of us had worked on predecessor
languages that built on CSP's ideas), but also because CSP has the property
that it is easy to add to a procedural programming model without profound
changes to that model. That is, given a C-like language, CSP can be added to
the language in a mostly orthogonal way, providing extra expressive power
without constraining the language's other uses. In short, the rest of the
language can remain "ordinary".

There is one important caveat: **Go is not purely memory safe in the presence of
concurrency**. Sharing is legal and passing a pointer over a channel is
idiomatic (and efficient).

## Interface, Composition

Go **encourages composition over inheritance**, using simple, often one-method
interfaces to define trivial behaviors that serve as clean, comprehensible
boundaries between components.

Although type hierarchies have been used to build much successful software, it
is our opinion that the model has been overused and that it is worth taking a
step back.

Interface composition is a different style of programming, and people accustomed
to type hierarchies need to adjust their thinking to do it well, but the result
is an adaptability of design that is harder to achieve through type
hierarchies.

**The only way to have dynamically dispatched methods is through an interface.
Methods on a struct or any other concrete type are always resolved statically.**

Why Go don't have subclassing:

Type hierarchies result in brittle code. The hierarchy must be designed early,
often as the first step of designing the program, and early decisions can be
difficult to change once the program is written. As a consequence, the model
encourages early overdesign as the programmer tries to predict every possible
use the software might require, adding layers of type and abstraction just in
case. This is upside down. The way pieces of a system interact should adapt as
it grows, not be fixed at the dawn of time.

Note too that the elimination of the type hierarchy also eliminates a form of
dependency hierarchy. Interface satisfaction allows the program to grow
organically without predetermined contracts. And it is a linear form of growth;
a change to an interface affects only the immediate clients of that interface;
there is no subtree to update. The lack of implements declarations disturbs
some people but it enables programs to grow naturally, gracefully, and safely.

## Error Handling

There is no control structure associated with error handling. It was a
deliberate choice not to incorporate exceptions in Go. Here is why:

1. First, there is nothing truly exceptional about errors in computer programs. For
instance, the inability to open a file is a common issue that does not deserve
special linguistic constructs; if and return are fine.

    f, err := os.Open(fileName) if err != nil { return err }

2. Also, if errors use special control structures, error handling distorts the
control flow for a program that handles errors. The Java-like style of
try-catch-finally blocks interlaces multiple overlapping flows of control that
interact in complex ways. Although in contrast Go makes it more verbose to
check errors, the explicit design keeps the flow of control
straightforward—literally.

Explicit error checking forces the programmer to think about errors—and deal
with them—when they arise. Exceptions make it too easy to ignore them rather
than handle them, passing the buck up the call stack until it is too late to
fix the problem or diagnose it well.

```go
// most compact, but may be used only within a function, not for package-level
// variables.
s := ""

// relies on default initialization to the zero value for strings, which is "".
var s string

// rarely used except when declaring multiple variables. such as
//      var a, b, c = 1, 2, "sample"
var s = ""
// explicit about the variable's type, which is redundant when it is the same as
// that of the initial value but necessary in other cases where they are not of
// the same type.
var s string = ""
```

in practice, you should generally use on of the first two forms, with explicit
initialization to say that the initial value is important and implicit
initialization to say that the initial value doesn't matter.

# Compilers

gc (Ken Thompson), a.k.a. 6g, 8g, 5g

- derived from the Plan 9 compiler model
- generates OK code very quickly
- not directly gcc-linkable

gccgo (Ian Taylor)

- more familiar architecture
- generates good code not as quickly
- gcc-linkable

# Names

25 keywords can't be used as names:

    break       default         func        interface       select
    case        defer           go          map             struct
    chan        else            goto        package         switch
    const       fallthrough     if          range           type
    continue    for             import      return          var

Predeclared names for built-in constant, types, and functions:

    constants:      true    false   iota
    types:          int int8 int16 int32 int64
                    uint uint8 uint16 uint32 uint64 uintptr
                    float32 float64 complex128 complex64
                    bool byte rune string error
    zero value:     nil
    functions:      make len cap new append copy close delete
                    complex real imag panic recover

Go programs lean toward short names, espacially for local variables with small
scopes.

Go use "camel case", acronyms always in the same case: HTMLescape, NOT HtmlEscape.

# Package

Every package is identified by a unique string called its "import path".

Each package has a package name, which is the short name that appears in its
package declaration. By convention, a package's name matches the last segment
of its import path.

Package `main` is special: It defines a standalone executable program, not a
library.

Programs start running in package `main`.

```go
package main
```

## Importing Package

You must import *exactly* the packages you need.

1. factored import is preferred

```go
import (
    "fmt"
    "math"
)
```

2. multiple statement import

```go
import "fmt"
import "math"
```

## Exported Names

When importing a package, you can refer only to its `exported names`. A name is
"exported" if it begins with a capital letter.

In C, C++, or Java the name y could refer to anything. In Go, y (or even Y) is
always defined within the package, while the interpretation of x.Y is clear:
find x locally, Y belongs to it.

These rules provide an important property for scaling because they guarantee
that adding an exported name to a package can never break a client of that
package. The naming rules decouple packages, providing scaling, clarity, and
robustness.

## Package Initialization and Init Function

Pacakge initialization begins by initializing package-level variables in the
order in which they are declared, except that dependencies are resolved first:

```go
var a = b + c       // a initialized third, to 3
var b = f()         // b initialized second, to 2, by calling f
var c = 1           // c initialized first, to 1

func f() int { return c + 1 }
```

Within each file, "init function" are automatically executed when the program
starts, **in the order in which they are declared**. init function can't be
called or referenced. init() is called after all the variable declarations in
the package have evaluated their initializers, and those are evaluated only
after all the imported packages have been initialized. a common use of init
functions is to verify or repair correctness of the program state before real
execution begins.

If the package has multiple .go files, they are initialized in the order in
which the files are given to the compiler; the go tool sorts .go files by name
before invoking the compiler.

We can define *multiple* init functions per package. When we do, the execution
order of the init function inside the package is based on the source files’
alphabetical order. For example, if a package contains an a.go file and a b.go
file and both have an init function, the a.go init function is executed first.

We shouldn’t rely on the ordering of init functions within a package. Indeed, it
can be dangerous as source files can be renamed, potentially impacting the
execution order.

```go
func init() {
    if user == "" {
        log.Fatal("$USER not set")
    }
    if home == "" {
        home = "/home/" + user
    }
    if gopath == "" {
        gopath = home + "/go"
    }
    // gopath may be overridden by --gopath flag on command line.
    flag.StringVar(&gopath, "gopath", gopath, "override default GOPATH")
}
```

One package is initialized at a time, in the order of imports in the program,
dependencies first.

# Variable and Types

Go's types fall into four categories:

Basic Types. See #Basic_Types.

Aggregate Types.

    array struct

Reference Types.

    pointers slices maps functions channels

Interface Types.

# Operators

Binary operators (in order of decreasing precedence):

    *       /       %       <<      >>      &       &^
    +       -       |       ^
    ==      !=      <       <=      >       >=
    &&
    ||

The ^ binary operator is xor.

Binary operators of the same precedence associate from **left to right**.

There is no exponentiation operator.

The &^ operator is **"bit clear" (AND NOT)**: in the expression z = x &^ y, each
bit of z is 0 if the corresponding bit of y is 1; otherwise it equals the
corresponding bit of x. (You can think it as `x & (^y)`).

In Go, the sign of the remainder is always the same as **the sign of the
dividend**, so -5%3 and -5%-3 are both -2.

The behavior of / depends on whether its operands are integers, so 5.0/4.0 is
1.25, but 5/4 is 1 integer division truncates the result **toward zero**.
When overflow, the high-order bits that do not fit are **silently discarded**.

Left shifts fill the vacated bits with zeros, as do right shifts of unsigned
numbers, but right shifts of signed numbers fill the vacated bits with copies
of the sign bit. For this reason, it is important to **use unsigned arithmetic
when you're treating an integer as a bit pattern**.

Unary operators.

    &       !       *       +       -       ^       <-

Unary ^ is complement.

```go
var x uint8 = 1<<1 | 1<<5
var y uint8 = 1<<1 | 1<<2

fmt.Printf("%08b\n", x)     // "00100010", the set {1, 5}
fmt.Printf("%08b\n", y)     // "00000110", the set {1, 2}

fmt.Printf("%08b\n", x&y)   // "00000010", the intersection {1}
fmt.Printf("%08b\n", x|y)   // "00100110", the union {1, 2, 5}
fmt.Printf("%08b\n", x^y)   // "00100100", the symmetric difference {2, 5}
fmt.Printf("%08b\n", x&^y)  // "00100000", the difference {5}

for i := uint(0); i < 8; i++ {
    if x&(1<<i) != 0 {      // membership test
        fmt.Println(i)      // "1", "5"
    }
}

fmt.Printf("%08b\n", x<<1)  // "01000100", the set {2, 6}
fmt.Printf("%08b\n", x>>1)  // "00010001", the set {0, 4}
```

We tend to use the signed int form even for quantities that can't be negative,
such as the length of an array. Indeed, the built-in len function returns a
signed int. Here is why:

```go
// If len returned an unsigned number, then i too would be a uint, and the
// condition i >= 0 would always be true by definition. After the third
// iteration, in which i == 0, the i-- statement would cause i to become
// not -1, but the maximum uint value.
medals := []string{"gold", "silver", "bronze"}
for i := len(medals) - 1; i >= 0; i-- {
    // do something
}
```

In general, an explicit conversion is required to convert a value from one type
to another, and binary operators for arithmetic and logic (**except shifts**) must
have operands of the same type.

Float to integer conversion discards any fractional part, trucating **toward zero**.

```go
f := 3.141
i := int(f)
fmt.Println(f, i) // "3.141 3"
f = 1.99
fmt.Println(int(f)) // "1"
```

You should **avoid conversions in which the operand is out of range for the target
type, the behavior depends on the implementation**.

# Basic Types

                    keywords                        literal
    -------------------------------------------------------------------------
    numbers         int uint uintptr                decimal: 123
                    int8 int16 int32 int64          binary: 0b 0B
                    uint8 uint16 uint32 uint64      octal: 0 0o 0O
                                                    hexadecimal: 0x 0X
                    ---------------------------------------------------------
                    float32 float64                 0. 72.40 072.40 .25 1_5.
                                                    1.e+0 6.674E-11
                                                    0x1p-2 0X_1fffP-16
                    ---------------------------------------------------------
                    complex64 complex128            0i 0123i 0o123i 0xabci 0.i
                                                    1.e+0i qE6i .25i 0x1p-2i
                    ---------------------------------------------------------
    strings         string                          "日本" "\u65e5本\n\"" "\xff"
                                                    `raw string`
                    ---------------------------------------------------------
                    rune (synonym for int32)        '国' '\t' '\377'
                                                    '\x0f' '\u12e4' '\U00101234'
                    ---------------------------------------------------------
                    byte (synonym for uint8)
    -------------------------------------------------------------------------
    booleans        bool                            true false

## Int

The int, uint, and uintptr types are usually 32 bits wide on 32-bit systems and
64 bits wide on 64-bit systems. but one MUST NOT make assumptions about which;
different compilers may make different choices even on identical hardware.

uintptr type is used only for low-level programming, such as at the boundary of
a Go program with a C library or an operating system.

Regardless of their size, int, uint and uintptr are **different types** from
their explicitly sized siblings.

When you need an integer value you should use int unless you have a specific reason
to use a sized or unsigned integer type.

## Float

"P Notation" is a convention to denote base-2 exponents, the significant is
always meant to be hexadecimal and the exponent is always meant to be decimal.
So `1.3DEp42` represents `1.3DEₕ × 2⁴²` (42 is decimal).

A float32 provides *approximately* **six decimal** digits of precision, whereas a
float64 provides about **15 digits**; float64 should be preferred for most purpose
because float32 computations accumulate error rapidly, and the smallest
positive integer that cannot be exactly represented as a float32 is not large:

Quoting from Poe:

> In the IEEE 754 single-precision format (float32), 32 bits are used to store
  the floating-point number. The format consists of three components: a sign
  bit for the sign of the number, an 8-bit exponent field, and a 23-bit
  significand (also known as the mantissa) field.

> The 23-bit significand field can represent 2^23 (or approximately 8.4 million)
  distinct binary fractions. When converted to decimal, this corresponds to
  around 7 significant decimal digits. However, due to the nature of
  floating-point representation, not all decimal fractions can be represented
  exactly. Some decimal fractions require repeating or non-terminating binary
  representations, leading to rounding errors.

> In general, a rough guideline is that each additional binary bit represents
  approximately 3.3 decimal digits of precision. With 23 bits in the
  significand field, we can expect around 7 significant decimal digits of
  precision (23 / 3.3 ≈ 7).

> However, it's important to note that the precision of floating-point numbers
  can vary depending on the specific number being represented. Some numbers can
  be represented exactly, while others may be subject to rounding errors. The
  precision also depends on the magnitude of the number and the range of
  exponents available.

> The statement about six decimal digits of precision for float32 is an
  approximation and a general rule of thumb based on the properties of the IEEE
  754 format. The actual precision and the ability to represent decimal
  fractions accurately can vary based on the specific implementation and the
  operations performed on the floating-point numbers.

(See also cs.org#IEEE_754)

```go
var f float32 = 16777216  // 1 << 24
fmt.Println(f == f+1)     // "true" !! wrong
```

## Complex

complex64 and complex128's components are float32 and float64 respectively.

```go
// Using built-in complex(), real(), imag()
var x complex128 = complex(1, 2) // 1+2i
var y complex128 = complex(3, 4) // 3+4i
fmt.Println(x*y)                 // "(-5+10i)"
fmt.Println(real(x*y))           // "-5"
fmt.Println(imag(x*y))           // "10"

// Using imaginary literal
x := 1 + 2i
```

## Boolean

Boolean values can be combined with the && and || operators, which have
short-circuit behavior, making it safe to write expressions like:

    s != "" && s[0] == 'x'

## Strings

A string is an **IMMUTABLE** sequence of bytes: the byte sequence contained in a
string value can never be changed.

len returns the number of **bytes** (not runes) in a string. The i-th *byte*
(NOT character) of a string is not necessarily the i-th character of a string.

Strings are length-delimited NOT NUL-terminated.

### Strings and Byte Slice

Immutability means that it is safe for two copies of string to share the same
underlying memory, making it cheap to copy strings of any length. Substring
operation is also cheap. No new memory is allocated in either case.

By contrast, the elements of a byte slice can be freely modified. Conceptually,
the `[]byte(s)` conversion **allocates** a new byte array holding a copy of the
bytes of s, and yields a slice that references the entirety of that array. The
conversion from byte slice back to string with string(b) also **make a copy**,
to ensure immutability of the resulting string.

The "bytes" package provides the Buffer type for efficient manipulation of byte
slices. A Buffer starts out empty but grows as data of types like strings, byte,
and `[]byte` are written to it.

To build strings more efficiently, see the "strings.Builder" type.

### Double-Quoted String Literal: "..."

Within a double-quoted string literal, escape sequences that begin with a
backslash `\` can be used to insert arbitrary byte values into the string using
hexadecimal or octal. A hexadecimal escape is written \xhh, with exactly two
hexadecimal digits h. An octal escape is written \ooo with exactly three octal
digits o not exceeding \377 (= decimal 255). Both denote a single byte with the
specified value. Unicode escapes have two forms, `\uhhhh` for a 16-bit value
and `\Uhhhhhhhh` for 32-bit value, where each `h` is a hexadecimal digit.
(note JSON's \Uhhhh numeric escapes denote UTF-16 codes, not runes)

One set of escape handles ASCII control code:

    \a      "alert" or bell
    \b      backspace
    \f      form feed
    \n      newline
    \r      carriage return
    \t      tab
    \v      vertical tab
    \'      single quote (only in the rune literal '\'')
    \"      double quote (only within "..." literals)
    \\      backslash

### Raw String Literal: \`...\`

Within a raw string literal \`...\`, no escape sequences are processed; the
contents are taken literally, including backslash and newlines, so a raw string
literal can spread over several lines. The only processing is that carriage
returns **"\r" are deleted** so that the value of the string is the same on all
platforms. It's a convenient way to write regular expressions, also useful for
HTML templates, JSON literals, command usage messages, and alike.

```go
s := "hello, world"
fmt.Println(len(s))     // "12"
fmt.Println(s[0], s[7]) // "104 119" ('h' and 'w')
c := s[len(s)]          // panic: index out of range

// Substring operation s[i:j]
fmt.Println(s[0:5])     // "hello"
fmt.Println(s[:5])      // "hello"
fmt.Println(s[7:])      // "world"
fmt.Println(s[:])       // "hello, world"

// Concatenating with +
fmt.Println("goodbye" + s[5:])  // "goodby, world"

// Since strings are immutable, try to modify a string's data in place are not
// allowed
s[0] = 'L'              // compile error: cannot assign to s[0]

// raw string literal
const GoUsage = `Go is a tool for managing go source code.

Usage:
    go command [arguments]
...`
```

### Rune

The natural data type to hold a single rune is int32, and that's what Go uses. A
rune whose value is less than 256 may be written with a single hexadecimal
escape, such as '\x41' for 'A', but for higher values, a \u o \U escape must be
used.

Rune will be printed as numeric value unless proper formatting is specified.

UTF-8 encoding:

    0xxxxxxx                             runes 0-127     (ASCII)
    110xxxxx 10xxxxxx                    128-2047        (values <128 unused)
    1110xxxx 10xxxxxx 10xxxxxx           2048-65535      (values <2048 unused)
    11110xxx 10xxxxxx 10xxxxxx 10xxxxxx  65536-0x10ffff  (other values unused)

```go
// Process runes with utf8 package
import "unicode/utf8"

for i := 0; i < len(s); {
    r, size := utf8.DecodeRuneInString(s[i:])
    i += size
}

// range loop performs UTF-8 decoding implicitly
for i, r := range "Hello, 世界" {

}

// Each time when a UTF-8 decoder (DecodeRuneInString or range loop) encounter
// an unexpected input byte, it generates a special Unicde replacement character
// '\uFFFD', which usually printed as �
fmt.Println(string(1234567)) // "�"

s := "Hello, 世界"
fmt.Printf("% x\n", s)  // "48 65 6c 6c 6f 2c 20 e4 b8 96 e7 95 8c"
                        //  h  e  l  l  o  ,     世       界
                        //
                        // e   4    b   8    9   6    e   7    9   5    8   c
                        // 11100100 10111000 10010110 11100111 10010101 10001100
                        // ----xxxx --xxxxxx --xxxxxx ----xxxx --xxxxxx --xxxxxx
                        //     0100   111000   010110     0111   010101   001100
                        //     4      e   1      6        7      5   4      c

// []rune conversion applied to string return the sequence of Unicode code points
r := []rune(s)
fmt.Printf("%x\n", r)   // "[48 65 6c 6c 6f 2c 20 4e16 754c]"

// Slice of runes converted to a string, produces the concatenation of the UTF-8
// encodings of each rune:
fmt.Println(string(r))  // "世界"

// Converting an integer to a string interprets the integer as rune value, and
// yields the UTF-8 representation of that rune
fmt.Println(string(65)) // "A", not "65"
```

To convert between strings and numbers, use "fmt.Sprintf" or "strconv".

# Composite Types

Composite types -- array, struct, pointer, function, interface, slice, map, and
channel types -- may be constructed using type literals.

Array and structs are "aggregate types"; their values are *concatenations* of
other values in memory. Array are "homogeneous" whereas structs
are "heterogeneous". Both arrays and structs are *fixed size*. In contrast,
slices and maps are dynamic data structures that grow as values are added.

## Arrays

**Length is part of its type**, `[4]int` and `[5]int` is distinct, incompatible
types. Length is fixed, arrays cannot be resized.

Go's arrays **are values**. An array variable denotes the entire array; it is not a
pointer to the first array like in C. This means when you assign or pass around
an array value you **will MAKE A COPY** of its contents.

One way to think about arrays is as a sort of struct but with indexed rather
than named fields.

```go
// Declaration
var a [2]string         // with [n]T, size n must be a constant expression
primes := [6]int{2, 3, 5, 7, 11, 13} // with array literal

q := [...]int{1, 2, 3}  // if "..." is in place of the length, length is determined
                        // by the number of initializer.

// The size of an array is part of its type,
// so `[3]int` and `[4]int` are different types.
q = [4]int{1, 2, 3, 4}  // compile error: cannot assign [4]int to [3]int

// It's possible to specify a list of index and value pairs, like this
type Currency int
const (
    USD Current = iota
    EUR
    RMB
)
symbol := [...]string{USD: "$", EUR: "€", RMB: "¥"}

// unspecified values take on the zero value for the element type
r := [...]int{99: -1}

// Access elements with []
a[0] = "Hello"
```

Passing large array as function argument can be inefficient, and inherently
inflexible because of their fixed size. For these reason, other than special
cases like SHA256's fixed-size hash, arrays are seldom used as function
parameters.

## Slices

https://go.dev/blog/slices-intro

Slice is a dynamically-sized, flexible view into the elements of an array. A
slice is a lightweight data structure that gives access to a subsequence
(or perhaps all) of the elements of an array, which is known as the
slice's "underlying array".

A slice is a descriptor of an array segment.

A slice has **three components**: a pointer, a length, and a capacity. The
pointer points to the first element of the the array that is reachable through
the slice, which is not necessarily the array's first element. The length is
the number of slice elements; it can't exceed the capacity, which is usually
the number of elements between the start of the slice and the end of the
underlying array.

Multiple slices can share the same underlying array and may refer to overlapping
parts of that array.

The zero value of slice is `nil`, it has length 0 and capacity 0 and no
underlying array. Other than comparing equal to nil, a nil slice behaves like
any other zero length slice. Go functions should treat all zero-length slices
the same way, whether nil or non-nil.

```go
// Creating Slices.

// A slice type is written []T, where the elements have type T;
// it looks like array type without a size.
//
// The slice operator s[i:j], where 0<=i<=j<=caps(s), creates a new slice that
// refers to elements i through j-1 of the sequence s, which may be:
//
// * an array variable,
// * a pointer to an array,
// * or another slice.
//
// The slice operator s[i:j:m] cause resulting slice's cap set to m-i
//
// All indexing in Go uses half-open intervals that include the first index but
// exclude the last.
//
// s[i:j] contains j-i elements.

// 1. From Array

months := [...]string{1: "Jan", /* ... */, 12: "Dec"}
year := months[:]
Q2 := months[4:7]
summer := months[6:9]

// 2. From Existing Slice

// Slicing beyond cap(s) cause a panic.
// Slicing beyond len(s) extends the slice.
fmt.Println(summer[:20])    // panic: out of range

// Omitted low will default to 0, omitted high will default to length of slice
endlessSummer := summer[:5]

// 3. With Slice Literals

// Will creates array then builds a slice from it.
//
// As with array literals, slice literals may specify the values in order, or give
// their indices explicitly, or use a mix of the two styles.
d := []int{2, 3, 5, 7, 11, 13}
e := []struct {
    i int
    b bool
}{
    {2, true},
    {3, false},
}

// 2-D slice
f := [][]string{
    // type declaration []string is *optional for primitive types* like string.
    // but it's good idea to always specify type declaration when you are
    // dealing with more complex types.
    []string{"_", "_", "_"},
    []string{"_", "_", "_"},
    []string{"_", "_", "_"},
}

// 4. Using Make
//
//      make([]T, len)
//      make([]T, len, cap)
//
// make creates an unnamed array variable and return a slice of it; the array is
// accessible only through the returned slice. This is useful when number of
// element is known.
g := make([]int, 3, 5) // make a []int slice with 3 length(zeroed) and 5 capacity

// Zero Value.

// The zero value of slice is nil
var s []int      // len(s) == 0, s == nil
s = nil          // len(s) == 0, s == nil
s = []int(nil)   // len(s) == 0, s == nil
s = []int{}      // len(s) == 0, s != nil

// Obtain length & capacity
len(a)
cap(a)

// Extending Slices.

// To increase the capacity of a slice, we must create a new, larger slice and
// copy the contents of the original slice into it.
//
// copy() supports copying between slices of different lengths, it will copy
// only up to the smaller number of elements. In addition, copy can handle
// source and destination slices that share the same underlying array, handling
// overlapping slices correctly.
t := make([]byte, len(s), (cap(s)+1)*2)
copy(t, s) // copy(dest, source)
s = t

// append() will grow a slice if a greater capacity is needed.
//
// If underlying array is too small, append WILL REALLOCATE a new underlying
// array, the returned slice will point to the newly allocated array.
//
// Hence we must not assume that operations on elements of the old slice will
// (or will not) be reflected in the new slice. As a result, it's usual to
// assign the result of a call to append to the same slice variable whose value
// we passed to append.
a = append(a, 1)
// to append another slice, use "..."
a := []string{"John", "Paul"}
b := []string{"George", "Ringo"}
a = append(a, b...) // equivalent to "append(a, b[0], b[1])"
```

Since a slice contains a pointer to an element of an array, passing a slice to a
function permits the function to modify the underlying array elements. In other
words, copying a slice creates an *alias* for the underlying array.

It does not store any data, it just describes a section of an underlying array.
Changing the elements of a slice modifies the corresponding elements of its
underlying array. Other slices that share the same underlying array will see
those changes.

```go
names := [4]string{
    "John",
    "Paul",
    "George",
    "Ringo",
}
fmt.Println(names)

a := names[0:2]
b := names[1:3]
fmt.Println(a, b)

b[0] = "XXX"
fmt.Println(a, b)
fmt.Println(names)

// Output:
// [John Paul George Ringo]
// [John Paul] [Paul George]
// [John XXX] [XXX George]
// [John XXX George Ringo]
```

Slices are **not comparable. The only legal slice comparison is against nil**.
The standard library provides "bytes.Equal" function for comparing two
`[]bytes`, but for other types of slice, we must do the comparison ourselves.

Why we don't allow slice comparison?

There are two reasons why deep equivalence is problematic for slice:

- First, unlike array elements, the elements of a slice are indirect, making it
  **possible for a slice to contain itself**. Although there are ways to deal with
  such cases, none is simple, efficient, and most importantly, obvious.

- Second, because slice elements are indirect, **a fixed slice value may contain
  different elements at different times** as the contents of the underlying array
  are modified. Because a hash table such as Go's map type makes only shallow
  copies of its keys, it requires that equality for each key remain the same
  throughout the lifetime of the hash table. **Deep equivalence would thus make
  slices unsuitable for use as map keys**. For reference types like pointers and
  channels, the == operator tests *reference identify*, that is, whether the
  two entities refer to the same thing. An analogous "shallow" equality test
  for slice could be useful, and it would solve the problem with maps, but the
  inconsistent treatment of slices and arrays by the == operator would be
  confusing. The safest choice is to disallow slice comparisons altogether.

### Trap: Re-slicing Cause Big Data Unreclaimable

See <https://stackoverflow.com/questions/55045402/>

```go
var digitRegexp = regexp.MustCompile("[0-9]+")

func FindDigits(filename string) []byte {
    b, _ := ioutil.ReadFile(filename)
    return digitRegexp.Find(b)
}
```

In the above code, the returned `[]byte` points into an array containing the
entire file, Since the slice reference the original array, as long as the slice
is kept around the garbage collector can't release the array.

Workaround: copy the interesting data to a new slice before return. like

```go
func FindDigits(filename string) []byte {
    //...
    return append([]byte{}, b...)
}
```

Similar issue can happen when deleting from slice containing pointers, because
the deleted element is still referenced by underlying array, this prevent the
element from garbage collection. To fix this, we can set the pointer to nil
before delete it from slice.

## Maps

In Go, a map is a reference to a "hash table", a data structure created by make,
and a map type is wirtten `map[K][V]`, where K and V are the types of its keys
and values.

**Key can be of any type for which the equality operator is defined, such as
integers, floating point and complex numbers, strings, pointers, interfaces
(as long as the dynamic type supports equality), structs and arrays. Though
floating-point numbers are comparable, it's a bad idea to compare floats for
equality.**

The value type of a map can itself be a composite type, such as a map or slice.

**Slices cannot be used as map keys**, because equality is not defined on them.

Map's zero value is `nil`, that is, a reference to no hash table at all. A nil
map has no keys, nor can keys be added.

When a map is passed to a function, the function receives a "copy of the
reference", so any changes makes to the underlying data structure is visible
through the caller's map reference too.

```go
// Creating Maps.

// 1. With make
ages := make(map[string]int)

// 2. With map literals
ages := map[string]int{
    "alice": 31,
    "charlie": 34, // NOTE the tailing comma is required
}

// Lookup Maps.

// Accessing a map element by subscripting always yields a value. If the key is
// not present, you get the zero value for the element type. To distinguish
// between a nonexistent element and an element that happends to have the value
// zero, use the "comma ok" idiom:
ages["alice"] = 32
if age, ok := ages["bob"]; !ok { /* ... */ }

// All of these operations are safe even if the element isn't in the map; a map
// lookup using a key that isn't present returns the zero value for its type.
ages["bob"] = ages["bob"] + 1

// ++, --, +=, -= also works for map elements
ages["bob"] += 1
ages["bob"]++

// But map element is not a variable, we cannot take its address.
//
// One reason of this is that growing a map might cause rehashing of existing
// elements into new storage location, thus potentially invalidating the address
_ = &ages["bob"]    // compile error: cannot take address of map element

// Deleting a Map.
delete(ages, "alice")

// Looping a Map.

// The order of map iteration is unspecified.
//
// To enumerate the key/value pairs in order, we must sort the keys explicitly.
// This is a common pattern:
names := make([]string, 0, len(ages)) // since we know the final size of names,
                                      // it is more efficient to allocate an array
                                      // of the required size up front.
for names := range ages {
    names = append(names, name)
}
sort.Strings(names) // import "sort"
for _, name := range names {
    fmt.Printf("%s\t%d\n", name, ages[name])
}

// Zero Value of Maps.

// Most operations on maps, including lookup, delete, len, and range loops, are
// safe to perform on a nil map reference, since it behaves like an empty map.
//
// But storing to a nil map cause a panic. You must allocate (using make) the map
// before you can store into it.
var ages map[string]int
fmt.Println(ages == nil)    // "true"
fmt.Println(len(ages) == 0) // "true"
ages["carol"] = 21          // panic: assignment to entry in nil map

// Since keys of map are distince, we can implement a set using map
//
// Go programmers often describe a map used in this fashion as a "set of
// strings" without further ado. but beaware, not all map[string]bool values
// are simple sets; some may contain both true and false values.
seen := make(map[string]bool)

// As with slice, maps cannot be compared to each other; the only legal
// comparison is with nil. To test whether two maps contain the same keys and
// the same values, we must write a loop:
func equal(x, y map[string]int) bool {
    if len(x) != len(y) {
        return false
    }
    for k, xv := range x {
        if yv, ok := y[k]; !ok || yv != xv {
            return false
        }
    }
    return true
}

// To use a slice as key, we need a helper hash function
var m = make(map[string]int)
func k(list []string) string    { return fmt.Sprintf("%q", list) }
func Add(list []string)         { m[k(list)]++ }
func Count(list []string) int   { return m[k(list)]}
```

## Struct

A struct is an aggregate data type that groups together zero or more named
values of arbitrary types as a single entity. Each value is called a "field".

The zero value for a struct is composed of the zero value of each of its fields.

For efficiency, large struct types are usually passed to or returned from
functions indirectly using a pointer, and this is required if the function must
modify its argument.

If all the fields of a struct are comparable, the struct itself is comparable.
Comparable struct types may be used as the key type of a map.

```go
// Declaration.

// NOTE: Field order is significant to type identity.
type Employee struct {
    // the name of a struct field is exported if it begins with a capital letter.
    // A struct type may contain a mixture of exported and unexported fields.
    //
    // NOTE: a struct can have both exported field "Name" and unexported
    // field "name"
    ID              int
    // consecutive fields of the same type may be combined.
    // typically we only combine the declarations of related fields.
    Name, Address   string
    DoB             time.Time
    Position        string
    Salary          int
    ManagerID       int
}

var dilbert Employee

// A named struct type S can't declare a field of the same type S: an aggregate
// value cannot contain itself. But S may declare a field of the pointer
// type *S, which lets use create recursive data structure.
type tree struct {
    value       int
    left, right *tree
}

// The struct type with no fields is called the empty struct, written:
//
//      struct{}
//
// It has size zero and carries no information but may be useful nonetheless.
// Some go programmers use it instead of bool as the value type of a map that
// represent a set, to emphasize that only the keys are significant. We
// generally avoid it.

// Struct Literal.

// The two form below cannot be mixed.

// 1. By specify Every field.
//
//    It burden the writer with remembering exactly what the fields are, and it
//    makes the code fragile should the set of fields later grow or be reordered.
//
//    Used only within the package that defines the struct type, or with smaller
//    struct types for which there is an obvious field ordering convention, like
//    color.RGBA{red, green, blue, alpha}
type Point struct{ X, Y int }
p := Point{1, 2}
pp := &Point{1, 2} // obtain its address, creating pointer to struct.

// 2. By listing some or all of the field.
//
//    If the field is omitted, it is set to the zero value for its type.
//    Because names are provided, the order of fields doesn't matter.
anim := gif.GIF{LoopCount: nframes}

// Accessing Fields.

// 1. Using dot notation
dilbert.Salary -= 5000

// 2. Or through a pointer
position := &dilbert.Position
*position = "Senior " + *position

// Dot notation also work with a pointer to a struct
var employeeOfTheMonth *Employee = &dilbert
employeeOfTheMonth.Position += " (proactive team player)"
// Same as
//      (*employeeOfTheMonth).Position += " (proactive team player)"

// Anonymous Struct.

var sample struct {
    field string
    a, b int
}
sample.field = "hello"
sample.a = 9

// or
sample := struct {
    field string
    a, b int
}{
    "hello",
    1, 2,
}
```

### Struct Embedding

Go's unusual *struct embedding* mechanism lets us use one named struct type as
an "anonymous filed" of another struct type, providing a convenient syntactic
shortcut so that a simple dot expression like "x.f" can stand for a chain of
fields like "x.d.e.f".

```go
// The normal verbose way
type Point struct {
    X, Y int
}

type Circle struct {
    Center Point
    Radius int
}

type Wheel struct {
    Circle Circle
    Spokes int
}

var w Wheel
w.Circle.Center.X = 8 // w.X would be error
w.Spokes = 20

// Go lets use declare a field with a type but no name; such fields are called
// "anonymous fields". The type of the field must be a named type or pointer to
// a named type.
type Circle struct {
    Point       // anonymous field. Point is ``embedded'' within Circle
    Radius int
}

type Wheel struct {
    Circle      // anonymous field. Circle is ``embedded'' within Wheel
    Spokes int
}

var w Wheel
w.X = 8
w.Radius = 5
w.Spokes = 20

// The verbose way is still valid. The field Circle and Point do have names --
// that of the named type -- but those names are optional in dot expression. We
// may omit any or all of the anonymous fields when selecting their subfields.
w.Circle.Center.X = 8

// Unfortunately, there's no corresponding shorthand for the struct literal.
w = Wheel{8, 8, 5, 20}                       // compile error: unknown fields
w = Wheel{X: 8, Y: 8, Radius: 5, Spokes: 20} // compile error: unknown fields

// We MUST use one of the two forms below.
w = Wheel{Circle{Point{8, 8}, 5}, 20}
w = Wheel{
    Circle: Circle{
        Point: Point{X: 8, Y: 8},
        Radius: 5,
    },
    Spokes: 20,
}

// Because anonymous fields do have implicit names, you can't have two anonymous
// fields of the same type since their names would conflict. And because the
// name of the field is implicitly determined by its type, so too is the
// visibility of the field.

// Had it been unexported (point and circle). we could still use the shorthand
// form, but the explicit long form would be forbidden outside the declaring
// package, because circle and point would be inaccessible.
```

## JSON

Converting a Go data structure to JSON is called *marshaling*. The inversion is
called *unmarshaling*. Only exported fields are marshaled.

A *field tag* is a string of metadata associated at compile time with the field
of a struct. A field tag may be any literal string, but it is conventionally
interpreted as a space-separated list of key:"value" pairs. The json key
controls the behavior of the encoding/json package, and other encoding/*
packages follow this convention.

The tag "omitempty" indicates that no JSON output should be produced if the
field has the zero value or is otherwise empty.

## Text and HTML Templates

A *template* is a string of file containing one or more portions enclosed in
double braces, `{{...}}`, called *actions*. Each action contains an expression in
the template language, a simple but powerful notion for printing values,
selecting struct fields, calling functions and methods, expressing control flow
such as if-else statements and range loops, and instantiating other templates.

"html/template" package use the same API and expression language as "text/template"
but adds features for automatic and context-appropriate escaping of strings
appearing within HTML, Javascript, CSS, or URLs.

# Declaration

See https://blog.golang.org/gos-declaration-syntax

    var name type = expression

Either the type or the = expression part may be omitted, but not both. if the
type if omitted, it is determined by the initializer expression. If the
expression is omitted, the initial value is the zero value for the type:

    zero value      type
    ---------------------------------------------------------------------------
    0               numbers
    false           booleans
    ""              strings
    nil             interface and reference types (slice, pointer, map, chan, func)
    zero elem/field aggregate type like array or struct

In Go, there is **no uninitialized variable**.

NOTE: := is a declaration, whereas = is an assignment. A multi variable
declaration should not be confused with a tuple assignment.

```go
package main

import "fmt"

// package level variable are initialized before main begins.
var c, python, java bool

func main() {
    // local variables are initialized as their declarations are encountered
    // during function execution.
    var i int
    var j, k int = 1, 2 // with initializer. multiple variables in single declaration.

    // initializers may be literal values or arbitrary expressions. declarations
    // with multiple initializer expressions should be used only when they help
    // readability, such as for short and natural groupings like the
    // initialization part of a for loop.

    // NOTE: short assignment is only availabe in function.
    // as with var declarations, multiple variables may be declared and initialized
    // in the same short variable declaration.

    // convention to declare and init a float
    z := 1.0 // .0
    m, n := 3, 2

    f = float64(j) // type conversion: `Type(var)`, must be explicit

    // In a := declaration a variable v may appear even if it has already
    // been declared, provided:
    //
    // - this declaration is in the same scope as the existing declaration of v
    //   (if v is already declared in an outer scope, the declaration will
    //   create a new variable).
    // - the corresponding value in the initialization is assignable to v, and
    // - there is at least one other variable that is created by the declaration.

    // block declaration
    var (
        // declaration without initalizer are assgiend zero value
        n bool    // bool: false
        o float32 // numeric: 0
        p string  // string: ""
    )

    fmt.Println(i, j, k, m, n, o, p, c, python, java)
}
```

## new()

Another way to create a variable is to use the built-in function new.

    new(T)

creates an "unnamed variable" of type T, initializes it to the zero value of T,
and returns its address, which is a value of type `*T`. Each call to new
returns a distinct variable with a *unique address*:

    p := new(int)   // p, of type *int, points to an unnamed int variable
    q := new(int)
    fmt.Println(p == q) // "false"

There is **one exception** to this rule: two variables whose type carries no
information and is therefore of size zero, such as struct{} or `[0]int`, may,
depending on the implementation, have the same address.

The new function is relatively rarely used because the most common unnamed
variables are of struct types, for which the struct literal syntax is more
flexible.

# Type Declarations

A type declaration defines a new "named type" that has the same underlying type
as an existing type. The named type provides a way to separate different and
perhaps incompatible uses of the underlying type so that they can't be mixed
unintentionally.

    type name underlying-type

Even though both have the same underlying type, they are **not the same type**,
so they cannot be compared or combined in arithmetic expression.

The "underlying type" of a named type determines its structure and
representation, and also the set of intrinsic operations it supports.
Comparison operators like == and < can also be used to compare a value of a
named type to another of the same type, or to a value of the underlying type.
But two values of different named types cannot be compared directly:

```go
type Celsius float64
type Fahrenheit float64
var c Celsius
var f Fahrenheit
fmt.Println(c == 0)             // "true"
fmt.Println(f >= 0)             // "true"
fmt.Println(c == f)             // compile error: type mismatch
fmt.Println(c == Celsius(f))    // "true"!
```

# Type Conversion

    T(x)

For every type T, there is a corresponding conversion operation T(x) that
converts the value x to type T.

A conversion from one type to another is allowed if:

- both have the same underlying type
- or both are unnamed pointer types that point to variables of the same
  underlying type

These conversions change the type but not the representation of the value. If x
is assignable to T, a conversion is permitted but is usually redundant.

Conversions are also allowed between numeric types, and between string and some
slice types. These conversions may change the representation of the value. For
example, converting a floating-point number to an integer discards any
fractional part, and converting a string to a `[]byte` slice allocates a copy
of the string data. In any case, a **conversion never fails at run time**.

See also #Type_Assertion, #Type_Switch.

It's an idiom in Go programs to convert the type of an expression to access a
different set of methods (See #Methods).

# Comparability

All values of basic type -- booleans, numbers and strings -- are comparable,
further more, integers, floating-point numbers, and strings are ordered by the
comparison operators. Note that x and y is "comparable" only means that we can
do x == y or x != y, but **not <, >, <=, >=**.

Comparison with NaN always yields false, except !=, which is always the negation
of ==.

Two complex numbers are equal if their real parts and imaginary parts are equal.

String comparison is done byte by byte, so the result is the natural
lexicographic ordering.

If an array's element type is comparable then the array type is comparable too.

Slice and maps are not comparable, except with nil.

# Lifetime, Escaping, Allocation

Compiler may choose to allocate local variables on **the heap or on the stack**.
this choice is NOT determined by whether var or new was used to declare the
variable.

```go
var global *int

func f() {
    var x int
    x = 1
    global = &x
}

func g() {
    y := new(int)
    *y = 1
}
```

Here, x must be heap-allocated because it is still reachable from the variable
global after f has returned, despite being declared as a local variable; we say
"x escapes from f". Conversely, when g returns, the variable `*y` becomes
unreachable and can be recycled. Since `*y` does not escape from g, it's safe
for the compiler to allocate `*y` on the stack, even though it was allocated
with new. It's good to keep in mind during performance optimization the notion
of escaping, since each variable that escapes requires an *extra memory allocation*.

# Scope

Don't confuse scope with lifetime. There is a lexical block for the entire
source code, called the "universe block"; Built-in types, functions, and
constants are in the universe block and can be referred to throughout the
entire program. Declaration outside any function, that is, at "package level",
can be referred to from any file in the same pacakge. Imported packages are
declared at the "file level", so they can be referred to from the same file,
but not from another file in the same package without another import. Many
declarations are "local", so they can be referred to only from within the same
function or perhaps just a part of it.

When compiler encounters a reference to a name, it looks for a declaration,
starting with the innermost enclosing lexical block and workin up to the
universe block. The inner declaration is said to "shadow or hide" the outer
one, making it inaccessible.

Short variable declarations demand an awareness of scope:

```go
var cwd string
func init() {
    // Since neither cwd nor err is declared in the init function's block,
    // the := statement declares both of them as local varaibles. The inner
    // declaration of cwd makes the outer one inaccessible, so the statement
    // does not update the package-level cwd variable as intended.
    cwd, err := os.Getwd()
}

// also NOTE: the scope of function parameters and return values is the same as
// the function body, even though they appear lexically outside the braces that
// enclose the body.
```

# Trap: Iteration Variable Capture

```go
var rmdirs []func()
for _, dir := range tempDirs() {
    os.MkdirAll(dir, 0755)
    rmdirs = append(rmdirs, func() {
        os.RemoveAll(dir) // NOTE: incorrect!
    })
}
```

In this code, the for loop introduces a new lexical block in which the variable
dir is declared. All function values created by this loop "capture" and share
the same variable -- an addressable storage location, not its value at the
particular moment. The value of dir is updated in successive iterations, so by
the time the cleanup functions are called, the dir variable has been updated
several times by the now-completed for loop. Thus dir holds the value from the
final iteration, and consequently all calls to os.RemoveAll will attempt to
remove the same directory.

The risk is not unique to range-base for loops:

```go
for i := 0; i < len(dirs); i++ {
    os.MkdirAll(dirs[i], 0755)
    rmdirs = append(rmdirs, func() {
        os.RemoveAll(dirs[i]) // NOTE: incorrect!
    })
}
```

This code suffers from the same problem due to unintended capture of the index
variable i.

This trap is most often encountered when using the `go` statement or with `defer`
since both may delay the execution of a function value until after the loop has
finished. But the problem is not inherent to go or defer.

Workaround:

Introduce a inner variable, leading to odd-looking but crucial variable
declarations like this:

```go
for _, dir := range tempDirs() {
    dir := dir // declare inner dir, initialized to outer dir
    // ...
}
```

It's also good practice to assign the element to a variable during iteration.
It's easier to read in large function and nested loops.

```go
arr := [...]int{1, 2, 3}
for i := 0; i < len(arr); i++ {
    item := arr[i]
    fmt.Println(item)
}
```

# Assignment

The value held by a variable is updated by an assignment statement.

    x = 1
    *p = true
    person.name = "bob"
    count[x] = count[x] * scale

Numeric variables can also be incremented and decremented by ++ and -- statements.

    v := 1
    v++     // same as v = v + 1
    v--     // same as v = v - 1

"Tuple assignment" allows several variables to be assigned at once. All of the
right-hand side expression are evaluated before any of the variables are
updated, making this form most useful when some of the variables appear on
both sides of the assignment, for example when swapping:

    x, y = y, x
    a[i], a[j] = a[j], a[i]

Avoid tuple form if the expressions are complex.

# Assignability

Assignment also occurs implicitly when:

- function call assigns the argument values to the corresponding parameter variables
- a return statement assigns the return operands to the corresponding result variables
- a literal expression for a composite type such assigns each element

Assignability rule:

- types must exactly match
- nil may be assigned to any variable of interface or reference type
- constants have more flexible rules

Go assignment between items of different type requires an explicit conversion.

# Constant

Constants are *created at compile time*, even when defined as locals in functions,
and can only be numbers, characters (runes), strings or booleans. The
*underlying type of every constant is a basic type*: boolean, string, or number,
including named basic types like time.Duration.

The expressions that define them must be constant expressions.

A constant declaration may specify a type as well as a value, but in the absence
of an explicit type, the type is inferred from the expression on the right.

```go
const pi = 3.14159

// When declared as a group, right-hand side expression may be omitted for all
// but the first of the group, implying that the previous expression and its
// type should be used agian.
const (
    a = 1
    b
    c = 2
)

// In a const declaration, the constant generator iota's value begins at zero
// and increments by one for each item in the sequence.
const (
    _ = 1 << (10 * iota)
    KiB // 1024
    MiB // 1048576
    GiB // 1073741824
    TiB // 109951162776                 (exceeds 1 << 32)
    PiB // 1125899906842624
    EiB // 1152921504606846976
    ZiB // 1180591620717411303424       (exceeds 1 << 64)
    YiB // 1208925819614629174706176
)
// The iota mechanism has its limits. It's not possible to generate the more
// familiar powers of 1000 (KB, MB, and so on) because there is no
// exponentiation operator
```

Many computations on constants can be completely evaluated at compile time, and
enabling other compiler optimizations. Errorrs can be reported at compile time
when their operands are constants.

The results of all arithmetic, logical, and comparison operations applied to
constant operands are themselves constants, as are the results of conversions
and calls to certain built-in functions such as len, cap, real, imag, complex,
and unsafe.Sizeof.

Since their values are known to the compiler, constant expressions **may appear
in types**, specifically as the length of an array type:

```go
const IPv4Len = 4

func parseIPv4(s string) IP {
    var p [IPv4Len]byte
}
```

The compiler represents these "uncommitted constants" with much greater numeric
precision than values of basic types, and arithmetic on them is more precise
than machine arithmetic; you may assume *at least 256 bits of precision*.

There are six flavors of these "uncommitted constants".

For literal, syntax determines flavor. For example:

    literal                 flavor
    ---------------------------------------------------
    0                       untyped integer
    0.0                     untyped floating-point
    0i                      untyped complex
    '\u0000'                untyped rune
    true, false             untyped boolean
    "string"                untyped string

The choice of literal may affect the result of a constant divison expression:

```go
var f float64 = 212
fmt.Println((f - 32) * 5 / 9)   // "100"; (f - 32) * 5 is a float64
fmt.Println(5 / 9 * (f - 32))   // "0"; 5/9 is an untyped integer, 0
fmt.Prinln(5.0 / 9.0 * (f - 32))// "100"; 5.0/9.0 is an untyped float
```

Only constant can be untyped:

```go
// Implicitly converted to the type of variable when assigning or in declaration
var f float64 = 3 + 0i  // untyped complex -> float64
f = 2                   // untyped integer -> float64
f = 1e123               // untyped floating-point -> float64
f = 'a'                 // untyped rune -> float64

// Explicitly converting
const (
    deadbeef = 0xdeadbeef // untyped int with value 3735928559
    a = uint32(deadbeef)  // uint32 with value 3735928559
    b = float32(deadbeef) // float32 with value 3735928576 (rounded up)
    c = float64(deadbeef) // float64 with value 3735928559 (exact)

    // Whether implicit or explicit, converting a constant requires the target
    // type can represent the original value. Rounding is allowed for real and
    // complex floating-point numbers
    d = int32(deadbeef)   // compile error: constant overflows int32
    e = float64(1e309)    // compile error: constant overflows float64
    f = uint(-1)          // compile error: constant underflows uint
)
```

By deferring this commitment, untyped constants not only retain their higher
precision until later, but they can participate in many more expressions than
committed constants without requiring conversions. For example:

```go
// math.Pi is a untyped constant defined in math package
var x float32 = math.Pi
var y float64 = math.Pi
var z complex128 = math.Pi

// If math.Pi had been commited to a specific type such as float64, the result
// would not be as precise, and type conversions would be required to use it when
// a float32 or complex128 value is wanted
//
//      var x float32 = float32(math.Pi)
//      ...
```

# For loop

Go has **only one looping construct**, the for loop.

```go
for i := 0; i < 10; i++ { } // init; condition; post.
                            // any of these can be omitted, variable in init is
                            // visible only in the scope of the for statement.
                            // no parentheses, always require braces.

// omit init and post, drop semicolon. you got a traditional "while" loop.
for i < 10 { }

// a traditional infinite loop
for { }
```

# If Else

```go
if x < 0 { } // like `for`, no parentheses, always require braces.

// can execute a short statement before condition.
// v is only visible inside if block.
if v := math.Pow(x, n); v < lim {
    // ...
} else { // v still available in `else`. visible until the end of the if.
    fmt.Printf("%g >= %g\n", v, lim)
}
```

# Switch

There are two form of switch:

1. expression switch, which compares value
2. type switch, which compare type. See #Type_Switch.

```go
// Go evaluate cases from top to bottom, stop when a case succeeds.

switch os := runtime.GOOS; os {
// cases need not be constants, values involved need not be integers.
// cases can be presented in comma-separated lists ("case list").
case "darwin", "macos":
    fmt.Println("OS X.")
// Go only runs the selected case, cases do not fall throught. hence no
// `break` is needed. But we can use `fallthrough` to override this.
case "linux":
    fmt.Println("Linux.")
// default case will run if none of the other cases match, it can be placed
// anywhere.
default:
    fmt.Printf("%s.\n", os)
}

// fallthough indicate that control should flow from the end of this clause to
// the "first statement" of the next clause.
switch 'a' {
case 'a', 'b':
    fmt.Println("is a or b")
    fallthrough
case 'A', 'B':
    fmt.Println("And is capital")
}
// Rusult:
// is a or b
// And is capital

// without a condition is the same as switch true, a clean way to write long
// if-then-else chains. ("tagless switch")
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

# Break, Continue

There is NO `break n` where n is a number in Go.

Statements may be labeled so that break and continue can refer to them.

# Pointer

A pointer value is the address of a variable, thus the location at which a value
is stored. Not every value has an address, but every variable does.

Variables are sometimes described as addressable values. Expressions that denote
variables are the only expressions to which the address-of operator & may be
applied. Hence the "addressable" operand of & is either

- a variable
- pointer indirection
- slice indexing operation
- a field selector of an addressable struct operand
- an array indexing operation of an addressable array

Like C:

- declaration use `*`: `var p *int`
- generation use `&`: `p = &i`
- dereferencing/indirecting use `*`: `*p = 21`

Unlike C: Go has no pointer arithmetic.

```go
p := &i         // point to i
fmt.Println(*p) // read i through the pointer
*p = 21         // set i through the pointer
fmt.Println(i)  // see the new value of i
```

It is perfectly safe for a function to return the address of a local variable.
It will remain in existence even after the call has retuned, and the pointer
will still refer to it. See #Escaping.

Aliasing.

Each time we take the address of a variable or copy a pointer, we create new
"aliases" or ways to identify the same variable. Pointer aliasing is useful
because it allows us to access a variable without using its name. **It's not just
pointers that create aliases; aliasing also occurs when we copy values of other
reference types like slices, maps, and channels, and even structs, arrays, and
interfaces that contain there types**.

# Range

Range can be used to iterate over a slice or map.

```go
for i, v := range pow { // i: index, v: copy of the element at index
    fmt.Printf("2**%d = %d\n", i, v)
}

for _, v := range pow {}    // use _ to ignore index
for i, _ := range a {}      // or value, same as
for i := range a {}         // NOTE: preferred, simplified range
for range a {}              // this is valid syntax
```

For strings, the range does more work for you, breaking out individual Unicode
code points by parsing the UTF-8. Erroneous encodings consume one byte and
produce the replacement rune U+FFFD.

```go
for pos, char := range "日本\x80語" { // \x80 is an illegal UTF-8 encoding
    fmt.Printf("character %#U starts at byte position %d\n", char, pos)
}
```

# Function

Functions are values too (first-class citizen). They can be passed around just
like other values.

Arguments are **passed by value**. When a function is called, a copy of each
argument value is assigned to the corresponding parameter variable, so the
function receive a copy, not the original; modifications to the copy do not
affect the caller. However, if the argument contains some kind of reference,
like a pointer, slice, map, function, or channel, then the caller may be
affected by any modifications the function makes to variables *indirectly*
referred to by the argument.

Multiple return values can be used to improve on a couple of clumsy idioms in C
programs, such as:

- in-band error returns such as -1 for EOF
- modifying an argument passed by address

Go has **no concept of default parameter values, nor any way to specify
arguments by name**.

Many programming language implementations use a fixed-size function call stack;
size from 64KB to 2MB are typical. Fixed-size stacks impose a limit on the
depth of recursion, so one must be careful to avoid a stack overflow when
traversing large data structures recursively; fixed-size stacks may even pose a
security risk.

In contrast, typical Go implementations use **variable-size stacks** that start
small and grow as needed up to a limit on the order of a gigabyte. This lets us
use recursion safely and without worrying about overflow.

```go
// Function Declaration

// A function declaration has a name, a list of parameters, and optional list of
// results, and a body.
//
//    func name(parameter-list) (result-list) {
//        body
//    }

// A sequence of parameters or results of the same type can be factored so that
// the type itself is written only once.
//
// If the function returns one unnamed result or no results at all, parentheses
// in result-list are optional and usually omitted.
func hypot(x, y float64) float64 {
    // A function that has a result list must end with a return statement unless
    // execution clearly cannot reach the end of the function, perhaps because
    // the function ends with a call to panic or an infinite for loop with no
    // break.
    return math.Sqrt(x*x + y*y)
}

// All of the below declaration is valid.

func add(x int, y int) int      { return x + y }

// in a function with named results, the operands of a return statement may be
// omitted. This is called a "bare return". bare returns can reduce code
// duplication, but they rarely make code easier to understand. they are best
// used sparingly.
func sub(x, y int) (z int)      { z = x - y; return }

// use _ to emphasize that a parameter is unused.
func first(x int, _ int) int    { return x }

func zero(int, int) int         { return 0 }

// a function without a body, indicating that the function is implemented in a
// language other than Go.
func Sin(x float64) float64 // implemented in assembly language

// can return any number of results
func swap(x, y string) (string, string) {
    return y, x
}

// main() is special, its where the execution begins in a main package.
func main() { }

// Function Type

// the type of a function is sometimes called its "signature". Two functions
// have the same type or signature if they have the same sequence of parameter
// types and the same sequence of result types. The name of parameters and
// results don't affect the type, nor does whether or not they were declared
// using the factored form.
fmt.Printf("%T\n", add)     // "func(int, int) int"

// Calling Functions

// the result of calling a multi-valued function is a tuple of values.
links, err := findLinks(url)    // findLinks return ([]string, error)
links, _ := findLinks(url)      // using _ to ignore one of the values.

// the result of a multi-valued call may itself be returned from a
// (multi-valued) calling function.
func findLinksLog(url string) ([]string, error) {
    log.Printf("findLinks %s", url)
    return findLinks(url)
}

// a multi-valued call may appear as the sole argument when calling a function
// of multiple parameters. Although rarely used in production code, this
// feature is sometimes convenient during debugging since it lets us print all
// the results of a call using a single statement.
log.Println(findLinks(url))

// Function Values

// functions are "first-class values" in Go: like other values, function values
// have types, and they may be assigned to variables or passed to or returned
// from functions. A function value may be called like any other function.

// the zero value for a function type is nil. Calling a nil function value
// causes a panic.
func square(n int) int      { return n * n }
func negative(n int) int    { return -n }
func product(m, n int) int  { return m * n }

f := square
fmt.Println(f(3))   // "9"
f := negative
fmt.Println(f(3))   // "-3"
fmt.Printf("%T\n", f)   // "func(int) int"

f = product         // compile error: can't assign f(int, int) in to f(int) int

// function values are not comparable, except be compared with nil. They can not
// be used as keys in a map.
var f func(int) int
if f != nil {
    f(3)
}

// function values let us parameterize our functions over not just data, but
// behavior too.
func add1(r rune) rune { return r + 1 }
fmt.Println(strings.Map(add1, "VMS"))   // "WNT"
```

## Function Value, Literal, Closure

NOTE: *Named functions* can be declared only at the package level, but we can
use a *function literal* to denote a function value within any expression. A
function literal is written like a function declaration, but without a name
following the func keyword. It is an expression, and its value is called an
*anonymous function*.

```go
strings.Map(func(r rune) rune { return r + 1 }, "VMS") // "WNT"
```

More importantly, function defined in this way have access to the entire lexical
environment. so the inner function can refer to variables from the enclosing
function. That is, function values are not just code but can have state. This
hidden variable references are why we classify functions as reference types and
why function values are not comparable.

Go programmer often use *closure* for function values. A closure is a function
value that references variables from outside its body. The function may access
and assign to the referenced variables; in this sense the function is "bound"
to the variables.

除闭包函数以引用方式对外部变量访问外, 其他赋值和函数传参都是以传值方式处理. See #Defer_Trap.

```go
func adder() func(int) int {
    // the adder function returns a closure. Each closure is bound to its own
    // sum variable.
    sum := 0
    return func(x int) int {
        sum += x    // access to entire lexical environment
        return sum
    }
}

func main() {
    pos, neg := adder(), adder()
    for i := 0; i < 10; i++ {
        fmt.Println(
            pos(i),
            neg(-2*i),
        )
    }
}

// OUTPUT:
// 0 0
// 1 -2
// 3 -6
// 6 -12
// 10 -20
// 15 -30
// 21 -42
// 28 -56
// 36 -72
// 45 -90

// WHY:
//              pos                    neg
//      i   x   sum_before  sum_after  x    sum_before sum_after
//      ----------------------------------------------------------
//      0   0   0           0          0    0           0
//      1   1   0           1          -2   0           -2
//      2   2   1           3          -4   -2          -6
//      3   3   3           6          -6   -6          -12
//      ...
```

## Recursion

Function may be *recursive*, that is, they may call themselves, either directly
or indirectly.

When an anonymous function requires recursion, we must first declare a variable,
and then assign the anonymous function to that variable. These two steps can
NOT be combined in one declaration, like:

```go
// WRONG!
visitAll := func(item []string) {
    // ...
    visitAll(m[item]) // compile error: undefined: visitAll
    // ...
}
```

The function literal would not be within the scope of the variable visitAll so
it would have no way to call itself recursively. So we must write like this:

```go
var visitAll func(items []string)
visitAll = func(items []string) {
    // ...
    visitAll(m[time])
    // ...
}
```

## Variadic Function

A "variadic function" is one that can be called with varying numbers of arguments.

```go
// Declare Variadic Function

// to declare a variadic function, the type of the final parameter is preceded
// by an ellipsis, "..."
func sum(vals ...int) int {
    total := 0
    // within the body, the type of vals is an []int slice
    for _, val := range vals {
        total += val
    }
    return total
}

// the interface{} type means this function can accept any values at all for its
// final arguments. See #Interface.
func errorf(linenum int, format string, args ...interface{}) {
    // ...
}

// Calling Variadic Function

// implicitly, the caller allocates an array, copies the arguments into it,
// and pass a slice of the entire array to the function.
fmt.Println(sum(1, 2, 3, 4)) // "10"

// if the arguments are already in a slice
values := []int{1, 2, 3, 4}
fmt.Println(sum(values...))

// Type of Variadic Function

// the type of a variadic function is different from the type of a function with
// an ordinary slice parameter.
func f(...int) {}
func g([]int)  {}
fmt.Printf("%T\n", f) // "func(...int)"
fmt.Printf("%T\n", g) // "func([]int)"
```

