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
> > WIP [2022-06-16]
> >
> > + "// todo ..."-s
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
> + __ALL YOUR BASE ARE BELONG TO US__
>   + all *(integer)* bases between `2` and `4294967296` (incl.) are supported for in-/output
>     + bases up to `36` (incl.) use `0-9` and `A-Z` as needed
>     + bases above `36` use CSV (comma-separated-values or numbers in this case) to represent digits, where each number corresponds to the numerical value of the digit at that place *(in base `10`, with `0-9`)*
>     + base `"braille"` is in base `256` but uses braille patterns (unicodes `0x2800` to `0x28FF` incl.) as digit-charset
>     + supported prefixes
>       + `0b` for base `2`
>       + `0o` for base `8`
>       + `0x` for base `16`
>   + <details open><summary>supported base names to use instead of numbers:</summary>
>
>     + base `2` as `'b'`, `"bin"`, `"bits"`, `"binary"`, or `"1bit"`
>     + base `3` as `"ternary"` or `"trinary"`
>     + base `4` as `'q'`, `"quaternary"`, or `"2bit"`
>     + base `5` as `"quinary"` or `"pental"`
>     + base `6` as `"senary"`, `"heximal"`, or `"seximal"`
>     + base `7` as `"septenary"`
>     + base `8` as `'o'`, `"oct"`, `"octal"`, or `"3bit"`
>     + base `9` as `"nonary"`
>     + base `10` as `'d'`, `"dec"`, `"decimal"`, `"decimal"` or `"denary"`
>     + base `11` as `"undecimal"`
>     + base `12` as `"duodecimal"`, `"dozenal"`, or `"uncial"`
>     + base `13` as `"tridecimal"`
>     + base `14` as `"tetradecimal"`
>     + base `15` as `"pentadecimal"`
>     + base `16` as `'h'`, `"hex"`, `"hexadecimal"`, `"sexadecimal"`, or `"4bit"`
>     + base `17` as `"heptadecimal"`
>     + base `18` as `"octodecimal"`
>     + base `19` as `"enneadecimal"`
>     + base `20` as `"vigesimal"`
>     + base `21` as `"unvigesimal"`
>     + base `22` as `"duovigesimal"`
>     + base `23` as `"trivigesimal"`
>     + base `24` as `"tetravigesimal"`
>     + base `25` as `"pentavigesimal"`
>     + base `26` as `"hexavigesimal"`
>     + base `27` as `"heptavigesimal septemvigesimal"`
>     + base `28` as `"octovigesimal"`
>     + base `29` as `"enneavigesimal"`
>     + base `30` as `"trigesimal"`
>     + base `31` as `"untrigesimal"`
>     + base `32` as `"duotrigesimal"` or `"5bit"`
>     + base `33` as `"tritrigesimal"`
>     + base `34` as `"tetratrigesimal"`
>     + base `35` as `"pentatrigesimal"`
>     + base `36` as `'t'`, `"txt"`, `"text"`, or `"hexatrigesimal"`
>     + base `37` as `"heptatrigesimal"`
>     + base `38` as `"octotrigesimal"`
>     + base `39` as `"enneatrigesimal"`
>     + base `40` as `"quadragesimal"`
>     + base `42` as `"duoquadragesimal"`
>     + base `45` as `"pentaquadragesimal"`
>     + base `47` as `"septaquadragesimal"`
>     + base `48` as `"octoquadragesimal"`
>     + base `49` as `"enneaquadragesimal"`
>     + base `50` as `"quinquagesimal"`
>     + base `52` as `"duoquinquagesimal"`
>     + base `54` as `"tetraquinquagesimal"`
>     + base `56` as `"hexaquinquagesimal"`
>     + base `57` as `"heptaquinquagesimal"`
>     + base `58` as `"octoquinquagesimal"`
>     + base `60` as `"sexagesimal"` or `"sexagenary"`
>     + base `62` as `"duosexagesimal"`
>     + base `64` as `"tetrasexagesimal"` or `"6bit"`
>     + base `72` as `"duoseptuagesimal"`
>     + base `80` as `"octogesimal"`
>     + base `81` as `"unoctogesimal"`
>     + base `85` as `"pentoctogesimal"`
>     + base `89` as `"enneaoctogesimal"`
>     + base `90` as `"nonagesimal"`
>     + base `91` as `"unnonagesimal"`
>     + base `92` as `"duononagesimal"`
>     + base `93` as `"trinonagesimal"`
>     + base `94` as `"tetranonagesimal"`
>     + base `95` as `"pentanonagesimal"`
>     + base `96` as `"hexanonagesimal"`
>     + base `97` as `"septanonagesimal"`
>     + base `100` as `"centesimal"`
>     + base `120` as `"centevigesimal"`
>     + base `121` as `"centeunvigesimal"`
>     + base `125` as `"centepentavigesimal"`
>     + base `128` as `"centeoctovigesimal"` or `"7bit"`
>     + base `144` as `"centetetraquadragesimal"`
>     + base `169` as `"centenovemsexagesimal"`
>     + base `185` as `"centepentoctogesimal"`
>     + base `196` as `"centehexanonagesimal"`
>     + base `200` as `"duocentesimal"`
>     + base `210` as `"duocentedecimal"`
>     + base `216` as `"duocentehexidecimal"`
>     + base `225` as `"duocentepentavigesimal"`
>     + base `256` as `"duocentehexaquinquagesimal"`, `"byte"`, or `"8bit"`
>     + base `300` as `"trecentesimal"`
>     + base `360` as `"trecentosexagesimal"`
>     + base `512` as `"9bit"`
>     + base `1024` as `"10bit"`
>     + base `2048` as `"11bit"`
>     + base `4096` as `"12bit"`
>     + base `8192` as `"13bit"`
>     + base `16384` as `"14bit"`
>     + base `32768` as `"15bit"`
>     + base `65536` as `"16bit"`
>     + base `131072` as `"17bit"`
>     + base `262144` as `"18bit"`
>     + base `524288` as `"19bit"`
>     + base `1048576` as `"20bit"`
>     + base `2097152` as `"21bit"`
>     + base `4194304` as `"22bit"`
>     + base `8388608` as `"23bit"`
>     + base `16777216` as `"24bit"`
>     + base `33554432` as `"25bit"`
>     + base `67108864` as `"26bit"`
>     + base `134217728` as `"27bit"`
>     + base `268435456` as `"28bit"`
>     + base `536870912` as `"29bit"`
>     + base `1073741824` as `"30bit"`
>     + base `2147483648` as `"31bit"`
>     + base `4294967296` as `"32bit"`
>     </details>
> + comparisons:
>   + `isOdd()` / `isEven()`
>   + `A===0` / `A===1` / `A===2`
>   + `A<B` / `A>B` / `A===B` / `A>=B` / `A<=B`
> + __chainable methods:__
>   + number constants: `0` / `1` / `2` / `Infinity` (`1.79e308`) / `MAX_VALUE` / `HelloThere`
>   + logging to console *(using own `toString(base)` method, but more formatted)*
>   + copy/setEqual: `copy()` / `reverseCopy(toOtherNumber)` / `setEqualTo(otherNumber)`
>   + sign: `abs()` / `neg()` *(`-A`)*
>   + operations:
>     + `++A` / `--A` / `A+=B` / `A-=B`
>     + `A*=B` using karatsubas algorithm / `A**=B`
>     + `A/=B` with rounding (ceil, floor or round) / `A%=B` with type (euclidean, truncated, floored, ceiled, rounded)
>     + `A*=2` / `A/=2` with rounding (ceiled or floored)
>     + `A*=(256**x)` with rounding (ceiled, floored or rounded) - *(digit-shifts)*
>   + bitwise operations:
>     + `A>>>=x` / `A<<=x` / `A&=B` / `A|=B` / `A^=B` / `A=~A`
>   + `GCD(A,B)`
>   + `mapRange(a,b,a2,b2)` with rounding (ceiled, floored or rounded) and limit (cap at a2/b2)
> + `randomInt(min,max)` *(using `Math.random()`)*
> + *↑ (`A` and `B` are type `BigIntType` and `x` is type `Number`) ↑*
>
> *more details/documentation in the file itself ( within `/** */` or after `//~` )*
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
> + `randomBools(x=1)` generate an array, length x, of random booleans
> + `rangeArray(start,end,step=1,overflow=false);` creates a range of numbers as an iterable array
> + `rangeGenerator(start,end,step=1,overflow=false);` creates a generator for given range - iterable
>
