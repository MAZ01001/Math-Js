# [Math-Js](https://github.com/MAZ01001/Math-Js)

+ [[Polynomial.js]](#polynomialjs)
+ [[Fraction.js]](#fractionjs)
+ [[Matrix.js]](#matrixjs)
+ [[Vector.js]](#vectorjs)
+ [[ComplexNumber.js]](#complexnumberjs)
+ [[BigIntType.js]](#biginttypejs)
+ [[PerfectComplex.js]](#perfectcomplexjs)
+ [[functions.js]](#functionsjs)

> ## [Polynomial.js](https://github.com/MAZ01001/Math-Js/blob/main/Polynomial.js)
>
> >
> > WIP
> >
> > + formula for degree 3/4
> > + chainable methods
> >
>
> + make polynomial directly/from string/roots
> + print as string
> + finding roots
>   + Newton's method for degree 3 and higher
>   + formula for degree 2 and lower
> + create derivative/antiderivative
> + calculate f(x)
> + calculate integral with
>   + antiderivative formula
>   + set delta x
>
----
>
> ## [Fraction.js](https://github.com/MAZ01001/Math-Js/blob/main/Fraction.js)
>
> + make fraction directly/from decimal/-string
> + GCD & decimal to fraction algorithm as public static methods
> + fraction to
>   + improper-form
>   + mixed-form
>   + decimal
>   + string
> + addition/multiplication/subtraction/divition with
>   + a single integer
>   + another fraction
> + raise fraction to nth power
> + chainable methods
>
----
>
> ## [Matrix.js](https://github.com/MAZ01001/Math-Js/blob/main/Matrix.js)
>
> >
> > WIP
> >
> > + row to row addition
> > + row to row subtraction
> > + row multiplied by constant
> >
>
> + make matrix directly/from string
> + create identity matrix
> + print as a formatted string
> + single number
>   + muliplication
>   + divition
> + matrix
>   + addition
>   + subtraction
>   + multiplication
>   + divition
> + matrix inversion *(Gauß Bareiss)*
> + chainable methods
> + row
>   + move
>   + delete
> + col
>   + delete
> + check matrix stats
>
----
>
> ## [Vector.js](https://github.com/MAZ01001/Math-Js/blob/main/Vector.js)
>
> >
> > WIP
> >
> > + make vector from string
> > + printing to string
> >
>
> + 1D, 2D or 3D vector
> + calculate length
> + calculate angle
>   + to other vector
>   + to X, Y, Z - axis
>   + to XY, YZ, XZ - plane
>   + to X, Y, Z - axis on XY, YZ, XZ - plane *(2D>3D)*
> + static methods DEG to RAD and RAD to DEG conversion
> + test if finite
> + test if equal to another vector
> + convert vector to unit-vector *(length 1 same direction)*
> + vector
>   + addition
>   + subtraction
>   + inversion
>   + scale by constant *(multiply number)*
>
----
>
> ## [ComplexNumber.js](https://github.com/MAZ01001/Math-Js/blob/main/ComplexNumber.js)
>
> + make a complex number with
>   + real and imaginary part
>   + with length and angle
>     + radian
>     + degree
>   + square rooting a negative number
>   + raising e to i-times-n-th power *(`e^(i*n)`)*
>   + raising n to power of i *(`n^i`)*
> + getter for
>   + real part
>   + imaginary part
>   + angle *(radian or degree)*
>   + length / absolute value
>   + arc length *(from `0r`/`0°` to where the complex number is)*
> + check for equality
> + chainable methods
> + logging current value without braking method chain
> + create a copy of the the current complex number and continue with it
> + complex number
>   + addition
>   + subtraction
>   + multiplication
>   + division
> + raising current complex number to nth power
> + static values for
>   + `2π`
>   + `π/2`
>   + `π/4`
>   + `e^i`
>   + `i^i`
>
----
>
> ## [BigIntType.js](https://github.com/MAZ01001/Math-Js/blob/main/BigIntType.js)
>
> >
> > WIP [2022-03-14]
> >
> > + nth-root()
> > + log_n()
> > + (?) digits of `E` / `PI`
> > + (?) fraction output/calcs
> >
>
> arbitrary precision integer using JS's Uint8Array (unsigned 8-bit integer array)
> human "readable" code with lots of documentation (js-doc & some comments) and descriptive error throws
>
> > [online calculator [WIP]](https://maz01001.github.io/site/BigIntType_calc.html)
>
> + *(uses string arrays internally in private-methods for faster calculations)*
> + adjustable limit `MAX_SIZE:Number` (Range 1 to 67108864 / 64MiB) *(software max is [8PiB-1] - wich could be extended to [16PiB-2] using `Uint16Array` - or even [32PiB-4] using `Uint32Array` with `BigInt`)*
> + internal values: `sign:Boolean` / `digits:Uint8Array` (base 256 digits) / `length:Number` (length of digit-array)
> + convert from/to string with radixes 2 to 4294967296 incl. (bases above 10 use digits as CSV) or 256 with unicode-braille-pattern - (supported prefixes `0b`, `0o`, `0x`)
> + a lot of names for bases to use instead of the base number
> + comparisons:
>   + `isOdd()` / `isEven()`
>   + `A===0` / `A===1` / `A===2`
>   + `A<B` / `A>B` / `A===B` / `A>=B` / `A<=B`
> + __chainable methods:__
> + number constants: `0` / `1` / `2` / `Infinity` (`1.79e308`) / `MAX_VALUE` / `HelloThere`
> + logging to console (custom base) without breaking chain
> + copy/setEqual: `copy()` / `reverseCopy(toOtherNumber)` / `setEqualTo(otherNumber)`
> + sign: `abs()` / `neg()` (`!A`)
> + operations:
>   + `++A` / `--A` / `A+=B` / `A-=B`
>   + `A*=B` using karatsubas algorithm / `A**=B`
>   + `A/=B` with rounding (ceil, floor or round) / `A%=B` with type (euclidean, truncated, floored, ceiled, rounded)
>   + `A*=2` / `A/=2` with rounding (ceiled or floored)
>   + `A*=(256**x)` with rounding (ceiled, floored or rounded) - *(digit-shifts)*
> + bitwise operations:
>   + `A>>=x` / `A<<=x` / `A&=B` / `A|=B` / `A^=B` / `A=~A`
> + `GCD(A,B)`
> + `mapRange(a,b,a2,b2)` with rounding (ceiled, floored or rounded) and limit (cap at a2/b2)
> + `randomInt(min,max)` (using `Math.random()`)
> + *↑ (`A` and `B` are type `BigIntType` and `x` is type `Number`) ↑*
>
----
>
> ## [PerfectComplex.js](https://github.com/MAZ01001/Math-Js/blob/main/PerfectComplex.js)
>
> >
> > WIP
> >
> > idea: ~BigIntType~ BigInt > Fraction > ComplexNumber]
> >
>
----
>
> ## [functions.js](https://github.com/MAZ01001/Math-Js/blob/main/functions.js)
>
> some useful math functions
>
> > also see [`other-projects/useful.js`](https://github.com/MAZ01001/other-projects#usefuljs)
>
> + `mapRange(n,x,y,x2,y2,limit=false);` map number from one range to another
> + `roundDecimal(n,dec=0);` rounds number to decimal place
> + `toPercent(n,x,y);` calculates percent of number in range *("progress")*
> + `deg2rad(deg);` DEG to RAD
> + `rad2deg(rad);` RAD to DEG
> + `gcd(A,B);` calculates the greatest common divisor of A and B
> + `dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6);` estimates a decimal number with a fraction
> + `padNum(n,first=0,last=0);` pad number in respect to the decimal point
> + `euclideanModulo(a,b);` calculates the modulo of two whole numbers *(the euclidean way with only positive remainder)*
> + `fixFloat(n);` an attempt of fixing float precision errors in JS *(without strings)*
> + `randomRange(min,max);` genarates a random number within given range *(including min and max)*
> + `randomRangeInt(min,max);` genarates a random integer within given range *(including min and max)*
> + `fixPrecision(n);` attempt of fixing (potential) js float precision errors *(with `Number.EPSILON`)*
> + `divisionWithRest(A,B);` calculates division of A by B and returns *(integer)* quotient and remainder
>
