//@ts-check
"use strict";
/**
 * ## Translate a number from one range to another
 * @param {number} n - a number (can be outside given range)
 * @param {number} a - initial range start
 * @param {number} b - initial range end
 * @param {number} x - new range start
 * @param {number} y - new range end
 * @param {boolean} [limit] - if `true` clamps output to min {@linkcode x} and max {@linkcode y} - default `false`
 * @returns {number} translated number
 * @throws {TypeError} if {@linkcode n}, {@linkcode a}, {@linkcode b}, {@linkcode x} or {@linkcode y} are not numbers (or `NaN`)
 * @throws {TypeError} if {@linkcode limit} is given but not a boolean
 * @throws {RangeError} if {@linkcode a} and {@linkcode b} are equal and {@linkcode n} is not equal to both while {@linkcode limit} is `false` (or not given)
 * @throws {RangeError} if {@linkcode a} and {@linkcode b} are equal while {@linkcode x} and {@linkcode y} are not (can't translate point to rage)
 * @example mapRange(0.5, 0, 1, 0, 100); //=> 50
 */
function mapRange(n,a,b,x,y,limit){
    "use strict";
    if(typeof n!=="number"||Number.isNaN(n))throw new TypeError("[mapRange] n is not a number.");
    if(typeof a!=="number"||Number.isNaN(a))throw new TypeError("[mapRange] a is not a number.");
    if(typeof b!=="number"||Number.isNaN(b))throw new TypeError("[mapRange] b is not a number.");
    if(typeof x!=="number"||Number.isNaN(x))throw new TypeError("[mapRange] x is not a number.");
    if(typeof y!=="number"||Number.isNaN(y))throw new TypeError("[mapRange] y is not a number.");
    if(typeof(limit??=false)!=="boolean")throw new TypeError("[mapRange] limit (given) is not a boolean.");
    if(a===b){
        if(x===y){
            if(limit||n===a)return x;
            throw new RangeError("[mapRange] n is not equal to given point (not range) while limit is disabled.");
        }
        throw new RangeError("[mapRange] can't translate point to range.");
    }
    if(x===y)return x;
    if(limit)
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
 * ## linear interpolation
 * @param {number} a - start ({@linkcode t}=0)
 * @param {number} b - end ({@linkcode t}=1)
 * @param {number} t - factor in range `[0,1]` (can be outside range)
 * @returns {number} linear blend from {@linkcode a} to {@linkcode b}
 * @throws {TypeError} if {@linkcode a} or {@linkcode b} are not finite numbers or {@linkcode t} is not a number (or `NaN`)
 */
function lerp(a,b,t){
    if(!Number.isFinite(a))throw new TypeError("[lerp] a is not a finite number");
    if(!Number.isFinite(b))throw new TypeError("[lerp] b is not a finite number");
    if(typeof t!=="number"||Number.isNaN(t))throw new TypeError("[lerp] t is not a number");
    if(a===b)return a;
    switch(t){
        case 0:return a;
        case 1:return b;
        case-Infinity:return a<b?-Infinity:Infinity;
        case Infinity:return a<b?Infinity:-Infinity;
        default:return a+(b-a)*t;
    }
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
 * ## Computes the greatest-common-divisor of two integers
 * @param {number} n - positive safe integer (except `0`) `[1..2^53[`
 * @param {number} m - positive safe integer (except `0`) `[1..2^53[`
 * @returns {number} greatest-common-divisor `[1..2^53[`
 * @throws {TypeError} if {@linkcode n} or {@linkcode m} are not positive safe integers (or `0`) `[1..2^53[`
 * @example gcd(45, 100); //=> 5 → (45/5) / (100/5) → 9/20 = 45/100
 */
function gcd(n,m){
    "use strict";
    if(!Number.isSafeInteger(n)||n<1)throw new TypeError("[gcd] n is not a positive safe integer or 0");
    if(!Number.isSafeInteger(m)||m<1)throw new TypeError("[gcd] m is not a positive safe integer or 0");
    if(n<m)[n,m]=[m,n];
    for(let r=0;(r=n%m)>0;n=m,m=r);
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
    "use strict";
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
    "use strict";
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
 * @param {number} x - real number (in safe integer range: `]-2^53,2^53[`)
 * @returns {boolean} `true` when {@linkcode x} is a prime number and `false` otherwise
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2^53,2^53[`)
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
 * @param {number} x - real number (in safe integer range: `]-2^53,2^53[`)
 * @returns {number|undefined} next prime number smaller than {@linkcode x} or `undefined` for {@linkcode x} below or equal to 2 (no last prime)
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2^53,2^53[`)
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
 * @param {number} x - real number (in safe integer range: `]-2^53,2^53[`)
 * @returns {number|undefined} next prime number larger than {@linkcode x} or `undefined` when going outside safe integer range (`>=2^53`)
 * @throws {TypeError} if {@linkcode x} is not a number
 * @throws {RangeError} if {@linkcode x} is not in safe integer range (`]-2^53,2^53[`)
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
 * @param {number} n - positive safe integer (`[0..2^53[`)
 * @returns {number[]} prime factors of {@linkcode n} in ascending order (empty for numbers below `2`)
 * @throws {TypeError} if {@linkcode n} is not a positive safe integer
 */
function factorize(n){
    "use strict";
    if(!Number.isSafeInteger(n)||n<0)throw new TypeError("[factorize] n is not a positive safe integer.");
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
/**
 * ## Integer factorization (prime decomposition)
 * via (modified) trial division
 * @param {number} n - positive safe integer (`[0..2^53[`)
 * @returns {[number,number][]} prime factors of {@linkcode n} in ascending order as `[prime,amount]` (only primes that appear at least once; empty for numbers below `2`)
 * @throws {TypeError} if {@linkcode n} is not a positive safe integer
 */
function factorize2D(n){
    "use strict";
    if(!Number.isSafeInteger(n)||n<0)throw new TypeError("[factorize] n is not a positive safe integer.");
    if(n<2)return[];
    /**@type {[number,number][]}*/const fac=[];
    //~ check for 2 and 3 so that factors of n are >=5 before loop
    let f2=0,f3=0;
    for(;(n&1)===0;n*=.5)++f2;
    for(;n%3===0;n/=3)++f3;
    if(f2>0)fac.push([2,f2]);
    if(f3>0)fac.push([3,f3]);
    //~ (loop) check ±1 of every 6th number until sqrt(n) (inclusive) or n=1
    for(let d=5,fd=0,e=0,fe=0;n>1;d+=6){
        if(d*d>n){
            if(n>1)fac.push([n,1]);
            return fac;
        }
        for(fd=0;n%d===0;n/=d)++fd;
        for(fe=0,e=d+2;n%e===0;n/=e)++fe;
        if(fd>0)fac.push([d,fd]);
        if(fe>0)fac.push([e,fe]);
    }
    return fac;
}
/**
 * ## Integer factorization (prime decomposition)
 * via (modified) trial division
 * @param {number} n - positive safe integer (`[0..2^53[`)
 * @returns {Map<number,number>} prime factors of {@linkcode n} as `prime => amount` (only primes that appear at least once; added in ascending order; empty for numbers below `2`)
 * @throws {TypeError} if {@linkcode n} is not a positive safe integer
 */
function factorizeMap(n){
    "use strict";
    if(!Number.isSafeInteger(n)||n<0)throw new TypeError("[factorize] n is not a positive safe integer.");
    if(n<2)return new Map();
    const fac=new Map();
    //~ check for 2 and 3 so that factors of n are >=5 before loop
    let f2=0,f3=0;
    for(;(n&1)===0;n*=.5)++f2;
    for(;n%3===0;n/=3)++f3;
    if(f2>0)fac.set(2,f2);
    if(f3>0)fac.set(3,f3);
    //~ (loop) check ±1 of every 6th number until sqrt(n) (inclusive) or n=1
    for(let d=5,fd=0,e=0,fe=0;n>1;d+=6){
        if(d*d>n){
            if(n>1)fac.set(n,1);
            return fac;
        }
        for(fd=0;n%d===0;n/=d)++fd;
        for(fe=0,e=d+2;n%e===0;n/=e)++fe;
        if(fd>0)fac.set(d,fd);
        if(fe>0)fac.set(e,fe);
    }
    return fac;
}
/**
 * ## Calculate the number of consecutive tries needed until an event with a given % change has a 90% (or custom) chance of success overall
 * set two variables to calculate the missing (or `null`) third: {@linkcode tries} consecutive tries with {@linkcode chance}% each to have a {@linkcode goal}% chance of success overall \
 * give percentages in decimal values (`[0,1]`); also tries can have decimals (`[0,∞[`)
 * @param {number|null} [chance] - percentage of the chance for given event succeeding (once) - default none (expected to be given)
 * @param {number|null} [tries] - number of consecutive tries (can be decimal) - default `null` (expected to be the output)
 * @param {number|null} [goal] - percentage of the final/total chance of success for given event (after {@linkcode tries} number of consecutive tries) - default 90% (`0.90`)
 * @returns {number} parameter that was not given (or `null`): {@linkcode chance}, {@linkcode tries}, or {@linkcode goal}
 * @example // in explanation: (input) {default} [output]
 * chanceAmount(0.40);             //=> 4.507575551943848  | [4.51] consecutive tries with (40%)    each to have a {90%} chance of success overall
 * chanceAmount(0.40, null, 0.50); //=> 1.3569154488567239 | [1.36] consecutive tries with (40%)    each to have a (50%) chance of success overall
 * chanceAmount(0.40, 2);          //=> 0.64               | (2)    consecutive tries with (40%)    each to have a [64%] chance of success overall
 * chanceAmount(null, 2, 0.50);    //=> 0.2928932188134524 | (2)    consecutive tries with [29.29%] each to have a (50%) chance of success overall
 * @throws {TypeError} if {@linkcode chance}, {@linkcode tries}, or {@linkcode goal} are not numbers (not type number or `NaN`)
 * @throws {RangeError} if {@linkcode chance} or {@linkcode goal} are negative or above 100% (`1.00`)
 * @throws {RangeError} if {@linkcode tries} is negative or `Infinity`
 * @throws {SyntaxError} if an invalid set of parameters are given (only two parameters are given (missing is `null` or `undefined`))
 * @typedef {(chance:number,tries?:null,goal?:number)=>number} CalcTries calculate how many consecutive tries, with {@linkcode chance}% each, are needed to have a {@linkcode goal}% (default 90%) chance of success overall (that it happens once)
 * @typedef {(chance:number,tries:number,goal?:null)=>number} CalcGoal calculate how much chance of success (that it happens once) there is overall, for {@linkcode tries} consecutive tries with {@linkcode chance}% each
 * @typedef {(chance:undefined|null,tries:number,goal:number)=>number} CalcChance calculate what % chance each try has, when {@linkcode tries} consecutive tries have a {@linkcode goal}% chance of success overall (that it happens once)
 * @type {CalcChance&CalcTries&CalcGoal}
 */
const chanceAmount=(chance,tries,goal)=>{
    "use strict";
    if(chance!=null){
        if(typeof chance!=="number"||Number.isNaN(chance))throw new TypeError("[chanceAmount] chance is not a number");
        if(chance<0||chance>1)throw new RangeError("[chanceAmount] chance can't be negative or above 100%");
    }
    if(tries!=null){
        if(typeof tries!=="number"||Number.isNaN(tries))throw new TypeError("[chanceAmount] tries is not a number");
        if(tries<0||tries===Infinity)throw new RangeError("[chanceAmount] tries can't be negative or infinite");
    }
    if(goal!=null){
        if(typeof goal!=="number"||Number.isNaN(goal))throw new TypeError("[chanceAmount] goal is not a number");
        if(goal<0||goal>1)throw new RangeError("[chanceAmount] goal can't be negative or above 100%");
    }
    //~ tries = log[1 - chance](1 - goal) = log(1 - goal) / log(1 - chance)
    if(chance!=null&&tries==null){
        //? avoid NaN for chance:0% and goal:0% → tries:0
        if(goal===0)return 0;
        //? avoid NaN for chance:100% and goal:100% → tries:1
        if(chance===1)return 1;
        return Math.log1p(-(goal??.9))/Math.log1p(-chance);
    }
    //~ goal = 1 - (1 - chance)^tries
    if(chance!=null&&tries!=null&&goal==null)return 1-(1-chance)**tries;
    //~ chance = 1 - root[tries](1 - goal) = 1 - (1 - goal)^(1 / tries)
    if(chance==null&&tries!=null&&goal!=null){
        //? avoid NaN for tries:0 and goal:0% → chance:0%
        if(goal===0)return 0;
        return 1-(1-goal)**(1/tries);
    }
    throw new SyntaxError("[chanceAmount] invalid set of parameters given");
};
/**
 * ## generate all unique (unordered) permutations of tuples of {@linkcode elements} (indices) with size {@linkcode length}
 * the size of the resulting (outer) list is the binomial coefficient `n choose m` where `n` is {@linkcode elements} and `m` is {@linkcode length}
 * @param {number} elements - number of elements available (max index + 1)
 * @param {number} length - number of elements in one tuple (inner list)
 * @returns {number[][]} - list of (all unique unordered) tuples (size {@linkcode length}) with indices for {@linkcode elements}
 * @throws {TypeError} if {@linkcode elements} or {@linkcode length} are not positive safe integers
 * @example P(3,2); //=> [ [0,1], [0,2], [1,2] ]
 */
function P(elements,length){
    "use strict";
    if(!Number.isSafeInteger(elements)||elements<0)throw new TypeError("[P] elements is not a positive safe integer.");
    if(!Number.isSafeInteger(length)||length<0)throw new TypeError("[P] length is not a positive safe integer.");
    if(length===0)return[[]];
    if(elements<length)return[];
    const list=[],index=Array.from({length},(_,i)=>i);
    for(let j=0,k=0;index[length-1]<elements;){
        list.push(index.slice());
        inc:for(j=length-1;j>=0;--j)
            if(++index[j]<elements){
                for(k=j+1;k<length;++k)
                    if((index[k]=index[k-1]+1)>=elements)continue inc;
                break;
            }
    }
    return list;
}
/**
 * ## calculate the binomial coefficient ({@linkcode n} choose {@linkcode m})
 * @param {number} n - number of elements available
 * @param {number} m - number of elements choosen
 * @returns {number} number of all possible unique (unordered) permutations
 * @throws {TypeError} if {@linkcode n} or {@linkcode m} are not positive safe integers
 * @example
 * choose(3,2); //=> 3 ({ {1,2}, {1,3}, {2,3} })
 * choose(20,10); //=> 184756
 */
function choose(n,m){
    "use strict";
    if(!Number.isSafeInteger(n)||n<0)throw new TypeError("[choose] n is not a positive safe integer.");
    if(!Number.isSafeInteger(m)||m<0)throw new TypeError("[choose] m is not a positive safe integer.");
    if(m===0)return 1;
    if(n<m)return 0;
    let a=1,b=1;
    for(let k=1;k<=m;++k){
        a*=(n-m)+k;
        b*=k;
    }//~ always results in an integer (if not for float imprecision)
    return a/b;
}
/**
 * ## calculate barycentric coordinates of {@linkcode point} in 2D
 * @param {[number,number]} v0 - first triangle vertex position
 * @param {[number,number]} v1 - second triangle vertex position
 * @param {[number,number]} v2 - third triangle vertex position
 * @param {[number,number]} point - position of a point
 * @returns {[number,number,number,number]} `[m1, m2, m3, one]` (with `m1 + m2 + m3 = one`) where all masses are positive when {@linkcode point} is inside triangle (to normalize do `[m1/one, m2/one, m3/one]` ! `one` is 0 if the triangle has no area/is a line ! also, values may be inverted when `one` is negative (triangle vertices are given in reverse/clockwise order))
 * @throws {TypeError} if any argument is not a finite 2D vector
 * @throws {RangeError} if all triangle vertices have the same position
 */
function barycentricCoordinates2D(v0,v1,v2,point){
    "use strict";
    if(!Array.isArray(v0)||v0.length!==2||!v0.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates2D] v0 is not a finite 2D vector");
    if(!Array.isArray(v1)||v1.length!==2||!v1.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates2D] v1 is not a finite 2D vector");
    if(!Array.isArray(v2)||v2.length!==2||!v2.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates2D] v2 is not a finite 2D vector");
    if(!Array.isArray(point)||point.length!==2||!point.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates2D] point is not a finite 2D vector");
    if(v0.every((v,i)=>v===v1[i]&&v===v2[i]))throw new RangeError("[barycentricCoordinates2D] all triangle vertices have the same position");
    //~          m1        +        m2        +        m3        =        1
    //~ | (x1-xp)  (x2-xp) | (x2-xp)  (x0-xp) | (x0-xp)  (x1-xp) | (x1-x0) (x2-x1) |
    //~ | (y1-yp)  (y2-yp) | (y2-yp)  (y0-yp) | (y0-yp)  (y1-yp) | (y1-y0) (y2-y1) |
    //~ value=cross2(col0,col1)
    //? in 2D m1+m2+m3 is always "1" (rather the sign of each weight (special 2D crossproduct) is used to determine if the point is inside the triangle) and one of those can be calculated with the other three (here "1"), to save on some processing
    //? the weights m1,m2,m3 can also be made unsigned and then m1+m2+m3 is only equal to "1" when the point is within the triangle (like in 3D)
    //! "1" is 0 if the triangle is a line; all masses are also 0 if the point is inside that line or if the triangle is a point, no matter if the given point is equal to it or not (in-/outside), hence the range error
    //! all values may be inverted when "1" is negative (when triangle vertices are given in clockwise order)
    const
        p0x=v0[0]-point[0],p0y=v0[1]-point[1],
        p1x=v1[0]-point[0],p1y=v1[1]-point[1],
        p2x=v2[0]-point[0],p2y=v2[1]-point[1],
        m1=p1x*p2y-p2x*p1y,
        m2=p2x*p0y-p0x*p2y,
        m3=p0x*p1y-p1x*p0y;
    return[m1,m2,m3,m1+m2+m3];
    // const x01=v1[0]-v0[0],y01=v1[1]-v0[1],
    //     x12=v2[0]-v1[0],y12=v2[1]-v1[1];
    // return[m1,m2,m3,x01*y12-x12*y01];
}
/**
 * ## calculate barycentric coordinates of {@linkcode point} in 3D
 * @param {[number,number,number]} v0 - position of first triangle vertex
 * @param {[number,number,number]} v1 - position of second triangle vertex
 * @param {[number,number,number]} v2 - position of third triangle vertex
 * @param {[number,number,number]} point - position of a point
 * @returns {[number,number,number,number]} `[m1, m2, m3, one]` (with unsigned values) where `m1 + m2 + m3 = one` whenever {@linkcode point} is inside the triangle (to normalize do `[m1/one, m2/one, m3/one]` ! `one` is 0 if the triangle has no area/is a line)
 * @throws {TypeError} if any argument is not a finite 3D vector
 * @throws {RangeError} if all triangle vertices have the same position
 */
function barycentricCoordinates3D(v0,v1,v2,point){
    "use strict";
    if(!Array.isArray(v0)||v0.length!==3||!v0.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates3D] v0 is not a finite 3D vector");
    if(!Array.isArray(v1)||v1.length!==3||!v1.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates3D] v1 is not a finite 3D vector");
    if(!Array.isArray(v2)||v2.length!==3||!v2.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates3D] v2 is not a finite 3D vector");
    if(!Array.isArray(point)||point.length!==3||!point.every(n=>Number.isFinite(n)))throw new TypeError("[barycentricCoordinates3D] point is not a finite 3D vector");
    if(v0.every((v,i)=>v===v1[i]&&v===v2[i]))throw new RangeError("[barycentricCoordinates3D] all triangle vertices have the same position");
    //~          m1        +        m2        +        m3        =        1
    //~ | (x1-xp)  (x2-xp) | (x2-xp)  (x0-xp) | (x0-xp)  (x1-xp) | (x1-x0) (x2-x1) |
    //~ | (y1-yp)  (y2-yp) | (y2-yp)  (y0-yp) | (y0-yp)  (y1-yp) | (y1-y0) (y2-y1) |
    //~ | (z1-zp)  (z2-zp) | (z2-zp)  (z0-zp) | (z0-zp)  (z1-zp) | (z1-z0) (z2-z1) |
    //~ value=length(cross(col0,col1))
    //? the (normal) 3D crossproduct gives a vector, wich have no signed (positive/negative) direction and therefore the length is used as weights (slower calculation than 2D) and the sum of those (unsigned) weights is only equal to "1" when the point is on the same plane & inside the triangle
    //! "1" is 0 if the triangle is a line; all masses are also 0 if the point is inside that line or if the triangle is a point, no matter if the given point is equal to it or not (in-/outside), hence the range error
    const
        p0x=v0[0]-point[0],p0y=v0[1]-point[1],p0z=v0[2]-point[2],
        p1x=v1[0]-point[0],p1y=v1[1]-point[1],p1z=v1[2]-point[2],
        p2x=v2[0]-point[0],p2y=v2[1]-point[1],p2z=v2[2]-point[2],
        x01=v1[0]-v0[0],y01=v1[1]-v0[1],z01=v1[2]-v0[2],
        x12=v2[0]-v1[0],y12=v2[1]-v1[1],z12=v2[2]-v1[2];
    return[
        Math.hypot(p1x*p2y-p2x*p1y,p1y*p2z-p2y*p1z,p1z*p2x-p2z*p1x),
        Math.hypot(p2x*p0y-p0x*p2y,p2y*p0z-p0y*p2z,p2z*p0x-p0z*p2x),
        Math.hypot(p0x*p1y-p1x*p0y,p0y*p1z-p1y*p0z,p0z*p1x-p1z*p0x),
        Math.hypot(x01*y12-x12*y01,y01*z12-y12*z01,z01*x12-z12*x01)
    ];
}
