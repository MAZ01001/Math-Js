# Math-Js

> ## Polynomial.js
>
> >
> > ### __*WIP*__
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
> ## Fraction.js
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
> ## Matrix.js
>
> >
> > ### __*ideas*__
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
> + matrix inversion _(Gauß Bareiss)_
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
> ## Vector.js
>
> >
> > ### __*Ideas*__
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
>   + to X, Y, Z - axis on XY, YZ, XZ - plane _(2D>3D)_
> + static methods DEG to RAD and RAD to DEG conversion
> + test if finite
> + test if equal to another vector
> + convert vector to unit-vector _(length 1 same direction)_
> + vector
>   + addition
>   + subtraction
>   + inversion
>   + scale by constant _(multiply number)_
>
----
>
> ## ComplexNumber.js
>
> + make a complex number with
>   + real and imaginary part
>   + with length and angle
>     + radian
>     + degree
>   + square rooting a negative number
>   + raising e to i-times-n-th power _(`e^(i*n)`)_
>   + raising n to power of i _(`n^i`)_
> + getter for
>   + real part
>   + imaginary part
>   + angle _(radian or degree)_
>   + length / absolute value
>   + arc length _(from `0r`/`0°` to where the complex number is)_
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
> ## functions.js
>
> > some useful math functions _(also see `other-projects/useful.js`)_
>
> + `mapRange(n,x,y,x2,y2,limit=false);` map number from one range to another
> + `roundDecimal(n,dec=0);` rounds number to decimal place
> + `toPercent(n,x,y);` calculates percent of number in range _("progress")_
> + `deg2rad(deg);` DEG to RAD
> + `rad2deg(rad);` RAD to DEG
> + `gcd(A,B);` calculates greatest common divisor
> + `dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6);` estimates a decimal number with a fraction
> + `padNum(n,first=0,last=0);` pad number in respect to the decimal point
> + `euclideanModulo(a,b);` calculates the modulo of two whole numbers _(the euclidean way with only positive remainder)_
> + `fixFloat(n);` an attempt of fixing float precision errors in JS _(without strings)_
> + `randomRange(min,max);` genarates a random number within given range _(including min and max)_
> + `randomRangeInt(min,max);` genarates a random integer within given range _(including min and max)_
> + `fixPrecision(n);` attempt of fixing (potential) js float precision errors _(with `Number.EPSILON`)_
>
