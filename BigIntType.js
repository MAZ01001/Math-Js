class BigIntType{
    //~ property/method names starting with '#' are private - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields for details
    /*
        max number with 500 base 256 digits is
        256**500-1 = 13 182 040 934 309 431 001 038 897 942 365 913 631 840 191 610 932 727
            690 928 034 502 417 569 281 128 344 551 079 752 123 172 122 033 140 940 756 480
            716 823 038 446 817 694 240 581 281 731 062 452 512 184 038 544 674 444 386 888
            956 328 970 642 771 993 930 036 586 552 924 249 514 488 832 183 389 415 832 375
            620 009 284 922 608 946 111 038 578 754 077 913 265 440 918 583 125 586 050 431
            647 284 603 636 490 823 850 007 826 811 672 468 900 210 689 104 488 089 485 347
            192 152 708 820 119 765 006 125 944 858 397 761 874 669 301 278 745 233 504 796
            586 994 514 054 435 217 053 803 732 703 240 283 400 815 926 169 348 364 799 472
            716 094 576 894 007 243 168 662 568 886 603 065 832 486 830 606 125 017 643 356
            469 732 407 252 874 567 217 733 694 824 236 675 323 341 755 681 839 221 954 693
            820 456 072 020 253 884 371 226 826 844 858 636 194 212 875 139 566 587 445 390
            068 014 747 975 813 971 748 114 770 439 248 826 688 667 129 237 954 128 555 841
            874 460 665 729 630 492 658 600 179 338 272 579 110 020 881 228 767 361 200 603
            478 973 120 168 893 997 574 353 727 653 998 969 223 092 798 255 701 666 067 972
            698 906 236 921 628 764 772 837 915 526 086 464 389 161 570 534 616 956 703 744
            840 502 975 279 094 087 587 298 968 423 516 531 626 090 898 389 351 449 020 056
            851 221 079 048 966 718 878 943 309 232 071 978 575 639 877 208 621 237 040 940
            126 912 767 610 658 141 079 378 758 043 403 611 425 454 744 180 577 150 855 204
            937 163 460 902 512 732 551 260 539 639 221 457 005 977 247 266 676 344 018 155
            647 509 515 396 711 351 487 546 062 479 444 592 779 055 555 421 362 722 504 575
            706 910 949 375 in base 10 which is 1 205 digits (2.41 times longer)
    */
    /**@type {number} - maximum possible length of a number _(excluding sign)_ - originally `500` = 0.5KB in RAM */
    static #MAX_SIZE=500;
    /**@returns {number} _current_ maximum possible length of a number _(excluding sign)_ */
    static get MAX_SIZE(){return BigIntType.#MAX_SIZE;}
    /**@throws {RangeError} - if setting this to a number that is not an integer in range `[1-1048576]` - _( `1048576` = 1MiB in RAM )_ */
    static set MAX_SIZE(n){
        // technically, max is 9007199254740991 (Number.MAX_SAFE_INTEGER) but with 1 Byte each entry that's almost 8PiB ! for ONE number
        // and chrome browser will only create typed arrays up to 2GiB
        if(!Number.isInteger(n)||n<1||n>1048576){throw new RangeError("[MAX_SIZE] must be an integer in range [1-1048576]");}
        return BigIntType.#MAX_SIZE=n;
    }
    /**@type {Readonly<{2:RegExp;10:RegExp;16:RegExp;256:RegExp;}>} - regular expressions for matching strings in specific base with optional sign, minimum one digit and no leading zeros */
    static #REGEXP_STRING=Object.freeze({
        2:/^([+-]?)(0|1[01]*)$/,
        10:/^([+-]?)(0|[1-9][0-9]*)$/,
        16:/^([+-]?)(0|[1-9A-F][0-9A-F]*])$/,
        256:/^([+-]?)(\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)$/u
    });
    /**
     * __constructs a BigIntType number__
     * @param {string|boolean[]|Uint8Array} num - an integer - _default `'1'`_
     * + + ( in arrays the number is unsigned and index 0 = 0th-place-digit for example: `"1230"` → `[0,3,2,1]` )
     * + `base` 2   → as string or Uint8Array `0` and `1` or as bool array `true` and `false`
     * + `base` 10  → as string or Uint8Array `0` to `9`
     * + `base` 16  → as string `0` to `9` and `A` to `F` or as Uint8Array `0` to `16`
     * + `base` 256 → as string `⠀` to `⣿` (Braille `0x2800` to `0x28FF`) or as Uint8Array `0` to `256`
     * @param {string|number} base - base of `num` as a number or string - _default `'d'`_
     * + base 2 can be `'b'`, `"bin"`, `"binary"` or `'2'`
     * + base 10 can be `'d'`, `"dec"`, `"decimal"` or `"10"`
     * + base 16 can be `'h'`, `"hex"`, `"hexadecimal"` or `"16"`
     * + base 256 can be `"byte"` or `"256"`
     * @throws {SyntaxError} - if `base` is not an available option
     * @throws {SyntaxError} - if `num` does not have the correct format for this `base`
     * @throws {RangeError} - if `num` exceedes `MAX_SIZE` (after conversion in base 256)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    constructor(num='1',base='d'){//TODO multi base
        /** @type {boolean} - sign of the number - `true` = positive */
        this.sign=true;
        /** @type {Uint8Array} - the number as unsigned 8bit integer array - index 0 is the 0st-digit of the number */
        this.digits;
        if(num==='0'||num==='\u2800'||(num.length===1&&(num[0]===0||num[0]===false))){this.digits=new Uint8Array(1);return;}
        if(num==='1'||num==='\u2801'||(num.length===1&&(num[0]===1||num[0]===true))){this.digits=new Uint8Array([1]);return;}
        switch(String(base).toLowerCase()){
            case'b':case"bin":case"binary":case'2':base=2;break;
            case'd':case"dec":case"decimal":case"10":base=10;break;
            case'h':case"hex":case"hexadecimal":case"16":base=16;break;
            case"byte":case"256":base=256;break;
            default:throw new SyntaxError("[base] is not an available option");
        }
        if(base===2&&Array.isArray(num)){
            if(num.every(v=>typeof(v)==="boolean")){num=new Uint8Array(num);}
            else{throw new SyntaxError("[num] (array) has incorrect values for base 2");}
        }
        /**@type {boolean} - if `num` is a string this will be the sign of the number (after the conversion) */
        let _sign=true;
        if(!(num instanceof Uint8Array)){
            num=String(num);
            /**@type {RegExpMatchArray|null} - sign and number from string or `null` if no match*/
            let _match=num.match(BigIntType.#REGEXP_STRING[base]);
            if(!_match){throw new SyntaxError(`[num] (string) does not have the correct format for base ${base}`);}
            _sign=_match[1]!=='-';
            switch(base){
                case 2:case 10:num=new Uint8Array([..._match[2]].reverse());break;
                case 16:num=new Uint8Array([..._match[2]].map(v=>Number.parseInt(v,16)).reverse());break;
                case 256:num=new Uint8Array([..._match[2]].map(v=>v.charCodeAt(0)-10240).reverse());break;
            }
        }
        switch(base){
            case 2:
                if(!(num.every(v=>v===0||v===1))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 2");}
                this.digits=new Uint8Array(Math.ceil(num.length/8));
                for(let i=0;i<this.digits.length;i++){this.digits[i]=Number.parseInt(num.slice(i*8,(i+1)*8).reverse().join(''),2);}
                break;
            case 10:// TODO
                if(!(num.every(v=>v>=0&&v<10))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 10");}
                //HK__## 10 to 256 ##
                // TODO private base10 mul, pow256, sub, add ~
                //! this.digits;
                /**@type {number} - exponent for _pow256 */
                let _exp=1,
                    /**@type {BigIntType} - power of 256 */
                    _pow256=new BigIntType(new Uint8Array([6,5,2]),256);
                /**@type {BigIntType} - const 256 */
                const _only256=_pow256.copy();
                //! while _pow256<this loop _pow256++ then if _pow256!=this _pow256-- 1x
                //! exp→0 loop (loop decrease num by _pow256 and save the times in exp-index of new number) and decrease _pow256 by one power (div 256 or calc new pow) then add rest of num to 0 index of new number
                break;
            case 16:
                if(!(num.every(v=>v>=0&&v<16))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 16");}
                this.digits=new Uint8Array(Math.floor(num.length/2));
                for(let i=0;i<this.digits.length;i++){this.digits[i]=Number.parseInt(num.slice(i*2,(i+1)*2).reverse().join(''),2);}
                break;
            case 256://TODO
                if(!(num.every(v=>v>=0&&v<256))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 256");}
                if(/^[\u2800\u28FF]$/u.test(num[0])){
                    if(!(num.every(v=>/^[\u2800\u28FF]$/u.test(v)))){throw new SyntaxError("[num] array has mixed values for base 256");}
                    this.digits=new Uint8Array(num.map(v=>String(v.charCodeAt(0)-10240)));
                }else{
                    if(!(num.every(v=>Number(v)>=0&&Number(v)<256&&Number.isInteger(Number(v))))){throw new SyntaxError("[num] array has mixed values for base 256");}
                    this.digits=new Uint8Array(num);
                }
                break;
        }
        if(this.digits.length>BigIntType.MAX_SIZE){throw new RangeError(`[num] would be longer than [MAX_SIZE]`);}
        this.sign=_sign;
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
    log(maxLen=100){//TODO multi base
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
        return(n=>{
            n.sign=this.sign;
            n.digits=this.digits.slice();//~ unlinked copy
            return n;
        })(new BigIntType('0'));
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
     * __removes (unnecessary) leading zeros from `this` number__
     * @returns {BigIntType} - `this` number after removing all leading zeros
     */
    #removeLeadingZeros(){
        /**@type {number} - index of first non-zero digit (from left)*/
        let first=this.digits.length-1;
        for(;first>0&&this.digits[first]===0;first--);
        this.digits=this.digits.slice(0,first+1);
        return this;
    }
    // TODO
    // TODO
    /**
     * __makes the carry and returns new first-digit-index__ \
     * specifically for conversion from base 10 to base 256
     * @param {Uint8Array} num - number (original will be altered)
     * @param {number} i - current index
     * @param {number} first - current index of the first digit
     * @returns {number} new index for first digit
     */
    static #base10MinusCarry(num,i,first){
        let j=1;
        while(_tmp[i+j]===0){num[i+j++]=9;}
        num[i+j]=num[i+j]-1;
        if(num[i+j]===0&&i+j===first){first--;}
        return first;
    }
    /**
     * __subtracts `n` from `this` number__ \
     * specifically for conversion from base 10 to base 256
     * @param {BigIntType} n - subtrahend
     * @returns {BigIntType} `this - n` (base 10)
     */
    #base10Sub(n){
        /**@type {number} - length of the longer number */
        const len=Math.max(this.digits.length,n.digits.length);
        /**@type {Uint8Array} - new digits */
        let num=new Uint8Array(len),
            /**@type {number} - last calculation */
            z,
            /**@type {number} - index of first digit */
            first=len-1;
        for(let i=first;i>=0;i--){
            z=((this.digits[i]||0)-(n.digits[i]||0));
            if(z===0){
                if(i===first){first--;}
                num[i]=0;
            }else if(z<0){
                if(i===first){return new BigIntType('0');}
                num[i]=z+10;
                first=BigIntType.#base10MinusCarry(num,i,first);
            }else{num[i]=z;}
        }
        this.digits=num;
        return this.#removeLeadingZeros();
    }
    
    // TODO

    // add=
    // /**
    //  * __adds `b` to `a`__
    //  * @param {Uint8Array} a - augend
    //  * @param {Uint8Array} b - addend
    //  * @returns {Uint8Array} `a + b`
    //  */
    // (a,b)=>{
    //     /**@type {number} - length of the longer number */
    //     const len=Math.max(a.length,b.length);
    //     /**@type {Uint8Array} - new number */
    //     let _tmp=new Uint8Array(len+1),
    //         /**@type {number} - last calculation */
    //         z;
    //     for(let i=0;i<len;i++){
    //         z=(a[i]||0)+(b[i]||0)+_tmp[i];
    //         if(z>=10){
    //             _tmp[i]=z%10;
    //             _tmp[i+1]=1;
    //         }else{_tmp[i]=z;}
    //     }
    //     _tmp=removeLeadingZeros(_tmp);
    //     //! check max size
    //     return _tmp;
    // },digitShiftLeft=
    // /**
    //  * __shifts the digits of a number to the left__
    //  * @param {Uint8Array} a - initial number
    //  * @param {number} x - amount of digit shifts to the left - (positive only)
    //  * @returns {Uint8Array} `a * (base ** x)`
    //  */
    // (a,x)=>{
    //     //! check max size
    //     return new Uint8Array([...new Uint8Array(x),...a]);
    // },karazubaMul=
    // /**
    //  * __multiplies `X` and `Y`__
    //  * @param {Uint8Array} X - first number
    //  * @param {Uint8Array} Y - second number
    //  * @description __[!]__ `X` and `Y` must be the same length and that length must be a power of 2 _(end-padded with `'0'`)_ __[!]__
    //  * @returns {Uint8Array} `X * Y`
    //  */
    // (X,Y)=>{
    //     if(X.every(v=>v===0)||Y.every(v=>v===0)){return new Uint8Array([0]);}
    //     if(X.length===1){return new Uint8Array([...String(X[0]*Y[0])]).reverse();}
    //     let [Xh,Xl,Yh,Yl]=[
    //         X.slice(Math.floor(X.length*.5)),X.slice(0,Math.floor(X.length*.5)),
    //         Y.slice(Math.floor(Y.length*.5)),Y.slice(0,Math.floor(Y.length*.5))
    //     ];
    //     let [P1,P2,P3]=[
    //         karazubaMul(Xh,Yh),
    //         karazubaMul(Xl,Yl),
    //         mul(add(Xh,Xl),add(Yh,Yl))
    //     ];
    //     //~ X * Y == (P1 * b**(2*n)) + (P3 - (P1 + P2)) * b**n + P2 | **=power b=base n=digit-length of Xh/Yh/Xl/Yl or half of X/Y
    //     return add(add(digitShiftLeft(P1,X.length),digitShiftLeft(sub(P3,add(P1,P2)),Xh.length)),P2);
    // },mul=
    // /**
    //  * __multiplies two numbers__ \
    //  * _using karazubas multiplication algorithm_
    //  * @param {Uint8Array} a - number
    //  * @param {Uint8Array} b - number
    //  * @returns {Uint8Array} `a * b`
    //  */
    // (a,b)=>{
    //     /**@type {number} - power of 2 for pading `a` and `b` to a length that's a power of 2 */
    //     const len=(()=>{let n=1;for(;n<Math.max(a.length,b.length);n*=2);return n;})();
    //     /**@type {Uint8Array} - new number */
    //     let _tmp=karazubaMul(
    //         new Uint8Array([...a,...new Uint8Array(len-a.length)]),
    //         new Uint8Array([...b,...new Uint8Array(len-b.length)])
    //     );
    //     //! check max size
    //     return _tmp;
    // },pow256=
    // /**
    //  * __make 256 to the power of x__
    //  * @param {number} exp - exponent
    //  * @returns {Uint8Array} `256 ** x`
    //  */
    // exp=>{
    //     /**@type {Uint8Array} - starting base (256) */
    //     let base=new Uint8Array([6,5,2]),
    //         /**@type {Uint8Array} - new number */
    //         _tmp=new Uint8Array([1]);
    //     if(exp%2){_tmp=mul(_tmp,base);}
    //     exp=Math.floor(exp*.5);
    //     while(exp!==0){
    //         base=mul(base,base);
    //         if(exp%2){_tmp=mul(base,_tmp);}
    //         exp=Math.floor(exp*.5);
    //     }
    //     return _tmp;
    // };

    // TODO
    // TODO

    /**
     * __makes the carry and returns new first-digit-index__ \
     * _used in `#calcDec()` and `#calcSub()`_
     * @param {string[]} _tmp - the temporary string-array (original will be altered)
     * @param {number} i - current index
     * @param {number} first - current index of the first digit
     * @returns {number} new index for first digit
     */
    static #minusCarry(_tmp,i,first){//TODO multi base
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
    #calcInc(){//TODO multi base
        /**@type {string[]} - array for temporary storage */
        let _tmp=['1'];
        for(let i=0;i<this.digits.length;i++){
            _tmp[i]=String((this.digits[i]||0)+(Number(_tmp[i])||0));
            if(Number(_tmp[i])>9){
                _tmp[i]=String(Number(_tmp[i])%10);
                _tmp[i+1]='1';
            }
        }
        if(_tmp.length>1&&_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`additive calculation with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        this.digits=Uint8Array.from(_tmp);
        return this;
    }
    /**
     * __decrement `this` number by `1`__ \
     * _ignoring  initial sign_ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after decrementing
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #calcDec(){//TODO multi base
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
        this.digits=Uint8Array.from(_tmp.slice(0,(first+1)||1));
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
    #calcAdd(n){//TODO multi base
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
        this.digits=Uint8Array.from(_tmp);
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
    #calcSub(n){//TODO multi base
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
        for(let i=first;i>=0;i--){
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
        this.digits=Uint8Array.from(_tmp.slice(0,(first+1)||1));
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
    half(rounding='c'){//TODO multi base
        rounding=String(rounding);if(!/^(c|ceil|f|floor)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        if(this.digits.length===1&&this.digits[0]===0){return this;}
        /**@type {string[]} - array for temporary storage */
        let _tmp=['0'];
        if(!(this.digits.length===1&&this.digits[0]===1)){
            _tmp[this.digits.length-1]='0';
            for(let i=this.digits.length-1;i>0;i--){
                _tmp[i]=String(Number(_tmp[i])+(this.digits[i]>>>1));
                _tmp[i-1]=Boolean(this.digits[i]&1)?'5':'0';
            }
            _tmp[0]=String(Number(_tmp[0])+(this.digits[0]>>>1));
            for(;_tmp.length>1&&_tmp[_tmp.length-1]==='0';_tmp.pop());
        }
        this.digits=new Uint8Array(_tmp);
        switch(rounding){
            case'f':case"floor":return this;
            case'c':case"ceil":return Boolean(this.digits[0]&1)?this.inc():this;
            //~ here rounded is the same as ceil since it can only have `.5` as the final "carry" and thus would round up
        }
    }
    /**
     * __calculates double of `this` number__ \
     * _modifies the original_
     * @returns {BigIntType} `this` number after doubling
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    double(){//TODO multi base
        /**@type {string[]} - array for temporary storage */
        let _tmp=['0'],
            /**@type {number} - last calculation */
            z;
        for(let i=0;i<this.digits.length;i++){
            z=Number(_tmp[i])+(this.digits[i]<<1);
            _tmp[i]=String(z%10);
            _tmp[i+1]=z>=10?'1':'0';
        }
        if(_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`doubling would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
        this.digits=new Uint8Array(_tmp);
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
    div(n,rounding='r'){//TODO multi base
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        // dividend / divisor = quotient + remainder / divisor
        if((n.digits.length===1&&n.digits[0]===0)){throw new RangeError("[n] is 0");}
        if((this.digits.length===1&&this.digits[0]===0)||(n.digits.length===1&&n.digits[0]===1)){return n.sign?this:this.neg();}
        if(n.digits.length>1&&n.digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){this.times256ToThePowerOf(1-n.digits.length,rounding);}
        else if(this.copy().abs().smallerThan(n.copy().abs())){
            switch(rounding){
                case'c':case"ceil":this.digits=new Uint8Array([1]);break;
                case'f':case"floor":this.digits=new Uint8Array([0]);break;
                case'r':case"round":this.digits=new Uint8Array([n.biggerThan(this.copy().abs().double())?0:1]);break;
            }
        }else if(this.equalTo(n)){this.digits=new Uint8Array([1]);}
        else{
            /**@type {BigIntType} - rest */
            let r=this.copy().abs(),
                /**@type {BigIntType} - quotient */
                q=new BigIntType('0');
            for(;!(r.smallerThan(n));q.inc()){r.sub(n)};
            switch(rounding){
                case'c':case"ceil":this.digits=(r.digits.length===0&&r.digits[0]===0)?q.digits:q.inc().digits;break;
                case'f':case"floor":this.digits=q.digits;break;
                case'r':case"round":this.digits=r.double().smallerThan(q)?q.digits:((r.digits.length===0&&r.digits[0]===0)?q.digits:q.inc().digits);break;
            }
        }
        this.sign=!(this.sign^n.sign);
        return this;
    }
    /**
     * __multiplies `this` number with `10**x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding` in respect to base 10_ \
     * ( same as `number*10**x` but for base 10 )
     * @param {number} x - exponent - save integer
     * @param {string} rounding - how to round when digit-shifting right _default `'r'`_
     * + `'r'` or `"round"` auto rounds possible decimal places
     * + `'f'` or `"floor"` rounds down possible decimal places
     * + `'c'` or `"ceil"` rounds up possible decimal places
     * @returns {BigIntType} - `this` number after multiplication/digit-shifts
     * @throws {TypeError} - if `x` is not a save integer
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    #times10ToThePowerOf(x,rounding='r'){return this;}//TODO ?
    /**
     * __multiplies `this` number with `256**x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding` in respect to base 256_ \
     * ( same as `number*10**x` but for base 256 )
     * @param {number} x - exponent - save integer
     * @param {string} rounding - how to round when digit-shifting right _default `'r'`_
     * + `'r'` or `"round"` auto rounds possible decimal places
     * + `'f'` or `"floor"` rounds down possible decimal places
     * + `'c'` or `"ceil"` rounds up possible decimal places
     * @returns {BigIntType} - `this` number after multiplication/digit-shifts
     * @throws {TypeError} - if `x` is not a save integer
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    times256ToThePowerOf(x,rounding='r'){
        x=Number(x);if(!Number.isSafeInteger(x)){throw new TypeError("[x] is not a save integer");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[rounding] is not a valid option");}
        if(this.digits.length===1&&this.digits[0]===0){return this;}
        if(x>0){
            if(x+this.digits.length>BigIntType.MAX_SIZE){throw new RangeError(`[n] digit-shifts would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
            this.digits=new Uint8Array([...new Uint8Array(x),...this.digits]);
        }else if(x<0){
            x=Math.abs(x);
            if(x>=this.digits.length){
                switch(rounding){
                    case'c':case"ceil":this.digits=new Uint8Array([1]);break;
                    case'f':case"floor":this.digits=new Uint8Array([0]);break;
                    case'r':case"round":this.digits=new Uint8Array([x===this.digits.length?Number(this.digits[0]>=128):0]);break;
                }
            }else{
                this.digits=this.digits.slice(x);
                switch(rounding){
                    case'c':case"ceil":if(this.digits[x]!==0){this.#calcInc();}break;
                    case'r':case"round":if(this.digits[x]>=128){this.#calcInc();}break;
                }
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
        if(X.digits.length===1){return new BigIntType(String(X.digits[0]*Y.digits[0]),"256");}
        let Xh=new BigIntType('0'),Xl=new BigIntType('0'),
            Yh=new BigIntType('0'),Yl=new BigIntType('0');
        Xh.digits=X.digits.slice(Math.floor(X.digits.length*.5));Xl.digits=X.digits.slice(0,Math.floor(X.digits.length*.5));
        Yh.digits=Y.digits.slice(Math.floor(Y.digits.length*.5));Yl.digits=Y.digits.slice(0,Math.floor(Y.digits.length*.5));
        let [P1,P2,P3]=[
            BigIntType.#karazubaMul(Xh,Yh),
            BigIntType.#karazubaMul(Xl,Yl),
            Xh.copy().add(Xl).mul(Yh.copy().add(Yl))
        ];
        return P1.copy().times256ToThePowerOf(X.digits.length).add((P3.copy().sub(P1.copy().add(P2))).times256ToThePowerOf(Xh.digits.length)).add(P2);
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
        }else if(n.digits.length>1&&n.digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){
            if((n.digits.length-1)+this.digits.length>BigIntType.MAX_SIZE){throw new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`);}
            this.digits=new Uint8Array([...new Uint8Array(n.digits.length-1),...this.digits]);
        }else{
            /**@type {number} - length (a power of 2) for karazuba-algorithm-numbers */
            let len=1;
            for(;len<this.digits.length||len<n.digits.length;len*=2);
            /**@type {BigIntType[]} - padded numbers for karazuba-algorithm */
            let [X,Y]=new Array(2).fill(new BigIntType('0'));
            X.digits=new Uint8Array([...this.digits,...new Uint8Array(len-this.digits.length)]);
            Y.digits=new Uint8Array([...n.digits,...new Uint8Array(len-n.digits.length)]);
            try{this.digits=BigIntType.#karazubaMul(X,Y).digits;}
            catch(e){throw(e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE] (${BigIntType.MAX_SIZE})`):e;}
        }
        this.sign=this.sign===n.sign;
        return this;
    }
    // TODO ↓↓↓↓↓↓↓↓↓↓
    // TODO ↓↓↓↓↓↓↓↓↓↓
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
    modulo(n,type='e'){//TODO multi base
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(n.digits.length===1&&n.digits[0]===0){throw new RangeError("[n] cannot divide by 0");}
        if((this.digits.length===1&&this.digits[0]===0)||(n.digits.length===1&&n.digits[0]===1)){this.digits=new Uint8Array([0]);return this;}
        if(n.digits.length===1&&n.digits[0]===2){this.digits=new Uint8Array([this.digits[0]%2]);return this;}
        type=String(type);
        if(!/^(e|euclid|t|trunc|f|floor|c|ceil|r|round)$/.test(type)){throw new SyntaxError("[type] is not a valid option");}
        let[_A,_B]=[this.copy().abs(),n.copy().abs()];
        /**@type {BigIntType} - rest */
        let R;
        if(_A.smallerThan(_B)){R=_A}
        else if(_A.equalTo(_B)){R=new BigIntType('0');}
        else{
            for(;!(_A.smallerThan(_B));_A.sub(_B));
            R=_A;
        }
        switch(type){
            case'e':case"euclid":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(this.sign?R:_B.sub(R));break;
            case't':case"trunc":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(this.sign?R:R.neg());break;
            case'f':case"floor":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(n.sign?(this.sign?R:_B.sub(R)):(this.sign?R.sub(_B):R.neg()));break;
            case'c':case"ceil":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(n.sign?(this.sign?R.sub(_B):R.neg()):(this.sign?R:_B.sub(R)));break;
            case'r':case"round":(_obj=>{this.digits=_obj.digits;this.sign=_obj.sign;})(R.copy().sub(_B.copy().half('c')).sign?(this.sign?R.sub(_B):_B.sub(R)):(this.sign?R:R.neg()));break;
        }
        return this;
    }
    /* TODO's

        ! - new attribute "base" ?! usually 256 but for start and log could be 10 ~ instead for base10add / sub / etc methods ?!
        ! - _tmp array from string[] to Uint8Array !

        baseConvert method (private) from base [2/10/16/256] as [Uint8Array/string] to base [2/10/16/256] as [Uint8Array/string] (base 256 string = braille)

        numbers base to 256 - Uint8 [0-255]
        1234 base 10 → [4,3,2,1] base 10 !→ [210,4] base 256 (210+(4*256=1024))

        gcd(a,b) pow(n) root(n) maprange(n,min1,max1,min2,max2,limit?) toString(padLen?,padChar?,maxLen?)

        ( n-root(n,x) => pow(x,1/n) )

        log(x)(y)=z <-> (x^z=y) https://en.wikipedia.org/wiki/Logarithm#Change_of_base

        randomInt(min,max) algorithm?Math.random()?function*(x){yield x++;}?

        (；￢＿￢)

        <num_frac([a+(b/c)])>
            frac2decString => [PowerShell]> $b=1234;$c=5678;$n=3;'0.'+([string][math]::floor(($b*[math]::pow(10,$n))/$c)).PadLeft($n,'0') >> '0,217' :D ($n=number of decimal points)
            E PI sqrt2 ?! ~> e^() e^(()*PI) ...
            Trigenomitry: https://en.wikipedia.org/wiki/Trigonometric_functions
            Sine,Tangent,Secant https://upload.wikimedia.org/wikipedia/commons/e/ec/TrigFunctionDiagram.svg
            +arc-*,co-*,hyperbolic-*,arc-co-*,co-hyperbolic-*,arc-hyperbolic-*,arc-co-hyperbolic-*
            COS: https://wikimedia.org/api/rest_v1/media/math/render/svg/b81fe2f5f9ac74cbd88ec71d23baf9a1e39b8f04
            SIN: https://wikimedia.org/api/rest_v1/media/math/render/svg/2d12b4b66e58abfcf03c1f452658b85f662ce228
    */
}

new BigIntType('456')//=> [200,1]
.mul(new BigIntType('123'))//=> [123]
.log()//=> [67,2] → 56088 (base 10)
;

// TODO                     ↑
// TODO implement this to that
// TODO             ↓

// TODO maxLen for output strings !
// TODO typedarrays instead of string arrays
/**
 * __converts from base 10 to base 256__
 * @param {string} base10 - base 10 integer
 * @returns {Uint8Array} base 256 integer
 */
function decString2byte(base10='1'){// 360 digit base 10 string to 150 digit base 256 array in 3.125sec ~ not that bad
    //! /^(?:0|[1-9][0-9]*)$/
    /**@type {Uint8Array} - initial base 10 number (the ones place has the index 0)*/
    let n=new Uint8Array([...base10]).reverse();
    const removeLeadingZeros=
    /**
     * __removes (unnecessary) leading zeros from a number__
     * @param {Uint8Array} num - number
     * @returns {Uint8Array} - new number
     */
    num=>{
        /**@type {number} - index of first non-zero digit (from left)*/
        let first=num.length-1;
        for(;first>0&&num[first]===0;first--);
        return num.slice(0,first+1);
    },smallerThan=
    /**
     * __test if `a` is smaller than `b`__
     * @param {Uint8Array} a
     * @param {Uint8Array} b
     * @returns {boolean} `a < b`
     */
    (a,b)=>{
        if(a.length<b.length){return true;}
        if(a.length>b.length){return false;}
        for(let i=a.length-1;i>=0;i--){
            if(a[i]<b[i]){return true;}
            if(a[i]>b[i]){return false;}
        }
        return false;
    },sub=
    /**
     * __subtracts `b` from `a`__
     * @param {Uint8Array} a - minuend
     * @param {Uint8Array} b - subtrahend
     * @returns {Uint8Array} `a - b`
     */
    (a,b)=>{
        /**@type {number} - length of the longer number */
        const len=Math.max(a.length,b.length),
            /**
             * __makes the carry and returns new first-digit-index__
             * @param {Uint8Array} num - the number (original will be altered)
             * @param {number} i - current index
             * @param {number} first - current index of the first digit
             * @returns {number} new index for first digit
             */
            minusCarry=(num,i,first)=>{
                let j=1;
                while(num[i+j]===0){num[i+j++]=9;}
                num[i+j]--;
                if(num[i+j]===0&&i+j===first){first--;}
                return first;
            };
        /**@type {Uint8Array} - new number */
        let _tmp=new Uint8Array(len),
            /**@type {number} - last calculation */
            z,
            /**@type {number} - index of first digit */
            first=len-1;
        for(let i=first;i>=0;i--){
            z=((a[i]||0)-(b[i]||0));
            if(z===0){
                if(i===first){first--;}
                _tmp[i]=0;
            }else if(z<0){
                if(i===first){return new Uint8Array(1);}
                _tmp[i]=z+10;
                first=minusCarry(_tmp,i,first);
            }else{_tmp[i]=z;}
        }
        return removeLeadingZeros(_tmp);
    },add=
    /**
     * __adds `b` to `a`__
     * @param {Uint8Array} a - augend
     * @param {Uint8Array} b - addend
     * @returns {Uint8Array} `a + b`
     */
    (a,b)=>{
        /**@type {number} - length of the longer number */
        const len=Math.max(a.length,b.length);
        /**@type {Uint8Array} - new number */
        let _tmp=new Uint8Array(len+1),
            /**@type {number} - last calculation */
            z;
        for(let i=0;i<len;i++){
            z=(a[i]||0)+(b[i]||0)+_tmp[i];
            if(z>=10){
                _tmp[i]=z%10;
                _tmp[i+1]=1;
            }else{_tmp[i]=z;}
        }
        _tmp=removeLeadingZeros(_tmp);
        //! check max size
        return _tmp;
    },digitShiftLeft=
    /**
     * __shifts the digits of a number to the left__
     * @param {Uint8Array} a - initial number
     * @param {number} x - amount of digit shifts to the left - (positive only)
     * @returns {Uint8Array} `a * (base ** x)`
     */
    (a,x)=>{
        //! check max size
        return new Uint8Array([...new Uint8Array(x),...a]);
    },karazubaMul=
    /**
     * __multiplies `X` and `Y`__
     * @param {Uint8Array} X - first number
     * @param {Uint8Array} Y - second number
     * @description __[!]__ `X` and `Y` must be the same length and that length must be a power of 2 _(end-padded with `'0'`)_ __[!]__
     * @returns {Uint8Array} `X * Y`
     */
    (X,Y)=>{
        if(X.every(v=>v===0)||Y.every(v=>v===0)){return new Uint8Array([0]);}
        if(X.length===1){return new Uint8Array([...String(X[0]*Y[0])]).reverse();}
        let [Xh,Xl,Yh,Yl]=[
            X.slice(Math.floor(X.length*.5)),X.slice(0,Math.floor(X.length*.5)),
            Y.slice(Math.floor(Y.length*.5)),Y.slice(0,Math.floor(Y.length*.5))
        ];
        let [P1,P2,P3]=[
            karazubaMul(Xh,Yh),
            karazubaMul(Xl,Yl),
            mul(add(Xh,Xl),add(Yh,Yl))
        ];
        //~ X * Y == (P1 * b**(2*n)) + (P3 - (P1 + P2)) * b**n + P2 | **=power b=base n=digit-length of Xh/Yh/Xl/Yl or half of X/Y
        return add(add(digitShiftLeft(P1,X.length),digitShiftLeft(sub(P3,add(P1,P2)),Xh.length)),P2);
    },mul=
    /**
     * __multiplies two numbers__ \
     * _using karazubas multiplication algorithm_
     * @param {Uint8Array} a - number
     * @param {Uint8Array} b - number
     * @returns {Uint8Array} `a * b`
     */
    (a,b)=>{
        /**@type {number} - power of 2 for pading `a` and `b` to a length that's a power of 2 */
        const len=(()=>{let n=1;for(;n<Math.max(a.length,b.length);n*=2);return n;})();
        /**@type {Uint8Array} - new number */
        let _tmp=karazubaMul(
            new Uint8Array([...a,...new Uint8Array(len-a.length)]),
            new Uint8Array([...b,...new Uint8Array(len-b.length)])
        );
        //! check max size
        return _tmp;
    },pow256=
    /**
     * __make 256 to the power of x__
     * @param {number} exp - exponent
     * @returns {Uint8Array} `256 ** x`
     */
    exp=>{
        /**@type {Uint8Array} - starting base (256) */
        let base=new Uint8Array([6,5,2]),
            /**@type {Uint8Array} - new number */
            _tmp=new Uint8Array([1]);
        if(exp%2){_tmp=mul(_tmp,base);}
        exp=Math.floor(exp*.5);
        while(exp!==0){
            base=mul(base,base);
            if(exp%2){_tmp=mul(base,_tmp);}
            exp=Math.floor(exp*.5);
        }
        return _tmp;
    };
    /**@type {Uint8Array} - const 256 - base 10 - the ones place has the index 0 */
    const base256=new Uint8Array([6,5,2]);
    /**@type {number} - exponent for _tmp */
    let exp=1,
        /**@type {Uint8Array} - power of 256 */
        _tmp=base256.slice();
    for(;smallerThan(_tmp,n);_tmp=mul(_tmp,base256)){exp++;}
    /**@type {Uint8Array} - final base 256 number */
    let bytenum=new Uint8Array(exp);
    for(_tmp=pow256(--exp);exp>0;_tmp=pow256(--exp)){for(;!smallerThan(n,_tmp);n=sub(n,_tmp)){bytenum[exp]++;}}
    bytenum[0]=Number(n.reverse().join(''));
    return bytenum;
}
/**
 * __converts from base 256 to base 10__
 * @param {Uint8Array} bytenum - base 256 integer
 * @returns {string} - base 10 (decimal) integer (string)
 */
function byte2decString(bytenum){
    //! arrayLike ~ Uint8Array
    // TODO
    // mul/karazuba & add & pow256
    // bytenum forEach bytechar decnum=add(decnum,mul(bytechar,pow256(i)))
}
/**
 * __converts from base 256 to base 16__
 * @param {Uint8Array} bytenum - base 256 integer
 * @returns {string} - base 16 (hexadecimal) integer (string)
 */
function byte2hexString(bytenum){
    //! arrayLike ~ Uint8Array
    let out='';
    for(let i=bytenum.length-1;i>=0;i--){out+=bytenum[i].toString(16).toUpperCase().padStart(2,'0');}
    return out;
}
/**
 * __converts from base 256 to base 2__
 * @param {Uint8Array} bytenum - base 256 integer
 * @returns {string} - base 2 (binary) integer (string)
 */
function byte2binString(bytenum){
    //! arrayLike ~ Uint8Array
    let out='';
    for(let i=bytenum.length-1;i>=0;i--){out+=bytenum[i].toString(2).padStart(8,'0');}
    return out;
}
/**
 * __converts from base 256 to braille string__
 * @param {Uint8Array} bytenum - base 256 integer
 * @returns {string} - braille pattern string (base 256 char)
 */
function byte2brailleString(bytenum){
    //! arrayLike ~ Uint8Array
    let out='';
    for(let i=bytenum.length-1;i>=0;i--){out+=String.fromCharCode(10240+bytenum[i]);}
    return out;
}
/**
 * __converts from braille string to base 256 number__
 * @param {string} braillestring - braille pattern string (base 256 char)
 * @returns {Uint8Array} - base 256 integer
 */
function brailleString2byte(braillestring){
    //! /^[\u2800-\u28ff]+$/
    let bytenum=new Uint8Array(braillestring.length);
    for(let i=0;i<bytenum.length;i++){bytenum[i]=braillestring.charCodeAt((braillestring.length-1)-i)-10240;}
    return bytenum;
}
/**
 * __converts from base 16 to base 256__
 * @param {string} hexstring - base 16 (hexadecimal) integer (string)
 * @returns {Uint8Array} - base 256 integer
 */
function hexString2byte(hexstring){
    //! /^[0-9A-F]+$/
    if(hexstring.length%2){hexstring='0'+hexstring;}
    let bytenum=new Uint8Array(Math.floor(hexstring.length*.5));
    for(let i=hexstring.length,j=0;i>0;i-=2){bytenum[j++]=Number.parseInt(hexstring.substring(i-2,i),16);}
    return bytenum;
}
/**
 * __converts from base 2 to base 256__
 * @param {string} binstring - base 2 (binary) integer (string)
 * @returns {Uint8Array} - base 256 integer
 */
function binString2byte(binstring){
    //! /^[01]+$/
    if(binstring.length%8>0){binstring='0'.repeat(8-(binstring.length%8))+binstring;}
    let bytenum=new Uint8Array(Math.floor(binstring.length/8));
    for(let i=binstring.length,j=0;i>0;i-=8){bytenum[j++]=Number.parseInt(binstring.substring(i-8,i),2);}
    return bytenum;
}
/**
 * __byte number bitshift right / half__
 * @param {Uint8Array} bytenum - base 256 integer
 * @param {boolean} round - if `true` auto rounds number - default `false` → floored
 * @returns {Uint8Array} bytenum after shifting
 */
function byteBitshiftR(bytenum,round=false){
    let odd=Boolean(bytenum[0]&1);
    for(let i=0;i<bytenum.length-1;i++){
        bytenum[i]>>>=1;
        if(bytenum[i+1]&1){bytenum[i]|=128;}
    }
    bytenum[bytenum.length-1]>>>=1;
    if(round&&odd){
        let i=0;
        for(;bytenum[i]===255;bytenum[i++]=0);
        if(i===bytenum.length){bytenum=new Uint8Array([...bytenum,1]);}
        else{bytenum[i]+=1;}
    }
    if(bytenum[bytenum.length-1]===0){bytenum=bytenum.slice(0,bytenum.length-1);}
    return bytenum;
}
/**
 * __byte number bitshift left / double__
 * @param {Uint8Array} bytenum - base 256 integer
 * @returns {Uint8Array} bytenum after shifting
 */
function byteBitshiftL(bytenum){
    let overflow=Boolean(bytenum[bytenum.length-1]&128);
    for(let i=bytenum.length-1;i>0;i--){
        bytenum[i]<<=1;
        if(bytenum[i-1]&128){bytenum[i]|=1;}
    }
    bytenum[0]<<=1;
    if(overflow){bytenum=new Uint8Array([...bytenum,1]);}
    return bytenum;
}
let n="123456789";
let a=decString2byte(n);
console.log(
    "number: %s\nbyte: %s\nchars: %O\nhex: %s\nbin: %s\nhalf: %s\ndouble: %s\n%s",
    n,
    a.slice().reverse().join(' '),
    byte2brailleString(a),
    byte2hexString(a),
    byte2binString(a),
    byteBitshiftR(a.slice()).reverse().join(' '),
    byteBitshiftL(a.slice()).reverse().join(' '),
    byte2brailleString(hexString2byte("6747EF41C740C740CF470000B9016747EF415F85EF41"))
);
