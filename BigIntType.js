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
        if((n.length-(/^[+-]$/.test(n[0])?1:0))>BigIntType.MAX_SIZE){throw new RangeError(`[n] is bigger than ${BigIntType.MAX_SIZE} [MAX_SIZE]`);}
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
    /**
     * __makes a copy of `this` number__
     * @returns {BigIntType} a copy of `this` number
     */
    copy(){
        let _tmp=new BigIntType();
        _tmp.sign=this.sign;
        _tmp.digits=this.digits.slice();
        return _tmp;
        // return new BigIntType((this.sign?'+':'-')+this.digits.join(''));
    }
    // TODO !! best memory for temp array → Array.from(a,String) ← string uses only 2bytes each char! so "only" 2x as big as the Uint8ClampedArray which has 1byte each entry (and it's clamped)
    //~ btw for true/false memory efficient it's null/undefined apparently xD
    //~ and i recently found Object.is() :D
    // TODO check for length after calc - so it will only throw IF it would be overflow rather than potentially overflow
    /**
     * __adds two numbers together (ignoring sign)__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for addition
     * @returns {BigIntType} `this` number after addition
     * @throws {TypeError} - if [n] is not an instance of `BigIntType`
     * @throws {RangeError} - if new number could be larger than `BigIntType.MAX_SIZE`
     */
    #calcAdd(n=new BigIntType()){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not a BigIntType");}
        const len=Math.max(this.digits.length,n.digits.length);
        if(len+1>BigIntType.MAX_SIZE){throw new RangeError(`addition with [n] could result in a number bigger than MAX_SIZE (${BigIntType.MAX_SIZE})`);}
        let _tmp=[];
        for(let i=0;i<len;i++){
            _tmp[i]=((this.digits[i]||0)+(n.digits[i]|0))%10;
            _tmp[i+1]=Math.floor(((this.digits[i]||0)+(n.digits[i]||0))*.1);
        }
        _tmp.pop();
        this.digits=Uint8ClampedArray.from(_tmp);
        return this;
    }
    /**
     * __subtracts two numbers from one another (ignoring sign)__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for subtraction (subtrahend)
     * @returns {BigIntType} `this` number after subtraction
     * @throws {TypeError} - if [n] is not an instance of `BigIntType`
     */
    #calcSub(n=new BigIntType()){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not a BigIntType");}
        const len=Math.max(this.digits.length,n.digits.length),
            carry=(_tmp,i,j,first)=>{
                j=1;
                while(_tmp[i+j]===0){_tmp[i+j++]=9;}
                _tmp[i+j]-=1;
                if(_tmp[i+j]===0&&i+j===first){first--;}
                return first;
            };
        let first=len-1,sign=1,z,_tmp=[],j=1;
        for(let i=len-1;i>=0;i--){
            z=((this.digits[i]||0)-(n.digits[i]|0));
            if(z===0){
                if(i===first){first--;}
                _tmp[i]=0;
            }else if(z<0){
                if(sign===-1){_tmp[i]=Math.abs(z);}
                else if(i===first){
                    sign=-1;
                    _tmp[i]=Math.abs(z);
                }else{
                    _tmp[i]=z+10;
                    first=carry(_tmp,i,j,first);
                }
            }else{
                if(sign===-1){
                    _tmp[i]=Math.abs(z-10);
                    first=carry(_tmp,i,j,first);
                }else{_tmp[i]=z;}
            }
        }
        this.sign=sign===1;
        this.digits=Uint8ClampedArray.from(_tmp.slice(0,(first+1)||1));
        return this;
    }
    /**
     * __adds another number to `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for addition
     * @returns {BigIntType} `this` number after addition
     * @throws {TypeError} - if [n] is not an instance of `BigIntType`
     * @throws {RangeError} - if new number could be larger than `BigIntType.MAX_SIZE`
     */
    add(n=new BigIntType()){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(Math.max(this.digits.length,n.digits.length)+1>BigIntType.MAX_SIZE){throw new RangeError(`addition with [n] could result in a number bigger than MAX_SIZE (${BigIntType.MAX_SIZE})`);}
        if(this.sign===n.sign){this.#calcAdd(n);}
        else if(this.sign&&(!n.sign)){this.#calcSub(n);}
        else if((!this.sign)&&n.sign){(_obj=>[this.sign,this.digits]=[_obj.sign,_obj.digits])(n.copy().#calcSub(this));}
        return this;
    }
    /**
     * __subtracts another number from `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for subtraction (subtrahend)
     * @returns {BigIntType} `this` number after subtraction
     * @throws {TypeError} - if [n] is not an instance of `BigIntType`
     */
    sub(n=new BigIntType()){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.sign!==n.sign){this.#calcAdd(n);}
        else if(this.sign&&n.sign){this.#calcSub(n);}
        else if((!this.sign)&&(!n.sign)){(_obj=>[this.sign,this.digits]=[_obj.sign,_obj.digits])(n.copy().#calcSub(this));}
        return this;
    }
    // #mul(n=BigIntType()){}
    // #div(n=BigIntType()){}
    /**
     * __calculates the modulo of two numbers__ \
     * TODO update to using BigIntType not number
     * @param {number} A - first number - if `0` returns `A`
     * @param {number} B - second number - if `0` returns `NaN`
     * @param {string} type - _default `'e'`_
     * - `'e'` or `"euclid"` for euclidean modulo remainder
     * - `'t'` or `"trunc"` for truncated modulo remainder
     * - `'f'` or `"floor"` for floored modulo remainder
     * - `'c'` or `"ceil"` for ceiled modulo remainder
     * - `'r'` or `"round"` for rounded modulo remainder
     * @returns {number} the modulo according to `type` - retuns `NaN` if `B` is `0`
     * @throws {TypeError} - if `A` or `B` are not finite numbers
     * @throws {SyntaxError} - if `type` is not a valid option (see `type`s doc.)
     */
    static modulo(A,B,type='e'){//works perfectly fine just a few ms slower than js-s %operator xD (for each function call | no dif. if numbers scale up :D)
        [A,B]=[A,B].map(Number);
        if(!Number.isFinite(A)){throw new TypeError("[A] is not a finite number");}
        if(!Number.isFinite(B)){throw new TypeError("[B] is not a finite number");}
        if(B===0){return NaN;}
        if(A===0){return A;}
        type=String(type);
        const [sign_A,sign_B]=[A>=0,B>=0],
            [_A,_B]=[A,B].map(Math.abs);
        let R;
        if(_A<_B){R=_A;}
        else if(_A===_B){R=0;}
        else{
            let n=_A;
            for(;n>_B;n-=_B);//~ max O( ceil(A/B) ) i think
            if(n===_B){R=0;}
            else{R=n;}
        }
        switch(type){//~ more info @ https://en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition here R would look like \|\|\|\./|/|/|/ (positve and the dot is 0 - in any case of the divisor)
            case'e':case'euclid':return sign_A?R:_B-R;//default in number theory, so it's default here
            case't':case'trunc':return sign_A?R:-R;//most used, but inferior...wikipedia/Daan Leijen in "Division and Modulus for Computer Scientists" 2001
            case'f':case'floor':return sign_B?(sign_A?R:_B-R):(sign_A?R-_B:-R);//also "good" i heard
            case'c':case'ceil':return sign_B?(sign_A?R-_B:-R):(sign_A?R:_B-R);
            case'r':case'round':return sign_A?((R-(_B*.5))<0?R:R-_B):((R-(_B*.5))<0?-R:_B-R);//wood ?!
            default:throw new SyntaxError("[type] is not a valid option");
        }
    }
    /* TODO
        get/set sign num_frac(a/b/c) to_string
        smaller_than bigger_than equal_to
        mul div (modulo) gcd pow roots

        ( n-root(n,x) => pow(x,1/n) )

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

new BigIntType("499")
.log()
.sub(
    new BigIntType("50")
    .log()
).log();
