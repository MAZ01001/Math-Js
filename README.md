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
> + matrix inversion (Gauß Bareiss)
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
>   + to X, Y, Z - axis on XY, YZ, XZ - plane (2D>3D)
> + static methods DEG to RAD and RAD to DEG conversion
> + test if finite
> + test if equal to another vector
> + convert vector to unit-vector (length 1 same direction)
> + vector
>   + addition
>   + subtraction
>   + inversion
>   + scale by constant (multiply number)
>
----
>
> ## functions.js
>
> > some useful math functions _(also see `other-projects/useful.js`)_
>
> + `mapRange(n,x,y,x2,y2,limit=false);` map number from one range to another
> + `roundDecimal(n,dec=0);` rounds number to decimal place
> + `toPercent(n,x,y);` calculates percent of number in range ("progress")
> + `deg2rad(deg);` DEG to RAD
> + `rad2deg(rad);` RAD to DEG
> + `gcd(A,B);` calculates greatest common divisor
> + `dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6);` estimates a decimal number with a fraction
> + `padNum(n,first=0,last=0);` pad number in respect to the decimal point
> + `euclideanModulo(a,b);` calculates the modulo of two whole numbers _(the euclidean way with only positive remainder)_
> + `fixFloat(n);` an attempt of fixing float precision errors in JS _(without strings)_
> + `randomRange(min,max);` genarates a random number within given range _(including min and max)_
> + `randomRangeInt(min,max);` genarates a random integer within given range _(including min and max)_
>
