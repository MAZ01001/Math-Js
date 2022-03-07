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
> > WIP [2022-03-07]
> >
> > update methods and make an online calculator with this class
> >
>
> create numbers with js typed arrays (8bit - base 256)
>
> ### (BigIntType) Methods
>
> + `static get MAX_SIZE():Number`
> + `static set MAX_SIZE(n:Number):Number`
> + `get Sign():Boolean`
> + `get Digits():Uint8Array`
> + `get NumberOfDigits():Number`
> + `static get MAX_VALUE():BigIntType`
> + `static get HelloThere():BigIntType`
> + `static get Infinity():BigIntType`
> + `static get Zero():BigIntType`
> + `static get One():BigIntType`
> + `static get Two():BigIntType`
> + `toString(base:Number):String`
> + `logConsole(maxLen:Number):BigIntType`
> + `copy():BigIntType`
> + `setEqualTo(n:BigIntType):BigIntType`
> + `abs():BigIntType`
> + `neg():BigIntType`
> + `isOdd():BigIntType`
> + `isEven():BigIntType`
> + `isZero():BigIntType`
> + `isOne():BigIntType`
> + `isTwo():BigIntType`
> + `isSmallerThan(n:BigIntType):BigIntType`
> + `isGreaterThan(n:BigIntType):BigIntType`
> + `isEqualTo(n:BigIntType):BigIntType`
> + `isGreaterOrEqualTo(n:BigIntType):BigIntType`
> + `isSmallerOrEqualTo(n:BigIntType):BigIntType`
> + `inc():BigIntType`
> + `dec():BigIntType`
> + `add(n:BigIntType):BigIntType`
> + `sub(n:BigIntType):BigIntType`
> + `times256ToThePowerOf(x:Number,rounding:String):BigIntType`
> + `bitShiftR(x:Number):BigIntType`
> + `bitShiftL(x:Number):BigIntType`
> + `bitAND(n:BigIntType):BigIntType`
> + `bitOR(n:BigIntType):BigIntType`
> + `bitXOR(n:BigIntType):BigIntType`
> + `bitNOT():BigIntType`
> + `half(rounding:String):BigIntType`
> + `double():BigIntType`
> + `div(n:BigIntType,rounding:String):BigIntType`
> + `modulo(n:BigIntType,type:String):BigIntType`
>
----
>
> ## [PerfectComplex.js](https://github.com/MAZ01001/Math-Js/blob/main/PerfectComplex.js)
>
> >
> > WIP
> >
> > idea: BigIntType > Fraction > ComplexNumber]
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
> + `gcd(A,B);` calculates greatest common divisor
> + `dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6);` estimates a decimal number with a fraction
> + `padNum(n,first=0,last=0);` pad number in respect to the decimal point
> + `euclideanModulo(a,b);` calculates the modulo of two whole numbers *(the euclidean way with only positive remainder)*
> + `fixFloat(n);` an attempt of fixing float precision errors in JS *(without strings)*
> + `randomRange(min,max);` genarates a random number within given range *(including min and max)*
> + `randomRangeInt(min,max);` genarates a random integer within given range *(including min and max)*
> + `fixPrecision(n);` attempt of fixing (potential) js float precision errors *(with `Number.EPSILON`)*
>
