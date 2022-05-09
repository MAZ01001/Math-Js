/**
 * __calculates new bounds/scale for given number `n`__ \
 * _(number can be out of bounds)_
 * @param {number} n initial number
 * @param {number} x initial lower bound
 * @param {number} y initial upper bound
 * @param {number} x2 new lower bound
 * @param {number} y2 new upper bound
 * @param {boolean} limit if `true` clamps output at min(`x2`) and max(`y2`) - _default `false`_
 * @returns {number} calculated number
 * @throws {TypeError} if `n`, `x`, `y`, `x2` or `y2` are not numbers
 * @example mapRange(0.5,0,1,0,100);//=> 50
 */
function mapRange(n,x,y,x2,y2,limit=false){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[mapRange] n is not a number.');}
    x=Number(x);if(Number.isNaN(x)){throw new TypeError('[mapRange] x is not a number.');}
    y=Number(y);if(Number.isNaN(y)){throw new TypeError('[mapRange] y is not a number.');}
    x2=Number(x2);if(Number.isNaN(x2)){throw new TypeError('[mapRange] x2 is not a number.');}
    y2=Number(y2);if(Number.isNaN(y2)){throw new TypeError('[mapRange] y2 is not a number.');}
    limit=!!limit;
    let o=((n-x)/(y-x))*(y2-x2)+x2;
    return limit?(
        x2<y2?
        Math.max(Math.min(o,y2),x2):
        Math.max(Math.min(o,x2),y2)
    ):o;
}
/**
 * __rounds given number to given decimal place__
 * @param {number} n - initial number
 * @param {number} dec - number of decimal places to round to - _default `0`_
 * @returns {number} rounded number
 * @throws {TypeError} if `n` is not a number or `dec` is not a whole finite number
 * @description idea from [P5.js round function](https://github.com/processing/p5.js/blob/main/src/math/calculation.js#:~:text=p5.prototype.round)
 */
function roundDecimal(n,dec=0){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[roundDecimal] n is not a number.');}
    dec=Math.abs(Number(dec));if(!Number.isFinite(dec)||!Number.isInteger(dec)){throw new TypeError('[roundDecimal] dec is not a whole finite number.');}
    if(/[eE]/.test(n.toString())){
        let[,f,s,x]=[...n.toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)[eE]([+-]?)([0-9]+)$/)];
        if(s!=='-'){
            n=Math.round(f+'e'+(+x+dec));
            if(/[eE]/.test(n.toString())){
                [,f,s,x]=[...n.toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)[eE]([+-]?)([0-9]+)$/)];
                if(s!=='-')return Number(f+'e'+(+x-dec));
                else return Number(f+'e'+(-x+dec));
            }else{
                [,f]=[...n.toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)$/)];
                return Number(f+'e-'+dec);
            }
        }else{
            n=Math.round(f+'e'+(-x-dec));
            if(/[eE]/.test(n.toString())){
                [,f,s,x]=[...n.toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)[eE]([+-]?)([0-9]+)$/)];
                if(s!=='-')return Number(f+'e'+(-x+dec));
                else return Number(f+'e'+(+x-dec));
            }else{
                [,f]=[...n.toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)$/)];
                return Number(f+'e-'+dec);
            }
        }
    }else{
        let[,f,x]=[...Math.round(n+'e'+dec).toString().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)(?:[eE]\+?([0-9]+))?$/)];
        if(x!==undefined){return Number(f+'e'+(+x-dec));}
        else{return Number(f+'e-'+dec);}
    }
}
/**
 * __calculates percentage of a number within bounds__
 * @param {number} n initial number
 * @param {number} x lower bound
 * @param {number} y upper bound
 * @returns {number} percent as decimal number between 0 and 1
 * @throws {TypeError} if `n`, `x` or `y` are not numbers
 * @example toPercent(150,100,200);//=> 0.5
 * @description _same as `mapRange(n,x,y,0,1);`
 */
function toPercent(n,x,y){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[toPercent] n is not a number.');}
    x=Number(x);if(Number.isNaN(x)){throw new TypeError('[toPercent] x is not a number.');}
    y=Number(y);if(Number.isNaN(y)){throw new TypeError('[toPercent] y is not a number.');}
    if(y>x){[x,y]=[y,x];}
    return (n-x)/(y-x);
}
/**
 * __converts angle from DEG to RAD__
 * @param {number} deg - angle in degrees
 * @returns {number} angle in radians
 * @throws {TypeError} if `deg` is not a number
 */
function deg2rad(deg){
    deg=Number(deg);if(Number.isNaN(deg)){throw new TypeError('[deg2rad] deg is not a number.');}
    return deg*(180/Math.PI);
}
/**
 * __converts angle from RAD to DEG__
 * @param {number} rad - angle in radians
 * @returns {number} angle in degrees
 * @throws {TypeError} if `rad` is not a number
 */
function rad2deg(rad){
    rad=Number(rad);if(Number.isNaN(rad)){throw new TypeError('[rad2deg] rad is not a number.');}
    return rad*(Math.PI/180);
}
/**
 * __computes the greatest-common-divisor of two whole numbers__
 * @param {number} A unsigned integer
 * @param {number} B unsigned integer
 * @returns {number} greatest-common-divisor (integer)
 * @throws {TypeError} if `A` or `B` are not integers
 * @example gcd(45,100);//=> 5 | (/5)>> 45/100 == 9/20
 * @description used to shorten fractions (see example)
 */
function gcd(A,B){
    A=Math.abs(Number(A));if(!Number.isInteger(A)){throw new TypeError('[gcd] A is not a integer.');}
    B=Math.abs(Number(B));if(!Number.isInteger(B)){throw new TypeError('[gcd] B is not a integer.');}
    for([A,B]=A<B?[B,A]:[A,B];A%B>0;[A,B]=[B,A%B]);
    return B;
}
/**
 * __converts a decimal number to an improper-fraction (rough estimation)__
 * @param {number} dec - decimal number
 * @param {number} loop_last - if `>0` repeat the last `loop_last` decimal numbers of `dec` - _default `0`_
 * @param {number} max_den - max number for denominator - _default `0` (no limit)_
 * @param {number} max_iter - max iteration count - _default `1e6`_
 * @returns {{a:number,b:number,c:number,n:number,s:string}}
 * + a : whole number part
 * + b : numerator
 * + c : denominator
 * + n : iteration count
 * + s : reason of exit (`'precision'`|`'infinity'`|`'max_den'`|`'max_iter'`)
 * + `dec = a + ( b / c )`
 * @throws {TypeError} if `dec` is not a finite number or `loop_last`, `max_den` or `max_iter` are not whole numbers
 * @example dec2frac(.12,2);//=> a:0 b:4 c:33 = 4/33 = .121212121212...
 */
function dec2frac(dec,loop_last=0,max_den=0,max_iter=1e6){
    dec=Number(dec);if(!Number.isFinite(dec)){throw new TypeError('[dec2frac] dec is not a finite number.');}
    if(Number.isInteger(dec)){return{a:dec,b:0,c:1,n:0,s:'precision'};}
    loop_last=Math.abs(Number(loop_last));if(!Number.isInteger(loop_last)){throw new TypeError('[dec2frac] loop_last is not a whole number.');}
    max_den=Math.abs(Number(max_den));if(!Number.isInteger(max_den)){throw new TypeError('[dec2frac] max_den is not a whole number.');}
    max_iter=Math.abs(Number(max_iter));if(!Number.isInteger(max_iter)){throw new TypeError('[dec2frac] max_iter is not a whole number.');}
    let sign=(dec<0?-1:1),
        nint,ndec=Math.abs(dec),
        num,pnum=1,ppnum=0,
        den,pden=0,ppden=1,
        iter=0;
    /**
     * __shorten and return fraction__
     * @param {number} si sign
     * @param {number} W whole part
     * @param {number} N nominator
     * @param {number} D denominator
     * @param {number} I iteration
     * @param {string} S string
     * @returns {a:number;b:number;c:number;n:number;s:string} fraction
     */
    const __end=(si,W,N,D,I,S)=>{
        if(N===D){return{a:si*(W+1),b:0,c:1,n:I,s:S};}
        if(N>D){
            const _t=(N/D);
            if(_t===Math.floor(_t)){return{a:si*(W+_t),b:0,c:1,n:I,s:S};}
            W+=Math.floor(_t);
            N-=Math.floor(_t)*D;
        }
        const _gcd=((A,B)=>{for([A,B]=A<B?[B,A]:[A,B];A%B>0;[A,B]=[B,A%B]);return B;})(N,D);
        N/=_gcd;
        D/=_gcd;
        return{a:si*W,b:N,c:D,n:I,s:S};
    };
    if(loop_last>0&&!/e/.test(ndec.toString())){
        if(max_den===0){
            [,nint,ndec]=[...ndec.toString().match(/^([0-9]+)\.([0-9]+)$/)];
            nint=parseInt(nint);
            if(loop_last>ndec.length){loop_last=ndec.length;}
            const _l=10**(ndec.length-loop_last),
                _r=parseInt(''.padEnd(loop_last,'9')+''.padEnd(ndec.length-loop_last,'0'));
            num=(Number(ndec.slice(-loop_last))*_l)
                +(Number(ndec.slice(0,-loop_last))*_r);
            den=_l*_r;
            if(!Number.isFinite(nint+(num/den))){return __end(sign,nint,num,den,iter,'infinity');}
            return __end(sign,nint,num,den,iter,'precision');
        }
        const _l=dec.toString().match(/^[0-9]+\.([0-9]+)$/)[1];
        if(loop_last>_l.length){loop_last=_l.length;}
        dec=Number(dec.toString()+''.padEnd(22,_l.substr(-loop_last)));
        ndec=Math.abs(dec);
    }
    do{
        nint=Math.floor(ndec);
        num=ppnum+nint*pnum;
        den=ppden+nint*pden;
        if(max_den>0&&(ppden+(nint*pden))>max_den){return __end(sign,0,pnum,pden,--iter,'max_den');}
        if(!isFinite(ppnum+(nint*pnum))){return __end(sign,0,num,den,iter,'infinity');}
        // console.log(
        //     "<[%d]>\n%s\n%s\n%s\n%s",
        //     iter,
        //     ` ${((sign>0?'+':'-')+num).padEnd(21,' ')} ${ppnum} + ${nint} * ${pnum} * ${sign}`,
        //     `  ${den.toString().padEnd(20,' ')} ${ppden} + ${nint} * ${pden}`,
        //     ` =${sign*(num/den)}`,
        //     ` (${dec})`
        // );
        ppnum=pnum;
        ppden=pden;
        pnum=num;
        pden=den;
        ndec=1.0/(ndec-nint);
        if(Number.EPSILON>Math.abs((sign*(num/den))-dec)){return __end(sign,0,num,den,iter,'precision');}
    }while(iter++<max_iter);
    return __end(sign,0,num,den,iter,'max_iter');
}
/**
 * __convert number to string with padding__
 * @param {number} n - number
 * @param {number} first - padding to length before decimal point
 * @param {number} last - padding to length after decimal point
 * @returns {string} padded number as string
 * @throws {TypeError} if `n` is not a number or `first` or `last` are not whole numbers
 * @example padNum(1.23e2,3,5);//=> '+  1.23000e2'
 * @description
 * format:`[sign] [padded start ' '] [.] [padded end '0'] [e ~]`
 */
function padNum(n,first=0,last=0){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[padNum] n is not a number.')}
    first=Math.abs(Number(first));if(!Number.isInteger(first)){throw new TypeError('[padNum] first is not a whole number.');}
    last=Math.abs(Number(last));if(!Number.isInteger(last)){throw new TypeError('[padNum] last is not a whole number.');}
    if(/[eE]/.test(n.toString())){
        let [,s,i,d,x]=[...n.toString().match(/^([+-]?)([0-9]+)(?:\.([0-9]+))?([eE][+-]?[0-9]+)$/)];
        if(!d){d='0';}
        if(!s){s='+';}
        return s+i.padStart(first,' ')+'.'+d.padEnd(last,'0')+x;
    }
    let [,s,i,d]=[...n.toString().match(/^([+-]?)([0-9]+)(?:\.([0-9]+))?$/)];
    if(!d){d='0';}
    if(!s){s='+';}
    return s+i.padStart(first,' ')+'.'+d.padEnd(last,'0');
}
/**
 * __calculates the modulo of two whole numbers__ \
 * _the euclidean way with only positive remainder_
 * @param {number} a first number
 * @param {number} b second number
 * @returns {number} remainder (always positive)
 * @throws {TypeError} if `a` or `b` are not finite numbers
 * @description `a-(|b|*floor(a/|b|))`
 */
function euclideanModulo(a,b){
    a=Number(a);if(!Number.isFinite(a)){throw new TypeError('[euclideanModulo] a is not a finite number.');}
    b=Number(b);if(!Number.isFinite(b)){throw new TypeError('[euclideanModulo] b is not a finite number.');}
    return a-(Math.abs(b)*Math.floor(a/Math.abs(b)));
}
/**
 * __an attempt of fixing float precision errors in JS__ \
 * _without strings_
 * @param {number} n a number
 * @returns {number} a number
 * @throws {TypeError} if `n` is not a number
 * @description
 * does not always work, in which case, it just returns the same number \
 * so it should not alter the number in a wrong way
 * @example
 * fixFloat(.2/.3);//=> 0.6666666666666667 -> 0.6666666666666666
 * fixFloat(.9-.7);//=> 0.20000000000000007 -> 0.2
 * fixFloat(.3-.4);//=> -0.10000000000000003 -> -0.1
 */
function fixFloat(n){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[fixFloat] n is not a number.');}
    if((n.toString().match(/(?<=\.)([0-9]+([0-9]+)\2+[0-9]+)?$/)||[,''])[1].length>=16){return n-Number.EPSILON*n;}
    else{return n;}
}
/**
 * __genarates a random number within given range__ \
 * _(including `min` and `max`)_
 * @param {number} min - lower bound
 * @param {number} max - upper bound
 * @returns {number} random number within range
 * @throws {TypeError} - if `min` or `max` are not numbers
 */
function randomRange(min,max){
    min=Number(min);if(Number.isNaN(min)){throw new TypeError('[randomRange] min is not a number.');}
    max=Number(max);if(Number.isNaN(max)){throw new TypeError('[randomRange] max is not a number.');}
    if(min>max){[min,max]=[max,min];}
    //~ NOTE: `Math.random();` includes 0 but not 1 !
    //~       assume it goes from 0 to (1-`Number.EPSILON`)
    //~       ( 1 - 0.0000000000000002220446049250313 = 0.9999999999999998 )
    //~       then to include the 1 we have to divide by (1-`Number.EPSILON`)
    return((Math.random()/(1-Number.EPSILON))*(max-min))+min;
}
/**
 * __genarates a random integer within given range__ \
 * _(including `min` and `max`)_
 * @param {number} min - lower bound
 * @param {number} max - upper bound
 * @returns {number} random integer within range
 * @throws {TypeError} - if `min` or `max` are not save integers
 */
function randomRangeInt(min,max){
    min=Number(min);if(Number.isSafeInteger(min)){throw new TypeError('[randomRangeInt] min is not a save integer.');}
    max=Number(max);if(Number.isSafeInteger(max)){throw new TypeError('[randomRangeInt] max is not a save integer.');}
    if(min>max){[min,max]=[max,min];}
    //~ NOTE: `Math.random();` includes 0 but not 1 !
    return Math.floor(Math.random()*((++max)-min))+min;
}
/**
 * __checks for js float inaccuracy in a number__ \
 * _and attempts to fix the (potential) float precision error_
 * @param {number} n - initial number
 * @throws {TypeError} - if `n` is not a number
 * @returns {number} the fixed number
 * @description it checks if the difference of `n` and its nearest integer (`n` rounded) is smaller than EPSILON \
 * (EPSILON is the difference between 1 and the smallest value greater than 1, which is representable as a number value) \
 * and if it is, it returns this integer, else the initial number `n`
 */
function fixPrecision(n){
    n=Number(n);if(Number.isNaN(n)){throw new TypeError('[fixPrecision] n is not a number.');}
    if(Number.isInteger(n)){return n;}
    if(Math.abs(n)<Number.EPSILON){return 0;}
    const m=Math.round(n);
    return Math.abs(Math.abs(m)-Math.abs(n))<Number.EPSILON?m:n;
}
/**
 * __divides one number from another one__ \
 * _ignoring initial sign_
 * @param {number} A - dividend
 * @param {number} B - divisor
 * @returns {Readonly<{quotient:number;remainder:number}>} `A / B` (quotient with remainder)
 * @throws {TypeError} if `A` or `B` are not finite numbers
 * @throws {RangeError} if `B` is 0 (division by 0)
 */
function divisionWithRest(A,B){
    A=Math.abs(Number(A));if(!Number.isFinite(A)){throw new TypeError("[divisionWithRest] A is not a finite number");}
    B=Math.abs(Number(B));if(!Number.isFinite(B)){throw new TypeError("[divisionWithRest] B is not a finite number");}
    let Q=0,R=0;
    if(A===0){Q=(R=0);}
    else if(B===1){Q=A;R=0;}
    else if(B===0){throw new RangeError("[divisionWithRest] B is 0 (can not divide by 0)");}
    else if(A===B){Q=1;R=0;}
    else{
        Q=Math.floor(A/B);
        R=A%B;
    }
    return Object.freeze({quotient:Q,remainder:R});
    //~ see `#calcDivRest` in `Math-Js/BigIntType.js` for an approach with arbitrary-length-integers ~ string/bit-array (base power of 2)
    //~ → https://github.com/MAZ01001/Math-Js/blob/cafda120f3464dcd433a0816df4461c0e42a545e/BigIntType.js#L978
}
