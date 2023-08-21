# Math with JavaScript

- [Polynomial.js](#polynomialjs)
- [Fraction.js](#fractionjs)
- [Matrix.js](#matrixjs)
- [Vector.js](#vectorjs)
- [ComplexNumber.js](#complexnumberjs)
- [BigIntType.js](#biginttypejs)
- [BigIntFractionComplex.js](#bigintfractioncomplexjs)
- [functions.js](#functionsjs)

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

## [ComplexNumber.js](./ComplexNumber.js)

- make a complex number with
  - real and imaginary part
  - with length and angle
    - radian
    - degree
  - square rooting a negative number
  - raising e to i-times-n-th power (`e^(i*n)`)
  - raising n to power of i (`n^i`)
- getter for
  - real part
  - imaginary part
  - angle (radian or degree)
  - length / absolute value
  - arc length (from `0r`/`0°` to where the complex number is)
- check for equality
- chainable methods
- logging current value without braking method chain
- create a copy of the the current complex number and continue with it
- complex number
  - addition
  - subtraction
  - multiplication
  - division
- raising current complex number to nth power
- static values for
  - `2π`
  - `π/2`
  - `π/4`
  - `e^i`
  - `i^i`

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
- can be created from, and converted to, different [bases](#supported-numerical-bases "see all supported bases")
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
    - `A /= B` with [rounding](#supported-rounding-types "see supported rounding types") / `A %= B` with [rounding](#supported-modulo-types "see supported modulo types")
    - `A *= 2` / `A /= 2` with [rounding](#supported-rounding-types "see supported rounding types")
    - `A *= (256 ** x)` with [rounding](#supported-rounding-types "see supported rounding types") - (digit-shifts)
    - `A **= 2` / `A **= 3`
  - bitwise operations:
    - `A >>>= x` / `A <<= x` / `A &= B` / `A |= B` / `A ^= B` / `A ~= A`
  - `GCD(A, B)`
  - `mapRange(a, b, a2, b2)` with [rounding](#supported-rounding-types "see supported rounding types") and limit (cap at a2 / b2)
- `randomInt(min, max)` (using `Math.random()`)
- _↑ (`A` and `B` are type `BigIntType` and `x` is type `Number`) ↑_

### Supported numerical bases

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

#### Supported numerical base names

>
> [Wikipedia: Numerical Bases](https://en.wikipedia.org/wiki/List_of_numeral_systems#Standard_positional_numeral_systems)
>

<details closed><summary>click to show table</summary>
  <table>
    <tr><th style="text-align:right">base</th><th>names</th><th>|</th><th style="text-align:right">base</th><th>names</th></tr>
    <tr><td style="text-align:right">2</td><td><code>b</code> / <code>bin</code> / <code>bits</code> / <code>binary</code> / <code>1bit</code></td><td>|</td><td style="text-align:right">72</td><td><code>duoseptuagesimal</code></td></tr>
    <tr><td style="text-align:right">3</td><td><code>ternary</code> / <code>trinary</code></td><td>|</td><td style="text-align:right">80</td><td><code>octogesimal</code></td></tr>
    <tr><td style="text-align:right">4</td><td><code>q</code> / <code>quaternary</code> / <code>2bit</code></td><td>|</td><td style="text-align:right">81</td><td><code>unoctogesimal</code></td></tr>
    <tr><td style="text-align:right">5</td><td><code>quinary</code> / <code>pental</code></td><td>|</td><td style="text-align:right">85</td><td><code>pentoctogesimal</code></td></tr>
    <tr><td style="text-align:right">6</td><td><code>senary</code> / <code>heximal</code> / <code>seximal</code></td><td>|</td><td style="text-align:right">89</td><td><code>enneaoctogesimal</code></td></tr>
    <tr><td style="text-align:right">7</td><td><code>septenary</code></td><td>|</td><td style="text-align:right">90</td><td><code>nonagesimal</code></td></tr>
    <tr><td style="text-align:right">8</td><td><code>o</code> / <code>oct</code> / <code>octal</code> / <code>3bit</code></td><td>|</td><td style="text-align:right">91</td><td><code>unnonagesimal</code></td></tr>
    <tr><td style="text-align:right">9</td><td><code>nonary</code></td><td>|</td><td style="text-align:right">92</td><td><code>duononagesimal</code></td></tr>
    <tr><td style="text-align:right">10</td><td><code>d</code> / <code>dec</code> / <code>decimal</code> / <code>denary</code></td><td>|</td><td style="text-align:right">93</td><td><code>trinonagesimal</code></td></tr>
    <tr><td style="text-align:right">11</td><td><code>undecimal</code></td><td>|</td><td style="text-align:right">94</td><td><code>tetranonagesimal</code></td></tr>
    <tr><td style="text-align:right">12</td><td><code>duodecimal</code> / <code>dozenal</code> / <code>uncial</code></td><td>|</td><td style="text-align:right">95</td><td><code>pentanonagesimal</code></td></tr>
    <tr><td style="text-align:right">13</td><td><code>tridecimal</code></td><td>|</td><td style="text-align:right">96</td><td><code>hexanonagesimal</code></td></tr>
    <tr><td style="text-align:right">14</td><td><code>tetradecimal</code></td><td>|</td><td style="text-align:right">97</td><td><code>septanonagesimal</code></td></tr>
    <tr><td style="text-align:right">15</td><td><code>pentadecimal</code></td><td>|</td><td style="text-align:right">100</td><td><code>centesimal</code></td></tr>
    <tr><td style="text-align:right">16</td><td><code>h</code> / <code>hex</code> / <code>hexadecimal</code> / <code>sexadecimal</code> / <code>4bit</code></td><td>|</td><td style="text-align:right">120</td><td><code>centevigesimal</code></td></tr>
    <tr><td style="text-align:right">17</td><td><code>heptadecimal</code></td><td>|</td><td style="text-align:right">121</td><td><code>centeunvigesimal</code></td></tr>
    <tr><td style="text-align:right">18</td><td><code>octodecimal</code></td><td>|</td><td style="text-align:right">125</td><td><code>centepentavigesimal</code></td></tr>
    <tr><td style="text-align:right">19</td><td><code>enneadecimal</code></td><td>|</td><td style="text-align:right">128</td><td><code>centeoctovigesimal</code> / <code>7bit</code></td></tr>
    <tr><td style="text-align:right">20</td><td><code>vigesimal</code></td><td>|</td><td style="text-align:right">144</td><td><code>centetetraquadragesimal</code></td></tr>
    <tr><td style="text-align:right">21</td><td><code>unvigesimal</code></td><td>|</td><td style="text-align:right">169</td><td><code>centenovemsexagesimal</code></td></tr>
    <tr><td style="text-align:right">22</td><td><code>duovigesimal</code></td><td>|</td><td style="text-align:right">185</td><td><code>centepentoctogesimal</code></td></tr>
    <tr><td style="text-align:right">23</td><td><code>trivigesimal</code></td><td>|</td><td style="text-align:right">196</td><td><code>centehexanonagesimal</code></td></tr>
    <tr><td style="text-align:right">24</td><td><code>tetravigesimal</code></td><td>|</td><td style="text-align:right">200</td><td><code>duocentesimal</code></td></tr>
    <tr><td style="text-align:right">25</td><td><code>pentavigesimal</code></td><td>|</td><td style="text-align:right">210</td><td><code>duocentedecimal</code></td></tr>
    <tr><td style="text-align:right">26</td><td><code>hexavigesimal</code></td><td>|</td><td style="text-align:right">216</td><td><code>duocentehexidecimal</code></td></tr>
    <tr><td style="text-align:right">27</td><td><code>heptavigesimal</code> / <code>septemvigesimal</code></td><td>|</td><td style="text-align:right">225</td><td><code>duocentepentavigesimal</code></td></tr>
    <tr><td style="text-align:right">28</td><td><code>octovigesimal</code></td><td>|</td><td style="text-align:right">256</td><td><code>duocentehexaquinquagesimal</code> / <code>byte</code> / <code>8bit</code></td></tr>
    <tr><td style="text-align:right">29</td><td><code>enneavigesimal</code></td><td>|</td><td style="text-align:right">300</td><td><code>trecentesimal</code></td></tr>
    <tr><td style="text-align:right">30</td><td><code>trigesimal</code></td><td>|</td><td style="text-align:right">360</td><td><code>trecentosexagesimal</code></td></tr>
    <tr><td style="text-align:right">31</td><td><code>untrigesimal</code></td><td>|</td><td style="text-align:right">512</td><td><code>9bit</code></td></tr>
    <tr><td style="text-align:right">32</td><td><code>duotrigesimal</code> / <code>5bit</code></td><td>|</td><td style="text-align:right">1024</td><td><code>10bit</code></td></tr>
    <tr><td style="text-align:right">33</td><td><code>tritrigesimal</code></td><td>|</td><td style="text-align:right">2048</td><td><code>11bit</code></td></tr>
    <tr><td style="text-align:right">34</td><td><code>tetratrigesimal</code></td><td>|</td><td style="text-align:right">4096</td><td><code>12bit</code></td></tr>
    <tr><td style="text-align:right">35</td><td><code>pentatrigesimal</code></td><td>|</td><td style="text-align:right">8192</td><td><code>13bit</code></td></tr>
    <tr><td style="text-align:right">36</td><td><code>t</code> / <code>txt</code> / <code>text</code> / <code>hexatrigesimal</code></td><td>|</td><td style="text-align:right">16384</td><td><code>14bit</code></td></tr>
    <tr><td style="text-align:right">37</td><td><code>heptatrigesimal</code></td><td>|</td><td style="text-align:right">32768</td><td><code>15bit</code></td></tr>
    <tr><td style="text-align:right">38</td><td><code>octotrigesimal</code></td><td>|</td><td style="text-align:right">65536</td><td><code>16bit</code></td></tr>
    <tr><td style="text-align:right">39</td><td><code>enneatrigesimal</code></td><td>|</td><td style="text-align:right">131072</td><td><code>17bit</code></td></tr>
    <tr><td style="text-align:right">40</td><td><code>quadragesimal</code></td><td>|</td><td style="text-align:right">262144</td><td><code>18bit</code></td></tr>
    <tr><td style="text-align:right">42</td><td><code>duoquadragesimal</code></td><td>|</td><td style="text-align:right">524288</td><td><code>19bit</code></td></tr>
    <tr><td style="text-align:right">45</td><td><code>pentaquadragesimal</code></td><td>|</td><td style="text-align:right">1048576</td><td><code>20bit</code></td></tr>
    <tr><td style="text-align:right">47</td><td><code>septaquadragesimal</code></td><td>|</td><td style="text-align:right">2097152</td><td><code>21bit</code></td></tr>
    <tr><td style="text-align:right">48</td><td><code>octoquadragesimal</code></td><td>|</td><td style="text-align:right">4194304</td><td><code>22bit</code></td></tr>
    <tr><td style="text-align:right">49</td><td><code>enneaquadragesimal</code></td><td>|</td><td style="text-align:right">8388608</td><td><code>23bit</code></td></tr>
    <tr><td style="text-align:right">50</td><td><code>quinquagesimal</code></td><td>|</td><td style="text-align:right">16777216</td><td><code>24bit</code></td></tr>
    <tr><td style="text-align:right">52</td><td><code>duoquinquagesimal</code></td><td>|</td><td style="text-align:right">33554432</td><td><code>25bit</code></td></tr>
    <tr><td style="text-align:right">54</td><td><code>tetraquinquagesimal</code></td><td>|</td><td style="text-align:right">67108864</td><td><code>26bit</code></td></tr>
    <tr><td style="text-align:right">56</td><td><code>hexaquinquagesimal</code></td><td>|</td><td style="text-align:right">134217728</td><td><code>27bit</code></td></tr>
    <tr><td style="text-align:right">57</td><td><code>heptaquinquagesimal</code></td><td>|</td><td style="text-align:right">268435456</td><td><code>28bit</code></td></tr>
    <tr><td style="text-align:right">58</td><td><code>octoquinquagesimal</code></td><td>|</td><td style="text-align:right">536870912</td><td><code>29bit</code></td></tr>
    <tr><td style="text-align:right">60</td><td><code>sexagesimal</code> / <code>sexagenary</code></td><td>|</td><td style="text-align:right">1073741824</td><td><code>30bit</code></td></tr>
    <tr><td style="text-align:right">62</td><td><code>duosexagesimal</code></td><td>|</td><td style="text-align:right">2147483648</td><td><code>31bit</code></td></tr>
    <tr><td style="text-align:right">64</td><td><code>tetrasexagesimal</code> / <code>6bit</code></td><td>|</td><td style="text-align:right">4294967296</td><td><code>32bit</code></td></tr>
  </table>
</details>

### Supported rounding types

>
> [![Wikipedia: Rounding (interactible graph)](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Comparison_rounding_graphs_SMIL.svg/300px-Comparison_rounding_graphs_SMIL.svg.png "Wikipedia: Rounding (interactible graph)")](https://en.wikipedia.org/wiki/Rounding)
>

<details open><summary>click to hide table</summary>
  <table>
    <tr><th>name</th><th>description</th><th>examples</th></tr>
    <tr><td><code>NEAR_DOWN</code></td><td>round to nearest integer, towards -infinity</td><td style="font-family:consolas,monospace">+1.5 → +1 || -2.5 → -3</td></tr>
    <tr><td><code>NEAR_UP</code></td><td>round to nearest integer, towards +infinity</td><td style="font-family:consolas,monospace">+1.5 → +2 || -2.5 → -2</td></tr>
    <tr><td><code>NEAR_ZERO</code></td><td>round to nearest integer, towards zero</td><td style="font-family:consolas,monospace">+1.5 → +1 || -2.5 → -2</td></tr>
    <tr style="background-color:#0f02"><td><code>NEAR_INF</code></td><td>round to nearest integer, away from zero</td><td style="font-family:consolas,monospace">+1.5 → +2 || -2.5 → -3</td></tr>
    <tr><td><code>NEAR_EVEN</code></td><td>round to nearest even integer</td><td style="font-family:consolas,monospace">+1.5 → +2 || -2.5 → -2</td></tr>
    <tr><td><code>NEAR_ODD</code></td><td>round to nearest odd integer</td><td style="font-family:consolas,monospace">+1.5 → +1 || -2.5 → -3</td></tr>
    <tr><td><code>FLOOR</code></td><td>round down (towards -infinity)</td><td style="font-family:consolas,monospace">+1.x → +1 || -2.x → -3</td></tr>
    <tr><td><code>CEIL</code></td><td>round up (towards +infinity)</td><td style="font-family:consolas,monospace">+1.x → +2 || -2.x → -2</td></tr>
    <tr style="background-color:#0f01"><td><code>TRUNC</code></td><td>round down (towards zero)</td><td style="font-family:consolas,monospace">+1.x → +1 || -2.x → -2</td></tr>
    <tr><td><code>RAISE</code></td><td>round up (away from zero)</td><td style="font-family:consolas,monospace">+1.x → +2 || -2.x → -3</td></tr>
  </table>
</details>

### Supported modulo types

>
> [Wikipedia: Modulo](https://en.wikipedia.org/wiki/Modulo)
>

<details open><summary>click to hide table</summary>
  <table>
    <tr><th>name</th><th> description</th></tr>
    <tr><td><code>ROUND_NEAR_DOWN</code></td><td>division rounded towards -infinity</td></tr>
    <tr><td><code>ROUND_NEAR_UP</code></td><td>division rounded towards +infinity</td></tr>
    <tr><td><code>ROUND_NEAR_ZERO</code></td><td>division rounded towards zero</td></tr>
    <tr><td><code>ROUND_NEAR_INF</code></td><td>division rounded away from zero</td></tr>
    <tr><td><code>ROUND_NEAR_EVEN</code></td><td>division rounded to nearest even integer</td></tr>
    <tr><td><code>ROUND_NEAR_ODD</code></td><td>division rounded to nearest odd integer</td></tr>
    <tr><td><code>FLOOR</code></td><td>floored division (towards -infinity)</td></tr>
    <tr><td><code>CEIL</code></td><td>ceiled division (towards +infinity)</td></tr>
    <tr style="background-color:#0f01"><td><code>TRUNC</code></td><td>truncated division (towards zero)</td></tr>
    <tr><td><code>RAISE</code></td><td>raised division (away from zero)</td></tr>
    <tr style="background-color:#0f02"><td><code>EUCLID</code></td><td>euclidean division (positive remainder)</td></tr>
  </table>
</details>

#### Modulo examples

<details closed><summary>click to show table</summary>
  <table style="font-family:consolas,monospace;text-align:center">
    <tr><th>A % B</th><th style="background-color:#0f01">trunc</th><th>floor</th><th style="background-color:#0f02">euclid</th><th style="text-align:inherit">round</th><th>ceil</th><th>raise</th></tr>
    <tr><td colspan="7"><b>3 % 5 → 3 / 5 = 0 + 3 / 5 → round up</b></td></tr>
    <tr><td>+3 +5</td><td style="background-color:#0f01">+3</td><td>+3</td><td style="background-color:#0f02">+3</td><td>-2</td><td>-2</td><td>-2</td></tr>
    <tr><td>+3 -5</td><td style="background-color:#0f01">+3</td><td>-2</td><td style="background-color:#0f02">+3</td><td>-2</td><td>+3</td><td>-2</td></tr>
    <tr><td>-3 +5</td><td style="background-color:#0f01">-3</td><td>+2</td><td style="background-color:#0f02">+2</td><td>+2</td><td>-3</td><td>+2</td></tr>
    <tr><td>-3 -5</td><td style="background-color:#0f01">-3</td><td>-3</td><td style="background-color:#0f02">+2</td><td>+2</td><td>+2</td><td>+2</td></tr>
    <tr><td colspan="7"><b>5 % 3 → 5 / 3 = 1 + 2 / 3 → round up</b></td></tr>
    <tr><td>+5 +3</td><td style="background-color:#0f01">+2</td><td>+2</td><td style="background-color:#0f02">+2</td><td>-1</td><td>-1</td><td>-1</td></tr>
    <tr><td>+5 -3</td><td style="background-color:#0f01">+2</td><td>-1</td><td style="background-color:#0f02">+2</td><td>-1</td><td>+2</td><td>-1</td></tr>
    <tr><td>-5 +3</td><td style="background-color:#0f01">-2</td><td>+1</td><td style="background-color:#0f02">+1</td><td>+1</td><td>-2</td><td>+1</td></tr>
    <tr><td>-5 -3</td><td style="background-color:#0f01">-2</td><td>-2</td><td style="background-color:#0f02">+1</td><td>+1</td><td>+1</td><td>+1</td></tr>
    <tr><td colspan="7"><b>4 % 3 → 4 / 3 = 1 + 1 / 3 → round down</b></td></tr>
    <tr><td>+4 +3</td><td style="background-color:#0f01">+1</td><td>+1</td><td style="background-color:#0f02">+1</td><td>+1</td><td>-2</td><td>-2</td></tr>
    <tr><td>+4 -3</td><td style="background-color:#0f01">+1</td><td>-2</td><td style="background-color:#0f02">+1</td><td>+1</td><td>+1</td><td>-2</td></tr>
    <tr><td>-4 +3</td><td style="background-color:#0f01">-1</td><td>+2</td><td style="background-color:#0f02">+2</td><td>-1</td><td>-1</td><td>+2</td></tr>
    <tr><td>-4 -3</td><td style="background-color:#0f01">-1</td><td>-1</td><td style="background-color:#0f02">+2</td><td>-1</td><td>+2</td><td>+2</td></tr>
    <tr><td colspan="7"><b>3 % 2 → 3 / 2 = 1 + 1 / 2 → round (depends on type)</b></td></tr>
    <tr><td>+3 +2</td><td style="background-color:#0f01">+1</td><td>+1</td><td style="background-color:#0f02">+1</td><td>-1 ↑ ↓ +1</td><td>-1</td><td>-1</td></tr>
    <tr><td>+3 -2</td><td style="background-color:#0f01">+1</td><td>-1</td><td style="background-color:#0f02">+1</td><td>-1 ↑ ↓ +1</td><td>+1</td><td>-1</td></tr>
    <tr><td>-3 +2</td><td style="background-color:#0f01">-1</td><td>+1</td><td style="background-color:#0f02">+1</td><td>+1 ↑ ↓ -1</td><td>-1</td><td>+1</td></tr>
    <tr><td>-3 -2</td><td style="background-color:#0f01">-1</td><td>-1</td><td style="background-color:#0f02">+1</td><td>+1 ↑ ↓ -1</td><td>+1</td><td>+1</td></tr>
    <tr><td colspan="7"><b>3 % 3 → 3 / 3 = 1 + 0 / 3 → round 0 (default down)</b></td></tr>
    <tr><td>+3 +3</td><td style="background-color:#0f01">+0</td><td>+0</td><td style="background-color:#0f02">+0</td><td>+0</td><td>-0</td><td>-0</td></tr>
    <tr><td>+3 -3</td><td style="background-color:#0f01">+0</td><td>-0</td><td style="background-color:#0f02">+0</td><td>+0</td><td>+0</td><td>-0</td></tr>
    <tr><td>-3 +3</td><td style="background-color:#0f01">-0</td><td>+0</td><td style="background-color:#0f02">+0</td><td>-0</td><td>-0</td><td>+0</td></tr>
    <tr><td>-3 -3</td><td style="background-color:#0f01">-0</td><td>-0</td><td style="background-color:#0f02">+0</td><td>-0</td><td>+0</td><td>+0</td></tr>
  </table>
</details>

_more details/documentation in the file itself via js-docs (`/** */`) and additional commenting with `//~`_

## [BigIntFractionComplex.js](./BigIntFractionComplex.js)

>
> WIP
>
> idea: BigInt >> Fraction & Infinity >> ComplexNumber
>

----

## [functions.js](./functions.js)

some useful math functions

>
> also see [`other-projects/useful.js`](https://github.com/MAZ01001/other-projects#usefuljs)
>

### `mapRange`

translate the given number to another range

```typescript
function mapRange(n: number, x: number, y: number, x2: number, y2: number, limit?: boolean | undefined): number
mapRange(0.5, 0, 1, 0, 100); //=> 50
mapRange(3, 0, 1, 0, 100); //=> 300
mapRange(3, 0, 1, 0, 100, true); //=> 100
```

### `toPercent`

calculates the percentage of the given number within the given range

```typescript
function toPercent(n: number, x: number, y: number): number
toPercent(150, 100, 200); //=> 0.5 = 50%
```

### `deg2rad`

converts the given angle from DEG to RAD

```typescript
function deg2rad(deg: number): number
```

### `rad2deg`

converts the given angle from RAD to DEG

```typescript
function rad2deg(rad: number): number
```

### `gcd`

calculates the greatest common divisor of A and B (integers)

```typescript
function gcd(A: number, B: number): number
gcd(45, 100); //=> 5 → (45/5)/(100/5) → 9/20
```

### `dec2frac`

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

### `padNum`

convert number to string with padding \
format: `[sign] [padded start ' '] [.] [padded end '0'] [e ~]`

```typescript
function padNum(n: number | string, first?: number | undefined, last?: number | undefined): string
padNum("1.23e2", 3, 5); //=> "+  1.23000e2"
```

### `euclideanModulo`

calculates the modulo of two whole numbers (euclidean division)

$$\large a-\left(\lvert b\rvert\cdot\left\lfloor\dfrac{a}{\lvert b\rvert}\right\rfloor\right)$$

```typescript
function euclideanModulo(a: number, b: number): number
```

### `randomRange`

genarates a random number within given range (inclusive)

_gets a random number via `Math.random()` and assumes that this number is in range [0 to (1 - `Number.EPSILON`)] (inclusive)_

```typescript
function randomRange(min: number, max: number): number
```

### `randomRangeInt`

genarates a random integer within given range (inclusive)

```typescript
function randomRangeInt(min: number, max: number): number
```

### `divisionWithRest`

division with two unsigned numbers

$$\large\dfrac{A}{B}=Q+\dfrac{R}{B}$$

```typescript
function divisionWithRest(A: number, B: number): readonly [number, number]
divisionWithRest(5, 3); //=> [1, 2] → 1+2/3
```

also see [`Math-Js/BigIntType.js : #calcDivRest`](https://github.com/MAZ01001/Math-Js/blob/ca71710d50a5fa57e5cb76410cc33df8c1e688d4/BigIntType.js#L1880 "Permalink to #calcDivRest method in Math-Js/BigIntType.js") for a solution with arbitrary-length-integers

### `randomBools`

generate a set amount of random booleans \
_generator function_

```typescript
function randomBools(amount?: number | undefined): Generator<boolean, any, unknown>
for(const rng of randomBools(3))console.log("%O",rng);
```

### `rangeGenerator`

creates a generator for given range - iterable \
_use `Array.from()` to create a normal `number[]` array_

```typescript
function rangeGenerator(start: number, end: number, step?: number | undefined, overflow?: boolean | undefined): Generator<number, void, unknown>
for(const odd of rangeGenerator(1, 100, 2))console.log(odd); //~ 1 3 5 .. 97 99
```

### `rng32bit`

get a function to get random numbers like Math.random but from a given seed \
_uses `MurmurHash3` for seeding and `sfc32` for generating 32bit values_

```typescript
function rng32bit(seed?: string | undefined): () => number
rng32bit("seed")();            //=> 3595049765 [0 to 0xFFFFFFFF inclusive]
rng32bit("seed")()/0xFFFFFFFF; //=> 0.8370377509475307 [0.0 to 1.0 inclusive]
```

### `valueNoise`

calculates value noise for given coordinates \
uses quintic interpolation for mixing numbers, and a quick (non-cryptographic) hash function to get random noise from coordinates \
_the output is allways the same for the same input_

```typescript
function valueNoise(x: number, y: number): number
```

#### example render

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

### `sinAprx`

approximates `Math.sin()` \
_more accurate for numbers that result in numbers closer to `0`_

```typescript
function sinAprx(x: number): number
```

#### testing performance

```javascript
// → at around 42'000 calls it's slightly faster that `Math.sin()` and at 10'000'000 calls it's around 8 times faster (on my machine via nodejs)
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
