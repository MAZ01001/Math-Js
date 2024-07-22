//@ts-check
"use strict";
/**
 * ## Calculates new bounds/scale for given number {@linkcode n}
 * Number can be out of bounds
 * @param {number} n - initial number
 * @param {number} a - initial lower bound
 * @param {number} b - initial upper bound
 * @param {number} x - new lower bound
 * @param {number} y - new upper bound
 * @param {boolean} [limit] - if `true` clamps output to min {@linkcode x} and max {@linkcode y} - default `false`
 * @returns {number} new number
 * @throws {TypeError} if {@linkcode n}, {@linkcode a}, {@linkcode b}, {@linkcode x} or {@linkcode y} are not numbers
 * @throws {RangeError} if {@linkcode a} and {@linkcode b} are equal (no initial range)
 * @example mapRange(0.5, 0, 1, 0, 100); //=> 50
 */
function mapRange(n,a,b,x,y,limit){
    "use strict";
    if(typeof n!=="number")throw new TypeError("[mapRange] n is not a number.");
    if(typeof a!=="number")throw new TypeError("[mapRange] a is not a number.");
    if(typeof b!=="number")throw new TypeError("[mapRange] b is not a number.");
    if(typeof x!=="number")throw new TypeError("[mapRange] x is not a number.");
    if(typeof y!=="number")throw new TypeError("[mapRange] y is not a number.");
    if(a===b)throw new RangeError("[mapRange] a and b are equal.");
    if(x===y)return x;
    if(limit??false)
        if(a<b){
            if(n<=a)return x;
            if(n>=b)return y;
        }else{
            if(n>=a)return x;
            if(n<=b)return y;
        }
    return((y-x)/(b-a))*(n-a)+x;
}
/**
 * __calculates percentage of a number within bounds__
 * @param {number} n - initial number
 * @param {number} x - lower bound
 * @param {number} y - upper bound
 * @returns {number} percent as decimal number [0 to 1]
 * @throws {TypeError} if {@linkcode n}, {@linkcode x} or {@linkcode y} are not numbers
 * @example toPercent(150, 100, 200); //=> 0.5
 */
function toPercent(n,x,y){
    "use strict";
    if(typeof n!=="number")throw new TypeError("[toPercent] n is not a number");
    if(typeof x!=="number")throw new TypeError("[toPercent] x is not a number");
    if(typeof y!=="number")throw new TypeError("[toPercent] y is not a number");
    return y<x?(n-y)/(x-y):(n-x)/(y-x);
}
/**
 * __converts angle from DEG to RAD__
 * @param {number} deg - angle in degrees
 * @returns {number} angle in radians
 * @throws {TypeError} if {@linkcode deg} is not a number
 */
function deg2rad(deg){
    "use strict";
    if(typeof deg!=="number")throw new TypeError("[deg2rad] deg is not a number");
    return(deg*0xB4)/Math.PI;
}
/**
 * __converts angle from RAD to DEG__
 * @param {number} rad - angle in radians
 * @returns {number} angle in degrees
 * @throws {TypeError} if {@linkcode rad} is not a number
 */
function rad2deg(rad){
    "use strict";
    if(typeof rad!=="number")throw new TypeError("[rad2deg] rad is not a number");
    return(rad*Math.PI)/0xB4;
}
/**
 * ## Computes the greatest-common-divisor of two whole numbers
 * @param {number} n - positive safe integer `[1..2↑53[`
 * @param {number} m - positive safe integer `[1..2↑53[`
 * @returns {number} greatest-common-divisor `[1..2↑53[`
 * @throws {TypeError} if {@linkcode n} or {@linkcode m} are not positive safe integers `[1..2↑53[`
 * @example gcd(45, 100); //=> 5 → (45/5) / (100/5) → 9/20 = 45/100
 */
function gcd(n,m){
    "use strict";
    if(typeof n!=="number"||n<1||!Number.isSafeInteger(n))throw new TypeError("[gcd] n is not a positive safe integer > 0");
    if(typeof m!=="number"||m<1||!Number.isSafeInteger(m))throw new TypeError("[gcd] m is not a positive safe integer > 0");
    for(let r=(([n,m]=n<m?[m,n]:[n,m]),0);(r=n%m)>0;[n,m]=[m,r]);
    return m;
}
/**
 * __converts a decimal number to an improper-fraction (rough estimation)__
 * @param {number} dec - decimal number
 * @param {number} [loop_last] - if `>0` repeat the last {@linkcode loop_last} decimal numbers of {@linkcode dec} - _default `0`_
 * @param {number} [max_den] - max number for denominator - _default `0` (no limit)_
 * @param {number} [max_iter] - max iteration count - _default `1e6`_
 * @returns {Readonly<{a:number,b:number,c:number,i:number,r:string}>}
 * + a : whole number part
 * + b : numerator
 * + c : denominator
 * + i : iteration count
 * + r : reason of exit (`"precision"`|`"infinity"`|`"maximum denominator"`|`"maximum iterations"`)
 * @throws {TypeError} if {@linkcode dec} is not a finite number or {@linkcode loop_last}, {@linkcode max_den} or {@linkcode max_iter} are not positive safe integers
 * @example dec2frac(0.12, 2); //=> { a:0, b:4, c:33, i:0, r:"precision" } → 0+4/33 → 0.121212121212...
 */
function dec2frac(dec,loop_last,max_den,max_iter){
    "use strict";
    // TODO make dec a string and check for scientific notation ? or keep dec a number and extract integer part and shift digits to get needed decimals out ~ for repeating etc (max 16 digits floats in JS)
    if(typeof dec!=="number"||!Number.isFinite(dec))throw new TypeError("[dec2frac] dec is not a finite number");
    if(Number.isInteger(dec))return Object.freeze({a:dec,b:0,c:1,i:0,r:"precision"});
    if(loop_last==null)loop_last=0;
    else if(typeof loop_last!=="number"||loop_last<0||!Number.isSafeInteger(loop_last))throw new TypeError("[dec2frac] loop_last is not a positive safe integer");
    if(max_den==null)max_den=0;
    else if(typeof max_den!=="number"||max_den<0||!Number.isSafeInteger(max_den))throw new TypeError("[dec2frac] max_den is not a positive safe integer");
    if(max_iter==null)max_iter=0xF4240;
    else if(typeof max_iter!=="number"||max_iter<0||!Number.isSafeInteger(max_iter))throw new TypeError("[dec2frac] max_iter is not a positive safe integer");
    const sign=Math.sign(dec);
    let nint=0,ndec=Math.abs(dec),ndecstr=ndec.toString(),
        nom=0,pnom=1,ppnom=0,
        den=0,pden=0,ppden=1;
    /**
     * __shorten and return fraction__
     * @param {number} si sign
     * @param {number} W whole part
     * @param {number} N nominator
     * @param {number} D denominator
     * @param {number} I iteration
     * @param {string} R reason
     * @returns {Readonly<{a:number;b:number;c:number;i:number;r:string}>} fraction (_as described in parent function documentation_)
     */
    const _end_=(si,W,N,D,I,R)=>{
        "use strict";
        if(N===D)return Object.freeze({a:si*(W+1),b:0,c:1,i:I,r:R});
        if(N>D){
            const _t_=N/D;
            if(_t_===Math.floor(_t_))return Object.freeze({a:si*(W+_t_),b:0,c:1,i:I,r:R});
            W+=Math.floor(_t_);
            N-=Math.floor(_t_)*D;
        }
        const _gcd_=((A,B)=>{
            "use strict";
            for([A,B]=A<B?[B,A]:[A,B];A%B>0;[A,B]=[B,A%B]);
            return B;
        })(N,D);
        N/=_gcd_;
        D/=_gcd_;
        return Object.freeze({a:si*W,b:N,c:D,i:I,r:R});
    };
    if(loop_last>0&&!/e/.test(ndecstr)){
        if(max_den===0){
            (matches=>{
                "use strict";
                nint=Number.parseInt(matches[1]??"0");
                ndecstr=matches[2]??"0";
            })(ndecstr.match(/^([0-9]+)\.([0-9]+)$/)??[]);
            if(loop_last>ndecstr.length)loop_last=ndecstr.length;
            const _l=10**(ndecstr.length-loop_last),
                _r=Number.parseInt('9'.repeat(loop_last)+'0'.repeat(ndecstr.length-loop_last));
            nom=(Number(ndecstr.slice(-loop_last))*_l)
                +(Number(ndecstr.slice(0,-loop_last))*_r);
            den=_l*_r;
            if(!Number.isFinite(nint+(nom/den)))return _end_(sign,nint,nom,den,0,"infinity");
            return _end_(sign,nint,nom,den,0,"precision");
        }
        const _l=dec.toString().match(/^[0-9]+\.([0-9]+)$/)?.[1]??"0";
        if(loop_last>_l.length)loop_last=_l.length;
        ndec=Math.abs(dec=Number(dec.toString()+_l.substring(_l.length-loop_last).repeat(22)));
    }
    for(let iter=0;iter<max_iter;iter++){
        nint=Math.floor(ndec);
        nom=ppnom+nint*pnom;
        den=ppden+nint*pden;
        if(max_den>0&&(ppden+(nint*pden))>max_den)return _end_(sign,0,pnom,pden,iter-1,"maximum denominator");
        if(!isFinite(ppnom+(nint*pnom)))return _end_(sign,0,nom,den,iter-1,"infinity");
        //// console.log(
        ////     "<[%d]>\n%s\n%s\n%s\n%s",
        ////     iter,
        ////     ` ${((sign>0?'+':'-')+nom).padEnd(21,' ')} ${ppnom} + ${nint} * ${pnom} * ${sign}`,
        ////     `  ${den.toString().padEnd(20,' ')} ${ppden} + ${nint} * ${pden}`,
        ////     ` =${sign*(nom/den)}`,
        ////     ` (${dec})`
        //// );
        ppnom=pnom;
        ppden=pden;
        pnom=nom;
        pden=den;
        ndec=1/(ndec-nint);
        if(Number.EPSILON>Math.abs((sign*(nom/den))-dec))return _end_(sign,0,nom,den,iter-1,"precision");
    }
    return _end_(sign,0,nom,den,max_iter,"maximum iterations");
}
/**
 * __convert number to string with padding__ \
 * format: `[sign] [padded start ' '] [.] [padded end '0'] [e ~]`
 * @param {number|string} n - a number or a string of a number
 * @param {number} [first] - padding to length before decimal point - _default `0`_
 * @param {number} [last] - padding to length after decimal point - _default `0`_
 * @returns {string} padded number as string
 * @throws {TypeError} if {@linkcode n} is not a number/string or {@linkcode first} or {@linkcode last} are not safe integers
 * @example padNum("1.23e2", 3, 5); //=> "+  1.23000e2"
 */
function padNum(n,first,last){
    "use strict";
    if(typeof n==="string"){
        if(Number.isNaN(Number.parseFloat(n)))throw new TypeError("[padNum] n is not a number string");
    }else if(typeof n==="number")n=n.toString();
    else throw new TypeError("[padNum] n is not a number");
    if(first==null)first=0;
    else if(typeof first!=="number"||first<0||!Number.isSafeInteger(first))throw new TypeError("[padNum] first is not a positive safe integer");
    if(last==null)last=0;
    else if(typeof last!=="number"||last<0||!Number.isSafeInteger(last))throw new TypeError("[padNum] last is not a positive safe integer");
    let[,s,i,d,x]=(n.match(/^([+-])?([0-9]+)(?:\.([0-9]+))?([eE][+-]?[0-9]+)?$/)??[]);
    return(s??"+")+(i??"0").padStart(first,' ')+"."+(d??"0").padEnd(last,'0')+(x??"");
}
/**
 * __calculates the modulo of two whole numbers__ \
 * _with euclidean division (only positive remainder)_
 * @param {number} a first number
 * @param {number} b second number
 * @returns {number} remainder (always positive)
 * @throws {TypeError} if {@linkcode a} or {@linkcode b} are not finite numbers
 * @description `a - ( abs(b) * floor( a / abs(b) ) )`
 */
function euclideanModulo(a,b){
    "use strict";
    if(typeof a!=="number"||!Number.isFinite(a))throw new TypeError("[euclideanModulo] a is not a finite number");
    if(typeof b!=="number"||!Number.isFinite(b))throw new TypeError("[euclideanModulo] b is not a finite number");
    const absB=Math.abs(b);
    return a-(absB*Math.floor(a/absB));
}
/**
 * __genarates a random number within given range__ \
 * _(range is inclusive)_
 * @param {number} min - lower bound
 * @param {number} max - upper bound
 * @returns {number} random number within range (via {@linkcode Math.random()})
 * @throws {TypeError} - if {@linkcode min} or {@linkcode max} are not finite numbers
 */
function randomRange(min,max){
    "use strict";
    if(typeof min!=="number"||Number.isFinite(min))throw new TypeError("[randomRange] min is not a finite number");
    if(typeof max!=="number"||Number.isFinite(max))throw new TypeError("[randomRange] max is not a finite number");
    if(min===max)return min;
    if(min>max)[min,max]=[max,min];
    //~ NOTE: `Math.random()` includes 0 but not 1 !
    //~     assume it goes from 0 to (1-`Number.EPSILON`)
    //~     ( 1 - 0.0000000000000002220446049250313 = 0.9999999999999998 )
    //~     then to include the 1 we have to divide by (1-`Number.EPSILON`)
    return(Math.random()/(1-Number.EPSILON))*(max-min)+min;
}
/**
 * __genarates a random integer within given range__ \
 * _(range is inclusive)_
 * @param {number} min - lower bound
 * @param {number} max - upper bound
 * @returns {number} random integer within range (via {@linkcode Math.random()})
 * @throws {TypeError} - if {@linkcode min} or {@linkcode max} are not safe integers
 */
function randomRangeInt(min,max){
    "use strict";
    if(typeof min!=="number"||!Number.isSafeInteger(min))throw new TypeError("[randomRangeInt] min is not a safe integer");
    if(typeof max!=="number"||!Number.isSafeInteger(max))throw new TypeError("[randomRangeInt] max is not a safe integer");
    if(min===max)return min;
    if(min>max)[min,max]=[max,min];
    //~ NOTE: `Math.random()` includes 0 but not 1 !
    return Math.floor(Math.random()*(1+max-min))+min;
}
/**
 * __division with two unsigned numbers__
 * @param {number} A - dividend
 * @param {number} B - divisor
 * @returns {readonly[number,number]} `[quotient, remainder]` (`A / B = Q + R / B`)
 * @throws {TypeError} if {@linkcode A} or {@linkcode B} are not positive finite numbers
 * @throws {RangeError} if {@linkcode B} is 0 (division by 0)
 * @example divisionWithRest(5, 3); //=> [1, 2] → 1+2/3
 */
function divisionWithRest(A,B){
    "use strict";
    if(typeof A!=="number"||A<0||!Number.isFinite(A))throw new TypeError("[divisionWithRest] A is not a positive finite number");
    if(typeof B!=="number"||B<0||!Number.isFinite(B))throw new TypeError("[divisionWithRest] B is not a positive finite number");
    if(A===0)return Object.freeze([0,0]);
    if(B===1)return Object.freeze([A,0]);
    if(B===0)throw new RangeError("[divisionWithRest] B is 0 (can not divide by 0)");
    if(A===B)return Object.freeze([1,0]);
    return Object.freeze([Math.trunc(A/B),A%B]);
    //// const div=A/B;
    //// return Object.freeze([Math.trunc(div),B*(div-Math.trunc(div))]);
    //~ see `#calcDivRest` in `Math-Js/BigIntType.js` for an approach with arbitrary-length-integers
    //~ → https://github.com/MAZ01001/Math-Js/blob/ca71710d50a5fa57e5cb76410cc33df8c1e688d4/BigIntType.js#L1880
}
/**
 * __generate a set amount of random booleans__
 * @param {number} [amount] - amount of booleans to generate
 * @generator @yields {number} a random boolean (via {@linkcode Math.random()})
 * @throws {TypeError} if {@linkcode amount} is not a positive safe integer
 * @example for(const rng of randomBools(3))console.log("%O",rng);
 */
function*randomBools(amount){
    if(amount==null)return yield Math.random()<.5;
    if(typeof amount!=="number"||amount<0||!Number.isSafeInteger(amount))throw new TypeError('[randomBools] amount is not a positive safe integer');
    while(amount-->0)yield Math.random()<.5;
}
/**
 * __creates a generator for given range - iterable__ \
 * _use {@linkcode Array.from()} to create a normal `number[]` array_
 * @param {number} start - start of range (incl.)
 * @param {number} end - end of range (incl. ~ see {@linkcode overflow})
 * @param {number} [step] - step of range - _default `1`_
 * @param {boolean} [overflow] - if `true` the result may be bigger than {@linkcode end} if it can not land exactly on it with {@linkcode step} (not smaller than {@linkcode end}) - _default `false` (not bigger than {@linkcode end})_
 * @generator @yields {number} the next number in set range
 * @throws {TypeError} if {@linkcode start}, {@linkcode end}, or {@linkcode step} are not numbers
 * @throws {RangeError} if {@linkcode step} is `0` or {@linkcode end} is impossible to reach
 * @example for(const odd of rangeGenerator(1, 100, 2))console.log(odd); //~ 1 3 5 .. 97 99
 */
function*rangeGenerator(start,end,step,overflow){
    if(typeof start!=="number"||!Number.isFinite(start))throw TypeError("[range_gen] start is not a finite number");
    if(typeof end!=="number"||!Number.isFinite(end))throw TypeError("[range_gen] end is not a finite number");
    if(step==null)step=1;
    else if(typeof step!=="number"||!Number.isFinite(step))throw TypeError("[range_gen] step is not a finite number");
    else if(step===0)throw RangeError("[range_gen] step must not be 0");
    if((end<start&&step>0)||(end>start&&step<0))throw RangeError('[range_gen] end is impossible to reach');
    if(overflow??false){
        if(step<0)for(const max=end+step;start>max||start===end;start+=step)yield start;
        else for(const max=end+step;start<max||start===end;start+=step)yield start;
    }else{
        if(step<0)for(;start>=end;start+=step)yield start;
        else for(;start<=end;start+=step)yield start;
    }
}
/**
 * __get a function to get random numbers like `Math.random` but from a given seed__ \
 * uses `MurmurHash3` for seeding and `sfc32` for generating 32bit values
 * @param {string} [seed] - a string used as the seed - defaults to current millisecond timestamp (in hex)
 * @returns {()=>number} a function to generate random 32bit unsigned integers [0 to 0xFFFFFFFF inclusive] \
 * to get [0.0 to 1.0 inclusive] divide by 0xFFFFFFFF \
 * or by 0x100000000 to exclude the 1.0
 * @example
 * rng32bit("seed")();            //=> 3595049765 [0 to 0xFFFFFFFF inclusive]
 * rng32bit("seed")()/0xFFFFFFFF; //=> 0.8370377509475307 [0.0 to 1.0 inclusive]
 * @throws {TypeError} - if {@linkcode seed} is set but is not a string
 */
function rng32bit(seed){
    "use strict";
    if(seed==null)seed=Date.now().toString(0x10);
    else if(typeof seed!=="string")throw new TypeError("[rng32bit] seed is not a string");
    //~ MurmurHash3
    let h=0x811C9DC5>>>0;
    for(let i=0;i<seed.length;i++){
        const char=(k=>(k<<0xF)|(k>>>0x11))(Math.imul(seed.charCodeAt(i),0xCC9E2D51));
        h^=Math.imul(char,0x1B873593);
        h=(h<<0xD)|(h>>>0x13);
        h=(Math.imul(h,5)+0xE6546B64)|0;
    }
    h^=seed.length;
    const getSeed=()=>{
        "use strict";
        h^=h>>>0x10;
        h=Math.imul(h,0x85EBCA6B);
        h^=h>>>0xD;
        h=Math.imul(h,0xC2B2AE35);
        h^=h>>>0x10;
        return h>>>0;
    };
    let a=getSeed(),
        b=getSeed(),
        c=getSeed(),
        d=getSeed();
    return()=>{
        "use strict";
        //~ sfc32
        a|=0;
        b|=0;
        c|=0;
        d|=0;
        let val=(((a+b)|0)+d)|0;
        d=(++d)|0;
        a=b^(b>>>9);
        b=(c+(c<<3))|0;
        c=(c<<0x15)|(c>>>0xB);
        c=(c+val)|0;
        return val>>>0;
    };
}
/**
 * __calculates value noise for given coordinates__ \
 * uses quintic interpolation for mixing numbers, and a quick (non-cryptographic) hash function to get random noise from coordinates \
 * _the output is allways the same for the same input_
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {number} the noise value for this pixel [0 to 1]
 * @throws {TypeError} if {@linkcode x} or {@linkcode y} are not safe numbers (below {@linkcode Number.MAX_SAFE_INTEGER} but not strictly integers)
 * @example
 * const size = Object.freeze([1920, 1080]),
 *     exampleNoise = new ImageData(...size, {colorSpace: "srgb"});
 * for(let x = 0, y = 0; y < size[1] && x < size[0]; ++x >= size[0] ? (x = 0, y++) : 0){
 *     const pixel = valueNoise(x * 0.008, y * 0.008) * 127
 *         + valueNoise(x * 0.016, y * 0.016) * 63.5
 *         + valueNoise(x * 0.032, y * 0.032) * 31.75
 *         + valueNoise(x * 0.064, y * 0.064) * 15.875
 *         + valueNoise(x * 0.128, y * 0.128) * 7.9375;
 *         //// + valueNoise(x * 0.256, y * 0.256) * 3.96875
 *         //// + valueNoise(x * 0.512, y * 0.512) * 1.984375;
 *     exampleNoise.data.set([pixel, pixel, pixel, 0xFF], (y * size[0] + x) * 4);
 * }
 * document.body.style.backgroundImage = (() => {
 *     "use strict";
 *     const canvas = document.createElement("canvas");
 *     canvas.width = size[0];
 *     canvas.height = size[1];
 *     canvas.getContext("2d")?.putImageData(exampleNoise, 0, 0);
 *     return `url(${ canvas.toDataURL("image/png") })`;
 * })();
 */
function valueNoise(x,y){
    "use strict";
    if(typeof x!=="number"||x>Number.MAX_SAFE_INTEGER)throw new TypeError("[valueNoise] x is not a safe number");
    if(typeof y!=="number"||y>Number.MAX_SAFE_INTEGER)throw new TypeError("[valueNoise] y is not a safe number");
    /**
     * ## Gets random noise from a given coordinate
     * similar to a hash function (non-cryptographic ofc)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {number} random noise [0 to 1]
     */
    const getNoise=(x,y)=>{
        "use strict";
        const hash=(Math.imul(x,0xDEADBEEF)^Math.imul(y,0xCAFEAFFE))*Math.E;
        return hash-Math.floor(hash);
    };
    /**
     * ## Quintic interpolation between two numbers
     * @param {number} a - start point
     * @param {number} b - end point
     * @param {number} t - percentage [0 to 1]
     * @returns {number} number between {@linkcode a} and {@linkcode b}
     */
    const qLerp=(a,b,t)=>{
        "use strict";
        return(b-a)*(6*t*t*t*t*t-15*t*t*t*t+10*t*t*t)+a;
        //// return(b-a)*(3*t*t-2*t*t*t)+a;
        //// return(b-a)*t+a;
    };
    const[xi,yi]=[Math.trunc(x),Math.trunc(y)],
        [xf,yf]=[x-xi,y-yi],
        tl=getNoise(xi,yi),
        tr=getNoise(xi+1,yi),
        bl=getNoise(xi,yi+1),
        br=getNoise(xi+1,yi+1);
    return qLerp(qLerp(tl,tr,xf),qLerp(bl,br,xf),yf);
}
/**
 * ## Calcultates the factorial of {@linkcode n}
 * @typedef {number|bigint} int `bigint` or `number`
 * @param {int} n - a positive integer (as `number` only `[0..18]`)
 * @returns {int} the factorial of {@linkcode n}
 * @throws {TypeError} if {@linkcode n} is not a `number` or `bigint`
 * @throws {RangeError} if {@linkcode n} is a `bigint` and not positive
 * @throws {RangeError} if {@linkcode n} is a `number` and not an integer in range `[0..18]`
 */
function factorial(n){
    "use strict";
    if(typeof n==="bigint"){
        if(n<0n)throw new RangeError("[factorial] n (bigint) is not positive.");
        if(n===0n)return 1n;
        for(let m=n;m>1n;n*=--m);
        return n;
    }
    if(typeof n!=="number")throw new TypeError("[factorial] n is not a number or bigint.");
    if(n<0||n>18||!Number.isInteger(n))throw new RangeError("[factorial] n (number) is not an integer in range [0..18].");
    if(n===0)return 1;
    for(let m=n;m>1;n*=--m);
    return n;
}
/**
 * ## Checks if {@linkcode x} is a prime number
 * @param {number} x - real number (in safe integer range: `]-2↑53,2↑53[`)
 * @returns {boolean} `true` when {@linkcode x} is a prime number and `false` otherwise
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2↑53,2↑53[`)
 */
function isPrime(x){
    "use strict";
    if(typeof x!=="number")throw new TypeError("[isPrime] x is not a number.");
    if(Math.abs(x)>Number.MAX_SAFE_INTEGER)throw new RangeError("[isPrime] x is not in safe integer range.");
    //~ check for 2 and 3 so that x>=5 before loop
    if(x===2||x===3)return true;
    if(x<2||!Number.isInteger(x)||(x&1)===0||x%3===0)return false;
    //~ (loop) check ±1 of every 6th number until sqrt(x) (inclusive)
    for(let i=5,r=Math.sqrt(x);i<=r;i+=6)
        if(x%i===0||x%(i+2)===0)return false;
    return true;
}
/**
 * ## Calculates the next prime number smaller than {@linkcode x}
 * @param {number} x - real number (in safe integer range: `]-2↑53,2↑53[`)
 * @returns {number|undefined} next prime number smaller than {@linkcode x} or `undefined` for {@linkcode x} below or equal to 2 (no last prime)
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2↑53,2↑53[`)
 */
function lastPrime(x){
    "use strict";
    if(typeof x!=="number")throw new TypeError("[lastPrime] x is not a number.");
    if(Math.abs(x)>Number.MAX_SAFE_INTEGER)throw new RangeError("[lastPrime] x is not in safe integer range.");
    //~ check for 2 and 3 so that x>=5 before loop
    if(x<=2)return undefined;
    if(x<=3)return 2;
    if(x<=5)return 3;
    x=Math.ceil(x-1);
    if((x&1)===0)--x;
    if(x%3===0)x-=2;
    //~ (loop) check ±1 of every 6th number until sqrt(x) (inclusive)
    for(let i=5;i*i<=x;i+=6)
        if(x%i===0||x%(i+2)===0){
            if((x-=2)%3===0)x-=2;
            i=-1;
        }
    return x;
}
/**
 * ## Calculates the next prime number larger than {@linkcode x}
 * @param {number} x - real number (in safe integer range: `]-2↑53,2↑53[`)
 * @returns {number|undefined} next prime number larger than {@linkcode x} or `undefined` when going outside safe integer range (`>=2↑53`)
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2↑53,2↑53[`)
 */
function nextPrime(x){
    "use strict";
    if(typeof x!=="number")throw new TypeError("[nextPrime] x is not a number.");
    if(Math.abs(x)>Number.MAX_SAFE_INTEGER)throw new RangeError("[nextPrime] x is not in safe integer range.");
    //~ check for 2 and 3 so that x>=5 before loop
    if(x<2)return 2;
    if(x<3)return 3;
    if(x<5)return 5;
    x=Math.trunc(x)+1;
    if((x&1)===0)++x;
    if(x%3===0)x+=2;
    if(x>Number.MAX_SAFE_INTEGER)return undefined;
    //~ (loop) check ±1 of every 6th number until sqrt(x) (inclusive)
    for(let i=5;i*i<=x;i+=6)
        if(x%i===0||x%(i+2)===0){
            if((x+=2)%3===0)x+=2;
            if(x>Number.MAX_SAFE_INTEGER)return undefined;
            i=-1;
        }
    return x;
}
/**
 * ## Integer factorization (prime decomposition)
 * via (modified) trial division
 * @param {number} n - safe integer (`]-2↑53..2↑53[`)
 * @returns {number[]} prime factors of {@linkcode n} in ascending order (empty for numbers below `2`)
 * @throws {TypeError} if {@linkcode n} is not a safe integer
 */
function factorize(n){
    "use strict";
    if(!Number.isSafeInteger(n))throw new TypeError("[factorize] n is not a safe integer.");
    if(n<2)return[];
    const fac=[];
    //~ check for 2 and 3 so that factors of n are >=5 before loop
    for(;(n&1)===0;n*=.5)fac.push(2);
    for(;n%3===0;n/=3)fac.push(3);
    //~ (loop) check ±1 of every 6th number until sqrt(n) (inclusive) or n=1
    for(let d=5;n>1;d+=6){
        if(d*d>n){
            if(n>1)fac.push(n);
            return fac;
        }
        for(;n%d===0;n/=d)fac.push(d);
        for(const e=d+2;n%e===0;n/=e)fac.push(e);
    }
    return fac;
}
