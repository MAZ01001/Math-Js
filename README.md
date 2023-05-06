# Math with JavaScript

- [Polynomial.js](#polynomialjs)
- [Fraction.js](#fractionjs)
- [Matrix.js](#matrixjs)
- [Vector.js](#vectorjs)
- [ComplexNumber.js](#complexnumberjs)
- [BigIntType.js](#biginttypejs)
- [PerfectComplex.js](#perfectcomplexjs)
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
> - "// todo ..."-s
> - nth-root()
> - log_n()
> - (?) digits of `E` / `PI`
> - (?) fraction output/calcs
>

arbitrary precision integer using JS's Uint8Array (unsigned 8-bit integer array)
human "readable" code with lots of documentation (js-doc & some comments) and descriptive error throws

>
> [online calculator [WIP]](https://maz01001.github.io/site/BigIntType_calc.html)
>

- (uses string arrays internally in private-methods for faster calculations)
- adjustable limit `MAX_SIZE:Number` (Range 1 to 67108864 / 64MiB) (software max is [8PiB-1] - wich could be extended to [16PiB-2] using `Uint16Array` - or even [32PiB-4] using `Uint32Array` with `BigInt`)
- internal values: `sign:Boolean` / `digits:Uint8Array` (base 256 digits) / `length:Number` (length of digit-array)
- __ALL YOUR BASE ARE BELONG TO US__
  - all (integer) bases between `2` and `4294967296` (incl.) are supported for in-/output
    - bases up to `36` (incl.) use `0-9` and `A-Z` as needed
    - bases above `36` use CSV (comma-separated-values or numbers in this case) to represent digits, where each number corresponds to the numerical value of the digit at that place (in base `10`, with `0-9`)
    - base `"braille"` is in base `256` but uses braille patterns (unicodes `0x2800` to `0x28FF` incl.) as digit-charset
    - supported prefixes
      - `0b` for base `2`
      - `0o` for base `8`
      - `0x` for base `16`
  - <details closed><summary>All supported base names to use instead of numbers:</summary>
      <ul>
        <li>base <code>2</code> as <code>'b'</code>, <code>"bin"</code>, <code>"bits"</code>, <code>"binary"</code>, or <code>"1bit"</code></li>
        <li>base <code>3</code> as <code>"ternary"</code> or <code>"trinary"</code></li>
        <li>base <code>4</code> as <code>'q'</code>, <code>"quaternary"</code>, or <code>"2bit"</code></li>
        <li>base <code>5</code> as <code>"quinary"</code> or <code>"pental"</code></li>
        <li>base <code>6</code> as <code>"senary"</code>, <code>"heximal"</code>, or <code>"seximal"</code></li>
        <li>base <code>7</code> as <code>"septenary"</code></li>
        <li>base <code>8</code> as <code>'o'</code>, <code>"oct"</code>, <code>"octal"</code>, or <code>"3bit"</code></li>
        <li>base <code>9</code> as <code>"nonary"</code></li>
        <li>base <code>10</code> as <code>'d'</code>, <code>"dec"</code>, <code>"decimal"</code>, <code>"decimal"</code> or <code>"denary"</code></li>
        <li>base <code>11</code> as <code>"undecimal"</code></li>
        <li>base <code>12</code> as <code>"duodecimal"</code>, <code>"dozenal"</code>, or <code>"uncial"</code></li>
        <li>base <code>13</code> as <code>"tridecimal"</code></li>
        <li>base <code>14</code> as <code>"tetradecimal"</code></li>
        <li>base <code>15</code> as <code>"pentadecimal"</code></li>
        <li>base <code>16</code> as <code>'h'</code>, <code>"hex"</code>, <code>"hexadecimal"</code>, <code>"sexadecimal"</code>, or <code>"4bit"</code></li>
        <li>base <code>17</code> as <code>"heptadecimal"</code></li>
        <li>base <code>18</code> as <code>"octodecimal"</code></li>
        <li>base <code>19</code> as <code>"enneadecimal"</code></li>
        <li>base <code>20</code> as <code>"vigesimal"</code></li>
        <li>base <code>21</code> as <code>"unvigesimal"</code></li>
        <li>base <code>22</code> as <code>"duovigesimal"</code></li>
        <li>base <code>23</code> as <code>"trivigesimal"</code></li>
        <li>base <code>24</code> as <code>"tetravigesimal"</code></li>
        <li>base <code>25</code> as <code>"pentavigesimal"</code></li>
        <li>base <code>26</code> as <code>"hexavigesimal"</code></li>
        <li>base <code>27</code> as <code>"heptavigesimal septemvigesimal"</code></li>
        <li>base <code>28</code> as <code>"octovigesimal"</code></li>
        <li>base <code>29</code> as <code>"enneavigesimal"</code></li>
        <li>base <code>30</code> as <code>"trigesimal"</code></li>
        <li>base <code>31</code> as <code>"untrigesimal"</code></li>
        <li>base <code>32</code> as <code>"duotrigesimal"</code> or <code>"5bit"</code></li>
        <li>base <code>33</code> as <code>"tritrigesimal"</code></li>
        <li>base <code>34</code> as <code>"tetratrigesimal"</code></li>
        <li>base <code>35</code> as <code>"pentatrigesimal"</code></li>
        <li>base <code>36</code> as <code>'t'</code>, <code>"txt"</code>, <code>"text"</code>, or <code>"hexatrigesimal"</code></li>
        <li>base <code>37</code> as <code>"heptatrigesimal"</code></li>
        <li>base <code>38</code> as <code>"octotrigesimal"</code></li>
        <li>base <code>39</code> as <code>"enneatrigesimal"</code></li>
        <li>base <code>40</code> as <code>"quadragesimal"</code></li>
        <li>base <code>42</code> as <code>"duoquadragesimal"</code></li>
        <li>base <code>45</code> as <code>"pentaquadragesimal"</code></li>
        <li>base <code>47</code> as <code>"septaquadragesimal"</code></li>
        <li>base <code>48</code> as <code>"octoquadragesimal"</code></li>
        <li>base <code>49</code> as <code>"enneaquadragesimal"</code></li>
        <li>base <code>50</code> as <code>"quinquagesimal"</code></li>
        <li>base <code>52</code> as <code>"duoquinquagesimal"</code></li>
        <li>base <code>54</code> as <code>"tetraquinquagesimal"</code></li>
        <li>base <code>56</code> as <code>"hexaquinquagesimal"</code></li>
        <li>base <code>57</code> as <code>"heptaquinquagesimal"</code></li>
        <li>base <code>58</code> as <code>"octoquinquagesimal"</code></li>
        <li>base <code>60</code> as <code>"sexagesimal"</code> or <code>"sexagenary"</code></li>
        <li>base <code>62</code> as <code>"duosexagesimal"</code></li>
        <li>base <code>64</code> as <code>"tetrasexagesimal"</code> or <code>"6bit"</code></li>
        <li>base <code>72</code> as <code>"duoseptuagesimal"</code></li>
        <li>base <code>80</code> as <code>"octogesimal"</code></li>
        <li>base <code>81</code> as <code>"unoctogesimal"</code></li>
        <li>base <code>85</code> as <code>"pentoctogesimal"</code></li>
        <li>base <code>89</code> as <code>"enneaoctogesimal"</code></li>
        <li>base <code>90</code> as <code>"nonagesimal"</code></li>
        <li>base <code>91</code> as <code>"unnonagesimal"</code></li>
        <li>base <code>92</code> as <code>"duononagesimal"</code></li>
        <li>base <code>93</code> as <code>"trinonagesimal"</code></li>
        <li>base <code>94</code> as <code>"tetranonagesimal"</code></li>
        <li>base <code>95</code> as <code>"pentanonagesimal"</code></li>
        <li>base <code>96</code> as <code>"hexanonagesimal"</code></li>
        <li>base <code>97</code> as <code>"septanonagesimal"</code></li>
        <li>base <code>100</code> as <code>"centesimal"</code></li>
        <li>base <code>120</code> as <code>"centevigesimal"</code></li>
        <li>base <code>121</code> as <code>"centeunvigesimal"</code></li>
        <li>base <code>125</code> as <code>"centepentavigesimal"</code></li>
        <li>base <code>128</code> as <code>"centeoctovigesimal"</code> or <code>"7bit"</code></li>
        <li>base <code>144</code> as <code>"centetetraquadragesimal"</code></li>
        <li>base <code>169</code> as <code>"centenovemsexagesimal"</code></li>
        <li>base <code>185</code> as <code>"centepentoctogesimal"</code></li>
        <li>base <code>196</code> as <code>"centehexanonagesimal"</code></li>
        <li>base <code>200</code> as <code>"duocentesimal"</code></li>
        <li>base <code>210</code> as <code>"duocentedecimal"</code></li>
        <li>base <code>216</code> as <code>"duocentehexidecimal"</code></li>
        <li>base <code>225</code> as <code>"duocentepentavigesimal"</code></li>
        <li>base <code>256</code> as <code>"duocentehexaquinquagesimal"</code>, <code>"byte"</code>, or <code>"8bit"</code></li>
        <li>base <code>300</code> as <code>"trecentesimal"</code></li>
        <li>base <code>360</code> as <code>"trecentosexagesimal"</code></li>
        <li>base <code>512</code> as <code>"9bit"</code></li>
        <li>base <code>1024</code> as <code>"10bit"</code></li>
        <li>base <code>2048</code> as <code>"11bit"</code></li>
        <li>base <code>4096</code> as <code>"12bit"</code></li>
        <li>base <code>8192</code> as <code>"13bit"</code></li>
        <li>base <code>16384</code> as <code>"14bit"</code></li>
        <li>base <code>32768</code> as <code>"15bit"</code></li>
        <li>base <code>65536</code> as <code>"16bit"</code></li>
        <li>base <code>131072</code> as <code>"17bit"</code></li>
        <li>base <code>262144</code> as <code>"18bit"</code></li>
        <li>base <code>524288</code> as <code>"19bit"</code></li>
        <li>base <code>1048576</code> as <code>"20bit"</code></li>
        <li>base <code>2097152</code> as <code>"21bit"</code></li>
        <li>base <code>4194304</code> as <code>"22bit"</code></li>
        <li>base <code>8388608</code> as <code>"23bit"</code></li>
        <li>base <code>16777216</code> as <code>"24bit"</code></li>
        <li>base <code>33554432</code> as <code>"25bit"</code></li>
        <li>base <code>67108864</code> as <code>"26bit"</code></li>
        <li>base <code>134217728</code> as <code>"27bit"</code></li>
        <li>base <code>268435456</code> as <code>"28bit"</code></li>
        <li>base <code>536870912</code> as <code>"29bit"</code></li>
        <li>base <code>1073741824</code> as <code>"30bit"</code></li>
        <li>base <code>2147483648</code> as <code>"31bit"</code></li>
        <li>base <code>4294967296</code> as <code>"32bit"</code></li>
      </ul>
    </details>
- comparisons:
  - `isOdd()` / `isEven()`
  - `A===0` / `A===1` / `A===2`
  - `A<B` / `A>B` / `A===B` / `A>=B` / `A<=B`
- __chainable methods:__
  - number constants: `0` / `1` / `2` / `Infinity` (`1.79e308`) / `MAX_VALUE` / `HelloThere`
  - logging to console (using own `toString(base)` method, but more formatted)
  - copy/setEqual: `copy()` / `reverseCopy(toOtherNumber)` / `setEqualTo(otherNumber)`
  - sign: `abs()` / `neg()` (`-A`)
  - operations:
    - `++A` / `--A` / `A+=B` / `A-=B`
    - `A*=B` using karatsubas algorithm / `A**=B`
    - `A/=B` with rounding (ceil, floor or round) / `A%=B` with type (euclidean, truncated, floored, ceiled, rounded)
    - `A*=2` / `A/=2` with rounding (ceiled or floored)
    - `A*=(256**x)` with rounding (ceiled, floored or rounded) - (digit-shifts)
  - bitwise operations:
    - `A>>>=x` / `A<<=x` / `A&=B` / `A|=B` / `A^=B` / `A=~A`
  - `GCD(A,B)`
  - `mapRange(a,b,a2,b2)` with rounding (ceiled, floored or rounded) and limit (cap at a2/b2)
- `randomInt(min,max)` (using `Math.random()`)
- *↑ (`A` and `B` are type `BigIntType` and `x` is type `Number`) ↑*

*more details/documentation in the file itself ( within `/** */` or after `//~` )*

## [PerfectComplex.js](./PerfectComplex.js)

>
> WIP
>
> idea: ~BigIntType~ BigInt > Fraction > ComplexNumber
>

----

## [functions.js](./functions.js)

some useful math functions

>
> also see [`other-projects/useful.js`](https://github.com/MAZ01001/other-projects#usefuljs)
>

- `mapRange(n,x,y,x2,y2,limit=false);` map number from one range to another
- `toPercent(n,x,y);` calculates percent of number in range ("progress")
- `deg2rad(deg);` DEG to RAD
- `rad2deg(rad);` RAD to DEG
- `gcd(A,B);` calculates the greatest common divisor of A and B
- `dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6);` estimates a decimal number with a fraction
- `padNum(n,first=0,last=0);` pad number in respect to the decimal point
- `euclideanModulo(a,b);` calculates the modulo of two whole numbers (the euclidean way with only positive remainder)
- `fixFloat(n);` an attempt of fixing float precision errors in JS (without strings)
- `randomRange(min,max);` genarates a random number within given range (including min and max)
- `randomRangeInt(min,max);` genarates a random integer within given range (including min and max)
- `fixPrecision(n);` attempt of fixing (potential) js float precision errors (with `Number.EPSILON`)
- `divisionWithRest(A,B);` calculates division of A by B and returns (integer) quotient and remainder
- `randomBools(x=1)` generate an array, length x, of random booleans
- `rangeArray(start,end,step=1,overflow=false);` creates a range of numbers as an iterable array
- `rangeGenerator(start,end,step=1,overflow=false);` creates a generator for given range - iterable
