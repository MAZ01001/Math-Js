//@ts-check
"use strict";//~ anything inside a class uses strict-mode by default

const ComplexNumber=class ComplexNumber{
    /**
     * ## RegExp for matching a complex number (in cartesian form)
     * like `1.2-3e4i`
     * - group 1 is the real part incl. (optional) sign
     * - group 2 is the imaginary part incl. (mandatory) sign and excl. `i` (case sensitive)
     * - supports scientific notation (case insensitive)
     * - no leading/trailing `0`
     * - no whitespace
     */
    static RegExp=(real=>new RegExp(`^([+-]?${real})([+-]${real})i$`))("(?:(?:0|[1-9][0-9]*)(?:\\.[0-9]*[1-9])?|\\.[0-9]*[1-9])(?:[eE][+-]?(?:0|[1-9][0-9]*))?");
    /**
     * ## RegExp for matching a complex number in polar form (angle notation)
     * like `2∠1.57rad` or `2∠90°` (`∠` is U+2220 and `°` is U+00B0)
     * - group 1 is the length (optionally signed)
     * - group 2 is the angle (optionally signed)
     * - group 3 is `rad` or `°` (U+00B0)
     * - supports scientific notation (case insensitive)
     * - no leading/trailing `0`
     * - no whitespace
     */
    static RegExpPolar=(real=>new RegExp(`^([+-]?${real})\\u2220([+-]?${real})(\\xB0|rad)$`))("(?:(?:0|[1-9][0-9]*)(?:\\.[0-9]*[1-9])?|\\.[0-9]*[1-9])(?:[eE][+-]?(?:0|[1-9][0-9]*))?");
    /** ## [precalculated] `τ=2π` */
    static TAU=Math.PI*2;
    /** ## [precalculated] `π/2` */
    static halfPI=Math.PI*.5;
    /** ## [precalculated] `π/4` */
    static quarterPI=Math.PI*.25;
    /** ## [precalculated] multiply with a (real) number to convert radians `[0,2π[` to degrees `[0,360[` */
    static rad2deg=0xB4/Math.PI;
    /** ## [precalculated] multiply with a (real) number to convert degrees `[0,360[` to radians `[0,2π[` */
    static deg2rad=Math.PI/0xB4;
    /**
     * ## Create a new complex number `0` (`0+0i`)
     * identity element for addition (and subtraction)
     */
    static get zero(){return new ComplexNumber(0,0);}
    /**
     * ## Create a new complex number `1` (`1+0i`)
     * identity element for multiplication (and division)
     */
    static get one(){return new ComplexNumber(1,0);}
    /** ## Create a new complex number `0+1i` */
    static get i(){return new ComplexNumber(0,1);}
    /** ## Create a new complex number from `e↑i` */
    static get e_i(){return new ComplexNumber(Math.cos(1),Math.sin(1));}
    /** ## Create a new complex number from `i↑i` */
    static get i_i(){return new ComplexNumber(Math.E**-ComplexNumber.halfPI,0);}
    /**
     * ## Create a new complex number with a {@linkcode real} and an {@linkcode imaginary} part
     * @param {number} real - real part of complex number
     * @param {number} [imaginary] - [optional] imaginary part of complex number - default `0`
     * @throws {TypeError} if {@linkcode real} is not a number and when {@linkcode imaginary} is given but is not a number
     */
    constructor(real,imaginary){
        if(typeof real!=="number")throw new TypeError("[constructor] real is not a number.");
        if(imaginary!=null&&typeof imaginary!=="number")throw new TypeError("[constructor] imaginary is given but is not a number.");
        /** @type {number} - real part of complex number */
        this.real=real;
        /** @type {number} - imaginary part of complex number */
        this.imaginary=imaginary??0;
    }
    /**
     * ## Create a new complex number with a {@linkcode real} and an {@linkcode imaginary} part
     * constructor alias (without `new`)
     * @param {number} real - real part of complex number
     * @param {number} [imaginary] - [optional] imaginary part of complex number
     * @throws {TypeError} if {@linkcode real} is not a number and when {@linkcode imaginary} is given but is not a number
     */
    static c(real,imaginary){return new ComplexNumber(real,imaginary);}
    /**
     * ## [Internal] Computes the greatest-common-divisor of two whole numbers
     * @param {number} n - positive safe integer `[1..2↑53[`
     * @param {number} m - positive safe integer `[1..2↑53[`
     * @returns {number} greatest-common-divisor `[1..2↑53[`
     * @example gcd(45, 100); //=> 5 → (45/5) / (100/5) → 9/20 = 45/100
     */
    static _gcd_(n,m){
        for(let r=(([n,m]=n<m?[m,n]:[n,m]),0);(r=n%m)>0;[n,m]=[m,r]);
        return m;
    }
    /**
     * ## [Internal] Round {@linkcode x} to nearest integer if closer than {@linkcode Number.EPSILON} times {@linkcode e}
     * @param {number} x - floating point number
     * @param {number} [e] - [optional] scaler for {@linkcode Number.EPSILON} - default `5`
     * @return {number} floating point number with small error correction
     */
    static _roundEpsilon_(x,e){
        const rnd=Math.round(x);
        return Math.abs(Math.abs(x)-Math.abs(rnd))<Number.EPSILON*(e??5)?rnd:x;
    }
    /**
     * ## Round `this` real and complex part to nearest integer if closer than {@linkcode Number.EPSILON} times {@linkcode e}
     * use whenever float precision errors are expected
     * @param {number} [e] - [optional] scaler for {@linkcode Number.EPSILON} - default `5`
     * @throws {TypeError} when {@linkcode e} is given but is not a number
     * @return {ComplexNumber} `this` modified complex number
     */
    roundEpsilon(e){
        if(e!=null&&typeof e!=="number")throw new TypeError("[roundEpsilon] e is given but is not a number.");
        this.real=ComplexNumber._roundEpsilon_(this.real,e);
        this.imaginary=ComplexNumber._roundEpsilon_(this.imaginary,e);
        return this;
    }
    /**
     * ## Create a new complex number with a {@linkcode length} and an {@linkcode angle}
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} length - length of the vector in the complex plane [0,∞)
     * @param {number} angle - angle in radians [0,2π) (counterclockwise from positive real axis) can be negative and overflow a full rotation
     * @throws {TypeError} if {@linkcode length} or {@linkcode angle} are not numbers
     * @throws {RangeError} if {@linkcode length} is negative
     * @returns {ComplexNumber} the newly created complex number
     */
    static fromPolar(length,angle){
        if(typeof length!=="number")throw new TypeError("[fromPolar] length is not a number.");
        if(typeof angle!=="number")throw new TypeError("[fromPolar] angle is not a number.");
        if(length<0)throw new RangeError("[fromPolar] length is negative.");
        if(length===0)return ComplexNumber.zero;
        if((angle%=ComplexNumber.TAU)<0)angle+=ComplexNumber.TAU;
        if((angle%Math.PI)===0)return new ComplexNumber(angle===0?length:-length,0);
        return new ComplexNumber(
            Math.cos(angle)*length*(angle+ComplexNumber.halfPI>Math.PI?-1:1),
            Math.sin(angle)*length*(angle>Math.PI?-1:1)
        );
    }
    /**
     * ## Create a new complex number from {@linkcode angle} on the unit circle (radius `1`)
     * alias of {@linkcode ComplexNumber.fromPolar} with `length` set to `1`\
     * ! prone to float precision errors
     * @param {number} angle - angle in radians [0,2π) (counterclockwise from positive real axis) can be negative and overflow a full rotation
     * @throws {TypeError} if {@linkcode angle} is not a number
     * @returns {ComplexNumber} the newly created complex number
     */
    static fromUnitCircle(angle){
        if(typeof angle!=="number")throw new TypeError("[fromPolar] angle is not a number.");
        return ComplexNumber.fromPolar(1,angle);
    }
    /**
     * ## Creates complex number from the square root of {@linkcode x}
     * @param {number} x - real number
     * @throws {TypeError} if {@linkcode x} is not a number
     * @returns {ComplexNumber} the newly created complex number
     */
    static fromSqrt(x){
        if(typeof x!=="number")throw new TypeError("[fromSqrt] n is not a number.");
        if(x<0)return new ComplexNumber(0,Math.sqrt(-x));
        return new ComplexNumber(Math.sqrt(x),0);
    }
    /**
     * ## Create complex number from calculating `e` to the power of, `i` times {@linkcode x}
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} x - real number
     * @throws {TypeError} if {@linkcode x} is not a number
     * @returns {ComplexNumber} the newly created complex number
     */
    static fromEPowITimes(x){
        if(typeof x!=="number")throw new TypeError("[fromEPowITimes] x is not a number.");
        return new ComplexNumber(Math.cos(x),Math.sin(x));
    }
    /**
     * ## Creates complex number from raising {@linkcode x} to the power of `i`
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} x - real number (except `0`)
     * @throws {TypeError} if {@linkcode x} is not a number
     * @throws {RangeError} if {@linkcode x} is `0` ( <https://math.stackexchange.com/a/2087136> )
     * @returns {ComplexNumber} newly created complex number
     */
    static fromPowIWithBase(x){
        if(typeof x!=="number")throw new TypeError("[fromPowIWithBase] x is not a number.");
        if(x===0)throw new RangeError("[fromPowIWithBase] x is 0.");
        return x<0?ComplexNumber.fromEPowITimes(Math.log(-x)-Math.PI):ComplexNumber.fromEPowITimes(Math.log(x));
    }
    /**
     * ## Creates complex number from the logarithm (custom {@linkcode base}) of {@linkcode x}
     * @param {number} x - real number (except `0`)
     * @param {number} [base] - [optional] base of logarithm (must not be `0` or `1`) - default {@linkcode Math.E}
     * @throws {TypeError} if {@linkcode x} is not a number and if {@linkcode base} is given but is not a number
     * @throws {RangeError} if {@linkcode x} or {@linkcode base} are `0` and if {@linkcode base} is `1`
     * @returns {ComplexNumber} newly created complex number
     */
    static fromLog(x,base){
        if(typeof x!=="number")throw new TypeError("[fromLog] x is not a number.");
        if(x===0)throw new RangeError("[fromLog] x is 0.");
        if(base==null)return x<0?new ComplexNumber(0,Math.PI).add(Math.log(-x)):new ComplexNumber(Math.log(x),0);
        if(typeof base!=="number")throw new TypeError("[fromLog] base is given but is not a number.");
        if(base===0)throw new RangeError("[fromLog] base is 0.");
        if(base===1)throw new RangeError("[fromLog] base is 1.");
        return ComplexNumber.fromLog(x).div(ComplexNumber.fromLog(base));
    }
    /**
     * ## Create complex number from a formatted string
     * ! prone to float precision errors with polar form\
     * format: `±a±bi` where `a` and `b` are (unsigned) real numbers (optionally in scientific notation) and the first sign (`±` ie `+` or `-`) is optional\
     * or `r∠φrad` ({@linkcode polar}) or `r∠φ°` (degrees) where `r` and `φ` are real numbers (`∠` is U+2220 and `°` is U+00B0)
     * @param {string} str - string
     * @param {boolean} [polar] - when `true` uses polar form (angle notation in radians) otherwise cartesian form - default `false`
     * @throws {TypeError} if {@linkcode str} is not a string or when {@linkcode polar} or {@linkcode deg} are not booleans
     * @throws {SyntaxError} if {@linkcode str} does not match {@linkcode ComplexNumber.RegExp} or {@linkcode ComplexNumber.RegExpPolar}
     * @returns {ComplexNumber} newly created complex number
     */
    static fromString(str,polar){
        if(typeof str!=="string")throw TypeError("[fromString] str is not a string.");
        if(polar!=null&&typeof polar!=="boolean")throw TypeError("[fromString] polar is given but is not a boolean.");
        if(polar??false){
            const match=str.match(ComplexNumber.RegExpPolar);
            if(match==null)throw SyntaxError("[fromString] str is not a formatted complex number in polar form (angle notation).");
            return ComplexNumber.fromPolar(Number(match[1]),match[3]==="\xB0"?Number(match[2])*ComplexNumber.deg2rad:Number(match[2]));
        }
        const match=str.match(ComplexNumber.RegExp);
        if(match==null)throw SyntaxError("[fromString] str is not a formatted complex number (in cartesian form).");
        return new ComplexNumber(Number(match[1]),Number(match[2]));
    }
    static[Symbol.toStringTag]="ComplexNumber";
    /**
     * ## Absolute value of `this` complex number
     * @returns {number} the absolute value of `this` complex number
     */
    get abs(){return Math.hypot(this.real,this.imaginary);}
    /**
     * ## Length of the vector to `this` complex number
     * alias for {@linkcode ComplexNumber.prototype.abs}
     * @returns {number} length of the vector that points to `this` complex number on the complex plane
     */
    get length(){return this.abs;}
    /**
     * ## Radius of the circle on whose circumference `this` complex number lies
     * alias for {@linkcode ComplexNumber.prototype.abs}
     * @returns {number} radius of the circle on whose circumference `this` complex number lies
     */
    get radius(){return this.abs;}
    /**
     * ## Angle of `this` complex number in radians
     * like {@linkcode ComplexNumber.prototype.angleSmall} but returns only positive angles
     * counterclockwise from positive real axis
     * @returns {number|undefined} the calculated angle (in radians) or `undefined` when `this` complex number equals `0` (`0+0i`)
     */
    get angle(){
        if(this.isZero)return undefined;
        const at2=Math.atan2(this.imaginary,this.real);
        return at2<0?ComplexNumber.TAU+at2:at2;
    }
    /**
     * ## Angle of `this` complex number in radians
     * like {@linkcode ComplexNumber.prototype.angle} but returns `0` instead of `undefined`\
     * counterclockwise from positive real axis
     * @returns {number} the calculated angle (in radians) and `0` when `this` complex number equals `0` (`0+0i`)
     */
    get angleSafe(){return this.angle??0;}
    /**
     * ## Angle of `this` complex number in radians ≤ `π`
     * like {@linkcode ComplexNumber.prototype.angle} but returns only angles ≤ `π`
     * from positive real axis - positive = counterclockwise and negative = clockwise
     * @returns {number|undefined} the calculated angle (in radians) or `undefined` when `this` complex number equals `0` (`0+0i`)
     */
    get angleSmall(){
        if(this.isZero)return undefined;
        return Math.atan2(this.imaginary,this.real);
    }
    /**
     * ## Angle of `this` complex number in radians ≤ `π`
     * like {@linkcode ComplexNumber.prototype.angleSmall} but returns `0` instead of `undefined`\
     * from positive real axis - positive = counterclockwise and negative = clockwise
     * @returns {number} the calculated angle (in radians) and `0` when `this` complex number equals `0` (`0+0i`)
     */
    get angleSmallSafe(){return this.angleSmall??0;}
    /**
     * ## Arc length of `this` complex number
     * @returns {number} length of the arc from positive real axis to where `this` complex number lies in the complex plane
     */
    get arcLength(){return this.angleSafe*this.abs;}
    /**
     * ## Sector (area) of `this` complex number
     * @returns {number} area of the sector from positive real axis to where `this` complex number lies in the complex plane
     */
    get sector(){return this.angleSafe*(this.abs**2)*.5;}
    /**
     * ## Converts `this` complex number to a string
     * format: `±a±bi`, `r∠φrad`, or `r∠φ°` (`∠` is U+2220 and `°` is U+00B0)
     * @param {boolean} [polar] - when `true` uses polar form (angle notation in radians) otherwise cartesian form - default `false`
     * @param {boolean} [deg] - when `true` convert the angle to degrees otherwise keep the angle in radians - default `false`
     * @throws {TypeError} if {@linkcode polar} or {@linkcode deg} are given but are not booleans
     * @returns {string} string representation of `this` complex number
     */
    toString(polar,deg){
        if(polar!=null&&typeof polar!=="boolean")throw TypeError("[toString] polar is given but is not a boolean.");
        if(polar??false){
            if(deg!=null&&typeof deg!=="boolean")throw TypeError("[toString] deg is given but is not a boolean.");
            return(deg??false)?`${this.abs}\u2220${this.angleSafe*ComplexNumber.rad2deg}\xB0`:`${this.abs}\u2220${this.angleSafe}rad`;
        }
        return this.imaginary<0?`${this.real}-${-this.imaginary}i`:`${this.real}+${this.imaginary}i`;
    }
    /**
     * ## Logs the current value of `this` complex number to the {@linkcode console}
     * `±a + (±b)i ~ r ∠ φ rad (φ°)` (`∠` is U+2220 and `°` is U+00B0)
     * @returns {ComplexNumber} `this` unmodified complex number
     */
    logConsole(){
        const phi=this.angle;
        console.log(
            "%c%O + (%O)i ~ %O \u2220 %O rad (%O\xB0)",
            "background-color:#000;color:#3E3;padding-inline:.2rem;border-radius:.2rem",
            this.real,this.imaginary,
            this.abs,phi,phi===undefined?0:(phi*ComplexNumber.rad2deg)
        );
        return this;
    }
    /**
     * ## Creates a copy of `this` complex number
     * @returns {ComplexNumber} newly created copy
     */
    copy(){return new ComplexNumber(this.real,this.imaginary);}
    /**
     * ## Set `this` complex number to {@linkcode real} and {@linkcode imaginary}
     * @param {number} real - real number
     * @param {number} imaginary - real number
     * @throws {TypeError} if {@linkcode real} or {@linkcode imaginary} are not numbers
     * @returns {ComplexNumber} `this` modified complex number
     */
    set(real,imaginary){
        if(typeof real!=="number")throw new TypeError("[set] real is not a number.");
        if(typeof imaginary!=="number")throw new TypeError("[set] imaginary is not a number.");
        this.real=real;
        this.imaginary=imaginary;
        return this;
    }
    /**
     * ## Set `this` complex number to {@linkcode complex}
     * @param {ComplexNumber} complex - complex number
     * @throws {TypeError} if {@linkcode complex} is not an instance of {@linkcode ComplexNumber}
     * @returns {ComplexNumber} `this` modified complex number
     */
    copyFrom(complex){
        if(complex instanceof ComplexNumber){
            this.real=complex.real;
            this.imaginary=complex.imaginary;
            return this;
        }
        throw new TypeError("[is] complex is not an instance of ComplexNumber.");
    }
    /**
     * ## Set {@linkcode complex} to `this` complex number
     * @param {ComplexNumber} complex - complex number
     * @throws {TypeError} if {@linkcode complex} is not an instance of {@linkcode ComplexNumber}
     * @returns {ComplexNumber} `this` unmodified complex number
     */
    copyTo(complex){
        if(complex instanceof ComplexNumber){
            complex.real=this.real;
            complex.imaginary=this.imaginary;
            return this;
        }
        throw new TypeError("[is] complex is not an instance of ComplexNumber.");
    }
    /**
     * ## Check if `this` complex number is `0`
     * identity element for addition (and subtraction)
     * @returns {boolean} `true` if it equals `0+0i` and `false` otherwise
     */
    get isZero(){return this.real===0&&this.imaginary===0;}
    /**
     * ## Check if `this` complex number is `1`
     * identity element for multiplication (and division)
     * @returns {boolean} `true` if it equals `1+0i` and `false` otherwise
     */
    get isOne(){return this.real===1&&this.imaginary===0;}
    /**
     * ## Checks if `this` complex number is equal to {@linkcode complex}
     * @param {ComplexNumber} complex - complex number
     * @throws {TypeError} if {@linkcode complex} is not an instance of {@linkcode ComplexNumber}
     * @returns {boolean} `true` if `this` is equal to {@linkcode complex} and `false` otherwise
     */
    is(complex){
        if(complex instanceof ComplexNumber)return this.real===complex.real&&this.imaginary===complex.imaginary;
        throw new TypeError("[is] complex is not an instance of ComplexNumber.");
    }
    /**
     * ## Negates `this` complex number
     * Additive inverse
     * @returns {ComplexNumber} `this` modified complex number
     */
    neg(){return this.mul(-1);}
    /**
     * ## Inverts `this` complex number
     * Multiplicative inverse
     * @returns {ComplexNumber} `this` modified complex number
     */
    inv(){return this.pow(-1);}
    /**
     * ## Conjugates `this` complex number
     * @returns {ComplexNumber} `this` modified complex number
     */
    conj(){
        this.imaginary=-this.imaginary;
        return this;
    }
    /**
     * ## Rotates `this` complex number counterclockwise by {@linkcode phi} radians
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} phi - angle in radians (finite real number)
     * @throws {TypeError} if {@linkcode phi} is not a finite number
     * @returns {ComplexNumber} `this` modified complex number
     */
    rotate(phi){
        if(!Number.isFinite(phi))throw new TypeError("[addAngle] phi is not a finite number.");
        const abs=this.abs,
            ang=this.angleSafe+phi;
        return this.set(Math.cos(ang)*abs,Math.sin(ang)*abs);
    }
    /**
     * ## Scales the angle of `this` complex number by {@linkcode scaler}
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} scaler - finite real number
     * @throws {TypeError} if {@linkcode scaler} is not a finite number
     * @returns {ComplexNumber} `this` modified complex number
     */
    scaleAngle(scaler){
        if(!Number.isFinite(scaler))throw new TypeError("[turn] scaler is not a finite number.");
        const abs=this.abs,
            ang=this.angleSafe*scaler;
        if(ang%ComplexNumber.TAU===0)return this.set(abs,0);
        return this.set(Math.cos(ang)*abs,Math.sin(ang)*abs);
    }
    /**
     * ## Adds another (complex) number to `this` complex number
     * @param {ComplexNumber|number} complexOrReal - complex number or real part
     * @param {number} [imag] - [optional] when {@linkcode complexOrReal} is the real part this is the imaginary part - default `0`
     * @throws {TypeError} if {@linkcode complexOrReal} is not an instance of {@linkcode ComplexNumber} or a number and when {@linkcode imag} is given but is not a number
     * @returns {ComplexNumber} `this` modified complex number
     */
    add(complexOrReal,imag){
        if(complexOrReal instanceof ComplexNumber){
            this.real+=complexOrReal.real;
            this.imaginary+=complexOrReal.imaginary;
            return this;
        }
        if(typeof complexOrReal!=="number")throw new TypeError("[add] complexOrReal is not an instance of ComplexNumber or a number.");
        this.real+=complexOrReal;
        if(typeof imag==="number")this.imaginary+=imag;
        else if(imag!=null)throw new TypeError("[add] imag is given but is not a number.");
        return this;
    }
    /**
     * ## Subtracts another (complex) number from `this` complex number
     * @param {ComplexNumber|number} complexOrReal - complex number or real part
     * @param {number} [imag] - [optional] when {@linkcode complexOrReal} is the real part this is the imaginary part - default `0`
     * @throws {TypeError} if {@linkcode complexOrReal} is not an instance of {@linkcode ComplexNumber} or a number and when {@linkcode imag} is given but is not a number
     * @returns {ComplexNumber} `this` modified complex number
     */
    sub(complexOrReal,imag){
        if(complexOrReal instanceof ComplexNumber){
            this.real-=complexOrReal.real;
            this.imaginary-=complexOrReal.imaginary;
            return this;
        }
        if(typeof complexOrReal!=="number")throw new TypeError("[sub] complexOrReal is not an instance of ComplexNumber or a number.");
        this.real+=complexOrReal;
        if(typeof imag==="number")this.imaginary-=imag;
        else if(imag!=null)throw new TypeError("[sub] imag is given but is not a number.");
        return this;
    }
    /**
     * ## Mulitlies another (complex) number with `this` complex number
     * @param {ComplexNumber|number} complexOrReal - complex or real number
     * @param {number} [imag] - [optional] when {@linkcode complexOrReal} is the real part this is the imaginary part - default `0`
     * @throws {TypeError} if {@linkcode complexOrReal} is not an instance of {@linkcode ComplexNumber} or a number and when {@linkcode imag} is given but is not a number
     * @returns {ComplexNumber} `this` modified complex number
     */
    mul(complexOrReal,imag){
        if(complexOrReal instanceof ComplexNumber){
            [this.real,this.imaginary]=[
                (this.real*complexOrReal.real)-(this.imaginary*complexOrReal.imaginary),
                (this.real*complexOrReal.imaginary)+(this.imaginary*complexOrReal.real)
            ];
            return this;
        }
        if(typeof complexOrReal!=="number")throw new TypeError("[mul] complexOrReal is not an instance of ComplexNumber or a number.");
        if(imag==null){
            this.real*=complexOrReal;
            this.imaginary*=complexOrReal;
            return this;
        }
        if(typeof imag!=="number")throw new TypeError("[mul] imag is given but is not a number.");
        [this.real,this.imaginary]=[
            (this.real*complexOrReal)-(this.imaginary*imag),
            (this.real*imag)+(this.imaginary*complexOrReal)
        ];
        return this;
    }
    /**
     * ## Divides `this` complex number by another (complex) number
     * @param {ComplexNumber|number} complexOrReal - complex or real number
     * @param {number} [imag] - [optional] when {@linkcode complexOrReal} is the real part this is the imaginary part - default `0`
     * @throws {TypeError} if {@linkcode complexOrReal} is not an instance of {@linkcode ComplexNumber} or a number and when {@linkcode imag} is given but is not a number
     * @throws {RangeError} if {@linkcode complexOrReal} is `0` (as complex, as real, or as real in combination with {@linkcode imag})
     * @returns {ComplexNumber} `this` modified complex number
     */
    div(complexOrReal,imag){
        if(complexOrReal instanceof ComplexNumber){
            if(complexOrReal.isZero)throw RangeError("[div] complexOrReal (as complex) is 0.");
            const fac=(complexOrReal.real**2)+(complexOrReal.imaginary**2);
            [this.real,this.imaginary]=[
                ((this.real*complexOrReal.real)+(this.imaginary*complexOrReal.imaginary))/fac,
                ((this.imaginary*complexOrReal.real)-(this.real*complexOrReal.imaginary))/fac
            ];
            return this;
        }
        if(typeof complexOrReal!=="number")throw new TypeError("[div] complexOrReal is not an instance of ComplexNumber or a number.");
        if(imag==null){
            if(complexOrReal===0)throw RangeError("[div] complexOrReal (as real) is 0.");
            this.real/=complexOrReal;
            this.imaginary/=complexOrReal;
            return this;
        }
        if(typeof imag!=="number")throw new TypeError("[div] imag is given but is not a number.");
        if(complexOrReal===0&&imag===0)throw RangeError("[div] complexOrReal (as real) with imag is 0.");
        const fac=(complexOrReal**2)+(imag**2);
        [this.real,this.imaginary]=[
            ((this.real*complexOrReal)+(this.imaginary*imag))/fac,
            ((this.imaginary*complexOrReal)-(this.real*imag))/fac
        ];
        return this;
    }
    /**
     * ## Raise `this` complex number to the power of {@linkcode n}
     * @param {number} n - integer exponent `]-2↑53..2↑53[`
     * @throws {TypeError} if {@linkcode n} is not a save integer
     * @returns {ComplexNumber} `this` modified complex number
     */
    pow(n){
        if(!Number.isSafeInteger(n))throw new TypeError("[pow] n is not a save integer.");
        if(n<-1)return this.pow(-n).pow(-1);
        if(n===-1)return this.div((this.real**2)+(this.imaginary**2));
        if(n===0)return this.set(1,0);
        switch(n){
            case 1:break;
            case 2:[this.real,this.imaginary]=[(this.real**2)-(this.imaginary**2),2*this.real*this.imaginary];break;
            case 3:[this.real,this.imaginary]=[(this.real**3)-(3*this.real*(this.imaginary**2)),(3*(this.real**2)*this.imaginary)-(this.imaginary**3)];break;
            case 4:[this.real,this.imaginary]=[(this.real**4)-(6*(this.real**2)*(this.imaginary**2))+(this.imaginary**4),(4*(this.real**3)*this.imaginary)-(4*this.real*(this.imaginary**3))];break;
            case 5:[this.real,this.imaginary]=[(this.real**5)-(10*(this.real**3)*(this.imaginary**2))+(5*this.real*(this.imaginary**4)),(5*(this.real**4)*this.imaginary)-(10*(this.real**2)*(this.imaginary**3))+(this.imaginary**5)];break;
            case 6:[this.real,this.imaginary]=[(this.real**6)-(15*(this.real**4)*(this.imaginary**2))+(15*(this.real**2)*(this.imaginary**4))-(this.imaginary**6),(6*(this.real**5)*this.imaginary)-(20*(this.real**3)*this.imaginary**3)+(6*this.real*(this.imaginary**5))];break;
            case 7:[this.real,this.imaginary]=[(this.real**7)-(21*(this.real**5)*(this.imaginary**2))+(35*(this.real**3)*(this.imaginary**4))-(7*this.real*(this.imaginary**6)),(7*(this.real**6)*this.imaginary)-(35*(this.real**4)*(this.imaginary**3))+(21*(this.real**2)*(this.imaginary**5))-(this.imaginary**7)];break;
            case 8:[this.real,this.imaginary]=[(this.real**8)-(28*(this.real**6)*(this.imaginary**2))+(70*(this.real**4)*(this.imaginary**4))-(28*(this.real**2)*(this.imaginary**6))+(this.imaginary**8),(8*(this.real**7)*this.imaginary)-(56*(this.real**5)*(this.imaginary**3))+(56*(this.real**3)*(this.imaginary**5))-(8*this.real*(this.imaginary**7))];break;
            default:
                /*
                    2: a^2 + 2 i a   b -        b^2
                    3: a^3 + 3 i a^2 b - 3  a   b^2 -    i     b^3
                    4: a^4 + 4 i a^3 b - 6  a^2 b^2 - 4  i a   b^3 +        b^4
                    5: a^5 + 5 i a^4 b - 10 a^3 b^2 - 10 i a^2 b^3 + 5  a   b^4 +    i     b^5
                    6: a^6 + 6 i a^5 b - 15 a^4 b^2 - 20 i a^3 b^3 + 15 a^2 b^4 + 6  i a   b^5 -        b^6
                    7: a^7 + 7 i a^6 b - 21 a^5 b^2 - 35 i a^4 b^3 + 35 a^3 b^4 + 21 i a^2 b^5 - 7  a   b^6 -   i   b^7
                    8: a^8 + 8 i a^7 b - 28 a^6 b^2 - 56 i a^5 b^3 + 70 a^4 b^4 + 56 i a^3 b^5 - 28 a^2 b^6 - 8 i a b^7 + b^8

                    2: ( a^2 -        b^2                                 )+( 2 a   b                                     )i
                    3: ( a^3 - 3  a   b^2                                 )+( 3 a^2 b -        b^3                        )i
                    4: ( a^4 - 6  a^2 b^2 +        b^4                    )+( 4 a^3 b - 4  a   b^3                        )i
                    5: ( a^5 - 10 a^3 b^2 + 5  a   b^4                    )+( 5 a^4 b - 10 a^2 b^3 +        b^5           )i
                    6: ( a^6 - 15 a^4 b^2 + 15 a^2 b^4 -        b^6       )+( 6 a^5 b - 20 a^3 b^3 + 6  a   b^5           )i
                    7: ( a^7 - 21 a^5 b^2 + 35 a^3 b^4 - 7  a   b^6       )+( 7 a^6 b - 35 a^4 b^3 + 21 a^2 b^5 -     b^7 )i
                    8: ( a^8 - 28 a^6 b^2 + 70 a^4 b^4 - 28 a^2 b^6 + b^8 )+( 8 a^7 b - 56 a^5 b^3 + 56 a^3 b^5 - 8 a b^7 )i

                    {n,k} = n choose k = n! / ( k! (n-k)! ) = product[ from j=1 to k ]( (n+1)/j -1 ) ~ can compute this in loop with calulation of binomial coefficients (no extra function needed)
                    n=2: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2
                    n=3: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3
                    n=4: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3 + {n,4} a^(n-4) b^4
                    n=5: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3 + {n,4} a^(n-4) b^4 + {n,5} i a^(n-5) b^5
                    n=6: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3 + {n,4} a^(n-4) b^4 + {n,5} i a^(n-5) b^5 - {n,6} a^(n-6) b^6
                    n=7: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3 + {n,4} a^(n-4) b^4 + {n,5} i a^(n-5) b^5 - {n,6} a^(n-6) b^6 - {n,7} i a^(n-7) b^7
                    n=8: {n,0} a^n b^0 + {n,1} i a^(n-1) b^1 - {n,2} a^(n-2) b^2 - {n,3} i a^(n-3) b^3 + {n,4} a^(n-4) b^4 + {n,5} i a^(n-5) b^5 - {n,6} a^(n-6) b^6 - {n,7} i a^(n-7) b^7 + {n,8} a^(n-8) b^8

                    2:           1  2  1
                    3:         1  3  3  1
                    4:        1  4  6  4  1
                    5:      1  5 10 10  5  1
                    6:     1  6 15 20 15  6  1
                    7:   1  7 21 35 35 21  7  1
                    8:  1  8 25 56 70 56 25  8  1

                    // FIXME rewrite ↓ using ↑
                    let tmpRe=0,tmpIm=0;
                    for(let k=0,ki=0,last=1;k<=n;++k){
                        console.log(k);
                        switch(ki){
                            case 0:tmpRe+=last*(this.real**(n-k))*(this.imaginary**k);break;
                            case 1:tmpIm+=last*(this.real**(n-k))*(this.imaginary**k);break;
                            case 2:tmpRe-=last*(this.real**(n-k))*(this.imaginary**k);break;
                            case 3:tmpIm-=last*(this.real**(n-k))*(this.imaginary**k);break;
                        }
                        last=Math.floor(last*(n+1-k)/k);
                        if(++ki>3)ki=0;
                    }
                    this.real=tmpRe;
                    this.imaginary=tmpIm;
                */
                // TODO test if ↓ (cubic-polynomial of exponent multiplied out with complex numbers) is faster/better than ↑ (sum individual binomial coefficients for real and imaginary part separately)
                // n = a*8^3 + b*8^2 + c*8 + d
                // z^n = (z^512)^a * (z^64)^b * (z^8)^c * z^d
                // z**n = {a times (((z**8)**8)**8)} * ((z**8)**8)**b * (z**8)**c * z**d
                const z=ComplexNumber.one,
                    u=this.copy().pow(8),
                    v=u.copy().pow(8),
                    w=v.copy().pow(8),
                    a=Math.trunc(n*.001953125);//8**-3
                for(let k=0;k<a;++k)z.mul(w);
                z.mul(v.pow(Math.trunc((n*.015625)%8)));//8**-2
                z.mul(u.pow(Math.trunc((n*.125)%8)));//8**-1
                z.mul(this.copy().pow(n%8));//8**-0
                this.copyFrom(z);
            break;
        }
        return this;
    }
    /**
     * ## Raise `this` complex number to the power of {@linkcode x} (calculated via polar form)
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} x - exponent (finite real number)
     * @throws {TypeError} if {@linkcode x} is not a finite number
     * @returns {ComplexNumber} `this` modified complex number
     */
    powPolar(x){
        if(!Number.isFinite(x))throw new TypeError("[powPolar] x is not a finite number.");
        const abs=this.abs**x,
            ang=this.angleSafe*x;
        return this.set(Math.cos(ang)*abs,Math.sin(ang)*abs);
    }
    // TODO ? pow with complex numbers ~ z↑w → z↑(m/n)=root(n,z↑m) (use ComplexNumber._gcd_) ~ new method pow(complexOrReal,imag) and rename old method to powInt
    /**
     * ## Calculates the ("positive") square root of `this` complex number (in place)
     * use {@linkcode ComplexNumber.prototype.neg} to get the second solution to `z↑2`
     * @returns {ComplexNumber} `this` modified complex number
     */
    sqrt(){
        if(this.imaginary===0){
            if(this.real<0)return this.set(0,Math.sqrt(-this.real));
            return this.set(Math.sqrt(this.real),0);
        }
        const abs=this.abs;
        this.imaginary=Math.sign(this.imaginary)*Math.sqrt((abs-this.real)*.5);
        this.real=Math.sqrt((abs+this.real)*.5);
        return this;
    }
    /**
     * ## Computes all complex roots (index {@linkcode n}) of `this` complex number
     * ! prone to float precision errors, use {@linkcode ComplexNumber.prototype.roundEpsilon} to counteract some rounding errors
     * @param {number} n - root index - must not be `0`
     * @throws {TypeError} if {@linkcode n} is not a non-zero safe integer
     * @returns {Generator<ComplexNumber,void,unknown>} generator giving a list of newly created complex numbers (ordered counterclockwise from positive real axis - assume the first element is the "positive" root ie. principal root)
     * @example
     * new ComplexNumber(2,0).pow(-4).roots(-4).next().value
     *     ?.roundEpsilon().toString()??"no root";
     * "2+0i";
     *
     * [...new ComplexNumber(2,0).pow(-4).roots(-4)]
     *     .map(v=>v.roundEpsilon().toString());
     * ["2+0i", "0+2i", "-2+0i", "0-2i"];
     */
    *roots(n){
        if(!Number.isSafeInteger(n)||n===0)throw new TypeError("[root] n is not a non-zero safe integer.");
        if(this.isZero)return;
        const z=this.copy();
        if(n<0){
            n=-n;
            z.inv();
        }
        const
            p2n=ComplexNumber.TAU/n,
            w=((rn,an)=>new ComplexNumber(Math.cos(an)*rn,Math.sin(an)*rn))(z.abs**(1/n),z.angleSafe/n);
        for(let k=0;k<n;++k)yield w.copy().mul(Math.cos(k*p2n),Math.sin(k*p2n));
    };
    // TODO roots alternative without polar form ~ slower but more precise (?!)
    // TODO log of complex numbers ~ see fromLog (also custom base ? complex)
    static{//~ make class and prototype immutable
        Object.freeze(ComplexNumber.prototype);
        Object.freeze(ComplexNumber);
    }
}

if(typeof exports!=="undefined")exports.ComplexNumber=ComplexNumber;
//~ dynamic:     const{ComplexNumber}=await import("./ComplexNumber.js");
//~ node:        const{ComplexNumber}=require("./ComplexNumber.js");
//~ node module: import{ComplexNumber}from"./ComplexNumber.js";
//~ html:        <script src="./ComplexNumber.js"></script>
