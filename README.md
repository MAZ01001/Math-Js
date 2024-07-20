# Math in JavaScript

- [Polynomial.js](#polynomialjs)
- [Fraction.js](#fractionjs)
- [Matrix.js](#matrixjs)
- [Vector.js](#vectorjs)
- [ComplexNumber.js](#complexnumberjs)
- [BigIntType.js](#biginttypejs)
  - [Supported numerical bases](#biginttype-supported-numerical-bases "Scroll to section: [BigIntType] Supported numerical bases")
    - [Supported numerical base names](#biginttype-supported-numerical-base-names "Scroll to section: [BigIntType] Supported numerical base names")
  - [Supported rounding types](#biginttype-supported-rounding-types "Scroll to section: [BigIntType] Supported rounding types")
  - [Supported modulo types](#biginttype-supported-modulo-types "Scroll to section: [BigIntType] Supported modulo types")
    - [Modulo examples](#biginttype-modulo-examples "Scroll to section: [BigIntType] Modulo examples")
- [BigIntFractionComplex.js](#bigintfractioncomplexjs)
- [functions.js](#functionsjs)

----

## [Polynomial.js](./Polynomial.js)

>
> WIP
>
> - formula for degree 3/4
> - chainable methods
>

- make polynomial directly/from string/roots
- print as string
- finding roots
  - Newton's method for degree 3 and higher
  - formula for degree 2 and lower
- create derivative/antiderivative
- calculate f(x)
- calculate integral with
  - antiderivative formula
  - set delta x

Scroll [UP](#polynomialjs "Scroll to start of section: Polynomial.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [Fraction.js](./Fraction.js)

- make fraction directly/from decimal/-string
- GCD & decimal to fraction algorithm as public static methods
- fraction to
  - improper-form
  - mixed-form
  - decimal
  - string
- addition/multiplication/subtraction/divition with
  - a single integer
  - another fraction
- raise fraction to nth power
- chainable methods

Scroll [UP](#fractionjs "Scroll to start of section: Fraction.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [Matrix.js](./Matrix.js)

>
> WIP
>
> - row to row addition
> - row to row subtraction
> - row multiplied by constant
>

- make matrix directly/from string
- create identity matrix
- print as a formatted string
- single number
  - muliplication
  - divition
- matrix
  - addition
  - subtraction
  - multiplication
  - divition
- matrix inversion (Gauß Bareiss)
- chainable methods
- row
  - move
  - delete
- col
  - delete
- check matrix stats

Scroll [UP](#matrixjs "Scroll to start of section: Matrix.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [Vector.js](./Vector.js)

>
> WIP
>
> - make vector from string
> - printing to string
>

- 1D, 2D or 3D vector
- calculate length
- calculate angle
  - to other vector
  - to X, Y, Z - axis
  - to XY, YZ, XZ - plane
  - to X, Y, Z - axis on XY, YZ, XZ - plane (2D>3D)
- static methods DEG to RAD and RAD to DEG conversion
- test if finite
- test if equal to another vector
- convert vector to unit-vector (length 1 same direction)
- vector
  - addition
  - subtraction
  - inversion
  - scale by constant (multiply number)

Scroll [UP](#vectorjs "Scroll to start of section: Vector.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [ComplexNumber.js](./ComplexNumber.js)

>
> WIP
>
> - pow (without polar form) better calculation and support for non-integers
> - pow with complex exponent `z↑z`
> - root (any index) without polar form
> - root with complex index
> - log of complex numbers (with custom base)
>

- static (precalculated) values
  - RegExp for cartesian (`a±bi`) and polar form (`r∠φrad` or `r∠φ°`)
    - `∠` is U+2220 and `°` is U+00B0
  - `2π` ie `τ`
  - `π/2`
  - `π/4`
  - factor to convert from radians to degrees (`180/π`)
  - factor to convert from degrees to radians (`π/180`)
- create new complex numbers
  - from (getter) `0`, `1`, `i`, `e↑i`, or `i↑i`
  - from real and imaginary parts (constructor with `new` and alias without `new`)
  - from length and angle (from positive real axis in radians)
  - from angle (from positive real axis in radians) on unit circle
  - from the square root of any real number
  - from `e↑(i*n)` where `n` is a real number
  - from `n^i` where `n` is a real number (except `0`)
  - from logarithm with custom base (except `0` and `1`) from any real number (except `0`)
  - from string in format `a±bi` or `r∠φrad` (or degrees `r∠φ°`)
    - `∠` is U+2220 and `°` is U+00B0
- attributes (non-private)
  - real part (JS `Number`)
  - imaginary part (JS `Number`)
- internal methods (non-private)
  - calculate greatest common divisor of two positive safe integers (`[1..2↑53[`)
  - round float to nearest integer when closer than float minimum (JS `Number.EPSILON*5`)
- round complex number (real and imaginary part separately) to nearest integer when closer than float minimum (JS `Number.EPSILON*5`)
  - useful for trigonometric functions as they calculate with small numbers and are thereby prone to float precision errors (noted in JSDoc of affected methods)
- getter
  - absolute value / length / radius
  - angle from polar coordinates (from positive real axis in radians)
    - `[0,2π[` / `undefined`
    - _safe_ `[0,2π[` / `0`
    - _small_ `]-π,π]` / `undefined`
    - _small and safe_ `]-π,π]` / `0`
  - arc length _from positive real axis to the complex number in polar coordinates_
  - sector (arc area) _from positive real axis to the complex number in polar coordinates_
- convert to string in format `a±bi` or `r∠φrad` (or degrees `r∠φ°`)
  - `∠` is U+2220 and `°` is U+00B0
- log current value to console without breaking method chain
  - format: `±a + (±b)i ~ r ∠ φ rad (φ°)`
    - `∠` is U+2220 and `°` is U+00B0
- copy values
  - from the current to a new complex number (create a copy)
  - from another to the current complex number (override)
  - from the current to another complex number (reverse override)
- check for equality to `0`, `1`, or another complex number
- arithmetic with complex numbers
  - negate current complex number (`z*(-1)` ie `-z`)
  - invert current complex number (`z↑(-1)` ie `1/z`)
  - conjugate of current complex number (`a+bi` → `a-bi`)
  - rotate complex number (counterclockwise) by an angle (from positive real axis in radians)
  - scale angle by a scaler (real number)
  - addition with a real number or another complex number
  - subtraction with a real number or another complex number
  - multiplication with a real number or another complex number
  - division with a real number or another complex number
  - raising to `n`th power
    - with kartesian form (currently only safe integers `]-2↑53..2↑53[`)
    - with polar form (lower precision but faster and not limited to integers)
  - square root ("positive" solution to `z↑2`)
- `n`th root (currently only safe integers `]-2↑53..2↑53[`)
  - gives a generator that creates all complex solutions to `z↑n`
  - ordered counterclockwise from positive real axis
  - assume first entry is the "positive" root ie. principal root

  ```javascript
  new ComplexNumber(2,0).pow(-4).roots(-4).next().value
      ?.roundEpsilon().toString()??"no root";
  "2+0i";

  [...new ComplexNumber(2,0).pow(-4).roots(-4)]
      .map(v=>v.roundEpsilon().toString());
  ["2+0i", "0+2i", "-2+0i", "0-2i"];
  ```

the class and its prototype are immutable!

- import [dynamically](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import "MDN JS import() / dynamic import")

  ```javascript
  const { ComplexNumber } = await import("./ComplexNumber.js");
  ```

- import in node.js

  ```javascript
  const { ComplexNumber } = require("./ComplexNumber.js");
  // or in modules ↓
  import { ComplexNumber } from "./ComplexNumber.js";
  ```

- import in html:

  ```html
  <script src="./ComplexNumber.js"></script>
  ```

Scroll [UP](#complexnumberjs "Scroll to start of section: ComplexNumber.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [BigIntType.js](./BigIntType.js)

>
> WIP
>
> - custom PRNG for `randomInt()`
> - `BigIntType` as type for bitshift methods
> - new special case for internal division algorithm
>

arbitrary precision integer using JS's Uint8Array (unsigned 8-bit integer array)
human "readable" code with lots of documentation (js-doc & some comments) and descriptive error throws

>
> [__BigIntType online calculator__ WIP](https://maz01001.github.io/site/biginttype_calc.html)
>

- adjustable limit `MAX_SIZE:Number` (Range 1 to 67108864 / 64MiB) (software max is [8PiB-1] - wich could be extended to [16PiB-2] using `Uint16Array` - or even [32PiB-4] using `Uint32Array` and `BigInt`)
- internal values: `sign:Boolean` / `digits:Uint8Array` (base 256 digits) / `length:Number` (length of digit-array)
- during [JS type coercion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#type_coercion "MDN reference on type coercion in JS"), it converts to `BigInt` by default or in the context of numbers and to (base 16) `String` when used in the context of strings
- conversions to `toBigInt()` / `ToNumber()` / `ToString(base)`
- can be created from, and converted to, different [bases](#biginttype-supported-numerical-bases "see all supported bases")
- encode `toURL()` / `fromURL()`
- comparisons:
  - `isOdd()` / `isEven()`
  - `A === 0` / `A === 1` / `A === 2`
  - `A < B` / `A > B` / `A == B` / `A === B` / `A >= B` / `A <= B`
  - `isSafeInteger()` / `isFinite()` (for checking if its save to convert to `Number`)
  - `isPowerOfTwo()` / `isPowerOfBase()` (256)
- __chainable methods:__
  - number constants: `0` / `1` / `2` also negative equivalents and `Infinity` (`1 ** 1024`) / `MAX_VALUE` / `HelloThere`
  - logging to console via `logConsole(base)` format: `[timestamp] (byte count) sign digits (base indicator)` (text is green on black and in large monospace font if the console supports it)
  - copy/setEqual: `copy()` / `reverseCopy(toOtherNumber)` / `setEqualTo(otherNumber)` / `swapWith(otherNumber)`
  - sign: `abs()` / `neg()` (`-A`) / `signNum()` (+1 / +0 / -1)
  - operations:
    - `++A` / `--A` / `A += B` / `A -= B`
    - `A *= B` using karatsubas algorithm / `A **= B`
    - `A /= B` with [rounding](#biginttype-supported-rounding-types "see supported rounding types") / `A %= B` with [rounding](#biginttype-supported-modulo-types "see supported modulo types")
    - `A *= 2` / `A /= 2` with [rounding](#biginttype-supported-rounding-types "see supported rounding types")
    - `A *= (256 ** x)` with [rounding](#biginttype-supported-rounding-types "see supported rounding types") - (digit-shifts)
    - `A **= 2` / `A **= 3`
  - bitwise operations:
    - `A >>>= x` / `A <<= x` / `A &= B` / `A |= B` / `A ^= B` / `A ~= A`
  - `GCD(A, B)`
  - `mapRange(a, b, a2, b2)` with [rounding](#biginttype-supported-rounding-types "see supported rounding types") and limit (cap at a2 / b2)
- `randomInt(min, max)` (using `Math.random()`)
- _↑ (`A` and `B` are type `BigIntType` and `x` is type `Number`) ↑_

Scroll [UP](#biginttypejs "Scroll to start of section: BigIntType.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

### [BigIntType] Supported numerical bases

>
> ALL YOUR BASE ARE BELONG TO US
>

- all bases from 2 to 4'294'967'296 (inclusive) are supported for in- and output
  - via `String`, `Number`, `BigInt`, `Uint8Array`, or array of `Number`s
  - base 1 is only supported for input
- supported prefixes
  - `0b` for base 2 (binary)
  - `0o` for base 8 (octal)
  - `0x` for base 16 (hexadecimal)
- used characters (as digits in a string)
  - up to base 36 (including), `0-9` and `A-Z` are used as needed
  - above 36 only via CSV (comma-separated-values or numbers in this case),
    where each number corresponds to the numerical value of the digit at that place
    (in base 10 / with `0-9`)
  - `"braille"` is in base 256 but uses braille patterns (`U+2800` to `U+28FF` inclusive) as digit-charset

Scroll [UP](#biginttypejs "Scroll to start of section: BigIntType.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

#### [BigIntType] Supported numerical base names

>
> [Wikipedia: Numerical Bases](https://en.wikipedia.org/wiki/List_of_numeral_systems#Standard_positional_numeral_systems)
>

<details closed><summary>click to show table</summary>

| base | names                                                |       base | names                                          |
| ----:| ---------------------------------------------------- | ----------:| ---------------------------------------------- |
|    2 | `b` / `bin` / `bits` / `binary` / `1bit`             |         72 | `duoseptuagesimal`                             |
|    3 | `ternary` / `trinary`                                |         80 | `octogesimal`                                  |
|    4 | `q` / `quaternary` / `2bit`                          |         81 | `unoctogesimal`                                |
|    5 | `quinary` / `pental`                                 |         85 | `pentoctogesimal`                              |
|    6 | `senary` / `heximal` / `seximal`                     |         89 | `enneaoctogesimal`                             |
|    7 | `septenary`                                          |         90 | `nonagesimal`                                  |
|    8 | `o` / `oct` / `octal` / `3bit`                       |         91 | `unnonagesimal`                                |
|    9 | `nonary`                                             |         92 | `duononagesimal`                               |
|   10 | `d` / `dec` / `decimal` / `denary`                   |         93 | `trinonagesimal`                               |
|   11 | `undecimal`                                          |         94 | `tetranonagesimal`                             |
|   12 | `duodecimal` / `dozenal` / `uncial`                  |         95 | `pentanonagesimal`                             |
|   13 | `tridecimal`                                         |         96 | `hexanonagesimal`                              |
|   14 | `tetradecimal`                                       |         97 | `septanonagesimal`                             |
|   15 | `pentadecimal`                                       |        100 | `centesimal`                                   |
|   16 | `h` / `hex` / `hexadecimal` / `sexadecimal` / `4bit` |        120 | `centevigesimal`                               |
|   17 | `heptadecimal`                                       |        121 | `centeunvigesimal`                             |
|   18 | `octodecimal`                                        |        125 | `centepentavigesimal`                          |
|   19 | `enneadecimal`                                       |        128 | `centeoctovigesimal` / `7bit`                  |
|   20 | `vigesimal`                                          |        144 | `centetetraquadragesimal`                      |
|   21 | `unvigesimal`                                        |        169 | `centenovemsexagesimal`                        |
|   22 | `duovigesimal`                                       |        185 | `centepentoctogesimal`                         |
|   23 | `trivigesimal`                                       |        196 | `centehexanonagesimal`                         |
|   24 | `tetravigesimal`                                     |        200 | `duocentesimal`                                |
|   25 | `pentavigesimal`                                     |        210 | `duocentedecimal`                              |
|   26 | `hexavigesimal`                                      |        216 | `duocentehexidecimal`                          |
|   27 | `heptavigesimal` / `septemvigesimal`                 |        225 | `duocentepentavigesimal`                       |
|   28 | `octovigesimal`                                      |        256 | `duocentehexaquinquagesimal` / `byte` / `8bit` |
|   29 | `enneavigesimal`                                     |        300 | `trecentesimal`                                |
|   30 | `trigesimal`                                         |        360 | `trecentosexagesimal`                          |
|   31 | `untrigesimal`                                       |        512 | `9bit`                                         |
|   32 | `duotrigesimal` / `5bit`                             |       1024 | `10bit`                                        |
|   33 | `tritrigesimal`                                      |       2048 | `11bit`                                        |
|   34 | `tetratrigesimal`                                    |       4096 | `12bit`                                        |
|   35 | `pentatrigesimal`                                    |       8192 | `13bit`                                        |
|   36 | `t` / `txt` / `text` / `hexatrigesimal`              |      16384 | `14bit`                                        |
|   37 | `heptatrigesimal`                                    |      32768 | `15bit`                                        |
|   38 | `octotrigesimal`                                     |      65536 | `16bit`                                        |
|   39 | `enneatrigesimal`                                    |     131072 | `17bit`                                        |
|   40 | `quadragesimal`                                      |     262144 | `18bit`                                        |
|   42 | `duoquadragesimal`                                   |     524288 | `19bit`                                        |
|   45 | `pentaquadragesimal`                                 |    1048576 | `20bit`                                        |
|   47 | `septaquadragesimal`                                 |    2097152 | `21bit`                                        |
|   48 | `octoquadragesimal`                                  |    4194304 | `22bit`                                        |
|   49 | `enneaquadragesimal`                                 |    8388608 | `23bit`                                        |
|   50 | `quinquagesimal`                                     |   16777216 | `24bit`                                        |
|   52 | `duoquinquagesimal`                                  |   33554432 | `25bit`                                        |
|   54 | `tetraquinquagesimal`                                |   67108864 | `26bit`                                        |
|   56 | `hexaquinquagesimal`                                 |  134217728 | `27bit`                                        |
|   57 | `heptaquinquagesimal`                                |  268435456 | `28bit`                                        |
|   58 | `octoquinquagesimal`                                 |  536870912 | `29bit`                                        |
|   60 | `sexagesimal` / `sexagenary`                         | 1073741824 | `30bit`                                        |
|   62 | `duosexagesimal`                                     | 2147483648 | `31bit`                                        |
|   64 | `tetrasexagesimal` / `6bit`                          | 4294967296 | `32bit`                                        |

</details>

Scroll [UP](#biginttype-supported-numerical-bases "Scroll to start of section: [BigIntType] Supported numerical bases")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

### [BigIntType] Supported rounding types

>
> [![Wikipedia: Rounding (interactible graph)](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Comparison_rounding_graphs_SMIL.svg/300px-Comparison_rounding_graphs_SMIL.svg.png "Wikipedia: Rounding (interactible graph)")](https://en.wikipedia.org/wiki/Rounding)
>

<details open><summary>click to hide table</summary>

| name        | description                                 |                                     example                                      |
| ----------- | ------------------------------------------- |:--------------------------------------------------------------------------------:|
| `NEAR_DOWN` | round to nearest integer, towards -infinity |    $+1.5 \text{ → } +1$ <br> $+2.5 \text{ → } +2$ <br> $-2.5 \text{ → } -3$    |
| `NEAR_UP`   | round to nearest integer, towards +infinity |    $+1.5 \text{ → } +2$ <br> $+2.5 \text{ → } +3$ <br> $-2.5 \text{ → } -2$    |
| `NEAR_ZERO` | round to nearest integer, towards zero      |    $+1.5 \text{ → } +1$ <br> $+2.5 \text{ → } +2$ <br> $-2.5 \text{ → } -2$    |
| `NEAR_INF`  | round to nearest integer, away from zero    |    $+1.5 \text{ → } +2$ <br> $+2.5 \text{ → } +3$ <br> $-2.5 \text{ → } -3$    |
| `NEAR_EVEN` | round to nearest even integer               |    $+1.5 \text{ → } +2$ <br> $+2.5 \text{ → } +2$ <br> $-2.5 \text{ → } -2$    |
| `NEAR_ODD`  | round to nearest odd integer                |    $+1.5 \text{ → } +1$ <br> $+2.5 \text{ → } +3$ <br> $-2.5 \text{ → } -3$    |
| `FLOOR`     | round down (towards -infinity)              | $+1.\ast \text{ → } +1$ <br> $+2.\ast \text{ → } +2$ <br> $-2.\ast \text{ → } -3$ |
| `CEIL`      | round up (towards +infinity)                | $+1.\ast \text{ → } +2$ <br> $+2.\ast \text{ → } +3$ <br> $-2.\ast \text{ → } -2$ |
| `TRUNC`     | round down (towards zero)                   | $+1.\ast \text{ → } +1$ <br> $+2.\ast \text{ → } +2$ <br> $-2.\ast \text{ → } -2$ |
| `RAISE`     | round up (away from zero)                   | $+1.\ast \text{ → } +2$ <br> $+2.\ast \text{ → } +3$ <br> $-2.\ast \text{ → } -3$ |

</details>

Scroll [UP](#biginttypejs "Scroll to start of section: BigIntType.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

### [BigIntType] Supported modulo types

>
> [Wikipedia: Modulo](https://en.wikipedia.org/wiki/Modulo)
>

<details open><summary>click to hide table</summary>

| name              | description                              |
| ----------------- | ---------------------------------------- |
| `ROUND_NEAR_DOWN` | division rounded towards -infinity       |
| `ROUND_NEAR_UP`   | division rounded towards +infinity       |
| `ROUND_NEAR_ZERO` | division rounded towards zero            |
| `ROUND_NEAR_INF`  | division rounded away from zero          |
| `ROUND_NEAR_EVEN` | division rounded to nearest even integer |
| `ROUND_NEAR_ODD`  | division rounded to nearest odd integer  |
| `FLOOR`           | floored division (towards -infinity)     |
| `CEIL`            | ceiled division (towards +infinity)      |
| `TRUNC`           | truncated division (towards zero)        |
| `RAISE`           | raised division (away from zero)         |
| `EUCLID`          | euclidean division (positive remainder)  |

</details>

Scroll [UP](#biginttypejs "Scroll to start of section: BigIntType.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

#### [BigIntType] Modulo examples

<details closed><summary>click to show table</summary>

$\large 3 \bmod 5 \rightarrow \dfrac{3}{5} = 0\dfrac{3}{5} = 0.6 \rightarrow \text{round up}$
|               | trunc | floor | euclid | round | ceil | raise |
|:-------------:| -----:| -----:| ------:| -----:| ----:| -----:|
| $+3 \bmod +5$ |  $+3$ |  $+3$ |   $+3$ |  $-2$ | $-2$ |  $-2$ |
| $+3 \bmod -5$ |  $+3$ |  $-2$ |   $+3$ |  $-2$ | $+3$ |  $-2$ |
| $-3 \bmod +5$ |  $-3$ |  $+2$ |   $+2$ |  $+2$ | $-3$ |  $+2$ |
| $-3 \bmod -5$ |  $-3$ |  $-3$ |   $+2$ |  $+2$ | $+2$ |  $+2$ |

$\large 5 \bmod 3 \rightarrow \dfrac{5}{3} = 1\dfrac{2}{3} = 1.\overline{6} \rightarrow \text{round up}$
|               | trunc | floor | euclid | round | ceil | raise |
|:-------------:| -----:| -----:| ------:| -----:| ----:| -----:|
| $+5 \bmod +3$ |  $+2$ |  $+2$ |   $+2$ |  $-1$ | $-1$ |  $-1$ |
| $+5 \bmod -3$ |  $+2$ |  $-1$ |   $+2$ |  $-1$ | $+2$ |  $-1$ |
| $-5 \bmod +3$ |  $-2$ |  $+1$ |   $+1$ |  $+1$ | $-2$ |  $+1$ |
| $-5 \bmod -3$ |  $-2$ |  $-2$ |   $+1$ |  $+1$ | $+1$ |  $+1$ |

$\large 4 \bmod 3 \rightarrow \dfrac{4}{3} = 1\dfrac{1}{3} = 1.\overline{3} \rightarrow \text{round down}$
|               | trunc | floor | euclid | round | ceil | raise |
|:-------------:| -----:| -----:| ------:| -----:| ----:| -----:|
| $+4 \bmod +3$ |  $+1$ |  $+1$ |   $+1$ |  $+1$ | $-2$ |  $-2$ |
| $+4 \bmod -3$ |  $+1$ |  $-2$ |   $+1$ |  $+1$ | $+1$ |  $-2$ |
| $-4 \bmod +3$ |  $-1$ |  $+2$ |   $+2$ |  $-1$ | $-1$ |  $+2$ |
| $-4 \bmod -3$ |  $-1$ |  $-1$ |   $+2$ |  $-1$ | $+2$ |  $+2$ |

$\large 3 \bmod 2 \rightarrow \dfrac{3}{2} = 1\dfrac{1}{2} = 1.5 \rightarrow \text{round down or up }\normalsize\text{(depending on rounding type)}$
|               | trunc | floor | euclid |                       round                       | ceil | raise |
|:-------------:| -----:| -----:| ------:|:-------------------------------------------------:| ----:| -----:|
| $+3 \bmod +2$ |  $+1$ |  $+1$ |   $+1$ | $\lfloor -1 \rfloor \text{ or } \lceil +1 \rceil$ | $-1$ |  $-1$ |
| $+3 \bmod -2$ |  $+1$ |  $-1$ |   $+1$ | $\lfloor -1 \rfloor \text{ or } \lceil +1 \rceil$ | $+1$ |  $-1$ |
| $-3 \bmod +2$ |  $-1$ |  $+1$ |   $+1$ | $\lfloor +1 \rfloor \text{ or } \lceil -1 \rceil$ | $-1$ |  $+1$ |
| $-3 \bmod -2$ |  $-1$ |  $-1$ |   $+1$ | $\lfloor +1 \rfloor \text{ or } \lceil -1 \rceil$ | $+1$ |  $+1$ |

$\large 3 \bmod 3 \rightarrow \dfrac{3}{3} = 1\dfrac{0}{3} = 1.0 \rightarrow \text{round 0 }\normalsize\text{(same as rounding down)}$
|               | trunc | floor | euclid | round | ceil | raise |
|:-------------:| -----:| -----:| ------:| -----:| ----:| -----:|
| $+3 \bmod +3$ |  $+0$ |  $+0$ |   $+0$ |  $+0$ | $-0$ |  $-0$ |
| $+3 \bmod -3$ |  $+0$ |  $-0$ |   $+0$ |  $+0$ | $+0$ |  $-0$ |
| $-3 \bmod +3$ |  $-0$ |  $+0$ |   $+0$ |  $-0$ | $-0$ |  $+0$ |
| $-3 \bmod -3$ |  $-0$ |  $-0$ |   $+0$ |  $-0$ | $+0$ |  $+0$ |

</details>

_more details/documentation in the file itself via js-docs (`/** */`) and additional commenting with `//~`_

Scroll [UP](#biginttype-supported-modulo-types "Scroll to start of section: [BigIntType] Supported modulo types")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [BigIntFractionComplex.js](./BigIntFractionComplex.js)

>
> WIP
>
> idea: BigInt >> Fraction & Infinity >> ComplexNumber
>

----

Scroll [UP](#bigintfractioncomplexjs "Scroll to start of section: BigIntFractionComplex.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")

## [functions.js](./functions.js)

some useful math functions

>
> also see [`other-projects/useful.js`](https://github.com/MAZ01001/other-projects#usefuljs)
>

<details closed><summary><code>mapRange</code></summary>

translate the given number to another range

```typescript
function mapRange(n: number, a: number, b: number, x: number, y: number, limit?: boolean | undefined): number
mapRange(0.5, 0, 1, 0, 100); //=> 50
mapRange(3, 0, 1, 0, 100); //=> 300
mapRange(3, 0, 1, 0, 100, true); //=> 100
```

</details>

<details closed><summary><code>toPercent</code></summary>

calculates the percentage of the given number within the given range

```typescript
function toPercent(n: number, x: number, y: number): number
toPercent(150, 100, 200); //=> 0.5 = 50%
```

</details>

<details closed><summary><code>deg2rad</code></summary>

converts the given angle from DEG to RAD

```typescript
function deg2rad(deg: number): number
```

</details>

<details closed><summary><code>rad2deg</code></summary>

converts the given angle from RAD to DEG

```typescript
function rad2deg(rad: number): number
```

</details>

<details closed><summary><code>gcd</code></summary>

calculates the greatest common divisor of `n` and `m` (positive safe integers `[1..2↑53[`)

```typescript
function gcd(n: number, m: number): number
gcd(45, 100); //=> 5 → (45/5) / (100/5) → 9/20
```

</details>

<details closed><summary><code>dec2frac</code></summary>

converts a decimal number to an improper-fraction (rough estimation)

```typescript
function dec2frac(dec: number, loop_last?: number | undefined, max_den?: number | undefined, max_iter?: number | undefined): Readonly<{
    a: number;
    b: number;
    c: number;
    i: number;
    r: string;
}>
dec2frac(0.12, 2); //=> { a:0, b:4, c:33, i:0, r:"precision" } → 0+4/33 → 0.121212121212...
```

</details>

<details closed><summary><code>padNum</code></summary>

convert number to string with padding \
format: `[sign] [padded start ' '] [.] [padded end '0'] [e ~]`

```typescript
function padNum(n: number | string, first?: number | undefined, last?: number | undefined): string
padNum("1.23e2", 3, 5); //=> "+  1.23000e2"
```

</details>

<details closed><summary><code>euclideanModulo</code></summary>

calculates the modulo of two whole numbers (euclidean division)

$$\large a-\left(\lvert b\rvert\cdot\left\lfloor\dfrac{a}{\lvert b\rvert}\right\rfloor\right)$$

```typescript
function euclideanModulo(a: number, b: number): number
```

</details>

<details closed><summary><code>randomRange</code></summary>

genarates a random number within given range (inclusive)

_gets a random number via `Math.random()` and assumes that this number is in range [0 to (1 - `Number.EPSILON`)] (inclusive)_

```typescript
function randomRange(min: number, max: number): number
```

</details>

<details closed><summary><code>randomRangeInt</code></summary>

genarates a random integer within given range (inclusive)

```typescript
function randomRangeInt(min: number, max: number): number
```

</details>

<details closed><summary><code>divisionWithRest</code></summary>

division with two unsigned numbers

$$\large\dfrac{A}{B}=Q+\dfrac{R}{B}$$

```typescript
function divisionWithRest(A: number, B: number): readonly [number, number]
divisionWithRest(5, 3); //=> [1, 2] → 1+2/3
```

also see [`Math-Js/BigIntType.js : #calcDivRest`](https://github.com/MAZ01001/Math-Js/blob/ca71710d50a5fa57e5cb76410cc33df8c1e688d4/BigIntType.js#L1880 "Permalink to #calcDivRest method in Math-Js/BigIntType.js") for a solution with arbitrary-length-integers

</details>

<details closed><summary><code>randomBools</code></summary>

generate a set amount of random booleans \
_generator function_

```typescript
function randomBools(amount?: number | undefined): Generator<boolean, any, unknown>
for(const rng of randomBools(3))console.log("%O",rng);
```

</details>

<details closed><summary><code>rangeGenerator</code></summary>

creates a generator for given range - iterable \
_use `Array.from()` to create a normal `number[]` array_

```typescript
function rangeGenerator(start: number, end: number, step?: number | undefined, overflow?: boolean | undefined): Generator<number, void, unknown>
for(const odd of rangeGenerator(1, 100, 2))console.log(odd); //~ 1 3 5 .. 97 99
```

</details>

<details closed><summary><code>rng32bit</code></summary>

get a function to get random numbers like Math.random but from a given seed \
_uses `MurmurHash3` for seeding and `sfc32` for generating 32bit values_

```typescript
function rng32bit(seed?: string | undefined): () => number
rng32bit("seed")();            //=> 3595049765 [0 to 0xFFFFFFFF inclusive]
rng32bit("seed")()/0xFFFFFFFF; //=> 0.8370377509475307 [0.0 to 1.0 inclusive]
rng32bit("seed")()/0x100000000;//=> 0.8370377507526428 [0.0 inclusive to 1.0 exclusive]
```

</details>

<details closed><summary><code>valueNoise</code></summary>

calculates value noise for given coordinates \
uses quintic interpolation for mixing numbers, and a quick (non-cryptographic) hash function to get random noise from coordinates \
_the output is allways the same for the same input_

```typescript
function valueNoise(x: number, y: number): number
```

<details open><summary>Example render</summary>

I used the following code to render the background on the [preview of my r/place overlay script](https://maz01001.github.io/rPlaceOverlays/preview "Open rPlaceOverlays preview page online")

```javascript
const size = Object.freeze([1920, 1080]),
    exampleNoise = new ImageData(...size, {colorSpace: "srgb"});
for(let x = 0, y = 0; y < size[1] && x < size[0]; ++x >= size[0] ? (x = 0, y++) : 0){
    const pixel = valueNoise(x * 0.008, y * 0.008) * 127
        + valueNoise(x * 0.016, y * 0.016) * 63.5
        + valueNoise(x * 0.032, y * 0.032) * 31.75
        + valueNoise(x * 0.064, y * 0.064) * 15.875
        + valueNoise(x * 0.128, y * 0.128) * 7.9375;
        //// + valueNoise(x * 0.256, y * 0.256) * 3.96875
        //// + valueNoise(x * 0.512, y * 0.512) * 1.984375;
    exampleNoise.data.set([pixel, pixel, pixel, 0xFF], (y * size[0] + x) * 4);
}
document.body.style.backgroundImage = (() => {
    "use strict";
    const canvas = document.createElement("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    canvas.getContext("2d")?.putImageData(exampleNoise, 0, 0);
    return `url(${ canvas.toDataURL("image/png") })`;
})();
```

</details>
</details>

<details closed><summary><code>sinAprx</code></summary>

approximates `Math.sin()` \
_more accurate for numbers that result in numbers closer to `0`_

```typescript
function sinAprx(x: number): number
```

<details open><summary>Performance test</summary>

> node.js on intel i7-10700K

```javascript
// → at around 42'000 calls it's slightly faster that `Math.sin()` and at 10'000'000 calls it's around 8 times faster
const samples = 10000000,
    rngScale = 8;
const rng = new Array(samples>>>rngScale);
for(let i = 0; i < rng.length; i++) rng[i] = Math.random() < 0.5 ? -Math.random() : Math.random();
const a = performance.now();
for(let i = 0; i < samples; i++) _ = sinAprx(Number.MAX_SAFE_INTEGER * rng[i >>> rngScale] * Math.PI);
const b = performance.now();
for(let i = 0; i < samples; i++) _ = Math.sin(Number.MAX_SAFE_INTEGER * rng[i >>> rngScale] * Math.PI);
const c = performance.now();
console.log(
    "%i samples\nAprx %f ms (%f ms each)\nSin %f ms (%f ms each)\napprox.: %f times faster",
    samples, (b - a).toFixed(4), ((b - a) / samples).toFixed(4), (c - b).toFixed(4), ((c - b) / samples).toFixed(4), ((c - b) / (b - a)).toFixed(4)
);
```

</details>
</details>

<details closed><summary><code>factorial</code></summary>

calculates the factorial of a non-zero positive integer

must be either `number` in range `[0..18]` or `bigint`

```typescript
type int = number | bigint
function factorial(n: int): int
```

```javascript
// number of possible shuffles of a deck of cards
factorial(52n);//=> 80658175170943878571660636856403766975289505440883277824000000000000n (~ 8e+67)
// highest possible with `number` type
factorial(18); //=>   6402373705728000
factorial(19n);//=> 121645100408832000n
```

</details>

<details closed><summary><code>isPrime</code></summary>

calculates if a given number (in safe integer range: `]-2↑53,2↑53[`) is prime

```typescript
function isPrime(x: number): boolean
```

<details open><summary>Performance test</summary>

> node.js on intel i7-10700K

```javascript
const t=[
    performance.now(),isPrime(31),              //=>   0.0601 ms : Prime
    performance.now(),isPrime(331),             //=>   0.0036 ms : Prime
    performance.now(),isPrime(3331),            //=>   0.0080 ms : Prime
    performance.now(),isPrime(33331),           //=>   0.0157 ms : Prime
    performance.now(),isPrime(333331),          //=>   0.0106 ms : Prime
    performance.now(),isPrime(3333331),         //=>   0.0303 ms : Prime
    performance.now(),isPrime(33333331),        //=>   0.1183 ms : Prime
    //~ https://oeis.org/A123568 ↑
    performance.now(),isPrime(6779164939),      //=>   3.8812 ms : Prime
    performance.now(),isPrime(2**52-1),         //=>   3.6853 ms : -----
    performance.now(),isPrime(2**52-47),        //=> 189.1616 ms : Prime
    performance.now(),isPrime(2**53-3155490991),//=> 262.4474 ms : ----- (largest safe prime**2)
    performance.now(),isPrime(2**53-145),       //=> 272.7841 ms : Prime (2nd largest safe prime)
    performance.now(),isPrime(2**53-111),       //=> 258.4426 ms : Prime (largest safe prime)
    performance.now(),isPrime(2**53-94),        //=>   0.0084 ms : ----- (largest safe 2*prime)
    performance.now(),isPrime(2**53-1),         //=>   0.0185 ms : -----
    performance.now()
];
//@ts-ignore t has an even number of entries where every even element is type `number` and every odd `boolean` (impossible to type-doc and/or detect by linter)
for(let i=0;i+1<t.length;i+=2)console.log((t[i+2]-t[i]).toFixed(4).padStart(9),"ms :",t[i+1]?"Prime":"-----");
```

</details>
</details>

<details closed><summary><code>lastPrime</code></summary>

calculates the next prime number smaller than the given number (in safe integer range: `]-2↑53,2↑53[`)

`undefined` for numbers `2` and smaller that have no previous prime number

```typescript
function lastPrime(x: number): number|undefined
```

</details>

<details closed><summary><code>nextPrime</code></summary>

calculates the next prime number larger than the given number (in safe integer range: `]-2↑53,2↑53[`)

`undefined` when the next prime number is not a safe integer (`>=2↑53`)

```typescript
function nextPrime(x: number): number|undefined
```

```javascript
// generate all primes in range [10..100] (via iterator/generator function)
console.log(...(function*(s,e){for(let p=nextPrime(s-1)??NaN;p<=e;p=nextPrime(p)??NaN)yield p;})(10,100));
//=> 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97
```

</details>

<details closed><summary><code>factorize</code></summary>

calculates the prime decomposition of the given safe integer (`]-2↑53..2↑53[`)

prime factors are in ascending order and the list is empty for numbers below `2` (no prime factors)

```typescript
function factorize(n: number): number[]
```

<details open><summary>Performance test</summary>

> node.js on intel i7-10700K

```javascript
const t=[
    performance.now(),factorize(4),               //=>   0.0452 ms : 2 2
    performance.now(),factorize(108),             //=>   0.0029 ms : 2 2 3 3 3
    performance.now(),factorize(337500),          //=>   0.0018 ms : 2 2 3 3 3 5 5 5 5 5
    performance.now(),factorize(277945762500),    //=>   0.0126 ms : 2 2 3 3 3 5 5 5 5 5 7 7 7 7 7 7 7
    //~ https://oeis.org/A076265 ↑
    performance.now(),factorize(33332),           //=>   0.0116 ms : 2 2 13 641
    performance.now(),factorize(33223575732),     //=>   0.0375 ms : 2 2 3 599 1531 3019
    performance.now(),factorize(277945762499),    //=>   4.3610 ms : 41 6779164939
    performance.now(),factorize(2**53-3155490991),//=> 274.9417 ms : 94906249 94906249  (largest safe prime**2)
    performance.now(),factorize(2**53-111),       //=> 280.9777 ms : 9007199254740881   (largest safe prime)
    performance.now(),factorize(2**53-94),        //=> 192.1197 ms : 2 4503599627370449 (largest safe 2*prime)
    performance.now()
];
//@ts-ignore t has an even number of entries where every even element is type `number` and every odd `number[]` (impossible to type-doc and/or detect by linter)
for(let i=0;i+1<t.length;i+=2)console.log((t[i+2]-t[i]).toFixed(4).padStart(9),"ms :",...t[i+1]);
```

</details>
</details>

Scroll [UP](#functionsjs "Scroll to start of section: functions.js")
    | [TOP](#math-in-javascript "Scroll to top of document: Math in JavaScript")
