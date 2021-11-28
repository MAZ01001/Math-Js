class BigIntType{
    /** @type {number} - maximum length of number _(excluding sign)_ - default `500` */
    static MAX_SIZE=500;
    /** @type {RegExp} - regular expression for matching integer string with optional sign _(minimum one digit - if more than one, the first must be non-zero)_ */
    static #REGEXP_STRINT=/^([+-]?)([1-9][0-9]+|[0-9])$/;
    /**
     * __constructs a BigIntType__
     * @param {string} n - a _(signed)_ integer as string - _default=`"0"`_ \
     * minimum one digit and if more, than the first must be non-zero\
     * _(auto converts to string if not already of type string)_
     * @throws {RangeError} if `n` is an empty string
     * @throws {SyntaxError} if `n` is not a whole number string (in format)
     */
    constructor(n="0"){
        n=String(n);
        if(n.length==0){throw new RangeError("[n] is an empty string");}
        if(!BigIntType.#REGEXP_STRINT.test(n)){throw new SyntaxError("[n] is not a whole number string (in format)");}
        if(n.length>BigIntType.MAX_SIZE+(/^[+-]$/.test(n[0])?1:0)){throw new RangeError(`[n] is bigger than ${BigIntType.MAX_SIZE} [MAX_SIZE]`);}
        // let uint8=((a,b)=>{let c=new Uint8Array(a.length+b.length);c.set(a,0);c.set(b,a.length);return c;})(Uint8Array.from("123"),Uint8Array.from("456"));
        /** @type {boolean} - sign of the number - `true` = positive */
        this.sign;
        /** @type {Uint8ClampedArray} - the number as (clamped) unsigned 8bit integer array - index 0 has the right most number from the original string */
        this.digits;
        (m=>{this.sign=m[1]!=='-';this.digits=Uint8ClampedArray.from(m[2]).reverse();})(n.match(BigIntType.#REGEXP_STRINT));
    }
    /**
     * __logs number to console and returns itself (`this`)__
     * @param {number} maxLen - max digits to display - _default `100`_
     * + `-1`=`digits.length`
     * + auto clips to `0`-`digits.length`
     * + start is left (`123###`)
     * + shows how many more there would have been (`123 (+3 digits)`)
     * @returns {BigIntType} `this` with no changes
     */
    log(maxLen=100){
        maxLen=Number(maxLen);
        if(!Number.isInteger(maxLen)){throw new TypeError("[maxlen] is not an integer");}
        if(maxLen>this.digits.length||maxLen===-1){maxLen=this.digits.length;}
        if(maxLen<0){maxLen=0;}
        console.log(
            "[%i]: (total %i digit/s) %s %s%s",
            Date.now(),
            this.digits.length,
            this.sign?'+':'-',
            this.digits.slice(0,maxLen).reverse().join(''),
            maxLen<this.digits.length?` (+ ${this.digits.length-maxLen} digit/s)`:''
        );
        return this;
    }
    add(n=new BigIntType()){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not a BigIntType");}
        const len=Math.max(this.digits.length,n.digits.length);
        if(len+1>BigIntType.MAX_SIZE){throw new RangeError(`addition with [n] could result in a number bigger than MAX_SIZE (${BigIntType.MAX_SIZE})`);}
        let _tmp=[];
        // TODO : SIGN !!!
        for(let i=0;i<len;i++){
            _tmp[i]=((this.digits[i]||0)+(n.digits[i]|0))%10;
            _tmp[i+1]=Math.floor(((this.digits[i]||0)+(n.digits[i]||0))*.1);
        }
        _tmp.pop();
        this.digits=Uint8ClampedArray.from(_tmp);
        return this;
    }
    // #sub(n=BigIntType()){}
    // #mul(n=BigIntType()){}
    // #div(n=BigIntType()){}
    /* TODO
        get/set sign num_frac(a/b/c) to_string logger copy
        smaller_than bigger_than equal_to
        add sub mul div modulo(euclidean) pow

        log(x)(y)=z <-> (x^z=y) https://en.wikipedia.org/wiki/Logarithm#Change_of_base

        E PI sqrt2 ?! ~> e^() e^(()*PI) ...

        Trigenomitry: https://en.wikipedia.org/wiki/Trigonometric_functions
        Sine,Tangent,Secant https://upload.wikimedia.org/wikipedia/commons/e/ec/TrigFunctionDiagram.svg
            +arc-*,co-*,hyperbolic-*,arc-co-*,co-hyperbolic-*,arc-hyperbolic-*,arc-co-hyperbolic-*
        COS: https://wikimedia.org/api/rest_v1/media/math/render/svg/b81fe2f5f9ac74cbd88ec71d23baf9a1e39b8f04
        SIN: https://wikimedia.org/api/rest_v1/media/math/render/svg/2d12b4b66e58abfcf03c1f452658b85f662ce228

        (；￢＿￢)
    */
}

new BigIntType("+500")
.log()
.add(
    new BigIntType("+30")
    .log()
).log();
