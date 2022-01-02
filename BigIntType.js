class BigIntType{
    /** @type {number} - maximum possible length of a number _(excluding sign)_ - originally `500` = 0.5KB in RAM */
    static #MAX_SIZE=500;
    /**
     * @description
     * + equals max size of Bytes in RAM
     * + temporary string arrays are 2x bigger in RAM \
     *   _(and they're used frequently)_
     * @returns {number} _current_ maximum possible length of a number _(excluding sign)_
     */
    static get MAX_SIZE(){return BigIntType.#MAX_SIZE;}
    /**@throws {RangeError} - if setting this to a number that is not an integer in range `[1-1048576]` - _( `1048576 = 2**20` = 1MB in RAM )_ */
    static set MAX_SIZE(n){
        // technically, max is 9007199254740991 (Number.MAX_SAFE_INTEGER) but with 1 Byte each digit that's 9 PetaBytes ! for ONE number
        // also, the temporary string arrays have 2 Bytes for each digit so 2x bigger than the TypeArray ! and there are quite a lot in these methods
        // and, at least on my system in-browser, "only" arrays of size 2145386496(2**31-2**21) can be allocated !
        if(!Number.isInteger(n)||n<1||n>1048576){throw new RangeError("[MAX_SIZE] must be an integer in range [1-1048576]");}
        return BigIntType.#MAX_SIZE=n;
    }
    /**@type {RegExp} - regular expression for matching integer string with optional sign _(minimum one digit - if more than one, the first must be non-zero)_ */
    static #REGEXP_STRING=/^([+-]?)([1-9][0-9]+|[0-9])$/;
    /**
     * __constructs a BigIntType__
     * @param {string} n - a _(signed)_ integer as string - _default=`'1'`_
     * + minimum one digit and if more, than the first must be non-zero
     * + no scientific notation
     * + _(auto converts to string if not already of type string)_
     * @throws {RangeError} if `n` is an empty string
     * @throws {SyntaxError} if `n` is not a whole number string (in format)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    constructor(n='1'){
        n=String(n);
        if(n.length==0){throw new RangeError("[n] is an empty string");}
        if(!BigIntType.#REGEXP_STRING.test(n)){throw new SyntaxError("[n] is not a whole number string (in format)");}
        if((n.length-(/^[+-]$/.test(n[0])?1:0))>BigIntType.MAX_SIZE){throw new RangeError(`[n] is bigger than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        // let uint8=((a,b)=>{let c=new Uint8Array(a.length+b.length);c.set(a,0);c.set(b,a.length);return c;})(Uint8Array.from("123"),Uint8Array.from("456"));
        /** @type {boolean} - sign of the number - `true` = positive */
        this.sign;
        /** @type {Uint8ClampedArray} - the number as (clamped) unsigned 8bit integer array - index 0 has the right most number from the original string */
        this.digits;
        (m=>{
            this.sign=m[1]!=='-';
            this.digits=Uint8ClampedArray.from(m[2]).reverse();
        })(n.match(BigIntType.#REGEXP_STRING));
    }
    /**
     * __logs number to console and returns itself (`this`)__
     * @param {number} maxLen - max digits to display - _default `100`_
     * + `0`=`digits.length`
     * + auto clamps to `1`-`digits.length`
     * + start is left (`123###`)
     * + shows how many more there would have been (`123.. (+3 digit/s)`)
     * @returns {BigIntType} `this` with no changes
     * @throws {TypeError} - if `maxLen` is not a save integer
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    log(maxLen=100){
        maxLen=Number(maxLen);if(!Number.isSafeInteger(maxLen)){throw new TypeError("[maxlen] is not a save integer");}
        if(maxLen>this.digits.length||maxLen===0){maxLen=this.digits.length;}
        else if(maxLen<1){maxLen=1;}
        console.log(
            "[%i]: (total %i digit/s) %s%s%s",
            Date.now(),
            this.digits.length,
            this.sign?'+':'-',
            this.digits.slice(-maxLen).reverse().join(''),
            maxLen<this.digits.length?`.. (+${this.digits.length-maxLen} digit/s)`:''
        );
        return this;
    }
    /**
     * __makes a copy of `this` number__
     * @returns {BigIntType} a copy of `this` number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    copy(){
        let _tmp=new BigIntType();
        _tmp.sign=this.sign;
        _tmp.digits=this.digits.slice();//~ unlinked copy
        return _tmp;
        //// return new BigIntType((this.sign?'+':'-')+this.digits.join(''));
    }
    /**
     * __sets `this` sign positive__
     * @returns {BigIntType} `this` number
     */
    abs(){this.sign=true;return this;}
    /**
     * __negates/invertes `this` sign__
     * @returns {BigIntType} `this` number
     */
    neg(){this.sign=!this.sign;return this;}
    /**
     * __determines if `this` number is smaller than another number__
     * @param {BigIntType} n - the other number to compare to
     * @returns {boolean} if `this` number is smaller than `n` or not
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    smallerThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(!this.sign&&n.sign){return true;}
        if(this.sign&&!n.sign){return false;}
        if(this.sign){
            if(this.digits.length<n.digits.length){return true;}
            if(this.digits.length>n.digits.length){return false;}
            for(let i=this.digits.length-1;i>=0;i--){
                if(this.digits[i]<n.digits[i]){return true;}
                if(this.digits[i]>n.digits[i]){return false;}
            }
            return false;
        }else{
            if(this.digits.length>n.digits.length){return true;}
            if(this.digits.length<n.digits.length){return false;}
            for(let i=this.digits.length-1;i>=0;i--){
                if(this.digits[i]>n.digits[i]){return true;}
                if(this.digits[i]<n.digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is bigger than another number__
     * @param {BigIntType} n - the other number to compare to
     * @returns {boolean} if `this` number is bigger than `n` or not
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    biggerThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.sign&&!n.sign){return true;}
        if(!this.sign&&n.sign){return false;}
        if(this.sign){
            if(this.digits.length>n.digits.length){return true;}
            if(this.digits.length<n.digits.length){return false;}
            for(let i=this.digits.length-1;i>=0;i--){
                if(this.digits[i]>n.digits[i]){return true;}
                if(this.digits[i]<n.digits[i]){return false;}
            }
            return false;
        }else{
            if(this.digits.length<n.digits.length){return true;}
            if(this.digits.length>n.digits.length){return false;}
            for(let i=this.digits.length-1;i>=0;i--){
                if(this.digits[i]<n.digits[i]){return true;}
                if(this.digits[i]>n.digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is equal to another number__
     * @param {BigIntType} n - the other number to compare to
     * @returns {boolean} if `this` number is equal to `n` or not
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    equalTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.sign!==n.sign){return false;}
        if(this.digits.length!==n.digits.length){return false;}
        return this.digits.every((value,index)=>value===n.digits[index]);
    }
    /**
     * __makes the carry and returns new first-digit-index__
     * _used in `#calcDec()` and `#calcSub()`_
     * @param {string[]} _tmp - the temporary string-array (original will be altered)
     * @param {number} i - current index
     * @param {number} first - current index of the first digit
     * @returns {number} new index for first digit
     */
    static #minusCarry(_tmp,i,first){
        let j=1;
        while(_tmp[i+j]==='0'){_tmp[i+j++]='9';}
        _tmp[i+j]=String(Number(_tmp[i+j])-1);
        if(_tmp[i+j]==='0'&&i+j===first){first--;}
        return first;
    }
    /**
     * __increment `this` number by `1`__ \
     * _ignoring  initial sign_ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after incrementing
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #calcInc(){
        /**@type {string[]} - array for temporary storage*/
        let _tmp=[1];
        for(let i=0;i<this.digits.length;i++){
            _tmp[i]=String((this.digits[i]||0)+(Number(_tmp[i])||0));
            if(Number(_tmp[i])>9){
                _tmp[i]=String(Number(_tmp[i])%10);
                _tmp[i+1]='1';
            }
        }
        if(_tmp.length>1&&_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`additive calculation with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        this.digits=Uint8ClampedArray.from(_tmp);
        return this;
    }
    /**
     * __decrement `this` number by `1`__ \
     * _ignoring  initial sign_ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after decrementing
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #calcDec(){
        /**@type {number} - current index of the first digit */
        let first=this.digits.length-1,
            /**@type {boolean} - current sign of number */
            sign=true,
            /**@type {number} - last calculation for current index */
            z=(this.digits[0]||0)-1,
            /**@type {string[]} - array for temporary storage */
            _tmp=Array.from(this.digits,String);
        if(z===0){
            if(first===0){first--;}
            _tmp[0]='0';
        }else if(z===-1){
            if(first===0){
                sign=false;
                _tmp[0]='1';
            }else{
                _tmp[0]='9';
                first=BigIntType.#minusCarry(_tmp,0,first);
            }
        }else{_tmp[0]=String(z);}
        this.sign=sign;
        this.digits=Uint8ClampedArray.from(_tmp.slice(0,(first+1)||1));
        return this;
    }
    /**
     * __increments `this` number by `1`__ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after incrementing
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    inc(){return this.sign?this.#calcInc():this.#calcDec().neg();}
    /**
     * __decrements `this` number by `1`__ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after decrementing
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    dec(){return this.sign?this.#calcDec():this.#calcAdd();}
    /**
     * __adds two numbers together__ \
     * _ignoring initial sign_ \
     * _modifies the original_
     * @param {BigIntType} n - second number for addition
     * @returns {BigIntType} `this` number after addition
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #calcAdd(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not a BigIntType");}
        /**@type {string[]} - array for temporary storage*/
        let _tmp=[];
        /**@type {number} - length of the longer number */
        const len=Math.max(this.digits.length,n.digits.length);
        for(let i=0;i<len;i++){
            _tmp[i]=String((this.digits[i]||0)+(n.digits[i]||0)+(Number(_tmp[i])||0));
            if(Number(_tmp[i])>9){
                _tmp[i]=String(Number(_tmp[i])%10);
                _tmp[i+1]='1';
            }
        }
        if(_tmp.length>1&&_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`additive calculation with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        this.digits=Uint8ClampedArray.from(_tmp);
        return this;
    }
    /**
     * __subtracts two numbers from one another__ \
     * _ignoring initial sign_ \
     * _modifies the original_
     * @param {BigIntType} n - second number for subtraction (subtrahend)
     * @returns {BigIntType} `this` number after subtraction
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #calcSub(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not a BigIntType");}
        /**@type {number} - length of the longer number */
        const len=Math.max(this.digits.length,n.digits.length);
        /**@type {number} - current index of the first digit */
        let first=len-1,
            /**@type {boolean} - current sign of number */
            sign=true,
            /**@type {number} - last calculation for current index */
            z,
            /**@type {string[]} - array for temporary storage */
            _tmp=[];
        for(let i=len-1;i>=0;i--){
            z=((this.digits[i]||0)-(n.digits[i]||0));
            if(z===0){
                if(i===first){first--;}
                _tmp[i]='0';
            }else if(z<0){
                if(!sign){_tmp[i]=String(Math.abs(z));}
                else if(i===first){
                    sign=false;
                    _tmp[i]=String(Math.abs(z));
                }else{
                    _tmp[i]=String(z+10);
                    first=BigIntType.#minusCarry(_tmp,i,first);
                }
            }else{
                if(!sign){
                    _tmp[i]=String(Math.abs(z-10));
                    first=BigIntType.#minusCarry(_tmp,i,first);
                }else{_tmp[i]=String(z);}
            }
        }
        this.sign=sign;
        this.digits=Uint8ClampedArray.from(_tmp.slice(0,(first+1)||1));
        return this;
    }
    /**
     * __adds another number to `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for addition
     * @returns {BigIntType} `this` number after addition
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    add(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
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
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    sub(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.sign!==n.sign){this.#calcAdd(n);}
        else if(this.sign&&n.sign){this.#calcSub(n);}
        else if((!this.sign)&&(!n.sign)){(_obj=>[this.sign,this.digits]=[_obj.sign,_obj.digits])(n.copy().#calcSub(this));}
        return this;
    }
    /**
     * __calculates half of `this` number__ \
     * _modifies the original_
     * @param {string} rounding - _default `'c'`_
     * + `'c'` or `"ceil"` for rounding up the result
     * + `'f'` or `"floor"` for rounding down the result
     * @returns {BigIntType} `this` number after halving
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    half(rounding='c'){
        rounding=String(rounding);if(!/^(c|ceil|f|floor)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        if(this.digits.length===1&&this.digits[0]===0){return this;}
        /**@type {string[]} - array for temporary storage */
        let _tmp=[],
            /**@type {boolean} - if last digit had `.5` "carry" */
            carry=false;
        for(let i=this.digits.length-1;i>=0;i--){
            _tmp[i]=String(Math.floor(this.digits[i]*.5));
            if(carry){_tmp[i]=String(Number(_tmp[i])+5);carry=false;}
            if(this.digits[i]%2===1){carry=true;}
        }
        if(_tmp.length>1&&_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        this.digits=new Uint8ClampedArray(_tmp);
        switch(rounding){
            case'f':case"floor":return this;
            case'c':case"ceil":return carry?this.inc():this;
            //~ here rounded is the same as ceil since it can only have `.5` as the final "carry" and thus would round up, like ceil
        }
    }
    /**
     * __calculates double of `this` number__ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after doubling
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    double(){
        /**@type {string[]} - array for temporary storage */
        let _tmp=[0],
            /**@type {number} - last calculation */
            z;
        for(let i=0;i<this.digits.length;i++){
            z=Number(_tmp[i])+(this.digits[i]*2);
            _tmp[i]=String(z%10);
            _tmp[i+1]=String(Math.floor(z*.1));
        }
        if(_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`doubling would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        this.sign=true;
        this.digits=new Uint8ClampedArray(_tmp);
        return this;
    }
    /**
     * __divides another number from `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for division (divisor)
     * @param {string} rounding - _default `'r'`_
     * + `'r'` or `"round"` for rounded division result
     * + `'f'` or `"floor"` for floored division result
     * + `'c'` or `"ceil"` for ceiled division result
     * @returns {BigIntType} `this` number after division
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    div(n,rounding='r'){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        // dividend / divisor = quotient + remainder / divisor
        if((n.digits.length===1&&n.digits[0]===0)){throw new RangeError("[n] is 0");}
        if((this.digits.length===1&&this.digits[0]===0)||(n.digits.length===1&&n.digits[0]===1)){return n.sign?this:this.neg();}
        if(n.digits.length>1&&n.digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){this.times10ToThePowerOf(-(n.digits.length-1),rounding);}
        else if(this.smallerThan(n)){
            switch(rounding){
                case'c':case"ceil":this.digits=new Uint8ClampedArray([1]);break;
                case'f':case"floor":this.digits=new Uint8ClampedArray([0]);break;
                case'r':case"round":this.digits=new Uint8ClampedArray([n.biggerThan(this.copy().double())?0:1]);break;
            }
        }else if(this.equalTo(n)){this.digits=new Uint8ClampedArray([1]);}
        else{
            /**@type {BigIntType} - rest */
            let r=this.copy(),
                /**@type {BigIntType} - quotient */
                q=new BigIntType('0');
            for(;r.biggerThan(n);q.inc()){r.sub(n)};
            if(r.equalTo(n)){r.sub(n);q.inc();}
            if(!(r.digits.length===1&&r.digits[0]===0)){
                switch(rounding){
                    case'c':case"ceil":this.digits=new Uint8ClampedArray([1]);break;
                    case'f':case"floor":this.digits=new Uint8ClampedArray([0]);break;
                    case'r':case"round":this.digits=new Uint8ClampedArray([n.biggerThan(this.copy().double())?0:1]);break;
                }
            }
        }
        this.sign=!(this.sign^n.sign);
        return this;
    }
    /**
     * __multiplies `this` number with `10**x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding`_
     * @param {number} x - exponent - save integer
     * @param {string} rounding - how to round when digit-shifting right _default `'r'`_
     * + `'r'` or `"round"` for rounded division result
     * + `'f'` or `"floor"` for floored division result
     * + `'c'` or `"ceil"` for ceiled division result
     * @returns {BigIntType} - `this` number after multiplication/digit-shifts
     * @throws {TypeError} - if `x` is not a save integer
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    times10ToThePowerOf(x,rounding='r'){
        x=Number(x);if(!Number.isSafeInteger(x)){throw new TypeError("[x] is not a save integer");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        //~ (X>=0) 10**X => new BigIntType(['1',...Array(X).fill('0')].join(''))
        if(x>0){
            if(x+this.digits.length>BigIntType.MAX_SIZE){throw new RangeError(`[n] digit-shifts would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
            /**@type {string[]} - array for temporary storage */
            let _tmp=Array.from(this.digits,String);
            for(let shift=0;shift<x;shift++){_tmp.unshift('0');}
            this.digits=new Uint8ClampedArray(_tmp);
        }else if(x<0){
            if(Math.abs(x)>this.digits.length){
                switch(rounding){
                    case'c':case"ceil":this.digits=new Uint8ClampedArray([1]);break;
                    case'f':case"floor":this.digits=new Uint8ClampedArray([0]);break;
                    case'r':case"round":this.digits=new Uint8ClampedArray([Math.abs(x)===this.digits.length?(this.digits[this.digits.length-1]<5?0:1):0]);break;
                }
            }else{
                /**@type {string[]} - array for temporary storage */
                let _tmp=[];
                for(let shift=Math.abs(x);shift<this.digits.length;_tmp.push(String(this.digits[shift++])));
                this.digits=new Uint8ClampedArray(_tmp);
            }
        }
        return this;
    }
    /**
     * __Karazubas Multiplication Algorithm__
     * _with recursion_
     * @param {BigIntType} X - number for multiplication
     * @param {BigIntType} Y - number for multiplication
     * @description [!!] `X` and `Y` must be of same length and the length must be a power of two (pad end with `0` if needed)
     * @returns {BigIntType} result of `X`*`Y`
     * @throws {TypeError} - if `X` or `Y` are not instances of `BigIntType`
     * @throws {RangeError} - if some number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static #karazubaMul(X,Y){
        if(!(X instanceof BigIntType)){throw new TypeError("[X] is not an instance of BigIntType");}
        if(!(Y instanceof BigIntType)){throw new TypeError("[Y] is not an instance of BigIntType");}
        if(X.digits.every(v=>v===0)||Y.digits.every(v=>v===0)){return new BigIntType('0');}
        if(X.digits.length===1){return new BigIntType(String(X.digits[0]*Y.digits[0]));}
        let Xh=new BigIntType('1'),Xl=new BigIntType('1'),
            Yh=new BigIntType('1'),Yl=new BigIntType('1');
        Xh.digits=X.digits.slice(X.digits.length*.5);Xl.digits=X.digits.slice(0,X.digits.length*.5);
        Yh.digits=Y.digits.slice(Y.digits.length*.5);Yl.digits=Y.digits.slice(0,Y.digits.length*.5);
        let [P1,P2,P3]=[
            BigIntType.#karazubaMul(Xh,Yh),
            BigIntType.#karazubaMul(Xl,Yl),
            Xh.copy().add(Xl).mul(Yh.copy().add(Yl))
        ];
        return P1.copy().times10ToThePowerOf(X.digits.length).add((P3.copy().sub(P1.copy().add(P2))).times10ToThePowerOf(Xh.digits.length)).add(P2);
    }
    /**
     * __multiplies `this` number by `n`__ \
     * _using Karazubas Multiplication Algorithm_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this` number after multiplication
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    mul(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(n.digits.length===1&&n.digits[0]===2){
            try{this.double();}
            catch(e){throw (e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`):e;}
        }else if(this.digits.length===1&&this.digits[0]===2){
            try{this.digits=n.copy().double().digits;}
            catch(e){throw (e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`):e;}
        }else if(n.digits.length>1&&n.digits.every((v,i,a)=>(i===a.length-1&&v===1)||(i<a.length-1&&v===0))){
            if((n.digits.length-1)+this.digits.length>BigIntType.MAX_SIZE){throw new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
            let _tmp=Array.from(this.digits,String);
            for(let shift=0;shift<n.digits.length-1;shift++){_tmp.unshift('0');}
            this.digits=new Uint8ClampedArray(_tmp);
        }else{
            /**@type {number} - length (a power of 2) for karazuba-algorithm-numbers */
            let len=1,
            /**@type {string[][]} - arrays for temporary storage */
            [X,Y]=[this.digits,n.digits].map(v=>Array.from(v,String));
            for(;len<this.digits.length||len<n.digits.length;len<<=1);
            for(;X.length<len;X.push('0'));
            for(;Y.length<len;Y.push('0'));
            /**@type {BigIntType[]} - converted to BigIntTypes */
            [X,Y]=[X,Y].map(v=>{
                let _t=new BigIntType('0');
                _t.digits=new Uint8ClampedArray(v);
                return _t;
            });
            try{this.digits=BigIntType.#karazubaMul(X,Y).digits;}
            catch(e){throw (e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`):e;}
        }
        this.sign=!(this.sign^n.sign);
        return this;
    }
    // TODO
    #_pow(n){
        let result=new BigIntType('1'),
            exp=n.copy();
        for(;;){
            if(exp.digits[0]&1){result.mul(this);}
            exp.half('f');
            if(exp.digits.length===1&&exp.digits[0]===0){break;}
            this.mul(this);
        }
        this.digits=result.digits;
        this.sign=result.sign;
        return this;
    }
    /**
     * __calculates the modulo of two numbers__
     * @param {BigIntType} n - second number - if `0` throws `RangeError`
     * @param {string} type - _default `'e'`_
     * + `'e'` or `"euclid"` for euclidean modulo remainder
     * + `'t'` or `"trunc"` for truncated modulo remainder - (like js `%`operator)
     * + `'f'` or `"floor"` for floored modulo remainder
     * + `'c'` or `"ceil"` for ceiled modulo remainder
     * + `'r'` or `"round"` for rounded modulo remainder
     * @returns {BigIntType} the modulo according to `type` as a new `BigIntType`
     * @throws {TypeError} - if `n` is not a `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `type` is not a valid option (see `type`s doc.)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    modulo(n,type='e'){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(n.digits.length===1&&n.digits[0]===0){throw new RangeError("[n] cannot divide by 0");}
        if((this.digits.length===1&&this.digits[0]===0)||(n.digits.length===1&&n.digits[0]===1)){this.digits=new Uint8ClampedArray([0]);return this;}
        if(n.digits.length===1&&n.digits[0]===2){this.digits=new Uint8ClampedArray([this.digits[0]%2]);return this;}
        type=String(type);
        if(!/^(e|euclid|t|trunc|f|floor|c|ceil|r|round)$/.test(type)){throw new SyntaxError("[type] is not a valid option");}
        let[_A,_B]=[this.copy().abs(),n.copy().abs()];
        /**@type {BigIntType} - rest */
        let R;
        if(_A.smallerThan(_B)){R=_A}
        else if(_A.equalTo(_B)){R=new BigIntType('0');}
        else{
            for(;_A.biggerThan(_B);_A.sub(_B));//~ max O( ceil(this/n) ) i think, not that fluent in O-natation (yet)
            if(_A.equalTo(_B)){R=new BigIntType('0');}
            else{R=_A;}
        }
        switch(type){
            case'e':case"euclid":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(this.sign?R:_B.sub(R));return this;
            case't':case"trunc":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(this.sign?R:R.neg());return this;
            case'f':case"floor":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(n.sign?(this.sign?R:_B.sub(R)):(this.sign?R.sub(_B):R.neg()));return this;
            case'c':case"ceil":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(n.sign?(this.sign?R.sub(_B):R.neg()):(this.sign?R:_B.sub(R)));return this;
            case'r':case"round":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(R.copy().sub(_B.copy().half('c')).sign?(this.sign?R.sub(_B):_B.sub(R)):(this.sign?R:R.neg()));return this;
        }
    }
    /* TODO
        <num_frac(a/b/c)>
        gcd pow roots

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

new BigIntType('456')
.mul(new BigIntType('123'))
.log()//=>56088 correct ╭( ･ㅂ･)و ̑̑
;
