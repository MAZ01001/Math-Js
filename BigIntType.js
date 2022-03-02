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
            706 910 949 375 in base 10 which is 1205 digits (2.41 times longer)
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
        16:/^([+-]?)(0|[1-9A-F][0-9A-F]*)$/i,
        256:/^([+-]?)(\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)$/u
    });
    /**@type {boolean} - sign of the number - `true` = positive */
    #sign=true;
    /**@returns {boolean} sign of the number - `true` = positive */
    get sign(){return this.#sign;}
    /**@type {Uint8Array} - the number as unsigned 8bit integer array (base 256) - index 0 is the 0st-digit of the number */
    #digits=new Uint8Array(1);
    /**
     * @returns {Uint8Array} a copy of the digits as an unsigned 8bit integer array (base 256) - index 0 is the 0st-digit of the number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    get digits(){return this.#digits.slice();}
    /**
     * @returns {BigIntType} biggest possible number according to `MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get MAX_VALUE(){return new BigIntType(new Uint8Array(BigIntType.MAX_SIZE).fill(255),"256");}
    /**
     * __print as Braille string to see why this is funny__
     * @returns {BigIntType} some random funny number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get HelloThere(){return new BigIntType(new Uint8Array([0,1,0,0,0,1,0,0,1,3,0,0,0,1,0,1,0,1,0,1,0,0]),"256");}
    /**
     * __constructs a BigIntType number__
     * @param {string|boolean[]|Uint8Array} num - an integer - _default `'1'`_
     * + + ( in arrays the number is unsigned and index 0 = 0th-place-digit for example: `"1230"` → `[0,3,2,1]` )
     * + + ( if `num` is an Uint8Array and `base` 256 then the original Uint8Array will be used )
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
    constructor(num='1',base='d'){
        this.#sign=true;
        if(num==='0'||num==='\u2800'||(num.length===1&&(num[0]===0||num[0]===false))){this.#digits=new Uint8Array(1);return;}
        if(num==='1'||num==='\u2801'||(num.length===1&&(num[0]===1||num[0]===true))){this.#digits=new Uint8Array([1]);return;}
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
                this.#digits=new Uint8Array(Math.ceil(num.length/8));
                for(let i=0;i<this.#digits.length;i++){this.#digits[i]=Number.parseInt(num.slice(i*8,(i+1)*8).reverse().join(''),2);}
                break;
            case 10:
                if(!(num.every(v=>v>=0&&v<10))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 10");}
                num=Array.from(num,String);
                /**@type {string[]} - digits for base 256*/
                let b256=[];
                for(;BigIntType.#base10.greaterOrEqual256(num);){
                    b256.push('0');
                    for(let i=0;i<8;i++){
                        if(Number(num[0])&1){b256[b256.length-1]=String(Number(b256[b256.length-1])+(1<<i));}
                        BigIntType.#base10.half(num);
                    }
                }
                b256.push(num.reverse().join(''));
                this.#digits=new Uint8Array(b256);
                break;
            case 16:
                if(!(num.every(v=>v>=0&&v<16))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 16");}
                this.#digits=new Uint8Array(Math.floor(num.length/2));
                for(let i=0;i<this.#digits.length;i++){this.#digits[i]=Number.parseInt(num.slice(i*2,(i+1)*2).reverse().join(''),2);}
                break;
            case 256:
                if(!(num.every(v=>v>=0&&v<256))){throw new SyntaxError("[num] (Uint8Array) has incorrect values for base 256");}
                this.#digits=num;
                break;
        }
        this.#sign=_sign;
        if(this.#digits.length>BigIntType.MAX_SIZE){throw new RangeError(`[num] new number is longer than [MAX_SIZE]`);}
    }
    /**
     * __logs number as hex string to console and returns itself (`this`)__
     * @param {number} maxLen - max digits to display - _default `100`_
     * + `0`=`digits.length`
     * + auto clamps to `1`-`digits.length`
     * + start is left (`123#####`)
     * + shows how many more digits there would have been (`123.. (+5 digit/s)`)
     * @returns {BigIntType} `this` with no changes
     * @throws {TypeError} - if `maxLen` is not a save integer
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    log(maxLen=100){
        maxLen=Number(maxLen);if(!Number.isSafeInteger(maxLen)){throw new TypeError("[maxlen] is not a save integer");}
        if(maxLen>this.#digits.length||maxLen===0){maxLen=this.#digits.length;}
        else if(maxLen<1){maxLen=1;}
        console.log(
            "[%i]: (total %i digit/s) %s%s%s",
            Date.now(),
            this.#digits.length,
            this.#sign?'+':'-',
            Array.from(this.#digits.slice(-maxLen).reverse(),v=>v.toString(16).toUpperCase().padStart(2,'0')).join(' '),
            maxLen<this.#digits.length?`.. (+${this.#digits.length-maxLen} digit/s)`:''
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
            n.#sign=this.sign;
            return n;
        })(new BigIntType(this.digits,"256"));
    }
    /**
     * __set `this` number equal to `n`__
     * @param {BigIntType} n - number to set equal to (copy values from)
     * @returns {BigIntType} `this = n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    setEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        this.#digits=n.digits;
        this.#sign=n.sign;
        return this;
    }
    /**
     * __sets `this` sign positive__
     * @returns {BigIntType} `this` number
     */
    abs(){this.#sign=true;return this;}
    /**
     * __negates/invertes `this` sign__
     * @returns {BigIntType} `this` number
     */
    neg(){this.#sign=!this.#sign;return this;}
    /**
     * __determines if `this` number is odd__
     * @returns {boolean} `this % 2 === 1`
     */
    isOdd(){return Boolean(this.#digits[0]&1);}
    /**
     * __determines if `this` number is even__
     * @returns {boolean} `this % 2 === 0`
     */
    isEven(){return !this.isOdd();}
    /**
     * __determines if `this` number is equal to 0__
     * @returns {boolean} `this === 0`
     */
    isZero(){return(this.#digits.length===0&&this.#digits[0]===0);}
    /**
     * __determines if `this` number is equal to 1__
     * @returns {boolean} `this === 1`
     */
    isOne(){return(this.#digits.length===0&&this.#digits[0]===1);}
    /**
     * __determines if `this` number is smaller than `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this < n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(!this.#sign&&n.#sign){return true;}
        if(this.#sign&&!n.#sign){return false;}
        if(this.#sign){
            if(this.#digits.length<n.#digits.length){return true;}
            if(this.#digits.length>n.#digits.length){return false;}
            for(let i=this.#digits.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i]){return true;}
                if(this.#digits[i]>n.#digits[i]){return false;}
            }
            return false;
        }else{
            if(this.#digits.length>n.#digits.length){return true;}
            if(this.#digits.length<n.#digits.length){return false;}
            for(let i=this.#digits.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i]){return true;}
                if(this.#digits[i]<n.#digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is bigger than `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this > n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isBiggerThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.#sign&&!n.#sign){return true;}
        if(!this.#sign&&n.#sign){return false;}
        if(this.#sign){
            if(this.#digits.length>n.#digits.length){return true;}
            if(this.#digits.length<n.#digits.length){return false;}
            for(let i=this.#digits.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i]){return true;}
                if(this.#digits[i]<n.#digits[i]){return false;}
            }
            return false;
        }else{
            if(this.#digits.length<n.#digits.length){return true;}
            if(this.#digits.length>n.#digits.length){return false;}
            for(let i=this.#digits.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i]){return true;}
                if(this.#digits[i]>n.#digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this == n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(this.#sign!==n.#sign){return false;}
        if(this.#digits.length!==n.#digits.length){return false;}
        return this.#digits.every((value,index)=>value===n.#digits[index]);
    }
    /**
     * __determines if `this` number is bigger or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this >= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isBiggerOrEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        return !(this.isSmallerThan(n));
    }
    /**
     * __determines if `this` number is smaller or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this <= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerOrEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        return !(this.isBiggerThan(n));
    }
    /**
     * __removes (unnecessary) leading zeros from `digits`__
     * @param {string[]} digits - digits-array (original will be altered)
     * @returns {string[]} `digits` after removing all leading zeros
     */
    static #removeLeadingZeros(digits){
        /**@type {number} - index of first non-zero digit (from left)*/
        let first=digits.length-1;
        for(;first>0&&digits[first]==='0';first--);
        digits.splice(first+1);
        return digits;
    }
    /**@description __functions specifically for the conversion from base 10 to base 256__ */
    static #base10=Object.freeze({
        greaterOrEqual256:
        /**
         * __check if `A` is greater than or equal to 256__ \
         * specifically for conversion from base 10 to base 256
         * @param {string[]} A - first number
         * @returns {boolean} `A >= 256` (base 10)
         */
        (A)=>{
            if(A.length<3){return false;}
            if(A.length>3){return true;}
            if(A[2]<2){return false;}
            if(A[2]>2){return true;}
            if(A[1]<5){return false;}
            if(A[1]>5){return true;}
            if(A[0]<6){return false;}
            if(A[0]>6){return true;}
            return true;
        },
        half:
        /**
         * __halfs `A` (floored)__
         * @param {string[]} A - number (original will be altered)
         */
        (A)=>{
            if(A.length===1){
                if(A[0]==='0'){return;}
                if(A[0]==='1'){A[0]='0';return;}
            }
            A[0]=String(Number(A[0])>>1);
            for(let i=1;i<A.length;i++){
                if(Number(A[i])&1){A[i-1]=String(Number(A[i-1])+5);}
                A[i]=String(Number(A[i])>>1);
            }
            if(A[A.length-1]==='0'){A.splice(-1,1);}
            return;
        }
    });
    /**
     * __applies the negative carry and returns new first-digit-index__ \
     * _used in `#calcDec()` and `#calcSub()`_ \
     * does not remove leading zeros
     * @param {string[]} digits - digits-array (original will be altered)
     * @param {number} i - current index
     * @param {number} first - current index of the first digit
     * @returns {number} new index for first digit
     */
    static #minusCarry(digits,i,first){
        let j=1;
        for(;digits[i+j]==='0';digits[i+j++]="255");
        digits[i+j]=String(Number(digits[i+j])-1);
        return(digits[i+j]==='0'&&i+j===first)?--first:first;
    }
    /**
     * __increment `digits` once__ \
     * _ignoring  initial sign_ \
     * does not remove leading zeros
     * @param {string[]} digits - digits-array (original will be altered)
     * @returns {string[]} digits-array after incrementing
     */
    static #calcInc(digits){
        digits[0]=String(Number(digits[0])+1);
        for(let i=0;i<digits.length;i++){
            if(Number(digits[i])>=256){
                digits[i]=String(Number(digits[i])%256);
                digits[i+1]='1';
            }else{break;}
        }
        return digits;
    }
    /**
     * __decrement `this` number by `1`__ \
     * _ignoring  initial sign_ \
     * does not remove leading zeros
     * @param {string[]} digits - digits-array (original will be altered)
     * @returns {Readonly<{sign:boolean;digits:string[]}>} `digits` and sign after decrementing
     */
    static #calcDec(digits){
        /**@type {boolean} - sign for digits */
        let sign=true;
        digits[0]=String(Number(digits[0])-1);
        if(digits[0]==="-1"){
            if(digits.length===1){
                sign=false;
                digits[0]='1';
            }else{
                digits[0]='255';
                BigIntType.#minusCarry(digits,0,digits.length-1);
            }
        }
        return Object.freeze({sign:sign,digits:digits});
    }
    /**
     * __increments `this` number once__ \
     * _modifies the original_
     * @returns {BigIntType} `++ this`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    inc(){
        /**@type {string[]} - digits-array */
        let _tmp=Array.from(this.#digits,String);
        if(this.#sign){this.#digits=new Uint8Array(BigIntType.#removeLeadingZeros(BigIntType.#calcInc(_tmp)));}
        else{
            (({sign,digits})=>{
                this.#digits=new Uint8Array(BigIntType.#removeLeadingZeros(digits));
                this.#sign=!sign;
            })(BigIntType.#calcDec(_tmp));
        }
        if(this.#digits.length>BigIntType.MAX_SIZE){throw new RangeError("[inc] would result in a number longer than MAX_SIZE");}
        return this;
    }
    /**
     * __decrements `this` number once__ \
     * _modifies the original_
     * @returns {BigIntType} `-- this`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    dec(){
        /**@type {string[]} - digits-array */
        let _tmp=Array.from(this.#digits,String);
        if(this.#sign){
            (({sign,digits})=>{
                this.#digits=new Uint8Array(BigIntType.#removeLeadingZeros(digits));
                this.#sign=sign;
            })(BigIntType.#calcDec(_tmp));
        }else{this.#digits=new Uint8Array(BigIntType.#removeLeadingZeros(BigIntType.#calcInc(_tmp)));}
        if(this.#digits.length>BigIntType.MAX_SIZE){throw new RangeError("[dec] would result in a number longer than MAX_SIZE");}
        return this;
    }
    /**
     * __adds two numbers together__ \
     * _ignoring initial sign_ \
     * does not remove leading zeros
     * @param {string[]} A - first addend digits-array (original will be altered)
     * @param {string[]} B - second addend digits-array
     * @returns {string[]} `A + B` (modified `A`)
     */
    static #calcAdd(A,B){
        /**@type {number} - length of the longer array */
        const len=Math.max(A.length,B.length);
        for(let i=0;i<len;i++){
            A[i]=String(Number(A[i]||0)+Number(B[i]||0));
            if(Number(A[i])>255){
                A[i]=String(Number(A[i])%256);
                A[i+1]='1';
            }
        }
        return A;
    }
    /**
     * __subtracts two numbers from one another__ \
     * _ignoring initial sign_ \
     * does not remove leading zeros
     * @param {string[]} A - minuend digits-array (original will be altered)
     * @param {string[]} B - subtrahend digits-array
     * @returns {Readonly<{sign:boolean;digits:string[]}>} `A - B` (modified `A` with sign)
     */
    static #calcSub(A,B){
        /**@type {number} - length of the longer number */
        const len=Math.max(A.length,B.length);
        /**@type {number} - current index of the first digit */
        let first=len-1,
            /**@type {boolean} - current sign of number */
            sign=true;
        for(let i=first;i>=0;i--){
            A[i]=String(Number(A[i]||0)-Number(B[i]||0));
            if(A[i]==='0'){
                if(i===first){first--;}
            }else if(A[i][0]==='-'){//~ <0
                if(!sign){A[i]=A[i].substring(1);}//~ abs()
                else if(i===first){
                    sign=false;
                    A[i]=A[i].substring(1);//~ abs()
                }else{
                    A[i]=String(Number(A[i])+256);
                    first=BigIntType.#minusCarry(A,i,first);
                }
            }else if(!sign){
                A[i]=String(Math.abs(Number(A[i])-256));
                first=BigIntType.#minusCarry(A,i,first);
            }
        }
        return Object.freeze({sign:sign,digits:A});
    }
    /**
     * __adds another number to `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for addition
     * @returns {BigIntType} `this + n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    add(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[add] n is not an instance of BigIntType");}
        let [A,B]=[Array.from(this.#digits,String),Array.from(n.#digits,String)];
        if(this.#sign===n.#sign){//~ (+)+(+) || (-)+(-)
            BigIntType.#calcAdd(A,B);
            BigIntType.#removeLeadingZeros(A);
            if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
            this.#digits=new Uint8Array(A);
        }else{
            if(this.#sign){//~ (+)+(-)
                this.#sign=BigIntType.#calcSub(A,B).sign;
                BigIntType.#removeLeadingZeros(A);
                if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
                this.#digits=new Uint8Array(A);
            }else{//~ (-)+(+)
                this.#sign=BigIntType.#calcSub(B,A).sign;
                BigIntType.#removeLeadingZeros(B);
                if(B.length>BigIntType.MAX_SIZE){throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
                this.#digits=new Uint8Array(B);
            }
        }
        return this;
    }
    /**
     * __subtracts another number from `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - second number for subtraction (subtrahend)
     * @returns {BigIntType} `this - n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    sub(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[sub] n is not an instance of BigIntType");}
        let [A,B]=[Array.from(this.#digits,String),Array.from(n.#digits,String)];
        if(this.#sign!==n.#sign){//~ (+)-(-) || (-)-(+)
            BigIntType.#calcAdd(A,B);
            BigIntType.#removeLeadingZeros(A);
            if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
            this.#digits=new Uint8Array(A);
        }else{
            if(this.#sign){//~ (+)-(+)
                this.#sign=BigIntType.#calcSub(A,B).sign;
                BigIntType.#removeLeadingZeros(A);
                if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
                this.#digits=new Uint8Array(A);
            }else{//~ (-)-(-)
                this.#sign=BigIntType.#calcSub(B,A).sign;
                BigIntType.#removeLeadingZeros(B);
                if(B.length>BigIntType.MAX_SIZE){throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
                this.#digits=new Uint8Array(B);
            }
        }
        return this;
    }
    /**
     * __multiplies `this` number with 256 to the power of `x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding` in respect to base 256_
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
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[times256ToThePowerOf] rounding is not a valid option");}
        if(this.isZero()){return this;}
        if(x>0){
            if(x+this.#digits.length>BigIntType.MAX_SIZE){throw new RangeError(`[times256ToThePowerOf] n digit-shifts would result in a number longer than MAX_SIZE`);}
            this.#digits=new Uint8Array([...new Uint8Array(x),...this.#digits]);
        }else if(x<0){
            x=Math.abs(x);
            if(x>=this.#digits.length){
                switch(rounding){
                    case'c':case"ceil":this.#digits=new Uint8Array([1]);break;
                    case'f':case"floor":this.#digits=new Uint8Array([0]);break;
                    case'r':case"round":this.#digits=new Uint8Array([x===this.#digits.length?Number(this.#digits[0]>=128):0]);break;
                }
            }else{
                this.#digits=this.#digits.slice(x);
                switch(rounding){
                    case'c':case"ceil":if(this.#digits[x]!==0){this.#calcInc();}break;
                    case'r':case"round":if(this.#digits[x]>=128){this.#calcInc();}break;
                }
            }
        }
        return this;
    }
    //TODO ↓ base 256 & string[] for #calc !static now! also change error/throw behavior (see above)
    bitshiftR(x=1){
        x=Number(x);if(!Number.isSafeInteger(x)){throw new Error("[bitshiftR] x is not a save integer");}
        let digitshifts=Math.floor(x/8);
        x=x%8 // [this] >>> x
        // TODO
    }
    /**
     * __calculates half of `this` number__ \
     * _modifies the original_
     * @param {string} rounding - _default `'c'`_
     * + `'c'` or `"ceil"` for rounding up the result
     * + `'f'` or `"floor"` for rounding down the result
     * @returns {BigIntType} `this / 2` (`this` modified)
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    half(rounding='c'){//? done
        rounding=String(rounding);if(!/^(c|ceil|f|floor)$/.test(rounding)){throw new SyntaxError("[half] rounding is not a valid option");}
        if(this.#digits.length===1&&this.#digits[0]===0){return this;}
        // TODO bitshiftR(1) ?rounding
        if(this.isOdd()&&(rounding==='c'||rounding==="ceil")){return this.bitshiftR(1).inc();}
        else{return this.bitshiftR(1)}
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
        let _tmp=['0'],
            /**@type {number} - last calculation */
            z;
        for(let i=0;i<this.#digits.length;i++){
            z=Number(_tmp[i])+(this.#digits[i]<<1);
            _tmp[i]=String(z%10);
            _tmp[i+1]=z>=10?'1':'0';
        }
        if(_tmp[_tmp.length-1]==='0'){_tmp.pop();}
        if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError(`doubling would result in a number longer than [MAX_SIZE]`);}
        this.#digits=new Uint8Array(_tmp);
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
        if((n.#digits.length===1&&n.#digits[0]===0)){throw new RangeError("[n] is 0");}
        if((this.#digits.length===1&&this.#digits[0]===0)||(n.#digits.length===1&&n.#digits[0]===1)){return n.#sign?this:this.neg();}
        if(n.#digits.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){this.times256ToThePowerOf(1-n.#digits.length,rounding);}
        else if(this.copy().abs().isSmallerThan(n.copy().abs())){
            switch(rounding){
                case'c':case"ceil":this.#digits=new Uint8Array([1]);break;
                case'f':case"floor":this.#digits=new Uint8Array([0]);break;
                case'r':case"round":this.#digits=new Uint8Array([n.isBiggerThan(this.copy().abs().double())?0:1]);break;
            }
        }else if(this.isEqualTo(n)){this.#digits=new Uint8Array([1]);}
        else{
            /**@type {BigIntType} - rest */
            let r=this.copy().abs(),
                /**@type {BigIntType} - quotient */
                q=new BigIntType('0');
            for(;!(r.isSmallerThan(n));q.inc()){r.sub(n)};
            switch(rounding){
                case'c':case"ceil":this.#digits=(r.#digits.length===0&&r.#digits[0]===0)?q.#digits:q.inc().#digits;break;
                case'f':case"floor":this.#digits=q.#digits;break;
                case'r':case"round":this.#digits=r.double().isSmallerThan(q)?q.#digits:((r.#digits.length===0&&r.#digits[0]===0)?q.#digits:q.inc().#digits);break;
            }
        }
        this.#sign=!(this.#sign^n.#sign);
        return this;
    }
    /**
     * __Karazubas Multiplication Algorithm__ \
     * _with recursion_ \
     * for `BigIntType.mul`
     * @param {BigIntType} X - number for multiplication
     * @param {BigIntType} Y - number for multiplication
     * @description [!!] `X` and `Y` must be of same length and the length must be a power of 2 (pad end with `0` if needed)
     * @returns {BigIntType} result of `X`*`Y`
     * @throws {TypeError} - if `X` or `Y` are not instances of `BigIntType`
     * @throws {RangeError} - if some number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static #karazubaMul(X,Y){
        if(!(X instanceof BigIntType)){throw new TypeError("[X] is not an instance of BigIntType");}
        if(!(Y instanceof BigIntType)){throw new TypeError("[Y] is not an instance of BigIntType");}
        if(X.#digits.every(v=>v===0)||Y.#digits.every(v=>v===0)){return new BigIntType('0');}
        //~ assume here that`X` and `Y` are of same length and the length is a power of 2
        if(X.#digits.length===1){
            if(X.#digits[0]===1&&Y.#digits[0]===1){return new BigIntType('1');}
            else if(X.#digits[0]===1){return new BigIntType(Y.#digits.slice(),"256");}
            else if(Y.#digits[0]===1){return new BigIntType(X.#digits.slice(),"256");}
            else if(Y.#digits[0]===2){return X.copy().double();}
            else if(X.#digits[0]===2){return Y.copy().double();}
            else{
                const A=X.#digits[0]*Y.#digits[0];
                return new BigIntType(new Uint8Array([A%256,Math.floor(A/256)]),"256");
            }
        }
        let Xh=new BigIntType('0'),Xl=new BigIntType('0'),
            Yh=new BigIntType('0'),Yl=new BigIntType('0');
        Xh.#digits=X.#digits.slice(Math.floor(X.#digits.length*.5));Xl.#digits=X.#digits.slice(0,Math.floor(X.#digits.length*.5));
        Yh.#digits=Y.#digits.slice(Math.floor(Y.#digits.length*.5));Yl.#digits=Y.#digits.slice(0,Math.floor(Y.#digits.length*.5));
        let [P1,P2,P3]=[
            BigIntType.#karazubaMul(Xh,Yh),
            BigIntType.#karazubaMul(Xl,Yl),
            Xh.copy().add(Xl).mul(Yh.copy().add(Yl))
        ];
        return P1.copy().times256ToThePowerOf(X.#digits.length).add((P3.copy().sub(P1.copy().add(P2))).times256ToThePowerOf(Xh.#digits.length)).add(P2);
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
        if(
            this.#digits.length===1&&this.#digits[0]===1&&
            n.#digits.length===1&&n.#digits[0]===1
        );
        else if(this.#digits.length===1&&this.#digits[0]===1){this.#digits=n.#digits.slice();}
        else if(n.#digits.length===1&&n.#digits[0]===1);
        else if(n.#digits.length===1&&n.#digits[0]===2){
            try{this.double();}
            catch(e){throw (e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE]`):e;}
        }else if(this.#digits.length===1&&this.#digits[0]===2){
            try{this.#digits=n.copy().double().#digits;}
            catch(e){throw (e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE]`):e;}
        }else if(n.#digits.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){
            if((n.#digits.length-1)+this.#digits.length>BigIntType.MAX_SIZE){throw new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE]`);}
            this.times256ToThePowerOf(n.#digits.length-1,'f');
        }else{
            /**@type {number} - length (a power of 2) for karazuba-algorithm-numbers */
            let len=1;
            for(;len<this.#digits.length||len<n.#digits.length;len*=2);
            /**@type {BigIntType[]} - padded numbers for karazuba-algorithm */
            let [X,Y]=new Array(2).fill(new BigIntType('0'));
            X.#digits=new Uint8Array([...this.#digits,...new Uint8Array(len-this.#digits.length)]);
            Y.#digits=new Uint8Array([...n.#digits,...new Uint8Array(len-n.#digits.length)]);
            try{this.#digits=BigIntType.#karazubaMul(X,Y).#digits;}
            catch(e){throw(e instanceof RangeError)?new RangeError(`multiplication with [n] would result in a number longer than [MAX_SIZE]`):e;}
        }
        this.#sign=this.#sign===n.#sign;
        return this;
    }
    // TODO ↓↓↓↓↓↓↓↓↓↓
    // TODO ↓↓↓↓↓↓↓↓↓↓
    #_pow(n){
        let result=new BigIntType('1'),
            exp=n.copy();
        for(;;){
            if(exp.#digits[0]&1){result.mul(this);}
            exp.half('f');
            if(exp.#digits.length===1&&exp.#digits[0]===0){break;}
            this.mul(this);
        }
        this.#digits=result.#digits;
        this.#sign=result.#sign;
        return this;
        //~ // num = 256**exp
        //~ /**@type {Uint8Array} - starting base (256) */
        //~ let base=new Uint8Array([6,5,2]),
        //~     /**@type {Uint8Array} - new number */
        //~     num=new Uint8Array([1]);
        //~ if(exp%2){num=BigIntType.#base10.mul(num,base);}
        //~ exp=Math.floor(exp*.5);
        //~ while(exp!==0){
        //~     base=BigIntType.#base10.mul(base,base);
        //~     if(exp%2){num=BigIntType.#base10.mul(num,base);}
        //~     exp=Math.floor(exp*.5);
        //~ }
        //~ return num;
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
    modulo(n,type='e'){//TODO base 256
        if(!(n instanceof BigIntType)){throw new TypeError("[n] is not an instance of BigIntType");}
        if(n.#digits.length===1&&n.#digits[0]===0){throw new RangeError("[n] cannot divide by 0");}
        if((this.#digits.length===1&&this.#digits[0]===0)||(n.#digits.length===1&&n.#digits[0]===1)){this.#digits=new Uint8Array([0]);return this;}
        if(n.#digits.length===1&&n.#digits[0]===2){this.#digits=new Uint8Array([this.#digits[0]%2]);return this;}
        type=String(type);
        if(!/^(e|euclid|t|trunc|f|floor|c|ceil|r|round)$/.test(type)){throw new SyntaxError("[type] is not a valid option");}
        let[_A,_B]=[this.copy().abs(),n.copy().abs()];
        /**@type {BigIntType} - rest */
        let R;
        if(_A.isSmallerThan(_B)){R=_A}
        else if(_A.isEqualTo(_B)){R=new BigIntType('0');}
        else{
            for(;!(_A.isSmallerThan(_B));_A.sub(_B));
            R=_A;
        }
        switch(type){
            case'e':case"euclid":(_obj=>{this.#digits=_obj.#digits;this.#sign=_obj.#sign;})(this.#sign?R:_B.sub(R));break;
            case't':case"trunc":(_obj=>{this.#digits=_obj.#digits;this.#sign=_obj.#sign;})(this.#sign?R:R.neg());break;
            case'f':case"floor":(_obj=>{this.#digits=_obj.#digits;this.#sign=_obj.#sign;})(n.#sign?(this.#sign?R:_B.sub(R)):(this.#sign?R.sub(_B):R.neg()));break;
            case'c':case"ceil":(_obj=>{this.#digits=_obj.#digits;this.#sign=_obj.#sign;})(n.#sign?(this.#sign?R.sub(_B):R.neg()):(this.#sign?R:_B.sub(R)));break;
            case'r':case"round":(_obj=>{this.#digits=_obj.#digits;this.#sign=_obj.#sign;})(R.copy().sub(_B.copy().half('c')).#sign?(this.#sign?R.sub(_B):_B.sub(R)):(this.#sign?R:R.neg()));break;
        }
        return this;
    }
    /* TODO's

        gcd(a,b) pow(n) root(n) maprange(n,min1,max1,min2,max2,limit?) toString(padLen?,padChar?,maxLen?) logString(!see log() and toString()!)
        randomInt ?

        ( n-root(n,x) => pow(x,1/n) )

        log(x)(y)=z <-> (x^z=y) https://en.wikipedia.org/wiki/Logarithm#Change_of_base

        randomInt(min,max) algorithm?Math.random()?function*(x){yield x++;}?

        (；￢＿￢)

        <num_frac([a+(b/c)])>
            frac2decString - [PowerShell]
                    $b=123456;  # first number
                    $c=789123;  # second number
                    $n=100;     # number of decimals
                    $r=$true;   # rounding on/off
                    $out="0.";  # decimal output
                    $b_=$b;
                    for($i=0;$i -lt $n;$i++){
                        $d=[math]::floor($b_*10/$c);
                        if($r -and ($i -eq ($n-1))){
                            # rounding >=5 up
                            $d_=[math]::floor((($b_*10)-($c*$d))*10/$c);
                            if($d_ -ge 5){
                                # $d_ >=10 !!
                                $out+=[string]($d+1);
                            }else{$out+=[string]$d}
                        }else{$out+=[string]$d}
                        $b_=($b_*10)-($c*$d);
                    };
                    Out-String -InputObject "PS estimate: $($b/$c)";
                    Out-String -InputObject "$($n) decimal: $($out)";

            E PI sqrt2 ?! ~> e^() e^(()*PI) ...
            Trigenomitry: https://en.wikipedia.org/wiki/Trigonometric_functions
            Sine,Tangent,Secant https://upload.wikimedia.org/wikipedia/commons/e/ec/TrigFunctionDiagram.svg
            +arc-*,co-*,hyperbolic-*,arc-co-*,co-hyperbolic-*,arc-hyperbolic-*,arc-co-hyperbolic-*
            COS: https://wikimedia.org/api/rest_v1/media/math/render/svg/b81fe2f5f9ac74cbd88ec71d23baf9a1e39b8f04
            SIN: https://wikimedia.org/api/rest_v1/media/math/render/svg/2d12b4b66e58abfcf03c1f452658b85f662ce228
    */
}

// console.log((({sign,digits})=>({sign,digits}))(new BigIntType("12345649061847658743611234564906184765874361876734659431587645014856782195644643266854326514266548265442656816546542654265665426542657426565365427654635654646546546542765876734659431587645014856782195644643266123456490618476587436187673465943158764501485678219564464326685432651426654826123456490618476587436187673465943158764501485678219564464326685432651426654826544265681654654265426566542654265742656536542765463565464654654654276554426568165465426542656654265426574265653654276546356546465465465427065854032")));
//~ 512 digit base 10 string to base 256 Uint8Array(213) in 99ms finally faster :D
const a=Date.now();
let num=new BigIntType(new Uint8Array([6,247,252,93,6,34,21,134,230,3,176,174,134,177,34,22,122,210,6,22,210,6,36,53,123,6,35,123,142,6,31]),256),
    num2=new BigIntType(new Uint8Array([58,237,133,133,61,65,65,65,122,142,146,100,177,35,91,75,241,139,246,28,11,158,253,22,230,253,253,200]),256),
    num3=new BigIntType(new Uint8Array([112,74,221,233,65,144,244,38,7,7,77,0,76,29,29,7,145,96,201,209,172,56,121,220,204,188,34,30,102,36]),256),
    num4=new BigIntType(new Uint8Array([82,59,171,240,0,25,137,6,76,76,120,118,172,75,86,204,196,137,13,4,135,165,0,241,34,15,4,240,164,87]),256),
    num5=new BigIntType(new Uint8Array([8,30,8,99,242,226,56,26,54,165,46,143,65,6,146,54,66,54,66,6,164,145,164,64,156,12,142,65,165]),256),
    num6=num.add(num2).mul(num4).sub(num5).add(num).log();
console.log("done in %ims",Date.now()-a);
console.table([num,num2,num3,num4,num5,num6].map(({sign,digits})=>({sign,digits})));

// TODO                     ↑
// TODO implement this to that
// TODO             ↓

// TODO maxLen for output strings !
// TODO typedarrays instead of string arrays
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
// let n="123456789";
// let a=decString2byte(n);
// console.log(
//     "number: %s\nbyte: %s\nchars: %O\nhex: %s\nbin: %s\nhalf: %s\ndouble: %s\n%s",
//     n,
//     a.slice().reverse().join(' '),
//     byte2brailleString(a),
//     byte2hexString(a),
//     byte2binString(a),
//     byteBitshiftR(a.slice()).reverse().join(' '),
//     byteBitshiftL(a.slice()).reverse().join(' '),
//     byte2brailleString(hexString2byte("6747EF41C740C740CF470000B9016747EF415F85EF41"))
// );
