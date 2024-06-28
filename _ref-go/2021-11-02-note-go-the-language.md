---
title: Note - Go, The Language
layout: post
category: notes
tags: [go]
excerpt: "Reading notes on Go language."
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

```go
type foo int
type bar int

m := make(map[interface{}]int)
// even foo and bar has same underlying type and value, but this is valid:
m[foo(1)] = 1
m[bar(1)] = 1
```

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
    1, 2,  // comma is required!
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
interpreted as a **space-separated list of key:"value" pairs**. The json key
controls the behavior of the encoding/json package, and other "encoding/..."
packages follow this convention.

The tag "omitempty" indicates that no JSON output should be produced if the
field has the zero value or is otherwise empty.

## Text and HTML Templates

{% raw %}

A *template* is a string of file containing one or more portions enclosed in
double braces, `{{...}}`, called *actions*. Each action contains an expression in
the template language, a simple but powerful notion for printing values,
selecting struct fields, calling functions and methods, expressing control flow
such as if-else statements and range loops, and instantiating other templates.

{% endraw %}


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

Go is lexically scoped using blocks. See go.ref.spec#scope.

Don't confuse scope with lifetime. There is a lexical block for the entire
source code, called the "universe block"; Built-in types, functions, and
constants are in the universe block and can be referred to throughout the
entire program. Declaration outside any function, that is, at **"package
level"**, can be referred to from any file in the same pacakge. Imported
packages are declared at the **"file level"**, so they can be referred to from
the same file, but not from another file in the same package without another
import. Many declarations are **"local"**, so they can be referred to only from
within the same function or perhaps just a part of it.

When compiler encounters a reference to a name, it looks for a declaration,
*starting with the innermost enclosing lexical block and workin up to the
universe block*. The inner declaration is said to "shadow or hide" the outer
one, making it inaccessible.

Also NOTE: the scope of *function parameters and return values is the same as the
function body*, even though they appear lexically outside the braces that
enclose the body.

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

A "break" statement terminates execution of the **innermost** "for", "switch",
or "select" statement within the same function. There is NO `break n` where n
is a number in Go, but statements may be labeled so that break and continue can
refer to them.

"continue" works similar.

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

## Declaration

A function declaration has a name, a list of parameters, and optional list of
results, and a body.

    func name(parameter-list) (result-list) {
        body
    }

```go
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

Named functions can be declared **only at the package level** (Go don't allow
nested function declarationi), but we can use a *function literal* to denote a
function value within any expression. A function literal is written like a
function declaration, but without a name following the func keyword. It is an
expression, and its value is called an *anonymous function*.

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

# Defer

See <https://blog.golang.org/defer-panic-and-recover>

Syntactically, a *defer statement* is an ordinary function or method call
prefixed by the keyword `defer`. The function and argument expressions are
**evaluated when the defer statement is executed, but the actual call is
deferred until the function that contains the defer statement has finished,
whether normally, by executing a return statement or falling off the end, or
abnormally, by panicking**.

```go
func trace(s string)   { fmt.Println("entering:", s) }
func untrace(s string) { fmt.Println("leaving:", s) }

// Use them like this:
func a() {
    trace("a")
    defer untrace("a")
    // do something....
}
```

Any number of calls may be deferred; they are executed in the reverse of the
order in which they were deferred. That is, in **last-in-first-out** order
(stacks).

Since the arguments to the deferred function (which include the receiver if the
function is a method) are evaluated when the **defer** executes, not when the
call executes, This means that a single deferred call site can defer multiple
function executions, like:

```go
for i := 0; i < 5; i++ {
    defer fmt.Printf("%d ", i)
}
```

Its most interesting and powerful applications come precisely from the fact that
it's not "block-based" but "function-based".

## Usage and Use Case

1. Go's garbage collector recycles unused memory, but do not assume it will
release unused operating system resources like open files and network
connections. They should be closed explicitly. A defer statement is often used
with "paired operation" like open and close, connect and disconnect, or lock
and unlock to ensure that resources are released in all cases, no matter how
complex the control flow. The right place for a defer statement that releases a
resource is immediately after the resource has been successfully acquired.

```go
// for network connections
func title(url string) error {
    resp, err := http.Get(url)
    if err != nil {
        return err
    }
    defer resp.Body.Close
    // ...
}

// for file operations
func ReadFile(filename string) ([]byte, error) {
    f, err := os.Open(filename)
    if err != nil {
        return nil, err
    }
    defer f.Close()
    return ReadAll(f)
}

// for mutext lock and unlock
var mu sync.Mutex
var m = make(map[string]int)
func lookup(key string) int {
    mu.Lock()
    defer mu.Unlock()
    return m[key]
}
```

2. The defer statement can also be used to pair "on entry" and "on exit" actions
when debugging a complex function.

```go
func bigSlowOperation() {
    defer trace("bigSlowOperation")() // don't forget the extra parentheses, or
                                      // the "on-entry" action will happend on exit
                                      // and the "on-exit" action won't happend
                                      // at all!
    time.Sleep(10 * time.Second)      // simulate slow operation by sleeping
}

func trace(msg string) func() {
    // do "on-entry" action
    start := time.Now()
    log.Printf("enter %s", msg)
    // return a func to do the "on-exit" action, can even pass values like "start"
    // between the two actions
    return func() { log.Printf("exit %s (%s)", msg, time.Since(start)) }
}
```

3. Deferred functions run *after* return statements have updated the function's
result variables. Because an *anonymous function* can access its enclosing
function's variable, including named results, and deferred anonymous function
can observe the function's results.

```go
func double(x int) (result int) {
    // Note we have to use anonymous function / closure here for this to work.
    // If instead we do it like:
    //
    //      defer fmt.Printf("double(%d) = %d\n", x, result)
    //
    // "result" would be 0 when the defer statement is evaluated.
    defer func() { fmt.Printf("double(%d) = %d\n", x, result) }()
    return x + x
}
```

4. A deferred anonymous function can even change the values that the enclosing
function returns to its caller.

```go
func triple(x int) (result int) {
    defer func() { result += x }()
    return double(x)
}
```

## Traps and Wordaround

1. Because deferred functions aren't executed until the very end of a function's
execution, a defer statement in a loop deserves extra scrutiny. The code below
could run out of file descriptors since no file will be closed until all files
have been processed:

```go
for _, filename := range filenames {
    f, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer f.Close() // NOTE: risky; could run out of file descriptors
    // ...process f...
}

// Workaround: move the loop body, including the defer statement, into another
// function that is called on each iteration
for _, filename := range filenames {
    if err := doFile(filename); err != nil {
        return err
    }
}
func doFile(filename string) error {
    f, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer f.Close()
    // ...process f...
}
```

2. Derfering a Close operation after os.Create would be subtly wrong because
os.Create opens a file for *writing*, creating it as needed. On many file
systems, notably NFS, write errors are not reported immediately but may be
postponed until the file is closed. Failure to check the result of the close
operation could cause serious data loss to go unnoticed.

```go
// Fetch downloads the URL and returns the name and length of the local file.
func fetch(url string) (filename string, n int64, err error) {
    resp, err := http.Get(url)
    if err != nil {
        return "", 0, err
    }
    defer resp.Body.Close()

    local := path.Base(resp.Request.URL.Path)
    f, err := os.Create(local)
    if err != nil {
        return "", 0, err
    }
    defer f.Close() // NOTE: risky; write errors may be postpond until file closed
                    // failure of checking close error could cause data loss
    n, err = io.Copy(f, resp.Body)
    if err != nil {
        return "", 0, err
    }
    return local, n, err
}

// Workaround
func fetch(url string) (filename string, n int64, err error) {
    // ...
    f, err := os.Create(local)
    if err != nil {
        return "", 0, err
    }
    n, err = io.Copy(f, resp.Body)
    // Check f.Close error. But if both io.Copy and f.Close fail, we should
    // prefer to report the error from io.Copy since it occured first and
    // is more likely to tell use the root cause.
    if closeErr := f.Close(); err == nil {
        err = closeErr
    }
    return local, n, err
}
```

# Errors

See

* https://go.dev/blog/error-handling-and-go
* https://go.dev/blog/go1.13-errors
* https://go.dev/blog/errors-are-values
* go.ref.pkg#wrap,unwrap,is,as.

A function for which failure is an expected behavior returns an additional
result, conventionally the last one. If the failure has only one possible
cause, the result is a boolean, usually called ok. More often, and especially
for I/O, the failure may have a variety of causes for which the caller will
need an explanation. In such cases, the type of the additional result
is *error*.

Usually when a function returns a non-nil error, its other results are undefined
and should be ignored. However, a few functions may return partial results in
error cases.

Although Go does have an exception mechanism of sorts, it is used only for truly
unexpected errors that indicate a bug, not the routine errors that a robust
program should be built to expect.

The reason for this design is that exceptions tend to entangle the description
of an error with the control flow required to handle it, often leading to an
undesirable outcome: routine errors are reported to the end user in the form of
an incomprehensible stack trace, full of information about the structure of the
programe but lacking intelligible context about what went wrong.

By contrast, Go programs use ordinary control-flow mechanism like if and return
to respond to errors. This style undeniably demands that more attention be paid
to error-handling logic, but that is precisely the point.

## The error Interface

The 'error' type is a interface type, predeclared in universe block:

    type error interface {
        Error() string
    }

The most commonly-used implementation is the "errors" package's errorString Type:

```go
// The underlying type of errorString is a struct, not a string, to protect its
// representation from inadvertent update.
type errorString struct {
    s string
}

// The reason that the pointer type *errorString, not errorString alone,
// satisfies the error interface is so that every call to New allocates a
// distinct error instance that is equal to no other. We would not want a
// distinguished error such as io.EOF to compare equal to one that merely
// happene d to have the same message .
func (e *errorString) Error() string {
    return e.s
}

// errors.New construct a new errorString
func New(text string) error {
    return &errorString{text}
}
```

Always implement errors as a receiver function, since this prevent problems if
errors is inspected or compared. @??

The fmt package formats error value by calling its Error(). fmt.Errorf() formats
a string and returns it as an error created by errors.New().

Comparing To Sentinel Error

1. errString sentinel, checked with ==

```go
var ErrNotFound = errors.New("not found")

if err == ErrNotFound {
}
```

2. typed sentinel, checked with type assertion

```go
type NotFoundError struct {
    Name string
}

func (e *NotFoundError) Error() string { return e.Name + ": not found" }

if e, ok := err.(*NotFoundError); ok {
    // e.Name wasn't found
}
```

Wrap, Unwrap, %w

1. wrap by embedding, unwrap by type assertion

```go
type QueryError struct {
    Query string
    Err   error // embed
}

// client code:
if e, ok := err.(*QueryError); ok && e.Err == ErrPermission {
    // query failed because of a permission problem
}
```

2. Wrap by embedding, unwrap by Unwrap

The result of unwrapping an error may itself have an Unwrap method; we call the
sequence of errors produced by repeated unwrapping the "error chain".

```go
func (e *QueryError) Unwrap() error { return e.Err }
```

3. Wrap by %w

fmt.Errorf will have an Unwrap method returning the argument of %w, which must
be an error. wrapping with %w make it also available to errors.Is and
errors.As.

```go
if err != nil {
    return fmt.Errorf("decompress %v: %w", name, err)
}
```

Is, As

In the simplest case, the errors.Is function behaves like a comparison to a
sentinel error, and the errors.As function behaves like a type assertion. When
operating on wrapped errors, however, these functions **consider all the errors
in a chain**.

```go
// Similar to:
//  if err == ErrNotFound { … }
if errors.Is(err, ErrNotFound) {
    // something wasn't found
}

// Similar to:
//   if e, ok := err.(*QueryError); ok { … }
var e *QueryError
// Note: *QueryError is the type of the error.
if errors.As(err, &e) {
    // err is a *QueryError, and e is set to the error's value
}
```

---

Usually fmt.Errorf is good enough. But since error is an interface, you can use
arbitrary data structures as error values, to allow callers to inspect the
details of the error.

1. Additional fields for caller to inspect/"unwrapping" with type assertion or
type switch.

```go
// package json
type SyntaxError struct {
    msg    string // description of error
    Offset int64  // error occurred after reading Offset bytes
}

// Offset field isn't even shown in default error formatting
func (e *SyntaxError) Error() string { return e.msg }
```

```go
// But caller can use it to add additional info to their error when needed, using
// type assertion.
if err := dec.Decode(&val); err != nil {
    if serr, ok := err.(*json.SyntaxError); ok {
        line, col := findLine(f, serr.Offset)
        return fmt.Errorf("%s:%d:%d: %v", f.Name(), line, col, err)
    }
    return err
}
```

2. Embed the underlying error, additional methods.

```go
// package net
type Error interface {
    error
    Timeout() bool   // Is the error a timeout?
    Temporary() bool // Is the error temporary?
}
```

```go
// Client code can distinguish transient errors from permanent ones, then decide
// what to do
if nerr, ok := err.(net.Error); ok && nerr.Temporary() {
    time.Sleep(1e9)
    continue
}
if err != nil {
    log.Fatal(err)
}
```

## Error Design

Two important thing when thinking about error in Go:

* errors are value, they can be programmed just as other values in Go.
* wrapping an error makes that error part of your API, as the wrapped error is
  exposed to your caller.

If you don't want to expose implementation details, or don't want to commit to
supporting that error as part of your API in the future, you shouln't wrap the
error.

The choice to wrap is about whether to give programs additional information so
they can make more informed decisions, or to withhold that information to
preserve an abstraction layer.

## Error Handling Strategies

1. **Propagate** the errors directly, so that a failure in a subroutine becomes a
failure of the calling routine.

```go
resp, error := http.Get(url)
if err != nil {
    return nil err
}
```

2. Construct a new error message that **include** missing pieces of information as
well as the underlying error, then propagate the errors.

```go
doc, err := html.Parse(resp.Body)
resp.Body.Close()
if err != nil {
    // Parse error lack information about URL
    return nil, fmt.Errorf("parsing %s as HTML: %v", url, err)
}
```

Because error messages are frequently chained together, **message strings should
not be capitalized and newlines should be avoided**.

When designing error messages, be deliberate, so that each one is a meaningful
description of the problem with sufficient and relevant detail, and be
consistent, so that errors returned by the same function or by a group of
functions in the same package are similar in form and can be dealt with in the
same way.

In general, the call f(x) is responsible for reporting the attempted operation f
and the argument value x as they relate to the context of the error. The caller
is responsible for adding further information that it has but the call f
(x) does not.

3. For errors that represent transient or unpredictable problems, it may make
sense to **retry** the failed operation, possibly with a delay between tries,
and perhaps with a limit on the number of attempts or the time spent trying
before giving up entirely.

```go
for tries := 0; time.Now().Before(deadline); tries++ {
    _, err := http.Head(url)
    // ...
    log.Printf("server not responding (%s); retrying...", err)
    time.Sleep(time.Second << uint(tries)) // exponential back-off
}
```

4. If progress is impossible, the caller can print the error and stop the
program gracefully, but this course of action should generally be reserved for
the main package of a program. Library functions should usually propagate
errors to the caller, unless the error is a sign of an internal
inconsistency -- that is, a bug.

```go
// (In function main)
if err := WaitForServer(url); err != nil {
    fmt.Fprintf(os.Stderr, "Site is down: %v\n", err)
    os.Exit(1)
    // or more conveniently
    log.Fatalf("Site is down: %v\n", err)
}
```

5. In some case, it's sufficient just to log the error and then continue,
perhaps with reduced functionality.

```go
if err := Ping(); err != nil {
    fmt.Fprintf(os.Stderr, "ping failed: %v; networking disabled\n")
    // or more conveniently:
    log.Printf("ping failed: %v; networking disabled", err)
}
```

6. In rare cases we can safely ignore an error entirely. Get into the habit of
considering errors after every function call, and when you deliberately ignore
one, document your intetion clearly.

```go
dir, err := ioutil.TempDir("", "scratch")
if err != nil {
    return fmt.Errorf("failed to create temp dir: %v", err)
}
// ...use temp dir...
or.RemoveAll(dir) // ignore errors; $TMPDIR is cleaned periodically
```

## Simplify Repetitive Error Hanlding

# Panic

Go's type system catches many mistakes at compile time, but others, like an out-
of-bounds array access or nil pointer dereference, require checks at run time.
When the Go runtime detects these mistakes, it "panics".

During a typical panic, normal execution stops, all deferred function calls in
that goroutine are executed, and the program crashes with a log message. This
log message includes the *panic value*, which is usually an error message of
some sort, and, for each goroutine, a *stack trace* showing the stack of
function calls that were active at the time of the panic.

Prior to Go 1.6, when a goroutine panicked, the runtime would print stack traces
of all the currently executing goroutines. Go 1.6 and greater greatly simplify
things by printing **only the stack trace of the panicking goroutine**, but we
can enable the old behavior by setting the `GOTRACEBACK` env to "all".

Not all panics **come from the runtime**. The built-in `panic` function may be
**called directly**; it accepts any value as an argument. A panic is often the
best thing to do when some "impossible" situation happens. for instance,
execution reaches a case that logically can't happen.

```go
switch s := suit(drawCard()); s {
case "Spades":      // ...
case "Hearts":      // ...
case "Diamonds":    // ...
case "Clubs":       // ...
default:
    panic(fmt.Sprintf("invalid suit %q", s)) // Joker?
}
```

Unless you can provid a more informative error message or detect an error
sooner, there is no point asserting a condition that the runtime will check for
you.

```go
func Reset(x *Buffer) {
    if x == nil {
        panic("x is nil") // unecessary!
    }
    x.elements = nil
}
```

Although Go's panic mechanism resembles exceptions in other languages, but since
a panic causes the program to crash, it is generally used for grave errors.
Diligent programmers consider any crash to be proof of a bug in their code. In
a robust program, "expected" errors, the kind that arise from incorrect input,
misconfiguration, or failing I/O, should be handled gracefully; they are best
dealt with using *error* values.

Go's panic mechanism runs the deferred function *before* it unwinds the stack,
so runtime.Stack can print information about functions that seem to have
already been "unwound".

> Wikipedia: Adding a subroutine's entry to the call stack is sometimes
  called "winding"; conversely, removing entries is "unwinding".

> Starting in Go 1.21, calling panic with a nil interface value or an untyped
  nil causes a run-time error (a different panic). The GODEBUG setting
  panicnil=1 disables the run-time error.

# Recover

Giving up is usually the right response to a panic, but not always. It might be
possible to recover in some way, or at least clean up the mess before quitting.

If the built-in recover function is called **within a deferred function** and
the function containing the defer statement is panicking, recover ends the
current state of panic and returns the panic value. The function that was
panicking does not continue where it left off but returns normally.

> Recover is **only useful inside deferred functions**. During normal execution, a
  call to recover will return nil and have no other effect.

```go
func Parse(input string) (s *Syntax, err error) {
    defer func() {
        // The deferred function recovers from a panic, using the panic value to
        // construct an error message.
        if p := recover(); p != nil {
            err = fmt.Errorf("internal error: %v", p)
        }
    }
}
```

Here is an example of how defer, panic, recover behave:

```go
func main() {
    f()
    fmt.Println("Returned normally from f.")
}

func f() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered in f", r)
        }
    }()
    fmt.Println("Calling g.")
    g(0)
    fmt.Println("Returned normally from g.")
}

func g(i int) {
    if i > 3 {
        fmt.Println("Panicking!")
        panic(fmt.Sprintf("%v", i))
    }
    defer fmt.Println("Defer in g", i)
    fmt.Println("Printing in g", i)
    g(i + 1)
}
// Output:
// Calling g.
// Printing in g 0
// Printing in g 1
// Printing in g 2
// Printing in g 3
// Panicking!
// Defer in g 3
// Defer in g 2
// Defer in g 1
// Defer in g 0
// Recovered in f 4
// Returned normally from f.
```

Recovering indiscriminately from panic is a dubious practice because the state
of a package's variable after a panic is rarely well defined or documented.
Perhaps a critical update to a data structure was incomplete, a file or network
connection was opened but not closed, or a lock was acquired but not released.
Furthermore, by replacing a crash with, say, a line in a log file, indiscriminate
recovery may cause bugs to go unnoticed.

Recovering from a panic within the same package can help simplify the handling
of complex or unexpected errors, but as a **general rule, you should not
attempt to recover from another pacakge's panic**. Public APIs should report
failures as errors. Similarly, you should not recover from a panic that may
pass through a function you do not maintain, such as a caller-provided
callback, since you cannot reason about its safety.

For all the above reasons, it's safest to recover selectively if at all. In
other words, recover only from panics that were intended to be recovered from,
which should be rare. **This intention can be encoded by using a distinct,
unexported type for the panic value and testing whether the value returned by
recover has that type. If so, we report the panic as an ordinary error; if
not, we call panic with the same value to resume the state of panic**.

```go
// soleTitle returns the text of the first non-empty title element in doc, and
// an error if there was not exactly one.
//
// This example does somewhat violate our advice about not using panics for
// "expected" errors, but it provides a compact illustration of the mechanics.
func soleTitle(doc *html.Node) (title string, err error) {
    type bailout struct{}

    defer func() {
        switch p := recover(); p {
        case nil:
            // no panic
        case bailout{}:
            // "expected" panic
            err = fmt.Errorf("multiple title elements")
        default:
            panic(p) // unexpected panic; carry on panicking
        }
    }()

    // Bail out of recursion if we find more than one non-empty title.
    forEachNode(doc, func(n *html.Node) {
        if n.Type == html.ElementNode && n.Data == "title" &&
            n.FirstChild != nil {
            if title != "" {
                panic(bailout{}) // multiple title elements
            }
            title = n.FirstChild.Data
        }
    }, nil)

    if title == "" {
        return "", fmt.Errorf("no title element")
    }
    return title, nil
}
```

For some conditions there is *no recovery*. Running out of memory, for example,
causes the Go runtime to terminate the program with a **fatal error**.

For a real-world example of panic and recover, see the json package from the Go
standard library. It encodes an interface with a set of recursive functions. If
an error occurs when traversing the value, panic is called to unwind the stack
to the top-level function call, which recovers from the panic and returns an
appropriate error value (see the ’error’ and ‘marshal’ methods of the
encodeState type in encode.go).

The convention in the Go libraries is that even when a package uses panic
internally, its external API still presents explicit error return values.

# Methods

Go does not have classes.

*Method* is a function with a special "receiver" argument.

Methods may be declared on any **named type** defined in the same package, so
long as its underlying type is **neither a pointer nor an interface**.

Receiver's type definition and method definition **must be in the same package**,
this means you can NOT define methods on built-in types.

Why doesn't Go support overloading of methods and operators?

Method dispatch is simplified if it doesn't need to do type matching as well.
Experience with other languages told us that having a variety of methods with
the same name but different signatures was occasionally useful but that it could
also be confusing and fragile in practice. Matching only by name and requiring
consistency in the types was a major simplifying decision in Go's type system.

Regarding operator overloading, it seems more a convenience than an absolute
requirement. Again, things are simpler without it.

```go
// Method Declarations

type Point struct { X, Y float64 }

// Traditional function
func Distance(p, q Point) float64 {
    return math.Hypot(q.X-p.X, q.Y-p.Y)
}

// Same thing, but as a method of the Point type.
//
// The Distance method operates on a *copy* of the original Point value.
//
// Since the reciever name will be frequently used, it's a good idea to choose
// something short and to be consistent across methods. A common choice is the
// first letter of the name.
func (p Point) Distance(q Point) float64 {
    return math.Hypot(q.X-p.X, q.Y-p.Y)
}

// Functions are called by values. the same goes for methods. so if we need to
// update the receiver variable, we attach them to the pointer type.
//
// The name of this method is (*Point).ScaleBy. the parentheses are necessary.
//
// NOTE: in realistic program, convention dictates that if any method of Point
// has a pointer receiver, then *all* methods of Point should have a pointer
// receiver, even ones that don't strictly need it. our example broke this rule
// to show both kinds of method.
//
// Methods on a given type should have either value or pointer receivers, but
// not a mixture of both.
func (p *Point) ScaleBy(factor float64) {
    p.X *= factor
    p.Y *= factor
}

// NOTE: method declarations are NOT permitted on named types that are
// themselves pointer types.
type P *int
func (P) f() { /* ... */ } // compile error: invalid receiver type

// Method Calls

// There is no conflict between the two declarations of functions called Distance.
// the first declares a package-level function called geometry.Distance. the second
// declares a method of the type Point, so its name is Point.Distance.
//
// But there IS conflict if we define two method with the same name, one on Point
// and another on *Point:
func (p *Point) Distance(q *Point) { } // error: method already declared.

// The expression p.Distance is called a "selector". selector are also used to
// select fields of struct types as in p.X.
//
// Since methods and fields inhabit the same name space, declaring a method X on
// the struct type Point would be ambiguous and the compiler will reject it.
p := Point{1, 2}
q := Point{4, 6}
fmt.Println(Distance(p, q))     // "5", function call
fmt.Println(p.Distance(q))      // "5", method call
```

## Value vs Pointer Receiver

The rule about pointers vs. values for receivers is that value methods can be
invoked on pointers and values, but pointer methods can only be invoked on
pointers.

This rule arises because pointer methods can modify the receiver; invoking them
on a value would cause the method to receive a copy of the value, so any
modifications would be discarded. The language therefore disallows this
mistake. There is a handy exception, though. When the value is **addressable**,
the language takes care of the common case of invoking a pointer method on a
value by inserting the address operator automatically.

```go
// The (*Point).ScaleBy method can be called by providing a *Point receiver, like:
r := &Point{1, 2}
r.ScaleBy(2)
// or
p := Point{1, 2}
pptr := &p
pptr.ScaleBy(2)
// or
p := Point{1, 2}
(&p).ScaleBy(2)

// The last two are ungainly, so Go helps us here. if the receiver p is
// a *variable* of type Point but the method requires a *Point receiver, we can
// use this shorthand:
p.ScaleBy(2)
// The compiler will perform an implicit &p on the variable.
//
// this works only for variables, including struct fields like p.X and array
// or slice elements like. we cannot call a *Point method on a non-addressable
// Point receiver, because there is no way to obtain the address of a temporary
// value
Point{1, 2}.ScaleBy(2) // compile error: can't take address of Point literal

// But we *can* call a Point method like Point.Distance with a *Point receiver,
// because there is a way to obtain the value from the address: just load the
// value pointed to by the receiver. the compiler inserts an implicit *
// operation for us. these two function calls are equivalent:
pptr.Distance(q)
(*pptr).Distance(q)

// In summary, a method call is valid in three cases:
//
// 1. either the receiver argument has the same type as the receiver parameter
//
// 2. or the receiver argument is a variable of type T and the reciver parameter
// has type *T. compiler implicitly take the address of the variable
//
// 3. or the receiver argument has type *T and the receiver parameter has type
// T. compiler implicitly dereferences the receiver
```

If all the methods of a named type T have a receiver type of T itself(not `*T`),
it is safe to copy instances of that type; calling any of its methods
necessarily makes a copy. But **if any method has a pointer receiver, you
should avoid copying instances of T** because doing so may violate internal
invariants. For example, copying an instance of bytes.Buffer would cause the
original and the copy to alias the same underlying array of bytes. Subsequent
method calls would have unpredictable effects.

## Nil Receiver

Just as some function allow nil pointers as arguments, so do some methods for
their receiver, especially if nil is a meaningful zero value of the type, as
with maps and slices.

When you define a type whose methods allow nil as a receiver value, it's worth
pointing this out explicitly in its documentation comment.

```go
// An IntList is a linked list of integers.
// A nil *IntList represents the empty list.
type IntList struct {
    Value int
    Tail *IntList
}

// Sum returns the sum of the list elements.
func (list *IntList) Sum() int {
    if list == nil {
        return 0
    }
    return list.Value + list.Tail.Sum()
}
```

## Method Promotion with Struct Embedding

```go
// Embedding allows complex types with many methods to be built up by the
// *composition* of several fields.
type ColoredPoint struct {
    Point
    Color color.RGBA
}

red := color.RGBA{255, 0, 0, 255}
blue := color.RGBA{0, 0, 255, 255}
var p = ColoredPoint{Point{1, 1}, red}
var q = ColoredPoint{Point{5, 4}, blue}

// We can call methods of the embedded Point field using a receiver of type
// ColoredPoint. The methods of Point have been *promoted* to ColoredPoint.
fmt.Println(p.Distance(q.Point)) // "5"
p.ScaleBy(2)
q.ScaleBy(2)
fmt.Println(p.Distance(q.Point)) // "10"

// The type of an anonymous field may be a *pointer* to a named type, in which
// case fields and methods are promoted *indirectly* from the pointed-to
// object. This lets us share common structures and vary the relationships
// between objects dynamically.
func (p *Point) ScaleBy(factor float64) {
    p.X *= factor
    p.Y *= factor
}

p := ColoredPoint{&Point{1, 1}, red}
q := ColoredPoint{&Point{5, 4}, blue}
fmt.Println(p.Distance(*q.Point))   // "5"
q.Point = p.Point                   // p and q now share the same Point
p.ScaleBy(2)
fmt.Println(*p.Point, *q.Point)     // "{2, 2} {2, 2}"

// A struct type may have more than one anonymous field.
type ColoredPoint struct {
    Point
    color.RGBA
}
// When the compiler resolves a selector such as p.ScaleBy to a method, it first
// look for a directly declared method named ScaleBy, then for methods promoted
// once from ColoredPoint's embedded fields, then for methods promoted twice
// from embedded fields within Point and RGBA, and so on.
//
// The compiler reports an error if the selector was ambiguous because two
// methods were promoted from the same rank.
```

## Method for Unnamed Struct Type

Although **methods can be declared only on named types and pointers to them**,
but using embedding, It's possible and sometimes useful for *unnamed* struct
types to have methods too.

```go
// cache is a unnamed struct type, but have methods promoted from sync.Mutex.
var cache = struct {
    sync.Mutex
    mapping map[string]string
} {
    mapping: make(map[string]string),
}

func Lookup(key string) string {
    // the variable cache gives more expressive names to the variables related
    // to the cache, and because the sync.Mutex field is embedded within it,
    // its Lock and Unlock methods are promoted
    cache.Lock()
    v := cache.mapping[key]
    cache.Unlock()
    return v
}
```

## Method Value

The selector p.Distance yields a "method value", a *function* that binds a method
(Point.Distance) to a specific receiver value p.

```go
distanceFromP := p.Distance     // method value
fmt.Println(distanceFromP(q))   // "5"
```

Method values are useful when a pacakge's API calls for a function value, and
the client's desired behavior for that function is to call a method on a
specific receiver.

```go
type Rocket struct { /* ... */ }
func (r *Rocket) Launch() { /* ... */ }
r := new(Rocket)

// time.AfterFunc calls a function value after a specified delay.
//
// with function value
time.AfterFunc(10 * time.Second, func() { r.Launch() })
// with method value, shorter
time.AfterFunc(10 * time.Second, r.Launch)
```

## Method Expression

A "method expression" written `T.f` or `(*T).f` where T is a type, yields a
*function* value with a regular first parameter taking the place of the
receiver.

```go
distance := Point.Distance  // method expression
fmt.Println(distance(p, q)) // "5", p supplied as receiver
fmt.Printf("%T\n", distance)// "func(Point, Point) float64"

scale := (*Point).ScaleBy
scale(&p, 2)
fmt.Println(p)              // "{2 4}"
fmt.Printf("%T\n", scale)   // "func(*Point, float64)"
```

Method expression can be helpful when you need a value to represent a choice
among several methods belonging to the same type so that you can call the chosen
method with many different receiver.

```go
package geometry

type Path []Point

func (path Path) TranslateBy(offset Point, add bool) {
    // variable op represents either the addition or the subtraction method of
    // type Point will be called
    var op func(p, q Point) Point
    if add {
        op = Point.Add
    } else {
        op = Point.Sub
    }
    for i := range path {
        path[i] = op(path[i], offset)
    }
}
```

# Encapsulation

"Encapsulation" or "information hiding" provides three benefits:

* First, because clients cannot directly modify the objects' variables, one need
  inspect fewer statements to understand the possible values of those
  variables.
* Second, hiding implementation details prevents clients from depending on
  things that might change, which gives the designer greater freedom to evolve
  the implementation without breaking API compatibility.
* Thirdly and most importantly, it prevents clients from setting an objects'
  variables arbitrarily.

Go has **only one mechanism** to control the visibility of names: capitalized
identifier are exported from the package in which they are defined, and
uncapitalized names are not. The same mechanism that limits access to members
of package also limits access to the fields of a struct or the methods of a
type.

As a consequence, **to encapsulate an object, we must make it a struct**. Like:

```go
type IntSet struct {
    words []uint64
}
```

Although it is is essentially equivalent to `type IntSet []uint64`, but the later
would allow clients from other package to read and modify the slice directly.

Another consequence of this name-based mechanism is that the unit of
encapsulation is the package, not the type as in many other languages.

> When naming a getter method, we usually omit the Get prefix. This preference
  for brevity extends to all methods, not just field accessor, and to other
  redundant prefixes as well, such as Fetch, Find, and Lookup.

## When Not To Encapsulate

Encapsulation is not always desirable. By revealing its representation as an
int64 number of nanoseconds, time.Duration lets us use all the usual arithmetic
and comparison operations with duration, and even to define constants of this
type.

geometry.Path vs IntSet:

geometry.Path is *intrinsically* a sequence of points, no more and no less, and
we **don't foresee adding new fields to it, so it makes sense for it to
reveal** that Path is a slice. In contrast, and IntSet merely happens to be
represented as `[]uint64` slice. It could have been represented using `
[]uint`, or something completely different for sets that are sparse or very
small, and it might perhaps benefit from additional features like an extra
field to record the number of elements in the set. For these reason, it makes
sense for IntSet to be opaque.

# Interface

(@todo Need update due to generic features)

See: https://research.swtch.com/interfaces.

A "concrete type" specifies the exact **representation of its values** and
exposes the **intrinsic operations** of that representation. It may also
provide additional behaviors through its methods. When you have a value of a
concrete type, you know exactly what it *is* and what you can *do* with it.

An "interface type" is an abstract type. It doesn't expose the representation
or internal structure of its value, or the set of basic operations they
support; it **reveals only some of their methods**. When you have a value of an
interface type, you know nothing about what is *is*; you know only what i
can *do*, or more precisely, what behaviors are provided by its methods.

Interface types express generalizations or abstractions about the behaviors of
other types.

A type "satisfies" an interface if it possesses all the methods the interface
requires. Go programmers often say that a concrete type "is a" particular
interface type, meaning that is satisfies the interface.

What makes Go's interfaces so distinctive is that they are *satisfied
implicitly*. This design **lets you create new interfaces that are satisfied by
existing concrete types without changing the existing types**.

## Declaration

    InterfaceType  = "interface" "{" { InterfaceElem ";" } "}" .
    InterfaceElem  = MethodElem | TypeElem .
    MethodElem     = MethodName Signature .
    MethodName     = identifier .
    TypeElem       = TypeTerm { "|" TypeTerm } .
    TypeTerm       = Type | UnderlyingType .
    UnderlyingType = "~" Type .

An "interface type" defines a **type set**. A variable of interface type can
store a value of any type that is in the type set of the interface.

```go
// 1. "Basic Interfaces": a list of methods

// The order in which the methods appear is immaterial. All that matters is the
// set of methods.
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// 2. "Embedded Interfaces": a more general form of interface

// Interface types can be combined together, resembles struct embedding. This is
// called "embedding an interface".
type ReadWriter interface {
    Reader
    Writer
}

// Or even using a mixture of the two style
type ReadWriter interface {
    Read(p []byte) (n int, err error)
    Writer
}

// When embedding interfaces, methods with the same names must have identical
// signatures.

// ReadWriter's methods are Read, Write, and Close.
type ReadWriter interface {
    // NOTE: even though there are two Close one from Reader and one from Write,
    // this is legal if the two methods with the same names have identical
    // signatures.
    Reader // includes methods of Reader in ReadWriter's method set
    Writer // includes methods of Writer in ReadWriter's method set
}

type ReadCloser interface {
    Reader   // includes methods of Reader in ReadCloser's method set
    Close()  // illegal: signatures of Reader.Close and Close are different
}

// 3. "General Interfaces": the most general form. See #Generic_Type
```

## Assignment

See <https://stackoverflow.com/questions/44370277/>

The rules is simple: an expression may be assigned to an interface only if
its type satisfies the interface.

```go
var w io.Writer
w = os.Stdout       // OK: *os.File has Write method
w = time.Second     // compile error: time.Duration lacks Write method

// This rule applied even when the right-hand side is itself an interface.
var rw io.ReadWriter
w = rw              // OK: io.ReadWriter has Write method
```

Although it's legal to call a `*T` method on an argument of type T so long as
the argument is a variable, but this is mere syntactic sugar: **a value of
type T does not possess all the methods that a `*T` pointer does, and as a
result it might satisfy fewer interfaces**.

For example:

    var v interface{} = T{}
    var v interface{} = &T{}

The former is passing the struct/concrete type into the interface, while the
latter is passing a pointer to it instead. In the former case, only value
methods `func(t T) M()` can be used to fulfill the interface methods, while in
the later **both** value methods and pointer methods `func(t *T) M()` can be
used.

This is because when assinging value to a interface type, Go is storing
a **copy** of the original structure in the interface, pointer methods would
have unexpected effects, ie. unable to alter the original structure: A value
stored in an interface forces a copy that you *cannot then get a reference to*,
so pointer receivers cannot modify the original.

```go
type IntSet struct { /* ... */ }
func (*IntSet) String() string

var s IntSet
var _ fmt.Stringer = &s     // OK
var _ fmt.Stringer = s      // compile error: IntSet lacks String method

// Method call of Interface Type

// Only the methods revealed by the interface type may be called, even if the
// concrete type has others
os.Stdout.Write([]byte("hello")) // OK: *os.File has Write method

var w io.Writer
w = os.Stdout
w.Write([]byte("hello"))        // OK: io.Writer has Write method
w.Close()                       // compile error: io.Writer lacks Close method
                                // even *os.File has Close method, this still fail

// Empty Interface Type

// The type `interface{}`, which is called the *empty interface* type, is
// indispensable. Because the empty interface type places no demands on the
// types that satisfy it, we can assign *any* value to the empty interface.
var any interface{}
any = true
any = 12.34
any = "hello"
any = map[string]int{"one": 1}
any = new(bytes.Buffer)
```

Although interface satisfactions is implicit, but sometimes we it's useful to
document and assert the relationship at compile time. The idiomatic way to do
this is:

```go
// *bytes.Buffer must satisfy io.Writer
var _ io.Writer = (*bytes.Buffer)(nil)

// We use a explicit conversion to nil because we needn't allocate a new variable.
// We use _ because we never intended to use the variable.
```

Conceptually, a value of an interface type, or "interface value", has two
components, a concrete type and a value of that type. These are called the
interface's "dynamic type" and "dynamic value". In our conceptual model, a set
of values called *type descriptors* provide information about each type, such
as its name and methods. In an interface value, the type component is
represented by the appropriate type descriptor.

**A variable of interface type stores a pair: the concrete value assigned to the
variable, and that value's type descriptor**. To be more precise, the value is
the underlying concrete data item that implements the interface and the type
describes the full type of that item.

The zero value for an interface has both its type and value components set to
nil. An interface value is described as nil or non-nil based on its dynamic
type.

```go
// Initialized to nil interface value
var w io.Writer

// Calling any method of a nil interface value causes a panic.
w.Write([]byte("hello")) // panic: nil pointer dereference.

// This assignment involves an implicit conversion from a concrete type to an
// interface type, and is equivalent to the explicit conversion:
//
//      io.Writer(os.Stdout)
//
// A conversion of this kind, whether explicit or implicit, captures the type
// and the value of its operand. The interface value's dynamic type is the type
// descriptor for the pointer type *os.File, and its dynamic value holds
// a *copy* of os.Stdout, which is a pointer to the os.File variable
// representing the standard output of the process.
w = os.Stdout

// Calling the Write method on an interface value containing *os.File pointer
// cause the (*os.File).Write method to be called.
//
// In general, we cannot know at compile time what the dynamic type of an
// interface value will be, so call through an interface must use *dynamic
// dispatch*. Instead of a direct call, the compiler must generate code to
// obtain the address of the method named Write from the type descriptor, then
// make an indirect call to that address. The receiver argument for the call is
// a *copy* of the interface's dynamic value, os.Stdout. The effect is as if we
// had made this call directly:
//
//      os.Stdout.Write([]byte("hello")) // "hello"
//
w.Write([]byte("hello")) // "hello"

// The dynamic type is now *bytes.Buffer
w = new(bytes.Buffer)
// A call to Write uses the same mechanism as before
w.Write([]byte("hello"))    // (*bytes.Buffer).Write is called

// Reset both its components to nil
w = nil
```

## Comparison

Interface values may be compared using == and !=. Two interface values are equal
if both are nil, or if their dynamic types are identical and their dynamic
values are equal according to the usual behavior of == for that type. Because
interface values are comparable, they may be used as the keys of a map or as
the operand of a switch statement.

However, if two interface values are compared and have the same dynamic type,
but that type is not comparable (a slice, for instance), then the **comparison
fails with a panic**.

```go
var x interface{} = []int{1, 2, 3}
fmt.Println(x == x) // panic: comparing uncomparable type []int
```

When comparing interface values or aggregate types that contain interface
values, we must **be aware of the potential for a panic**. A similar risk
exists when using interfaces **as map keys or switch operands**.

Only compare interface values if you are certain that they contain dynamic
values of comparable types.

## Trap: Interface Containing a Nil Pointer Is Non-Nil

A nil interface value, which contains no value at all, is *not* the same as an
interface value containing a pointer that happens to be nil.

```go
// We might expect that changing debug to false would disable the collection of
// the output, but in fact it causes the program to panic during the out.Write
// call.
const debug = true

func main() {
    var buf *bytes.Buffer
    if debug {
        buf = new(byte.Buffer) // enable collection of output
    }
    f(buf) // NOTE: subtly incorrect!
    if debug {
        // ...use buf...
    }
}

func f(out io.Writer) {
    // When main calls f, it assigns a nil pointer of type *bytes.Buffer to the out
    // parameter, so the dynamic value of out is nil. However, its dynamic type is
    // *bytes.Buffer, meaning that out is a non-nil interface containing a nil
    // pointer value, so the defensive check out != nil is still true.
    //
    // The dynamic dispatch mechanism determines that (*bytes.Buffer).Write must
    // be called but with a receiver value that is nil. For *bytes.Buffer, nil
    // is not a valid receiver, so it panic.
    if out != nil {
        out.Write([]byte("done!\n"))
    }
}
```

Workaround

The problem is that although a nil `*bytes.Buffer` pointer has the methods
needed to satisfy the interface, it doesn't satisfy the *behavioral*
requirements of the interface. In particular, the call violates the implicit
precondition of `(*bytes.Buffer).Write` that is receiver is not nil. The
solution is to change the type of buf in main to io.Writer, thereby avoiding
the assignment of the dysfunctional value to the interface in the first place.

```go
var buf io.Writer
if debug {
    buf = new(bytes.Buffer)
}
f(buf)
```

# Type Assertion

A "type assertion" is an operation **applied to an interface value**.
Syntactically, it looks like:

    x.(T)

where x is an expression of an **interface type** and T is a type, called
the "asserted type". A type assertion checks that the *dynamic type* of its
operand matches the asserted type.

## Assert Concrete Type

If the asserted type T is a concrete type, then the type assertion checks
whether x's dynamic type is *identical* to T. If this check succeeds, the
result of the type assertion is x's dynamic value, whose type is of course T.
In other words, a **type assertion to a concrete type extracts the concrete value
from its operand**.

```go
var w io.Writer
w = os.Stdout
f := w.(*os.File)       // success: f == os.Stdout, type of f is *os.File
c := w.(*bytes.Buffer)  // panic: interface holds *os.File, not *bytes.Buffer
```

## Assert Interface Type

If instead the asserted type T is an interface type, then the type assertion
checks whether x's dynamic type *satisfies* T. If this check succeeds, the
dynamic value is not extracted; the result is still an interface value with the
same type and value components, but the result has the interface type T. In
other words, a **type assertion to an interface type changes the type of the
expression, making a different (and *usually larger*) set of methods accessible,
but it preserves the dynamic type and value components inside the interface
value**.

```go
// After the first type assertion, both w and rw hold os.Stdout so each has a
// dynamic type of *os.File, but w, an io.Writer, exposes only the file's Write
// method, whereas rw exposes its Read method too
var w io.Writer
w = os.Stdout
rw := w.(io.ReadWriter)     // success: *os.File has both Read and Write

w = new(ByteCounter)
rw = w.(io.ReadWriter)      // panic: *ByteCounter has no Read method
```

If the operand is a nil interface value, the type assertion fails.

A type assertion to a less restrictive interface type (one with fewer methods)
is **rarely needed, as it behaves just like an assignment, except in the nil
case**.

```go
w = rw                  // io.ReadWriter is assignable to io.Writer
w = rw.(io.Writer)      // fails only if rw == nil
```

If the type assertion appears in an assignment in which two results are
expected, the operation does not panic on failure but instead returns an
additional second result, a boolean indicating success:

```go
var w io.Writer = os.Stdout
// the second result is conventionally assigned to a variable named ok
f, ok := w.(*os.File)       // success: ok, f == os.Stdout
// if the operation failed, the first result is equal to the zero value of the
// asserted type
b, ok := w.(*bytes.Buffer)  // failure: !ok, b == nil

// you'll sometimes see the original name reused, shadowing the original, like
// this:
if w, ok := w.(*os.File); ok {
    // ...use w...
}
```

# Type Switch

A "type switch" statement *simplifies an if-else chain of type assertions*. A type
switch enables a multi-way branch based on the interface value's **dynamic type**.

1. Simplest form: `x.(type)`

Case **order becomes significant when one or more case types are interfaces,
since then there is a possibility of two cases matching**. But the position of
the default case relative to the others is immaterial. **No fallthrough** is
allowed.

```go
switch x.(type) {
case nil:       // ...
case int, uint: // ...
case bool:      // ...
case string:    // ...
default:        // ...
}
```

2. Extended form: `switch x := x.(type)`

```go
func sqlQuote(x interface{}) string {
    // Here we've called the new variables x too; as with type assertion, reuse
    // of variable names is common. Like a switch statement, a type switch
    // implicitly creates a lexical block, so the declaration of the new
    // variable called x does not conflict with a variable x in an outer block.
    // Each case also implicitly creates a separate lexical block.
    switch x := x.(type) {
    case nil:
        return "NULL"

    // Within the block of each multi-type case, x has the (interface) type of
    // the switch operand, which is interface{} in this example.
    case int, uint:
        return fmt.Sprintf("%d", x) // x has type interface{} here

    // Within the block of each single-type case, the variable x has the same
    // type as the case. Here x has type bool.
    case bool:
        if x {
            return "TRUE"
        }
        return "FALSE"
    }
    case string:
        return sqlQuoteString(x)
    default:
        panic(fmt.Sprintf("unexpected type %T: %v", x, x))
}
```

# Interface Design

## Use Case of Interface

1. To encompass Common Behaviors. Such as sorting pattern:

```go
type Interface interface {
    Len() int
    Less(i, j int) bool
    Swap(i, j int)
}
```

2. To decouple our code from an implementation.

3. To restrict behavior.

```go
// Suppose our code use a IntConfig to store integer configuration, and it has
// both Get and Set method.
type IntConfig struct {
    // ...
}

// But in our client code, we need to make it read-only. We can do this by rely
// on intConfigGetter instead.
type intConfigGetter interface {
    Get() int
}
```

## Subtype Polymorphism and Ad-Hoc Polymorphism

Interfaces are used in two distinct styles:

1. "subtype polymorphism": An interface's methods express the similarities of
the concrete types that satisfy the interface but hide representation details
and intrinsic operations of those concrete types. The emphasis is on the
methods, not on the concrete types.

2. "ad hoc polymorphism": Exploits the ability of an interface value to hold
values of a variety of concrete types and considers the interface to be the
*union* of those types. Type assertions are used to discriminate among these
types dynamically and treat each case differently. The emphasis is on the
concrete types that satisfy the interface, not on the interface's methods, and
there is no hiding of information. We describe interfaces used this way
as *discriminated unions*

The previous sqlQuote function is a demo of discriminated unions. We now
consider another one. In the encodoing/xml package:

```go
package xml

type Name struct {
    Local string    // e.g., "Title" or "id"
}
type Attr struct {  // e.g., name="value"
    Name Name
    Value string
}

// A Token includes StartElement, EndElement, CharData and Comment
type Token interface{}
type StartElement struct {  // e.g., <name>
    Name Name
    Attr []Attr
}
type EndElement struct { Name Name }    // e.g., </name>
type CharData []byte                    // e.g., <p>CharData</p>
type Comment []byte                     // e.g., <!-- Comment -->

type Decoder struct{ /* ... */ }
func NewDecoder(io.Reader) *Decoder
func (*Decoder) Token() (Token, error)  // returns next Token in sequence
```

The Token interface, which has no methods, is also an example of a discriminated
union. The purpose of a traditional interface like io.Reader is to hide details
of the concrete types that satisfy it so that new implementations can be
created; each concrete type is *treated uniformly*. By contrast, the set of
concrete types that satisfy a discriminated union *is fixed by the design and
exposed, no hidden*. Discriminated union types have few methods; functions that
operate on them are expressed as a set of cases using a type switch, with
different logic in each case.

```go
dec := xml.NewDecoder(os.Stdin)
for {
    tok, err := dec.Token()
    switch tok := tok.(type) {
    case xml.StartElement:  // ...
    case xml.endElement:    // ...
    case xml.CharData:      // ...
    }
}
```

## When to Use Interface

> Abstractions should be discovered, not created.

It means we shouldn’t start creating abstractions in our code if there is no
immediate reason to do so. We shouldn’t design with interfaces but wait for a
concrete need. Said differently, we should create an interface when we need it,
not when we foresee that we could need it.

When designing a new package, novice Go programmers often start by creating a
set of interfaces and only later define the concrete types that satisfy them.
This approach results in many interfaces, each of which has only a single
implementation. Don't do that. Such interfaces are unnecessary abstractions;
they also have a run-time cost. You can restrict which methods of a type or
fields of a struct are visible outside a package using the export mechanism.
**Interfaces are only needed when there are two or more concrete types that must
be dealt with in a uniform way**.

**We make an exception to this rule when an interface is satisfied by a single
concrete type but that type cannot live in the same package as the interface
because of its dependencies. In that case, an interface is a good way to
decouple two packages**.

Also a small interface with fewer, simpler methods are easier to satisfy when
new types come along. A good rule of thumb for interface design is *ask only
for what you need*.

---

(taken from Udemy course)

Function operating on interfaces should **never accept a pointer to an
interface (like `do(i *MyInterface)`)**. If we do that, caller will never get
chance if they want to operate on value. In short, caller should determines
whether pointers or value(copy) is used.

```go
type MyType int // implements MyInterface

// since our function 'execute' operate on value of i...
func execute(i MyInterface) { // DONT do this: execute(i *MyInterface)
    i.Function1()
}

m := MyType(1)

// hence the caller 'execute' can use either value of m or pointer of m
execute(m)
execute(&m)

// suppose we operate on pointer of i, then we are not able to call execute with
// copy of i
```

When implementing a pointer receiver function, all functions accepting the
interface will only accept pointers.

If self-modification is needed, implement all interface functions as receiver
functions for consistency.

```go
type MyType int

// we should either define receiver function all accepting pointer
func (m *MyType) M1() {}
// or all accepting value
func (m MyType) M2() {}
// but not mixed, for consistency.

// if we do this (like above)
func execute(i MyInterface) {
    i.M1()
}
m := MyType(1)
// then this call will throw compiler error
execute(m)  // Compiler Error!
// we are only restricted to use pointer
execute(&m)
```

# Common Built-in Interface

## Stringer

```go
package fmt

// Stringer is implemented by any value that has a String method,
// which defines the ``native'' format for that value.
// The String method is used to print values passed as an operand
// to any format that accepts a string or to an unformatted printer
// such as Print.
type Stringer interface {
    String() string
}
```

### Trap: Recursive call of fmt.Sprintf

Don't construct a String/Error method by calling Sprintf in a way that will
recur into your String method indefinitely.

```go
type MyString string

// ERR:
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", m) // Error: will recur forever.
}

// FIX:
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", string(m)) // OK: note the conversion.
}
```

## sort

```go
package sort

type Interface interface {
    Len() int
    Less(i, j int) bool
    Swap(i, j int)
}
```

## io Reader Writer Closer

```go
package io

type Reader interface {
    Read(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

type ReadWriter interface {
    Reader
    Writer
}

// ...and combinations of above three...
```

## flag

```go
package flag

// Value is the interface to the value stored in a flag.
type Value interface {
    String() string
    Set(string) error
}
```

## net/http

```go
package http

type Handler interface {
    ServeHTTP(w ResponseWriter, r *Request)
}
```

# Generics

See: https://go.dev/doc/tutorial/generics.

With generics, you can declare and use functions or types that are written to
work with any of **a set of types** provided by calling code.

Type Parameter, Type Constraint, Type Elem

    TypeParameters  = "[" TypeParamList [ "," ] "]" .
    TypeParamList   = TypeParamDecl { "," TypeParamDecl } .
    TypeParamDecl   = IdentifierList TypeConstraint .

    TypeConstraint = TypeElem .

    TypeElem       = TypeTerm { "|" TypeTerm } .
    TypeTerm       = Type | UnderlyingType .
    UnderlyingType = "~" Type .

Each "type parameter" has a "type constraint" that acts as a kind of meta-type
for the type parameter. Each type constraint specifies the permissible type
arguments that calling code can use.

While a type parameter's constraint typically represents a set of types, at
compile time the type parameter stands for a single type – the type provided as
a type argument by the calling code.

Keep in mind that a type parameter must support all the operations the generic
code is performing on it. For example, if your function's code were to try to
perform string operations (such as indexing) on a type parameter whose
constraint included numeric types, the code wouldn't compile. @??

## Generic Functions

Functions can be written to work on multiple types using type parameters.

```go
// Index returns the index of x in s, or -1 if not found.
func Index[T comparable](s []T, x T) int {
    for i, v := range s {
        // v and x are type T, which has the comparable constraint, so we can
        // use == here.
        if v == x {
            return i
        }
    }
    return -1
}

// SumIntsOrFloats function is defined with two type parameters(inside the
// square brackets), K and V, and one argument that uses the type parameters, m
// of type map[K]V. The function returns a value of type V.
//
// 'comparable' is a type constraint for the k type parameter, intended
// specifically for cases like these, the comparable constraint is predeclared
// in Go. It allows any type whose values may be used as an operand of the
// comparison operators == and !=. Go requires that map keys be comparable. So
// declaring K as comparable is necessary so you can use K as the key in the
// map variable. NOTE, 'comparable' doesn't enable >, >=, <, <= comparison.
//
// 'int64 | float64' specify for the V type parameter a constraint that is a
//  union of two types: int64 and float64. Using | specifies a union of the two
//  types, meaning that this constraint allows either type. Using ~ specifies
//  underlying type.
func SumIntsOrFloats[K comparable, V int64 | float64](m map[K]V) V {
    var s V
    for _, v := range m {
        s += v
    }
    return s
}

func main() {
    // Index works on a slice of ints
    si := []int{10, 20, 15, -10}
    fmt.Println(Index(si, 15))

    // Index also works on a slice of strings
    ss := []string{"foo", "bar", "baz"}
    fmt.Println(Index(ss, "hello"))

    // Specify type arguments – the type names in square brackets
    //
    // in each call the compiler replaced the type parameters
    // with the concrete types specified in that call.
    fmt.Printf("Generic Sums: %v and %v\n",
        SumIntsOrFloats[string, int64](ints),
        SumIntsOrFloats[string, float64](floats))

    // you can often omit the type arguments in the function call.
    // Go can often infer them from your code.
    fmt.Printf("Generic Sums, type parameters inferred: %v and %v\n",
        SumIntsOrFloats(ints),
        SumIntsOrFloats(floats))
}
```

## Generic Type

Go also supports generic types. A type can be parameterized with a type parameter.

```go
// Declare a type constraint as interface ("constraint interface")
// so we can reuse the constaint "int64 | float64"
type Number interface {
    int64 | float64
}

func SumNumbers[K comparable, V Number](m map[K]V) V {
    var s V
    for _, v := range m {
        s += v
    }
    return s
}

type List[T any] struct {
    next *List[T]
    val  T
}
```

Type parameters **can’t be used with method arguments, only with function
arguments or method receivers**. For example, the following method won’t
compile:

```go
type Foo struct {}
func (Foo) bar[T any](t T) {}
./main.go:29:15: methods cannot have type parameters
```

If we want to use generics with methods, it’s **the receiver** that needs to be a
type parameter.

## Trap: "any does not implement comparable"

See: <https://go.dev/blog/comparable>.

```go
// any is comparable, this works fine.
var lookupTable map[any]string

// but before Go1.2, the seemingly equivalent generic map type:
type genericLookupTable[K comparable, V any] map[K]V

// produced a compile-time error when any was used as the key type: the set of
// types comprised by comparable is not the same as the set of all comparable
// types defined by the Go spec.

// ERROR: any does not implement comparable (Go 1.18 and Go 1.19).
var lookupTable genericLookupTable[any, string]
// Before Go1.2, "satisfy" means "implement". Starting with go1.2, the above
// code works fine: a type that supports == also satisfies comparable
// (even though it may not implement it).
```

# Concurrency

Go enable two style of concurrent programming:

1. Goroutines and channels, which support "communicating sequential processes"
or "CSP", a model of concurrency in which *values* are passed between independent
activities (goroutines) but *variables* are for the most part confined to a single
activity.

2. A more traditional model of "shared memory multithreading", which will be
familiar if you've used threads in other mainstream languages.

Happen Before, Concurrent, Concurrency-Safe

When we say x "happens before" y, we mean that it is guaranteed that x occurs
earlier in time than y, and that all its prior effects, such as updates to
variables, are complete and you may rely on them.

When we cannot confidently say that one event happens before the other, then the
events x and y are "concurrent".

* A function is "concurrency-safe" if it continues to work correctly even when
  called concurrently, that is, from two or more goroutines with no additional
  synchronization.
* A type is concurrency-safe if all its accessible methods and operations are
  concurrency-safe.

We can make a program concurrency-safe without making every concrete type in
that program concurrency-safe. Indeed, concurrency-safe types are the exception
rather than the rule, so you should access a variable concurrently only if the
documentation for its type says that this is safe.

We can avoid concurrent access to most variables:

* either by "confining" them to a single goroutine
* or by maintaining a higher-level invariant of "mutual exclusion".

In contrast, exported package-level functions *are* generally expected to be
concurrency-safe. Since package-level variables cannot be confined to a single
goroutine, functions that modify them must enforce mutual exclusion.

A "race condition" is a situation in which the program does not give the correct
result for some interleaving of the operations of multiple goroutines.

---

There are two types of conccurent code:

1. Threaded: code runs in parallel based on number of CPU cores.
2. Asynchronous: code can pause and resume execution, while paused, other code
   can resume.

Go will automatically choose the appropriate concurrency method.

# Goroutines

In Go, each concurrently executing activity is called a "goroutine".

When a program starts, its only goroutine is the one that calls the main
function, so we call it the "main goroutine". New goroutines are created by the
"go statement". A go statement causes the function to be called in a newly
created goroutine. The go statement itself **completes immediately**.

```go
f()         // call f(); wait for it to return

go f()      // create a new goroutine that calls f(); don't wait
            //
            // the arguments to the function started by go are evaluated when
            // the go statement itself is executed.
```

When main function returns, all goroutines are **abruptly terminated** and the
program exits. Other than by returning from main or existing the program, there
is **no programmatic way for one goroutine to stop another, but there are ways to
communicate with a goroutine to request that is stop**.

```go
func say(s string) {
    for i := 0; i < 5; i++ {
        time.Sleep(100 * time.Millisecond)
        fmt.Println(s)
    }
}

func main() {
    // evaluation of say("world") happens in the current goroutine. execution
    // of say("world") happens in the new goroutine goroutines run in the
    // *same address space*, so access to shared memory must be synchronized
    go say("world")
}
```

## Goroutine VS Threads

Why goroutines instead of threads?

Goroutines are part of making concurrency easy to use. The idea, which has been
around for a while, is to multiplex independently executing functions —
coroutines — onto **a set of threads**. When a coroutine blocks, such as by
calling a blocking system call, the run-time automatically moves other
coroutines on the same operating system thread to a different, runnable thread
so they won't be blocked. The programmer sees none of this, which is the point.
The result, which we call goroutines, can be very cheap: they have little
overhead beyond the memory for the stack, which is just a few kilobytes.

To make the stacks small, Go's run-time uses **resizable, bounded stacks**. A
newly minted goroutine is given a few kilobytes, which is almost always enough.
When it isn't, the run-time grows (and shrinks) the memory for storing the
stack automatically, allowing many goroutines to live in a modest amount of
memory. The CPU overhead averages about three cheap instructions per function
call. It is practical to create **hundreds of thousands of goroutines in the
same address space**. If goroutines were just threads, system resources would
run out at a much smaller number.

The differences between threads and goroutines are essentially quantitative, not
qualitative. Goroutines are lightweight threads managed by the Go runtime.

1. Growable Stacks

Each OS thread has a fixed-size block of memory (often as large as **2MB**) for its
stack, the work area where it saves the local variables of function calls that
are in progress or temporarily suspended while another function is called. This
fixed-size stack is simultaneously too much and too little. A 2MB stack would
be a huge waste of memory for a little goroutine, such as one that merely waits
for a WaitGroup then closes a channel. It's not uncommon for a Go program to
create hundreds of thousands of goroutines at one time, which would be
impossible with stacks this large. Yet despite their size, fixed-size stacks
are not always big enough for the most complex and deeply recursive of
functions. Changing the fixed size can improve space efficiency and allow more
threads to be created, or it can enable more deeply recursive functions, but it
cannot do both.

In contrast, a goroutine starts life with a small stack, typically **2KB**. A
goroutine's stack, like the stack of an OS thread, holds the local variables of
active and suspended function calls, but unlike an OS thread, a goroutine's
stack is not fixed; it grows and shrinks as needed. The size limit for a
goroutine stack may be as much as **1GB**, orders of magnitude larger than a
typical fixed-size thread stack, though of course few goroutines use that
much.

2. Goroutine Scheduling

OS threads are scheduled by the kernel, passing control from one thread to
another requires a **full context switch**, that is, saving the state of one user
thread to memory, restoring the state of another, and updating the scheduler's
data structures. This operation is slow, due to its poor locality and the
number of memory accesses required, and has historically only gotten worse as
the number of CPU cycles required to access memory has increased.

The Go runtime contains its own scheduler that uses a technique known as **m:n
scheduling**, because it multiplexes (or schedules) m goroutines on n OS
threads. The job of the Go scheduler is analogous to that of the kernel
scheduler, but it is concerned only with the goroutines of a single Go
program.

Unlike the operating system's thread scheduler, the **Go scheduler is not
invoked periodically by a hardware timer, but implicitly by certain Go language
constructs**. For example, when a goroutine calls time.Sleep or blocks in a
channel or mutex operation, the scheduler puts it to sleep and runs another
goroutine until it is time to wake the first one up. Because it doesn't need a
switch to kernel context, rescheduling a goroutine is much cheaper than
rescheduling a thread.

3. GOMAXPROCS

The Go scheduler uses a parameter called GOMAXPROCS to determine how many OS
threads may be actively executing Go code simultaneously. Its default value is
the number of CPUs on the machine, so on a machine with 8 CPUs, the scheduler
will schedule Go code on up to 8 OS threads at once. (GOMAXPROCS is the n in
m:n scheduling.) Goroutines that are sleeping or blocked in a communication do
not need a thread at all. Goroutines that are blocked in I/O or other system
calls or are calling non-Go functions, do need an OS thread, but GOMAXPROCS
need not account for them.

4. Goroutines Have No Identify

(Stateless?)

In most operating systems and programming languages that support multithreading,
the current thread has a distinct identity that can be easily obtained as an
ordinary value, typically an integer or pointer. This makes it easy to build an
abstraction called thread-local storage, which is essentially a global map
keyed by thread identity, so that each thread can store and retrieve values
independent of other threads.

Goroutines have **no notion of identity** that is accessible to the programmer.
This is by design, since thread-local storage tends to be abused. For example,
in a web server implemented in a language with thread-local storage, it's
common for many functions to find information about the HTTP request on whose
behalf they are currently working by looking in that storage. However, just as
with programs that rely excessively on global variables, this can lead to an
unhealthy "action at a distance" in which the behavior of a function is not
determined by its arguments alone, but by the identity of the thread in which
it runs. Consequently, if the identity of the thread should change—some worker
threads are enlisted to help, say—the function misbehaves mysteriously.

Go encourages a simpler style of programming in which parameters that affect the
behavior of a function are explicit. Not only does this make programs easier to
read, but it lets us freely assign subtasks of a given function to many
different goroutines without worrying about their identity.

# Channels

If goroutines are the activities of a concurrent Go program, channels are the
connections between them. A "channel" is a communication mechanism that lets
one goroutine send values to another goroutine. Each channel is a conduit for
values of a particular type, called the channel's "element type".

To create a channel, we use the built-in make function. A channel created with a
simple call to make is called an "unbuffered" channel, but make accepts an
optional second argument, an integer called the channel's "capacity". If the
capacity is non-zero, make creates a "buffered" channel.

```go
ch = make(chan int)     // unbuffered channel. ch has type 'chan int'
ch = make(chan int, 0)  // unbuffered channel
ch = make(chan int, 3)  // buffered channel with capacity 3

fmt.Println(cap(ch))    // "3", capacity can be obtained by cap()
ch <- 1
ch <- 2
fmt.Println(len(ch))    // "2", len returns the number of elements currently
                        // buffered. Since in a concurrent program this
                        // information is likely to be stale as soon as it is
                        // retrieved, its value is limited, but it could
                        // conceivably be useful during fault diagnosis or
                        // performance optimization
```

As with maps, a channel is a *reference* to the data structure created by make.
When we copy a channel or pass one as an argument to a function, we are copying
a reference, so caller and callee refer to the same data structure.

As with any other reference type, the zero value of a channel is nil.

Two channels of the same type may be compared using ==. The comparison is true
if both are references to the same channel data structure. A channel may also
be compared to nil.

Send, Receive, Close

    Operation       Channel State       Result
    -------------------------------------------------------------------
    read            nil                 block
                    open and empty      block
                    open and not empty  value
                    closed              default value, false
                    write only          compile error
    write           nil                 block
                    open and full       block
                    open and not full   write value
                    closed              panic !!
                    receive only        compile error
    close           nil                 panic !!
                    open and not empty  close channel, read succeed until drained,
                                        then reads produce default value
                    open and empty      close channel, read produces default value
                    closed              panic !!
                    receive only        compile error

A channel has two principal operations, "send" and "receive", collectively known
as "communications".

Channels also support "close", which **sets a flag** indicating that no more
values will ever be sent on this channel; subsequent attempts to send will
panic. Receive operations on a closed channel yield the values that have been
sent until no more values are left; any receive operations thereafter complete
immediately and yield the zero value of the channel's element type.
(non-block receive, spin on zero value).

You needn't close every channel when you've finished with it. It's **only
necessary to close a channel when it is important to tell the receiving
goroutines that all data have been sent** (such as to terminate a range loop).
A channel that the garbage collector determines to be unreachable will have its
resources reclaimed whether or not it is closed. (Don't confuse this with the
close operation for open files. It *is* important to call the Close method on
every file when you've finished with it.)

**Only the sender should close a channel, never the receiver**.

Attempting to close an already-closed channel causes a panic, as does closing a
nil channel.

```go
ch <- x     // a send statement transmits a value from one goroutine, through the
            // channel, to another goroutine executing a corresponding receive
            // expression.

x = <-ch    // a receive expression in an assignment statement
<-ch        // a receive statement; result is discarded

close(ch)
```

**By default, sends and receives block until the other side is ready**. A send
operation on an unbuffered channel blocks the sending goroutine until another
goroutine executes a corresponding receive on the same channel. If the receive
operation was attempted first, the receiving goroutine is blocked until another
goroutine performs a send on the same channel.

This **allows goroutines to synchronize without explicit locks or condition
variables**. Hence unbuffered channels are sometimes called "synchronous"
channels. When a value is sent on an unbuffered channel, the receipt of the
value happen before the reawakening of the sending goroutine.

There is no way to test directly whether a channel has been closed, but there is
a variant of the receive operation that produces two results: the received
channel element, plus a boolean value, conventionally called ok, which is true
for a successful receive and false for a receive on a closed and drained
channel. like:

    v, ok := <-ch

Range And Close

Consider the code:

```go
go func() {
    for {
        x ,ok := <-naturals
        if !ok {
            break
        }
        squares <- x*x
    }
    close(squares)
}()
```

Because the syntax above is clumsy, Go lets use use a range loop to iterate over
channels too.

```go
func fibonacci(n int, c chan int) {
    x, y := 0, 1
    for i := 0; i < n; i++ {
        c <- x
        x, y = y, x+y
    }
    close(c)
}

c := make(chan int, 10)
go fibonacci(cap(c), c)

// `range` will receive values from channel until it is closed
// can also check whether channel is close manually by `v, ok := <-ch`
for i := range c {
    fmt.Println(i)
}
```

Unbuffered Channel

```go
func sum(s []int, c chan int) {
    sum := 0
    for _, v := range s {
        sum += v
    }
    c <- sum // send to channel
}

s := []int{7, 2, 8, -9, 4, 0}

// Like maps and slices, channels must be created before use:
c := make(chan int)

go sum(s[:len(s)/2], c)
go sum(s[len(s)/2:], c)
x, y := <-c, <-c // receive from channel
fmt.Println(x, y, x+y)
```

Buffered Channel

Sends to a buffered channel block only when the buffer is full. Receives block
when the buffer is empty.

Novices are sometimes tempted to use buffered channels within a single goroutine
as a queue, lured by their pleasingly simple syntax, but this is a mistake.
Channels are deeply connected to goroutine scheduling, and without another
goroutine receiving from the channel, a sender - and perhaps the whole
program - risks becoming blocked forever. If all you need is a simple queue,
make one using a slice.

```go
// create `buffered channel`, by pass into `make()` buffer size 2
ch := make(chan int, 2)
ch <- 1
ch <- 2

// If we overfill a buffered channel, we will trigger `all goroutines are
// sleep - deadlock!` error
//
// ch <- 3

fmt.Println(<-ch)
fmt.Println(<-ch)
```

```go
func mirrorQuery() string {
    responses := make(chan string, 3)
    go func() { responses <= request("asia.gopl.io") }()
    go func() { responses <= request("europe.gopl.io") }()
    go func() { responses <= request("americas.gopl.io") }()
    return <-responses // return the quickest response
}
```

Had we used an unbuffered channel, the two slower goroutines would have gotten
stuck trying to send their responses on a channel from which no goroutine will
ever receive. This situation, called a "goroutine leak", would be a bug. Unlike
garbage variables, leaked goroutines are not automatically collected, so it is
important to make sure that goroutines terminate themselves when no longer
needed.

Unidirectional Channel

"Unidirectional" channel types expose only send or receive operations.

    chan<- int      // a send-only channel of int
    <-chan int      // a receive-only channel of int.

Violations of this discipline are detected at compile time.

Since the close operation asserts that no more sends will occur on a channel,
only the sending goroutine is in a position to call it, and for this reason it
is a compile-time error to attempt to close a receive-only channel.

Conversions **from bidirectional to unidirectional channel types are permitted**
in any assignment. There is **no going back**, however: once you have a value
of a unidirectional type such as `chan<- int`, there is no way to obtain from
it a value of type `chan int` that refers to the same channel data structure.

# Select

`select` lets a goroutine wait on multiple communication operations.

Each case specifies a "communication" (a send or receive operation on some
channel) and an associated block of statement. A select **block** until a
communication for some case is ready to proceed (unless a default case is
provided). A select with no cases, `select{}`, waits forever.

```go
select {
case <-ch1:
case x := <-ch2:
case ch3 <- y:
default:    // run if none of the other communication can proceed immediately
}
```

If multiple cases are ready (DO NOTE the precondition: **multiple, ready**),
select picks one **at random**, which ensures that every channel has an **equal
chance** of being selected.

```go
func fibonacci(c, quit chan int) {
    x, y := 0, 1
    for {
        select {
        case c <- x:
            x, y = y, x+y
        case <-quit:
            fmt.Println("quit")
            return
        default:
            // run if no other case is ready
        }
    }
}

c := make(chan int)
quit := make(chan int)
go func() {
    for i := 0; i < 10; i++ {
        fmt.Println(<-c)
    }
    quit <- 0
}()
fibonacci(c, quit)
```

A select case like this:

    case ch2 <- (<-ch1):

will block immediately on the receive from ch1, and then the select will control
whether the send on ch2 happens or a different case: the select treats it as
`ch2 <- <something>`, where `<something>` is evaluated on entering the select.

# Memory Model

See: https://go.dev/ref/mem

"Memory model" specify the conditions under which *reads* of a variable in one
goroutine can be guaranteed to observe values produced by *writes* to the same
variable in a different goroutine.

Goroutine:

* Within a single goroutine, the happens-before order is the order expressed by
  the program.
* If a package p imports package q, the completion of q's init functions happens
  before the start of any of p's.
* The start of the function main.main happens after all init functions have
  finished.
* The go statement that starts a new goroutine happens before the goroutine's
  execution begins.

Channel:

* A send on a channel happens before the corresponding receive from that channel
  completes.
* The closing of a channel happens before a receive that returns a zero value
  because the channel is closed.
* The kth receive on a channel with capacity C happens before the k+Cth send
  from that channel completes. @??
* A receive from an unbuffered channel happens before the send on that channel
  completes.

Locks:

* For any sync.Mutex or sync.RWMutex variable l and n < m, call n of l.Unlock
  () happens before call m of l.Lock() returns.
* For any call to l.RLock on a sync.RWMutex variable l, there is an n such that
  the l.RLock happens (returns) after call n to l.Unlock and the matching
  l.RUnlock happens before call n+1 to l.Lock.
* A single call of f() from once.Do(f) happens (returns) before any call of
  once.Do(f) returns.

# Concurrency Patterns

    Pattern                                         Code Example (in gopl)
    ---------------------------------------------------------------------------
    one goroutine per connection                    clock2
    multi-goroutine per connection                  reverb2
    ---------------------------------------------------------------------------
    sync with unbuffered chan                       netcat3
    limit concurrency
        by token / counting semaphar                crawl2,du3
        by long-lived goroutine                     crawl3
    cancel
        by close chan                               du4
    pipeline                                        pipeline

## Sync With Unbuffered Channel

Message send over channels have two important aspects:

1. Its value
2. The moment at which it occurs

We call messages "events" to stress the later. And when the event's sole purpose
is synchronization, we'll emphasize this by using a channel whose element type
is struct{}. It's also common to use a channel of bool or int like done<-1.

```go
func main() {
    done := make(chan struct{})
    go func() {
        // ...background works...
        done <- struct{}{} // signal the main goroutine
    }
    <-done // wait for background goroutine to finish
}
```

## Pipeline

Channels an be used to connect goroutines together so that the output of one is
the input to another. This is called "pipeline".

1. In long-running server programs where channels are used for lifelong
communication between goroutines containing infinite loops. See ch8/pipeline1.

2. If only a finite number of values will be sent, it's then useful to
communicate that no further values will ever be sent on a channel, so that the
receiver goroutines can stop waiting, by closing the channel and for-range
loop. See ch8/pipeline2.

## Looping in Parallel

Patterns for executing all the iterations of a loop in parallel.

Problem consist entirely of subproblems that are completely independent of each
other are described as "embarrassingly parallel". Embarrassingly parallel
problems are the easiest kind to implement concurrently and enjoy performance
that scales linearly with the amount of parallelism.

**Starting**

```go
// INCORRECT!
//
// makeThumbnails returns before it has finished doing what is was supposed to
// do. It starts all the goroutines, one per file name, but doesn't wait for
// them to finish.
func makeThumbnails(filenames []string) {
    for _, f := range filenames {
        go thumbnail.ImageFile(f) // NOTE: ignoring errors
    }
}
```

We can change the inner goroutine to report its completion to the outer
goroutine by sending an event on a shared channel.

```go
func makeThumbnails(filenames []string) {
    ch := make(chan struct{})
    // notice that we passed the value of f as an explicit argument to the
    // literal function instead of:
    //
    //      for _, f := range filenames {
    //          go func() {
    //              thumbnail.ImageFile(f)
    //          }
    //      }
    //
    // By adding an explicit parameter, we ensure that we use the value of f
    // that is current when the go statement is executed.
    //
    // See The Trap of Iteration Variable Capture.
    for _, f := range filenames {
        go func(f string) {
            thumbnail.ImageFile(f) // NOTE: ignoring errors
            ch <- struct{}{}
        }(f)
    }
    // wait for goroutines to complete
    for range filenames {
        <-ch
    }
}
```

**Reporting Error**

We want to return values from each worker goroutine to the main one. If the call
to thumbnail.ImageFile fails, it returns an error.

```go
// INCORRECT!
func makeThumbnails(filenames []string) error {
    errors := make(chan error)
    for _, f := range filenames {
        go func(f string) {
            _, err := thumbnail.ImageFile(f)
            errors <- err
        }(f)
    }
    for range filenames {
        // NOTE: incorrect: goroutine leak!
        //
        // when it encounters the first non-nil error, it returns the error to
        // the caller, leaving no goroutine draining the errors channel. Each
        // remaining worker goroutine will block forever when it tries to send
        // a value on that channel.
        if err := <-errors; err != nil {
            return err
        }
    }
    return nil
}
```

Solution 1: use buffered channel to return the names of the generated image
files along with any errors.

```go
func makeThumbnails(filenames []string) (thumbfiles []string, err error) {
    type item struct {
        thumbfile string
        err error
    }

    ch := make(chan item, len(filenames))   // buffered channel
    for _, f := range filenames {
        go func(f string) {
            var it item
            it.thumbfile, it.err = thumbnail.ImageFile(f)
            ch <- it
        }(f)
    }

    for range filenames {
        it := <-ch
        if it.err != nil {
            return nil, it.err
        }
        thumbfiles = append(thumbfiles, it.thumbfile)
    }
    return thumbfiles, nil
}
```

Solution 2: create another goroutine to drain the channel while the main
goroutine returns the first error without delay.

### WaitGroup

**Unknown Iteration Number**

We need to know when the last goroutine has finished, but the *iteration number
is unspecified*. So we need to increment a counter before each goroutine starts
and decrement it as each goroutine finishes. This demands a special kind of
counter, one that can be safely manipulated from multiple goroutines and that
provides a way to wait until it become zero. This counter type is known
as "sync.WaitGroup".

```go
// This time makeThumbnails receive files from a channel, and returns the number
// of bytes occupied by the file it creates. So we don't know the iteration
// number.
func makeThumbnails(filenames <-chan string) int64 {
    sizes := make(chan int64)
    var wg sync.WaitGroup // number of working goroutines
    for f := range filenames {
        // Add, which increments the counter, must be called before the worker
        // goroutine starts, not within it; otherwise we would not be sure that
        // the Add "happens before" the "closer" goroutine calls Wait.
        wg.Add(1)

        // worker
        go func(f string) {
            // Done is equivalent to Add(-1)
            //
            // we use defer to ensure that the counter is decremented even in
            // the error case
            defer wg.Done()
            thumb, err := thumbnail.ImageFile(f)
            if err != nil {
                log.Println(err)
                return
            }
            info, _ := os.Stat(thumb) // OK to ignore error
            sizes <- info.Size()
        }(f)
    }

    // closer. waits for the workers to finish before closing the sizes channel.
    //
    // these two operations, wait and close, must be concurrent with the loop
    // over sizes: if the wait operation were placed in the main goroutine
    // before the loop, it would never end. if placed after the loop, it would
    // be unreachable since with nothing closing the channel, the loop would
    // never terminate.
    go func() {
        wg.Wait()
        close(sizes)
    }()

    var total int64
    for size := range sizes {
        total += size
    }
    return total
}
```

## Limiting Parallelism: Buffered Channel as Counting Semaphore

Unbounded parallelism is rarely a good idea since there is always a limiting
factor in the system, such as the number of CPU cores for compute-bound
workload, the number of spindles and heads for local disk I/O operations, the
bandwidth of the network for streaming downloads, or the serving capacity of a
web service.

The solution is to limit the number of parallel uses of the resource to match the
level of parallelism that is available.

We can limit parallelism using a buffered channel of capacity n to model a
concurrency primitive called a *counting semaphore*. Conceptually, each of the
n vacant slots in the channel buffer represents a token entitling the holder to
proceed. Sending a value into the channel acquires a token, and receiving a
value from the channel releases a token, creating a new vacant slot. This
ensures that at most n sends can occur without an intervening receive.
(Although it might be more intuitive to treat *filled* slots in the channel
buffer as tokens, using vacant slots avoids the need to fill the channel buffer
after creating it.)

It's good practice to keep the semaphore operations as close as possible to the
I/O operation they regulate.

```go
// token is a counting semaphore used to enforce a limit of 20 concurrent requests.
var tokens = make(chan struct{}, 20)

func crawl(url string) []string {
    tokens <- struct{}{} // acquire a token
    list, err := links.Extract(url)
    <-tokens             // release the token
}
```

## Limiting Parallelism: Fixed Number of Long-Lived Goroutines

See ch8/crawl3

## Polling a Channel / Non-Blocking Communication

Sometimes we want to try to send or receive on a channel but avoid blocking if
the channel is not ready -- a *non-blocking* communication. A select statement
can do that too. A select may have a default, which specifies what to do when
none of the other communications can proceed immediately.

The select statement below receives a value from the abort channel if there is
one to receive, otherwise it does nothing. This is a non-blocking receive
operation; doing it repeatedly is called *polling* a channel.

```go
select {
case <-abort:
    fmt.Printf("Launch aborted\n")
    return
default:
    // do nothing
}
```

Checking Timeout.

```go
select {
case v := <-in:
    fmt.Println(v)
case <-time.After(time.Second):
    return // timed out
}
```

Prevent main From Exiting.

```go
func main() {
    // ...
    select {}
}
```

## Feature Disable with Nil Channel

Because send and receive operations on a nil channel block forever, a case in a
select statement whose channel is nil is never selected. This lets us use nil
to enable or disable cases that correspond to features like handling timeouts
or cancellation. See ch8/du2.

## Work Cancellation with Broadcast

We need to cancel two goroutines, or arbitrary number of goroutines.

One possibility might be to send as many events on the abort channel as there
are goroutines to cancel. If some of the goroutines have already terminated
themselves, however, our count will be too large, and our sends will get stuck.
On the other hand, if those goroutines have spawned other goroutines, our count
will be too small, and some goroutines will remain unaware of the cancellation.
In general, it's hard to know how many goroutines are working on our behalf at
any given moment. Moreover, when a goroutine receives a value from the abort
channel, it consumes that value so that other goroutines won't see it.

For cancellation, what we need is a reliable mechanism to broadcast an event
over a channel so that many goroutines can see it *as* it occurs and can later
see that it *has* occurred.

Recall that after a channel has been closed and drained of all sent values,
subsequent receive operations proceed immediately, yielding zero values. We can
exploit this to create a broadcast mechanism: don't send a value on the
channel, *close* it.

See ch8/du4 for example code.

Cancellation involves a trade-offs; a quicker response often requires more
intrusive changes to program logic. Ensuring that no expensive operations ever
occur after the cancellation event may require updating many places in your
code, but often most of the benefit can be obtained by checking for
cancellation in a few important places.

To determine whether main goroutine has cleaned up, There's a handy trick we can
use during testing: if instead of returning from main in the event of
cancellation, we execute a call to panic, then the runtime will dump the stack
of every goroutine in the program. If the main goroutine is the only one left,
then it has cleaned up after itself. But if other goroutines remain, they may
not have been properly cancelled, or perhaps they have been cancelled but the
cancellation takes time; a little investigation may be worthwhile. The panic
dump often contains sufficient information to distinguish these cases.

## Concurrency with Shared Variables

### Data Race

A "data race" occurs whenever two goroutines access the same variable
concurrently and at **least one of the accesses is a write**.

```go
package bank
var balance int
func Deposit(amount int) { balance = balance + amount }
func Balance() int { return balance }

// Alice:
go func() {
    bank.Deposit(200)                   // A1
    fmt.Println("=", bank.Balance())    // A2
}

// Bob:
go bank.Deposit(100)                    // B
```

Here is a possible operation sequence, in which Bob's deposit occurs in the
middle of Alice's deposit, after the balance has been read but before it has
been updated (A: Alice, r:read, w:write). The final balance is only 200, bank
is $100 richer at Bob's expense:

                0
    A1r         0       ... = balance+amount
    B         100
    A1w       200       balance = ...
    A2      "=200"

Follow the definition, there are three ways to avoid a data race.

1. Don't write the variable. Data structures that are never modified or are
immutable are inherently concurrency-safe and need no synchronization. But
obviously we can't use this approach if updates are essential, as with a bank
account.

2. Avoid accessing the variable from multiple goroutines. *Confine* those
variables to a single goroutine. Since other goroutines cannot access the
variable directly, they must use a channel to send the confining goroutine a
request to query or update the variable. This is what is meant by the Go
mantra "Do not communicate by sharing memory; instead, share memory by
communicating." A goroutine that brokers access to a confined variable using
channel requests is called a "monitor goroutine" for that variable. For
example, the broadcaster goroutine monitors access to the clients map.

```go
var deposits = make(chan int)
var balances = make(chan int)

func Deposit(amount int) { deposits <- amount } // send amount to deposit
func Balance() int { return <-balances }        // receive balance

func teller() {
    var balance int // balance is confined to teller goroutine
    for {
        select {
        case amount := <-deposits:
            balance += amount
        case balances <- balance:
        }
    }
}

func init() {
    go teller() // start the monitor goroutine
}
```

Even when a variable cannot be confined to a single goroutine for its entire
lifetime, confinement may still be a solution to the problem of concurrent
access. For example, it's common to share a variable between goroutines in a
pipeline by passing its address from one stage to the next over a channel. If
each stage of the pipeline refrains from accessing the variable after sending
it to the next stage, then all accesses to the variable are sequential. In
effect, the variable is confined to one stage of the pipeline, then confined to
the next, and so on. This discipline is sometimes called "serial confinement".

```go
type Cake struct{ state string }

func baker(cooked chan<- *Cake) {
    for {
        cake := new(Cake)
        cake.state = "cooked"
        cooked <- cake // baker never touches this cake again
    }
}

func icer(iced chan<- *Cake, cooked <-chan *Cake) {
    for cake := range cooked {
        cake.state = "iced"
        iced <- cake // icer never touches this cake again
    }
}
```

3. allow many goroutines to access the variable, but only one at a time. This
approach is known as "mutual exclusion".

### Binary Semphor, Mutex

We can use a channel of capacity 1 to ensure that at most one goroutine accesses
a shared variable at a time. A semaphore that counts only to 1 is called
a "binary semaphore".

```go
var (
    sema = make(chan struct{}, 1) // a binary semaphore guarding balance
    balance int
)

func Deposit(amount int) {
    sema <- struct{}{} // acquire token
    balance = balance + amount
    <-sema // release token
}

func Balance() int {
    sema <- struct{}{} // acquire token
    b := balance
    <-sema // release token
    return b
}
```

This pattern is supported directly by the Mutex type from the sync package.

```go
import "sync"

var (
    // By convention, the variables guarded by a mutex are declared immediately
    // after the declaration of the mutex itself.
    mu sync.Mutex // guards balance
    balance int
)

func Deposit(amount int) {
    mu.Lock()
    // by deferring a call to Unlock, the critical section implicitly extends to
    // the end of the current function, freeing us from having to remember to
    // insert Unlock calls in one or more places far from the call to Lock.
    //
    // A defer is marginally more expensive than an explicit call to Unlock, but
    // not enough to justify less clear code. As always with concurrent programs,
    // favor clarity and resist premature optimization. Where possible, use defer
    // and let critical sections extend to the end of a function.
    defer mu.Unlock()
    balance = balance + amount
}

func Balance() int {
    mu.Lock()
    defer mu.Unlock()
    b := balance
    return b
}
```

The region of code between Lock and Unlock in which a goroutine is free to read
and modify the shared variables is called a "critical section". The lock
holder's call to Unlock happens before any other goroutine can acquire the lock
for itself. It is essential that the goroutine release the lock once it is
finished, on all paths through the function, including error paths.

The bank program above exemplifies a common concurrency pattern. A set of
exported functions encapsulates one or more variables so that the only way to
access the variables is through these functions (or methods, for the variables
of an object). Each function acquires a mutex lock at the beginning and
releases it at the end, thereby ensuring that the shared variables are not
accessed concurrently. This arrangement of functions, mutex lock, and variables
is called a "monitor".(This older use of the word "monitor" inspired the
term "monitor goroutine." Both uses share the meaning of a broker that ensures
variables are accessed sequentially.)

Now consider the Withdraw function:

```go
// NOTE: not atomic!
func Withdraw(amount int) bool {
    Deposit(-amount)
    if Balance() < 0 {
        Deposit(amount)
        return false // insufficient funds
    }
    return true
}
```

This function eventually gives the correct result, but it has a nasty side
effect. When an excessive withdrawal is attempted, the balance transiently dips
below zero. This may cause a concurrent withdrawal for a modest sum to be
spuriously rejected. So if Bob tries to buy a sports car, Alice can't pay for
her morning coffee. The problem is that Withdraw is not "atomic": it consists
of a sequence of three separate operations, each of which acquires and then
releases the mutex lock, but nothing locks the *whole* sequence.

However, this attempt won't work:

```go
// NOTE: incorrect!
func Withdraw(amount int) bool {
    mu.Lock()
    defer mu.Unlock()
    Deposit(-amount) // deadlock
    if Balance() < 0 {
        Deposit(amount)
        return false
    }
    return true
}
```

Because mutex locks are not *re-entrant* -- it's not possible to lock a mutex
that's already locked—this leads to a deadlock where nothing can proceed, and
Withdraw blocks forever.

A common solution is to divide a function such as Deposit into two: an
unexported function, deposit, that assumes the lock is already held and does
the real work, and an exported function Deposit that acquires the lock before
calling deposit.

```go
func Withdraw(amount int) bool {
    mu.Lock()
    defer mu.Unlock()
    deposit(-amount)
    if balance < 0 {
        deposit(amount)
        return false
    }
    return true
}

func Deposit(amount int) {
    mu.Lock()
    defer mu.Unlock()
    deposit(amount)
}

// This function requires that the lock be held.
func deposit(amount int) { balance += amount }
```

When you use a mutex, make sure that both it and the variables it guards are not
exported, whether they are package-level variables or the fields of a struct.

### Read/Write Mutex: RWMutex

Since the Balance function only needs to read the state of the variable, it
would in fact be safe for multiple Balance calls to run concurrently, so long
as no Deposit or Withdraw call is running. In this scenario we need a special
kind of lock that **allows read-only operations to proceed in parallel with each
other, but write operations to have fully exclusive access**. This lock is called
a "multiple readers, single writer" lock, and in Go it's provided by sync.RWMutex:

```go
var mu sync.RWMutex
var balance int
func Balance() int {
    mu.RLock() // readers lock
    defer mu.RUnlock()
    return balance
}
```

The Balance function now calls the RLock and RUnlock methods to acquire and
release a "readers" or "shared lock". The Deposit function, which is unchanged,
calls the mu.Lock and mu.Unlock methods to acquire and release a "writer"
or "exclusive lock".

**RLock can be used only if there are no writes to shared variables in the
critical section**. In general, we should not assume that *logically* read-only
functions or methods don't also update some variables. For example, a method
that appears to be a simple accessor might also increment an internal usage
counter, or update a cache so that repeat calls are faster. If in doubt, use an
exclusive Lock.

It's **only profitable to use an RWMutex when most of the goroutines that acquire
the lock are readers, and the lock is under "contention"**, that is, goroutines
routinely have to wait to acquire it. An RWMutex requires more complex internal
bookkeeping, making it slower than a regular mutex for uncontended locks.

Memory Synchronization

In a modern computer there may be dozens of processors, each with its own local
cache of the main memory. For efficiency, writes to memory are buffered within
each processor and flushed out to main memory only when necessary. They may
even be committed to main memory in a different order than they were written by
the writing goroutine. Synchronization primitives like channel communications
and mutex operations cause the processor to flush out and commit all its
accumulated writes so that the effects of goroutine execution up to that point
are guaranteed to be visible to goroutines running on other processors.

Within a single goroutine, the effects of each statement are guaranteed to occur
in the order of execution; goroutines are sequentially consistent. But in the
absence of explicit synchronization using a channel or mutex, there is no
guarantee that events are seen in the same order by all goroutines.

All these concurrency problems can be avoided by the consistent use of simple,
established patterns. Where possible, confine variables to a single goroutine;
for all other variables, use mutual exclusion.

### Lazy Initialization: sync.Once

```go
// lazy init: NOT concurrency-safe
var icons map[string]image.Image

func loadIcons() {
    icons = map[string]image.Image{
        "spades.png": loadIcon("spades.png")
        "hearts.png": loadIcon("hearts.png")
        "diamonds.png": loadIcon("diamonds.png")
        "clubs.png": loadIcon("clubs.png")
    }
}

// NOTE: not concurrency-safe
func Icon(name string) image.Image {
    if icons == nil {
        loadIcons()
    }
    return icons[name]
}
```

```go
// Solution 1: concurrency-safe with mutex, BUT two goroutines cannot access the
// variable concurrently, even once the variable has been safely initialized
// and will never be modified again
var mu sync.Mutex // guards icons
var icons map[string]image.Image

// Concurrency-safe
func Icon(name string) image.Image {
    mu.Lock()
    defer mu.Unlock()
    if icons == nil {
        loadIcons()
    }
    return icons[name]
}
```

```go
// Solution 2: concurrency-safe with RWmutex, BUT complex and error-prone
var mu sync.RWMutex
var icons map[string]image.Image

func Icon(name string) image.Image {
    mu.RLock()
    if icons != nil {
        icon := icons[name]
        mu.RUnlock()
        return icon
    }
    mu.RUnlok()

    // There is no way to upgrade a shared lock to an exclusive one without first
    // releasing the shared lock, so we must recheck the icons variable in case
    // another goroutine already initialized it in the interim.
    mu.Lock()
    if icons == nil {
        loadIcons()
    }
    icon := icons[name]
    mu.Unlock()
    return icon
}
```

```go
// Solution 3: sync.Once provide specialized solution to the problem of one-time
// init
var loadIconsOnce sync.Once
var icons map[string]image.Image

func Icon(name string) image.Image {
    loadIconsOnce.Do(loadIcons)
    return icons[name]
}
```

**Conceptually, a Once consists of a mutex and a boolean variable that records
whether initialization has taken place**; the mutex guards both the boolean and
the client's data structures.

Each call to Do(loadIcons) locks the mutex and checks the boolean variable. In
the first call, in which the variable is false, Do calls loadIcons and sets the
variable to true. Subsequent calls do nothing, but the mutex synchronization
ensures that the effects of loadIcons on memory (specifically, icons) become
visible to all goroutines. Using sync.Once in this way, we can avoid sharing
variables with other goroutines until they have been properly constructed.

## Context

See:

* https://go.dev/blog/context
* go.concurrency#context
* go doc context

# Race Detector

Go runtime equipped a dynamic analysis tool to check concurrency mistakes. To
use it, just add `-race` flag to your go build, go run, or go test command.

The race detector studies the stream of synchronization events, looking for
cases in which one goroutine **reads or writes a shared variable that was most
recently written by a different goroutine without an intervening
synchronization operation**. This indicates a concurrent access to the shared
variable, and thus a data race.

However, it can only detect race conditions that occur during a run; it **cannot
prove** that none will ever occur. For best results, **make sure that your
tests exercise your packages using concurrency**, the Go team recommends
running a build of your application built with the race flag under **real-world
load**. I highly recommend integrating it **as part of your continuous
integration process**.

Due to extra bookkeeping, a program built with race detection needs more time
and memory to run, but the overhead is tolerable even for many production jobs.
For infrequently occurring race conditions, letting the race detector do its
job can save hours or days of debugging.

The following env can be used to tweak the behavior of the race detector:

* LOG_PATH. This tells the race detector to write reports to the LOG_PATH.pid
  file. You can also pass it special values: stdout and stderr. The default
  value is stderr.
* STRIP_PATH_PREFIX. This tells the race detector to strip the beginnings of
  file paths in reports to make them more concise.
* HISTORY_SIZE. This sets the per-goroutine history size, which controls how
  many previous memory accesses are remembered per goroutine. The valid range
  of values is `[0, 7]`. The memory allocated for goroutine history begins at
  **32 KB** when HISTORY_SIZE is 0, and **doubles** with each subsequent value for a
  **maximum of 4 MB** at a HISTORY_SIZE of 7. When you see “failed to restore
    the stack” in reports, that’s an indicator to increase this value; however,
    it can significantly increase memory consumption.

# Reflection

See: https://golang.org/doc/articles/laws_of_reflection.html.

Sometimes we need to write a function capable of dealing uniformly with values
of types that don't satisfy a common interface, don't have a known
representation, or don't exist at the time we design the function—or even all
three.

Go provides a mechanism to update variables and inspect their values at run
time, to call their methods, and to apply the operations intrinsic to their
representation, all without knowing their types at compile time. This mechanism
is called "reflection". Reflection also lets us treat types themselves as
first-class values.

However, reflection is complex to reason about and not for casual use, so
although packages like `fmt`, `encoding/*`,  `*/template` are implemented using
reflection, they do not expose reflection in their own APIs.

It should be used with care, for three reasons:

1. Reflection-based code can be fragile. For every mistake that would cause a
compiler to report a type error, there is a corresponding way to misuse
reflection, but whereas the compiler reports the mistake at build time, a
**reflection error is reported during execution as a panic**, possibly long
after the program was written or even long after it has started running.

Best way to avoid this fragility is to ensure that the use of reflection is
**fully encapsulated within your package**, if possible. If this is not
possible, **perform additional dynamic checks before each risky operation**.

2. Since types serve as a form of documentation and the operations of reflection
cannot be subject to static type checking, heavily reflective code is often
hard to understand.

Always carefully document the expected types and other invariants of functions
that accept an interface{} or a reflect.Value.

3. Reflection-based functions may be **one or two orders of magnitude slower**
than code specialized for a particular type. In a typical program, the majority
of functions are not relevant to the overall performance, so its fine to use
reflection when it makes the program clearer. **Testing is a particularly good
fit for reflection since most tests use small data sets. But for functions on
the critical path, reflection is best avoided**.

Reflection is provided by the "reflect" package. It defines two important types,
Type and Value.

## Reflect.Type

A Type represents a Go type. It is an interface with many methods for
discriminating among types and inspecting their components, like the fields of
a struct or the parameters of a function.

The reflect.TypeOf function accepts any interface{} and returns its **dynamic
type** as a reflect.Type:

```go
// The TypeOf(3) assigns the value 3 to the interface{} parameter. Recall that
// an assignment from a concrete value to an interface type performs an
// implicit interface conversion, which creates an interface value consisting
// of two components: its dynamic type is the operand's type (int) and its
// dynamic value is the operand's value (3).
t := reflect.TypeOf(3)  // a reflect.Type
fmt.Println(t.String()) // "int"
fmt.Println(t)          // "int"
```

Because reflect.TypeOf returns an interface value's dynamic type, it **always
returns a concrete type**.

```go
var w io.Writer = os.Stdout
fmt.Println(reflect.Typeof(w)) // "*os.File"

// refelect.Type satisfies fmt.Stringer.
// fmt.Printf's %T verb uses reflect.TypeOf internally
fmt.Printf("%T\n", 3)   // "int"
```

## Reflect.Value

A reflect.Value can hold a value of any type.

The reflect.ValueOf function accepts any interface{} and returns a reflect.Value
containing the interface's dynamic value. As with reflect.TypeOf, the results
of reflect.ValueOf are **always concrete, but a reflect.Value can hold interface
values too**.

```go
v := reflect.ValueOf(3) // a reflect.Value
fmt.Println(v)          // "3"
fmt.Printf("%v\n", v)   // "3"

// reflect.Value also satisfies fmt.Stringer, but unless the Value holds a
// string, the result of the String method reveals only the type. Instead, use
// the fmt package's %v verb, which treats reflect.Values specially.
fmt.Println(v.String()) // NOTE: "<int Value>"

// Calling the Type method on a Value returns its type as a reflect.Type
t := v.Type()           // a reflect.Type

// The inverse operation to reflect.ValueOf is the reflect.Value.Interface
// method. It returns an interface{} holding the same concrete value as the
// reflect.Value:
x := v.Interface()      // an interface{}
i := x.(int)            // an int
fmt.Printf("%d\n", i)   // "3"
```

A reflect.Value and an interface{} can both hold arbitrary values. The
difference is that an empty interface hides the representation and intrinsic
operations of the value it holds and exposes none of its methods, so unless we
know its dynamic type and use a type assertion to peer inside it ,there is
little we can do to the value within. In contrast, a Value has many methods for
inspecting its contents, regardless of its type.

Instead of a type switch, we use reflect.Value's Kind method to discriminate the
cases. Although there are infinitely many types, there are only a finite number
of "kinds of type": the basic types Bool, String, and all the numbers; the
aggregate types Array and Struct; the reference types Chan, Func, Ptr, Slice,
and Map; Interface types; and finally Invalid, meaning no value at all.
(The zero value of a reflect.Value has kind Invalid.)

```go
// Although reflect.Value has many methods, only a few are safe to call on any
// given value.
switch v.Kind() {
case reflect.Invalid:
    return "invalid"
case reflect.Int, reflect.Int8, reflect.Int16,
    reflect.Int32, reflect.Int64:
case reflect.Uint, reflect.Uint8, reflect.Uint16,
    reflect.Uint32, reflect.Uint64, reflect.Uintptr:
// ...floating-point and complex cases omitted for brevity...
case reflect.Bool:
case reflect.String:
case reflect.Array, reflect.Slice:
    // v.Len()
    // v.Index(i)
case reflect.Struct:
    // v.NumField()
    // v.Field(i): i-th field as a reflect.Value
    // v.Type().Field(i).Name
case reflect.Map:
    // v.MapKeys(): slice of reflect.Values
    // v.MapIndex(key): value of key
case reflect.Ptr, reflect.Interface:
    // v.Elem()
    // v.IsNil()
}
```

## Design

We can use wrapper to avoid exposing reflection in the API of a package.

```go
// The exported Display is a simple wrapper around display
func Display(name string, x interface{}) {
    display(name, reflect.ValueOf(x))
}

func display(path string, v reflect.Value) {
    // do the real work using reflect
}
```

## Addressable, Update

Recall that some Go expressions like x, `x.f[1]`, and `*p` denote variables, but
others like x + 1 and f(2) do not. A variable is an *addressable storage
location* that contains a value, and its value may be updated through that
address.

A similar distinction applies to reflect.Values. Some are addressable; others
are not. Consider the following declarations:

```go
x := 2                      // value    type    variable?
a := reflect.ValueOf(2)     // 2        int     no
b := reflect.ValueOf(x)     // 2        int     no
c := reflect.ValueOf(&x)    // &x       *int    no
d := c.Elem()               // 2        int     yes(x)
```

The value within a is not addressable. It is merely a copy of the integer 2. The
same is true of b. The value within c is also non-addressable, being a copy of
the pointer value &x. **In fact, no reflect.Value returned by reflect.ValueOf
(x) is addressable. But d, derived from c by dereferencing the pointer within
it, refers to a variable and is thus addressable. We can use this approach,
calling reflect.ValueOf(&x).Elem(), to obtain an addressable Value for any
variable x**.

We can ask a reflect.Value whether it is addressable through its CanAddr method:

```go
fmt.Println(a.CanAddr()) // "false"
fmt.Println(b.CanAddr()) // "false"
fmt.Println(c.CanAddr()) // "false"
fmt.Println(d.CanAddr()) // "true"
```

We obtain an addressable reflect.Value whenever we indirect through a pointer,
even if we started from a non-addressable Value. All the usual rules for
addressability have analogs for reflection. For example, since the slice
indexing expression `e[i]` implicitly follows a pointer, it is addressable even
if the expression e is not. By analogy, **reflect.ValueOf(e).Index(i) refers to a
variable, and is thus addressable even if reflect.ValueOf(e) is not**.

To recover the variable from an addressable reflect.Value requires three steps.
First, we call Addr(), which returns a Value holding a pointer to the variable.
Next, we call Interface() on this Value, which returns an interface{} value
containing the pointer. Finally, if we know the type of the variable, we can
use a type assertion to retrieve the contents of the interface as an ordinary
pointer. We can then update the variable through the pointer:

```go
x := 2
d := reflect.ValueOf(&x).Elem()     // d refers to the variable x
px := d.Addr().Interface().(*int)   // px := &x
*px = 3                             // x = 3
fmt.Println(x)                      // "3"
```

Or, we can update the variable referred to by an addressable reflect.Value
directly, without using a pointer, by calling the reflect.Value.Set method:

```go
// other variants: SetInt, SetUint, SetString, SetFloat...
d.Set(reflect.ValueOf(4))
fmt.Println(x) // "4"
```

The same checks for assignability that are ordinarily performed by the compiler
are done at run time by the Set methods. Above, the variable and the value both
have type int, but if the variable had been an int64, the program would panic,
so it’s crucial to **make sure the value is assignable** to the type of the
variable:

```go
d.Set(reflect.ValueOf(int64(5))) // panic: int64 is not assignable to int

// Calling Set on a non-addressable reflect.Value panics too:
x := 2
b := reflect.ValueOf(x)
b.Set(reflect.ValueOf(3))   // panic: Set using unaddressable value
```

In some ways these methods are more forgiving. SetInt, for example, will succeed
so long as the variable's type is some kind of signed integer, or even a named
type whose underlying type is a signed integer, and if the value is too large
it will be quietly truncated to fit. But tread carefully: calling SetInt on a
reflect.Value that refers to an interface{} variable will panic, even though
Set would succeed.

```go
x := 1
rx := reflect.ValueOf(&x).Elem()
rx.SetInt(2)                            // OK, x = 2
rx.Set(reflect.ValueOf(3))              // Ok, x = 3
rx.SetString("hello")                   // panic: string is not assignable to int
rx.Set(reflect.ValueOf("hello"))        // panic: string is not assignable to int

var y interface{}
ry := reflect.ValueOf(&y).Elem()
ry.SetInt(2)                            // panic: SetInt called on interface Value
ry.Set(reflect.ValueOf(3))              // OK, y = int(3)
ry.SetString("hello")                   // panic: SetString called on interface Value
ry.Set(reflect.ValueOf("hello"))        // OK, y = "hello"
```

Although reflection **can see unexported fields, but cannot update** such values:

```go
stdout := reflect.ValueOf(os.Stdout).Elem() // *os.Stdout, an os.File var
fmt.Println(stdout.Type())                  // "os.File"
fd := stdout.FieldByName("fd")
fmt.Println(fd.Int())                       // "1"
fd.SetInt(2)                                // panic: unexported field
```

The related method CanSet reports whether a reflect.Value is addressable
and *settable*.

```go
fmt.Println(fd.CanAddr(), fd.CanSet()) // "true false"
```

## Struct Field Tags

The Field method of reflect.Type returns a reflect.StructField that provides
information about the type of each field such as its name, type, and optional
tag. The Tag field is a reflect.StructTag, which is a string type that provides
a Get method to parse and extract the substring for a particular key.

## Methods of a Type

Both reflect.Type and reflect.Value have a method called Method. Each t.Method(i)
call returns an instance of reflect.Method, a struct type that describes
the name and type of a single method. Each v.Method(i) call returns a
reflect.Value representing a method value, that is, a method bound to its
receiver. Using the reflect.Value.Call method (which we don't have space to
show here), it's possible to call Values of kind Func like this one, but this
program needs only its Type.

# Unsafe

Go guarantees a number of "safety properties":

* During compilation, type checking detects most attempts to apply an operation
  to a value that is inappropriate for its type.
* Dynamic checks ensure that the program immediately terminates with an
  informative error whenever a forbidden operation occurs.
* Automatic memory management (garbage collection) eliminates "use after free"
  bugs, as well as most memory leaks.

Occasionally, we may choose to forfeit some of these helpful guarantees to
achieve the highest possible performance, to interoperate with libraries
written in other languages, or to implement a function that cannot be expressed
in pure Go.

The "unsafe" package lets us step outside the usual rules. It is actually
implemented by the compiler, used extensively within low-level packages like
runtime, os, syscall, and net that interact with the operating system, but is
almost never needed by ordinary programs.

## Size

```go
// Sizeof reports the size in bytes of the representation of its operand.
// A call to Sizeof is a constant expression of type uintptr
fmt.Println(unsafe.Sizeof(float640))    // "8"
```

Typical Sizes (for reference type, we give size in words, which is 4 bytes on
32-bit system and 8 bytes on 64-bit system):

    Type                                        Size
    ---------------------------------------------------
    bool                                        1 byte
    intN,uintN,floatN,complexN                  N/8 bytes
    int,uint,uintptr                            1 word
    *T                                          1 word
    string                                      2 words (data,len)
    []T                                         3 words (data,len,cap)
    map                                         1 word
    func                                        1 word
    chan                                        1 word
    interface                                   2 words (type,value)

## Alignment

If the types of a struct's fields are of different sizes, it may be more
space-efficient to declare the fields in an order that packs them as tightly as
possible. it's certainly not worth worrying about every struct, but efficient
packing may make frequently allocated data structures more compact and
therefore faster.

This shows how different **order of declaration affects memory space-efficiency**:

                                    // 64-bit       32-bit
    struct{ bool; float64; int16 }  // 3 words      4 words
    struct{ float64; int16; bool }  // 2 words      3 words
    struct{ bool; int16; float64 }  // 2 words      3 words

Alignof reports the required alignment of its argument's type. Typically boolean
and numeric types are aligned to their size (up to a maximum of 8 bytes) and
all other types are word-aligned.

Offsetof(x.f) computes the offset of a field relative to the start of its
enclosing struct x.

```go
//  32-bit system                               64-bit system
//
// | a |   |   b   |                    | a |   |   b  |               |
// |     c(data)   |                    |          c(data)             |
// |     c(len)    |                    |          c(len)              |
// |     c(cap)    |                    |          c(cap)              |
var s struct {
    a bool      // 1
    b int16     // 2
    c []int     // 3 words
}

// Typical 32-bit platform:
// Sizeof(x)   = 16  Alignof(x)   = 4
// Sizeof(x.a) = 1   Alignof(x.a) = 1   Offsetof(x.a) = 0
// Sizeof(x.b) = 2   Alignof(x.b) = 2   Offsetof(x.b) = 2
// Sizeof(x.c) = 12  Alignof(x.c) = 4   Offsetof(x.c) = 4


// Typical 64-bit platform:
// Sizeof(x)   = 32  Alignof(x)   = 8
// Sizeof(x.a) = 1   Alignof(x.a) = 1  Offsetof(x.a) = 0
// Sizeof(x.b) = 2   Alignof(x.b) = 2  Offsetof(x.b) = 2
// Sizeof(x.c) = 24  Alignof(x.c) = 8  Offsetof(x.c) = 8

```

## Pointer

unsafe.Pointer type is a special kind of pointer that **can hold the address of
any variable**. Of course, we can't indirect through an unsafe.Pointer using
`*p` because we don't know what type that expression should have. Like ordinary
pointers, unsafe.Pointers are comparable and may be compared with nil, which is
the zero value of the type.

An ordinary `*T` pointer may be converted to an unsafe.Pointer, and an
unsafe.Pointer may be converted back to an ordinary pointer, not necessarily of
the same type `*T`. **By converting a `*float64` pointer to a `*uint64`, for
instance, we can inspect the bit pattern of a floating-point variable**:

```go
func Float64bits(f float64) uint64 { return *(*uint64)(unsfae.Pointer(&f)) }
```

unsafe.Pointer conversions let us write arbitrary values to memory and thus
**subvert the type system**.

An unsafe.Pointer may also be converted to a uintptr that holds the pointer's
numeric value, letting us **perform arithmetic on addresses**.

Many unsafe.Pointer values are thus intermediaries for converting ordinary
pointers to raw numeric addresses and back again.

```go
// takes the address of variable x, adds the offset of its b field, converts the
// resulting address to *int16, and through that pointer update x.b:

// equivalent to pb := &x.b
pb := (*int16)(unsafe.Pointer(uintptr(unsafe.Pointer(&x)) + unsafe.Offsetof(x.b)))
*pb = 42

fmt.Println(x.b) // "42"
```

Traps:

DON'T be tempted to introduce temporary variable of type uintptr to break the line:

    tmp := uintptr(unsafe.Pointer(&x)) + unsafe.Offsetof(x.b)
    pb := (*int16)(unsafe.Pointer(tmp))
    *pb = 42

Some garbage collectors move variables around in memory to reduce fragmentation
or bookkeeping. Garbage collectors of this kind are known as "moving GCs". When
a variable is moved, all pointers that hold the address of the old location
must be updated to point to the new one. From the perspective of the garbage
collector, an unsafe.Pointer is a pointer and thus its value must change as the
variable moves, but a uintptr is just a number so its value must not change.
The incorrect code above *hides a pointer* from the garbage collector in the
non-pointer variable tmp. By the time the second statement executes, the
variable x could have moved and the number in tmp would no longer be the
address &x.b. The third statement clobbers an arbitrary memory location with
the value 42.

DON'T do:

    pT := uintptr(unsafe.Pointer(new(T)))

There are no pointers that refer to the variable created by new, so the garbage
collector is entitled to recycle its storage when this statement completes,
after which pT contains the address where the variable was but is no longer.

Workarounds:

Treat all uintptr values as if they contain the former address of a variable,
and minimize the number of operations between converting an unsafe.Pointer to a
uintptr and using that uintptr. When calling a library function that returns a
uintptr, the result should be immediately converted to an unsafe.Pointer to
ensure that it continues to point to the same variable.

# Cgo

See:

* https://golang.org/cmd/cgo.
* https://go.dev/blog/cgo

A Go program might need to use a hardware driver implemented in C, query an
embedded database implemented in C++, or use some linear algebra routines
implemented in Fortran.

cgo, a tool that **creates Go bindings for C functions**. Such tools are called
"foreign-function interfaces" (FFIs), and cgo is not the only one for Go
programs. SWIG (swig.org) is another; it provides more complex features for
integrating with C++ classes.

When To Use Cgo

If the C library were small, we would just port it to pure Go, and if its
performance were not critical for our purposes, we would be better off invoking
a C program as a helper subprocess using the os/exec package. It's when you
need to use a complex, performance-critical library with a narrow C API that it
may make sense to wrap it using cgo.

Going in the other direction, it's also possible to compile a Go program as a
static archive that can be linked into a C program or as a shared library that
can be dynamically loaded by a C program.

# Testing

See go.testing.

## Table Driven Testing

See gopl#word2/TestIsPalindrom.

Tests are **independent** of each other. If an early entry in the table causes
the test to fail, later table entr ies will still be checked. When we really
must stop (perhaps because some initialization code failed), we can use t.Fatal
or t.Fatalf.

## Randomized Testing

How do we know what output to expect from our function, given a random input?
There are two strategies.

* Write an alternative implementation of the function that uses a less efficient
  but simpler and clearer algorithm, and check that both implementations give
  the same result.
* Create input values according to a pattern so that we know what output to
  expect. See gopl#word2/word2/randomPalindrome.

Since randomized tests are nondeter ministic, it is critical that the log of the
failing test record sufficient information to reproduce the failure.

## Testing Main

See gopl#echo_test.

A package named main ordinarily produces an executable program, but it can be
**imported as a library** too. Although the package name is main and it defnies
a main function, during testing this package acts as a library that exposes
its TestXXX funcs to the test driver; its **main function is ignored**.

We can write tests for main program **by splitting** main program into two: one
that does the real work, while main parses and reads flag values and reports
any error returned by the former. As for input/output, we can let the function
being test write to another varaibles instead directly using
os.Stdin/os.Stdout, so that it can be replaced by any Writer implementation
while testing.

It’s important that code being tested **not call log.Fatal or os.Exit**, since
these will stop the process in its tracks; calling these functions should be
regarded as the exclusive right of main. If something totally unexpected
happens and a function panics, the test driver will recover, though the test
will of course be considered a failure.

## Whtie-Box Testing: Fake, Replace, Restore

We've seen two types of testing:

* **Black-box testing**: assume nothing about the implementation detail, like in
  TestIsPalindrome, it calls only the exposed function. Black-box testing are
  usually  more robust, needing fewer updates as the software envolves.
* **White-box testing**: has the privileged access to the internal functions and
  data structure of the package and can make observations and changes that an
  ordinary client cannot, like in TestEcho, it calls the echo function and updates
  the global variable out, both of which are unexported.

Using the same technique as TestEcho, we can replace other parts of the production
code with easy-to-test "fake" implementations.

Suppose we need to test a function that will send a email, but when testing, we
don't want the email actually sent out. So we can move the email logic into its
own function and store that function in an unexported package-level variable;
when testing, we replace it with our fake implementation; also, because its a
global variable, we need to restore it back so other tests won't be affected.
See gopl#storage1,storage2.

This pattern can be used to temporarily save and restore all kinds of global
variables, including command-line flags, debugging options, and performance
parameters; to install and remove hooks that cause the production code to call
some test code when something interesting happens; and to coax the production
code into rare but important states, such as timeouts, errors, and even
specifc interleavings of concurrent activities.

Using global variables in this way is **safe only because go test does not
normally run multiple tests concurrently**.

## External Test Package

Consider this situation: higher-level net/http package depend on lower-level
net/url pacakge, However one of the tests in net/url is an example
demonstrating the interaction between URLs and HTTP client library, so the
lower-level net/url need import higher-level net/http -- but it cannot, since
that would create a **import cycles** which Go spec forbid.

We resolve the problem by declaring the test function in an "external test
package", that is, in a flie in the net/url directory whose package declaration
reads package url_test. The extra suffix `_test` is a signal to go test that it
should build an additional package containing just these flies and run its
tests. It may be helpful to think of this external test package as if it had
the import path net/url_test, but it **cannot be imported** under this or any
other name.

Because external tests live in a separate package, they may import helper
packages that also depend on the package being tested, so instead of let
net/url depend on net/http and create import cycle, we let net/url_test depend
on both, breaking the import cycle. External test package is also useful to do
**"integratioin tests"**, which test the interaction of several components.

Sometimes **an external test package may need privileged access to the internals
of the package under test**, if for example a white-box test must live in a
separate package to avoid an import cycle. In such cases, we use a trick: we
add declarations to an in-package `_test.go` file to expose the necessary
internals to the external test. This file thus offers the test a **"back
door"** to the package. If the source flie exists only for this purpose and
contains no tests itself, it is often called export_test.go. This trick can
also be used whenever an external test needs to use some of the techniques of
white-box testing.

---

We can use the `go list` tool to summarize these differenct kind of source code:

{% raw %}

    # GoFiles are production code, which will include by go build:
    $ go list -f={{.GoFiles}} fmt

    # TestgoFiles are in-package tests
    $ go list -f={{.TestGoFiles}} fmt

    # XTestGoFiles are external tests
    $ go list -f={{.XTestGoFiles}} fmt
    
{% endraw %}

## Design

The key to a good test is to start by implementing the concrete behavior that
you want and only then use functions to simplify the code and eliminate
repetition. Best results are rarely obtained by starting with a library of
abstract, generic testing functions. That's why Go's testing framework seems so
minimalism.

The most brittle tests, which fail for almost any change to the production code,
good or bad, are sometimes called "change detector" or "status quo" tests, and
the time spent dealing with them can quickly deplete any benefit they once
seemed to provide.

When a function under test produces a complex output such as a long string, an
elaborate data structure, or a file, it’s tempting to check that the output is
exactly equal to some ‘‘golden’’ value that was expected when the test was
written. But as the program evolves, parts of the output will likely change ,
probably in good ways, but change nonetheless. And it’s not just the output;
functions with complex inputs often break because the input used in a test is
no longer valid.

The easiest way to avoid brittle tests is to **check only the properties you
care about**. Test your program’s simpler and more stable interfaces in
preference to its internal functions. Be selective in your assertions. Don’t
check for exact string matches, for example, but look for relevant substrings
that will remain unchanged as the program evolves. It’s often worth writing a
substantial function to distill a complex output down to its essence so that
assertions will be reliable. Even though that may seem like a lot of up-front
effort, it can pay for itself quickly in time that would other wise be spent
fixing spuriously failing tests.

# Coverage

    $ go tool cover

This command displays the usage of the coverage tool.

The "go tool" command runs one of the executables from the Go toolchain. These
programs live in the directory `$GOROOT/pkg/tool/${GOOS}_${GOARCH}`. Thanks to
go build, we rarely need to invoke them directly.

Gathering

    $ go test -coverprofile=c.out ...
    $ go test -cover ...
    $ go test -covermode=count

`-coverprofile` flag enables the collection of coverage data by "instrumenting"
the production code. That is, it modifies a copy of the source code so that
before each block of statements is executed, a boolean variable is set, with
one variable per block. Just before the modified program exits, it writes the
value of each variable to the specifeid log file c.out and prints a summary of
the fraction of statements that were executed. (If all you need is the summary,
use go test `-cover`.)

If go test is run with the `-covermode=count` flag, the instrumentation for each
block increments a counter instead of setting a boolean. The resulting log of
execution counts of each block enables quantitative comparisons
between "hotter" blocks, which are more frequently executed, and "colder"
ones.

Showing

    $ go tool cover -html=c.out

# Benchmark

Absolute Timing

Benchmarking is the practice of measuring the performance of a program on a
**fixed** workload.

    $ go test -bench=.
    PASS
    BenchmarkIsPalindrome-8 1000000             1035 ns/op

The "." pattern causes it to match all benchmarks. In the result, the benchmark
name's suffix, 8 here, indicates the value of GOMAXPROCS. The report tells us
that each call to IsPalindrome took about 1.035 microseconds, averaged over
1,000,000 runs.

Relative Timing

In many settings the interesting performance questions are about the relative
timings of two different operations. For example:

* If a function takes 1ms to process 1,000 elements, how long will it take to
  process 10,000 or a million? Such comparisons **reveal the asymptotic
  growth** of the running time of the function.
* What is the best size for an I/O buffer? Benchmarks of application throughput
  over a range of sizes can **help us choose** the smallest buffer that
  delivers satisfactory performance.
* Which algorithm performs best for a given job? Benchmarks that evaluate two
  different algorithms on the same input data can often show the strengths and
  weaknesses of each one on important or representative work loads.

Comparative benchmarks are just regular code. They typically take the form
of **a single parameterized function, called from several Benchmark functions
with different values**, like this:

    func benchmark(b *testing.B, size int) { /* ... */ }
    func Benchmark10(b *testing.B) { benchmark(b, 10) }
    func Benchmark100(b *testing.B) { benchmark(b, 100) }
    func Benchmark1000(b *testing.B) { benchmark(b, 1000) }

The parameter size, which specifies the size of the input, varies across
benchmarks but is constant within each benchmark. **Resist the temptation to
use the parameter b.N as the input size**. Unless you interpret it as an
iteration count for a fixed-size input, the results of your benchmark will be
meaningless.

# Profiling

See:

* https://go.dev/blog/pprof
* https://github.com/google/pprof/blob/main/doc/README.md
* go doc runtime/pprof
* go doc net/http/pprof

The best technique for identifying the critical code (so we know "where to
begin" our optimization) is profiling. "Profiling" is an automated approach
to performance measurement based on **sampling a number of profile events
during execution**, then extrapolating from them during a post-processing
step; the resulting statistical summary is called a profile.

The go test tool has built-in support for several kinds of profiling:

* A "CPU profile" identifeis the functions whose execution requires the most CPU
  time. The currently running thread on each CPU is interrupted periodically by
  the operating system every few milliseconds, with each interruption recording
  one profile event before normal execution resumes.
* A "heap proflie" identifeis the statements responsible for allocating the most
  memory. The profiling library samples calls to the internal memory allocation
  routines so that on average, one profile event is recorded per 512KB of
  allocated memory.
* A "blocking profile" identifies the operations responsible for blocking
  goroutines the longest, such as system calls, channel sends and receives, and
  acquisitions of locks. The profiling library records an event every time a
  goroutine is blocked by one of these operations.

Gathering For Test Code

    $ go test -cpuprofile=cpu.out
    $ go test -blockprofile=block.out
    $ go test -memprofile=mem.out

Be careful when using more than one flag at a time: the machinery for gathering
one kind of profile may skew the results of others.

Gathering For Non-Test Code

Though the details of how we do that vary between short-lived command-line
tools and long-running server applications. Profiling is especially
useful in long-running applications, so the Go runtime’s profiling features can
be enabled under programmer control using the **runtime API**.

Analyse

We can use `go tool pprof` to analyze the profile.


