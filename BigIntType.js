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
    //~ for potentially larger numbers Uint16Array could be used ('cause 2**16*2**16 is still a save integer is js so save to compute)
    //~ but it is the same size in memory just potentially a longer number 'cause the index can go higher (a digit-array in base 65536 is 2x shorter than in base 256)
    //~ but with (2**53-1) digits (MAX_SAFE_INTEGER) and 1Byte (base 256) per digit - it is large enough (usually not more than 2GB can be allocated anyways...)
    /**@type {number} - maximum possible length of a number _(excluding sign)_ - originally `500` = 0.5KB in RAM */
    static #MAX_SIZE=500;
    /**@returns {number} _current_ maximum possible length of a number _(excluding sign)_ */
    static get MAX_SIZE(){return BigIntType.#MAX_SIZE;}
    /**@throws {RangeError} - if setting this to a number that is not an integer in range `[1-1048576]` - _( `1048576` = 1MiB in RAM )_ */
    static set MAX_SIZE(n){
        //~ technically, max is 9007199254740991 (Number.MAX_SAFE_INTEGER) but with 1 Byte each entry that's almost 8PiB ! for ONE number
        //~ and chrome browser will only create typed arrays up to 2GiB
        if(!Number.isInteger(n)||n<1||n>1048576){throw new RangeError("[MAX_SIZE] must be an integer in range [1-1048576]");}
        return BigIntType.#MAX_SIZE=n;
    }
    /**
     * __constructs a RegExp to match `base`__ \
     * _min 1 digit_ \
     * allows prefixes for bases 2, 8, and 16 \
     * allows '_' between digits \
     * __supports bases 1 to 36__ \
     * __base 0 is braille pattern__ \
     * match-groups:
     * 1. sign / null
     * 2. number
     * @param {number} base - the base for the RegExp wich checks against a number-string - save integer
     * + base 1-10 [digits 0-9]
     * + base 11-36 [digits 0-9A-F]
     * @returns {RegExp} the regexp for number-strings with base `base`
     * @throws {RangeError} if `base` is not a save integer or bigger than 36
     */
    static #REGEXP_STRING(base){
        base=Math.abs(Number(base));if(!Number.isSafeInteger(base)||base>36){throw RangeError("[REGEXP_STRING] base is out of range");}
        switch(Number(base)){//~ special cases
            case 0:return/^([+-]?)((?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+(?:_(?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+)*)$/; //~ base 256 in braille-patterns
            case 1:return/^([+-]?)(0+(?:_0+)*)$/;//~ base 1 does not realy exist, but I would imagine it like this. Where the length is the number value -1, so "0" is 0, "00" is 1, "000" is 2, etc.
            case 2:return/^([+-]?)(?:0b)?((?:0|1[01]*)+(?:_(?:0|1[01]*)+)*)$/i;
            case 8:return/^([+-]?)(?:0o)?((?:0|[1-7][0-7]*)+(?:_(?:0|[1-7][0-7]*)+)*)$/i;
            case 16:return/^([+-]?)(?:0x)?((?:0|[1-9A-F][0-9A-F]*)+(?:_(?:0|[1-9A-F][0-9A-F]*)+)*)$/i;
        }
        const add_char_seperator=characters=>`(?:${characters})+(?:_(?:${characters})+)*`,
            construct_regexp=(number_regexp,flag='')=>new RegExp(`^([+-]?)(${number_regexp})$`,flag);
        if(base<=10){//~ base 2-10
            const characters=`0|[1-${base-1}][0-${base-1}]*`;
            return construct_regexp(add_char_seperator(characters));
        }else if(base<=36){//~ base 11-36
            const characters=`0|[1-9A-${String.fromCharCode(54+base)}][0-9A-${String.fromCharCode(54+base)}]*`;
            return construct_regexp(add_char_seperator(characters),'i');
        }
    }
    /**
     * __checking if the comma separated list matches format and numbers are below `base`__
     * @param {string} cSNumStr - comma separated numbers
     * @param {number} base - base of `cSNumStr` - save integer - _default `2**32`_
     * @returns {boolean} `true` if the comma separated list matches format and numbers are below `base` and `false` otherwise
     * @throws {TypeError} if `base` is not a safe integer
     */
    static #CheckCSNum(cSNumStr,base=2**32){
        cSNumStr=String(cSNumStr);
        base=Math.abs(Number(base));if(!Number.isSafeInteger(base)){throw new TypeError("[CheckCSNum] base is not a number");}
        const baseStr=String(base);
        if(!/^(?:0|(?:[1-9][0-9]*)(?:\,(?:0|[1-9][0-9]*))*)$/.test(cSNumStr)){return false;}
        for(let i=0,lastNum="";i<cSNumStr.length;i++){
            if(cSNumStr[i]!=','){
                lastNum+=cSNumStr[i];
                if(i<cSNumStr.length-1){continue;}
            }
            //~ check lastNum < baseStr
            if(lastNum.length>baseStr.length){return false;}
            if(lastNum.length===baseStr.length){
                for(let j=0;j<baseStr.length;j++){
                    if(lastNum.charCodeAt(j)>baseStr.charCodeAt(j)){return false;}
                    if(lastNum.charCodeAt(j)<baseStr.charCodeAt(j)){break;}
                }
            }
            lastNum="";
        }
        return true;
    }
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
    /**@returns {number} number of digits (base 256)*/
    get length(){return this.#digits.length;}
    /**
     * @returns {BigIntType} biggest possible number according to `MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get MAX_VALUE(){return new BigIntType(new Uint8Array(BigIntType.MAX_SIZE).fill(255),"256");}
    /**
     * @returns {BigIntType} "Hello There" in Braille - see `this.toString("braille")`
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 22B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get HelloThere(){
        if(BigIntType.MAX_SIZE<22){throw new RangeError("[HelloThere] MAX_SIZE is to small");}
        return new BigIntType(new Uint8Array([65,239,133,95,65,239,71,103,1,185,0,0,71,207,64,199,64,199,65,239,71,103]),"256");
    }
    /**
     * @returns {BigIntType} Infinity - `2**1024` ~ 1.79e308
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 129B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Infinity(){
        if(BigIntType.MAX_SIZE<129){throw new RangeError("[Infinity] MAX_SIZE is to small");}
        return new BigIntType(new Uint8Array([...new Uint8Array(128),1]),"256");
    }
    /**
     * @returns {BigIntType} `0`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Zero(){return new BigIntType(new Uint8Array([0]),"256");}
    /**
     * @returns {BigIntType} `1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get One(){return new BigIntType(new Uint8Array([1]),"256");}
    /**
     * @returns {BigIntType} `2`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Two(){return new BigIntType(new Uint8Array([2]),"256");}
    /**
     * @returns {BigIntType} `-0`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get NZero(){return new BigIntType.Zero.neg();}
    /**
     * @returns {BigIntType} `-1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get NOne(){return new BigIntType.One.neg();}
    /**
     * @returns {BigIntType} `-2`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get NTwo(){return new BigIntType.Two.neg();}
    /**
     * __constructs a BigIntType number__
     * @param {string|boolean[]|Uint8Array} num - an integer - _default `'1'`_
     * + + ( in arrays the number is unsigned and index 0 = 0th-place-digit for example: `"1230"` → `[0,3,2,1]` )
     * + + ( if `num` is an Uint8Array and `base` 256 then the original Uint8Array will be used )
     * + `base` 2   → as string or Uint8Array `0` and `1` or as bool array `true` and `false`
     * + `base` 4   → as string or Uint8Array `0` to `3`
     * + `base` 8   → as string or Uint8Array `0` to `7`
     * + `base` 10  → as string or Uint8Array `0` to `9`
     * + `base` 16  → as string `0` to `9` and `A` to `F` or as Uint8Array `0` to `16`
     * + `base` 32  → as string `0` to `9` and `A` to `Z` or as Uint8Array `0` to `36`
     * + `base` 256 → as string `⠀` to `⣿` (braille-patterns `0x2800` to `0x28FF`), `0` to `255` (comma-separated list) or as Uint8Array `0` to `256`
     * @param {string|number} base - base of `num` as a number or string (case insensitive) - _default `'d'`_
     * + base 2 can be `'b'`, `"bin"`, `"bit"`, `"binary"`, `'2'` or `2`
     * + base 4 can be `'c'`, `"crumb"`, `'q'`, `"quaternary"`, `'4'` or `4`
     * + base 8 can be `'o'`, `"oct"`, `"octal"`, `'8'` or `8`
     * + base 10 can be `'d'`, `"dec"`, `"decimal"`, `"10"` or `10`
     * + base 16 can be `'x'`, `'h'`, `"hex"`, `"hexadecimal"`, `'n'`, `"nibble"`, `"16"` or `16`
     * + base 36 can be `'t'`, `"text"`, `"bin-text"`, `"36"` or `36`
     * + base 256 can be `"braille"`, `"byte"`, `"256"` or `256` (`"braille"` must be a unicode braille-pattern string)
     * @throws {SyntaxError} - if `base` is not an available option
     * @throws {SyntaxError} - if `base` is `"braille"` and `num` is not a string
     * @throws {SyntaxError} - if `num` does not have the correct format for this `base`
     * @throws {RangeError} - if `num` exceedes `MAX_SIZE` (after conversion in base 256)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    constructor(num='1',base='d'){
        switch(String(base).toLowerCase()){
            /*
                all your base are belong to us
                3   ternary trinary             [0-2]
                5   quinary pental              [0-4]
                6   senary heximal seximal      [0-5]
                12  duodecimal dozenal uncial   [0-9,A-B]
                20  vigesimal                   [0-9,A-J]
                60  sexagesimal sexagenary      [<comma separated list>]
            */
            case'b':case"bin":case"bit":case"binary":case'2':base=2;break;
            case'c':case"crumb":
            case'q':case"quaternary":case'4':base=4;break;
            case'o':case"oct":case"octal":case'8':base=8;break;
            case'd':case"dec":case"decimal":case"10":base=10;break;
            case'n':case"nibble":
            case'x':case'h':case"hex":case"hexadecimal":case"16":base=16;break;
            case't':case"text":case"bin-text":case"36":base=36;break;
            case"byte":case"256":base=256;break;
            case"braille":base=0;break;
            default:throw new SyntaxError("[new BigIntType] base is not an available option");
        }
        this.#sign=true;
        if(base===2&&Array.isArray(num)){
            if(num.every(v=>typeof(v)==="boolean")){num=new Uint8Array(num);}
            else{throw new SyntaxError("[new BigIntType] num (array) has incorrect values for base 2");}
        }
        if(base===0&&num instanceof Uint8Array){throw new SyntaxError("[new BigIntType] base \"braille\" requires num to be a string");}
        if(num instanceof Uint8Array){
            if(num.length===1&&(num[0]===0||num[0]===false)){this.#digits=new Uint8Array(1);return;}
            if(num.length===1&&(num[0]===1||num[0]===true)){this.#digits=new Uint8Array([1]);return;}
        }else{
            num=String(num);
            if(num==='0'||num==='\u2800'){this.#digits=new Uint8Array(1);return;}
            if(num==='1'||num==='\u2801'){this.#digits=new Uint8Array([1]);return;}
        }
        /**@type {boolean} - if `num` is a string this will be the sign of the number (after the conversion) */
        let _sign=true;
        if(typeof num==="string"){
            if(base<=36){
                /**@type {RegExpMatchArray|null} - sign and number from string or `null` if no match*/
                let _match=num.match(BigIntType.#REGEXP_STRING(base));
                if(!_match){throw new SyntaxError(`[new BigIntType] num (string) does not have the correct format for base ${base===0?'256 (braille)':base}`);}
                _sign=_match[1]!=='-';
                _match[2]=_match[2].replace('_','');
                if(base===0){
                    num=new Uint8Array([..._match[2]].map(v=>v.charCodeAt(0)-10240).reverse());
                    base=256;
                }else if(base===1){
                    if(_match[2].length===1){this.#sign=_sign;this.#digits=new Uint8Array(1);return;}
                    if(_match[2].length===2){this.#sign=_sign;this.#digits=new Uint8Array([1]);return;}
                    base=36;
                    num=new Uint8Array([...(_match[2].length-1).toString(base).map(v=>Number.parseInt(v,base)).reverse()]);
                }else if(base<=10){num=new Uint8Array([..._match[2]].reverse());}
                else{num=new Uint8Array([..._match[2]].map(v=>Number.parseInt(v,base)).reverse());}
            }else{
                if(BigIntType.#CheckCSNum(num,base)){num=new Uint8Array(num.split(',').reverse());}
                else{throw new SyntaxError(`[new BigIntType] num (string / comma separated list) does not have the correct format for base ${base}`);}
            }
        }else if(num.some(v=>v>=base)){throw new SyntaxError(`[new BigIntType] num (Uint8Array) has incorrect values for base ${base}`);}
        switch(base){
            case 2://~ 8* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(num.length/8));
                for(let i=0;i<this.length;i++){
                    this.#digits[i]=num[i*8]+
                        ((num[i*8+1]??0)<<1)+
                        ((num[i*8+2]??0)<<2)+
                        ((num[i*8+3]??0)<<3)+
                        ((num[i*8+4]??0)<<4)+
                        ((num[i*8+5]??0)<<5)+
                        ((num[i*8+6]??0)<<6)+
                        ((num[i*8+7]??0)<<7);
                }
                break;
            case 4://~ 3* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(num.length/4));
                for(let i=0;i<this.length;i++){
                    this.#digits[i]=num[i*4]+
                        ((num[i*4+1]??0)*4)+
                        ((num[i*4+2]??0)*16)+ //~ 4**2
                        ((num[i*4+3]??0)*64); //~ 4**3
                }
                break;
            case 8://! remove (to default:)
                /**@type {string[]} - digits in base 8*/
                let b8=Array.from(num,String),
                    /**@type {string[]} - digits for base 256*/
                    __b256=[];
                for(;b8.length>3||(b8.length===3&&Number(b8[2])>=4);){//~ b8 >=256 (400_b8)
                    __b256.push('0');
                    for(let i=0;i<8;i++){
                        if(Number(b8[0])&1){__b256[__b256.length-1]=String(Number(__b256[__b256.length-1])+(1<<i));}
                        if(b8.length===1&&b8[0]==='0');//~ b8 /2
                        else if(b8.length===1&&b8[0]==='1'){b8[0]='0';}
                        else{
                            b8[0]=String(Number(b8[0])>>>1);
                            for(let i=1;i<b8.length;i++){
                                if(Number(b8[i])&1){b8[i-1]=String(Number(b8[i-1])+4);}
                                b8[i]=String(Number(b8[i])>>>1);
                            }
                            if(b8[b8.length-1]==='0'){b8.splice(-1,1);}
                        }
                    }
                }
                __b256.push(String(Number.parseInt(b8.reverse().join(''),8)));
                this.#digits=new Uint8Array(__b256);
                break;
            case 10://! remove (to default:)
                /**@type {string[]} - digits in base 10*/
                let b10=Array.from(num,String),
                    /**@type {string[]} - digits for base 256*/
                    b256=[];
                for(;b10.length>3||(b10.length===3&&(Number(b10[2])>2||(Number(b10[2])===2&&(Number(b10[1])>5||(Number(b10[1])===5&&(Number(b10[0])>=6))))));){//~ b10 >=256
                    b256.push('0');
                    for(let i=0;i<8;i++){
                        if(Number(b10[0])&1){b256[b256.length-1]=String(Number(b256[b256.length-1])+(1<<i));}
                        if(b10.length===1&&b10[0]==='0');//~ b10 /2
                        else if(b10.length===1&&b10[0]==='1'){b10[0]='0';}
                        else{
                            b10[0]=String(Number(b10[0])>>>1);
                            for(let i=1;i<b10.length;i++){
                                if(Number(b10[i])&1){b10[i-1]=String(Number(b10[i-1])+5);}
                                b10[i]=String(Number(b10[i])>>>1);
                            }
                            if(b10[b10.length-1]==='0'){b10.splice(-1,1);}
                        }
                    }
                }
                b256.push(b10.reverse().join(''));
                this.#digits=new Uint8Array(b256);
                break;
            case 16://~ 2* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(num.length/2));
                for(let i=0;i<this.length;i++){
                    this.#digits[i]=num[i*2]+
                    ((num[i*2+1]??0)*16);
                }
                break;
            case 36://! remove (to default:)
                /**@type {string[]} - digits in base 36*/
                let b36=Array.from(num,String),
                    /**@type {string[]} - digits for base 256*/
                    b256_=[];
                for(;b36.length>2||(b36.length===2&&(Number(b36[1])>7||(b36[1]==='7'&&(Number(b36[0])>=4))));){//~ b36 >=256 (74_b36)
                    b256_.push('0');
                    for(let i=0;i<8;i++){
                        if(Number(b36[0])&1){b256_[b256_.length-1]=String(Number(b256_[b256_.length-1])+(1<<i));}
                        if(b36.length===1&&b36[0]==='0');//~ b36 /2
                        else if(b36.length===1&&b36[0]==='1'){b36[0]='0';}
                        else{
                            b36[0]=String(Number(b36[0])>>>1);
                            for(let i=1;i<b36.length;i++){
                                if(Number(b36[i]??0)&1){b36[i-1]=String(Number(b36[i-1])+18);}
                                b36[i]=String(Number(b36[i]??0)>>>1);
                            }
                            if(b36[b36.length-1]==='0'){b36.splice(-1,1);}
                        }
                    }
                }
                b256_.push(String(Number(b36.reverse().join(''))));
                this.#digits=new Uint8Array(b256_);
                break;
            case 256:this.#digits=num;break;//~ copy memory adress of original
            case 65536://~ each digit is 2* 8bit digits
                break;
            case 16777216://~ each digit is 3* 8bit digits
                break;
            case 4294967296://~ each digit is 4* 8bit digits
                break;
            default:// TODO cases 3, 5-15, and 17-(2**32) - see other TODOs
                /**@type {string[]} - digits in base N*/
                let bN=Array.from(num,String),
                    /**@type {string[]} - digits for base 256*/
                    b256__=[];
                /**@type {string[]} - `256` in base `base` as string array (`[0]` is `[0]*base**0`)*/
                const bMax256=(
                    base<=36?[...256..toString(base)].map(v=>String(Number.parseInt(v,base))).reverse():(
                        // TODO 256 in bases 37-255 (x entries [0]=256%base or something like that)
                        base<256?['todo ↑']:(
                            base===256?['0','1']:['256']
                        )
                    )
                );
                for(;bN.length>1||bN[0]!=='0';){// TODO bN >= bMax256
                    b256__.push('0');
                    for(let i=0;i<8;i++){
                        if(Number(bN[0])&1){b256__[b256__.length-1]=String(Number(b256__[b256__.length-1])+(1<<i));}
                        if(bN.length===1&&bN[0]==='0');//~ bN>>>=1
                        else if(bN.length===1&&bN[0]==='1'){bN[0]='0';}
                        else{
                            if(base&1){//~ if base is odd the carry is special
                                /**@type {undefined[]|null[]} - carry if `[i]` is `null`*/
                                let numCarry=Array(bN.length).fill(),
                                    /**@type {boolean} - true if it's currently durring a carry*/
                                    numCarryLast=false
                                for(let i=0;i<bN.length;i++){//~ bN>>>=1 and save carry
                                    if(Number(bN[i])&1){numCarry[i]=null;}
                                    bN[i]=String(Number(bN[i])>>>1);
                                }
                                for(let i=numCarry.length-1;i>=0;i--){//~ apply carry
                                    if(numCarryLast){bN[i]=String(Number(bN[i])+Math.floor(base*.5));}
                                    if(numCarry[i]===null){
                                        if(numCarryLast){bN[i]=String(Number(bN[i])+1);}
                                        numCarryLast=!numCarryLast;
                                    }
                                }
                                //~ round up → if(numCarryLast){bN[0]=String(Number(bN[0])+1);}
                                if(bN[bN.length-1]==='0'){bN.splice(-1,1);}
                            }else{
                                // TODO ?
                                bN[0]=String(Number(bN[0])>>>1);
                                for(let i=1;i<bN.length;i++){
                                    if(Number(bN[i])&1){bN[i-1]=String(Number(bN[i-1])+Math.floor(base*.5));}
                                    bN[i]=String(Number(bN[i])>>>1);
                                }
                                if(bN[bN.length-1]==='0'){bN.splice(-1,1);}
                            }
                        }
                    }
                }
                b256__.push(bN.reverse().join(''));
                this.#digits=new Uint8Array(b256__);
                break;
        }
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        this.#sign=_sign;
        if(this.length>BigIntType.MAX_SIZE){throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);}
    }
    /**
     * __convert `this` number to string__
     * @param {string|number} base - base of number/digit string - case insensitive - _default `'x`_
     * + base 2 can be      `'b'`, `"bin"`, `"bit"`, `"binary"`, `'2'` or `2`                           → `'0'`-`'1'` (prefix `0b`)
     * + base 4 can be      `'c'`, `"crumb"`, `'q'`, `"quaternary"`, `'4'` or `4`                       → `'0'`-`'3'`
     * + base 8 can be      `'o'`, `"oct"`, `"octal"`, `'8'` or `8`                                     → `'0'`-`'7'` (prefix `0o`)
     * + base 10 can be     `'d'`, `"dec"`, `"decimal"`, `"10"` or `10`                                 → `'0'`-`'9'`
     * + base 16 can be     `'x'`, `'h'`, `"hex"`, `"hexadecimal"`, `'n'`, `"nibble"`, `"16"` or `16`   → `'0'`-`'9'` & `'A'`-`'F'` (prefix `0x`)
     * + base 36 can be     `'t'`, `"text"`, `"bin-text"`, `"36"` or `36`                               → `'0'`-`'9'` & `'A'`-`'Z'`
     * + base 256 can be    `"byte"`, `"256"` or `256`                                                  → `"0"`-`"255"` (comma-separated list)
     * + or                 `"braille"`,                                                                → `'⠀'`-`'⣿'` (Unicode Braille Pattern) `0x2800`-`0x28FF`
     * @returns {string} `this` number as string (in base `base`)
     * @throws {SyntaxError} if `base` is not an available option
     */
    toString(base=16){
        let out="";
        switch(String(base).toLowerCase()){
            case'b':case"bin":case"bit":case"binary":case'2':out="0b"+this.#digits[this.length-1].toString(2);for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(2).padStart(8,'0');}break;
            case'c':case"crumb":case'q':case"quaternary":case'4':out=this.#digits[this.length-1].toString(4);for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(4).padStart(4,'0');}break;
            case'o':case"oct":case"octal":case'8':
                /**@type {string[]} - digit-array base 8 */
                let b8=['0'];
                for(let i=this.length-1;i>=0;i--){
                    for(let j=7;j>=0;j--){
                        if(b8.length>1||b8[0]!=='0'){//~ b8 *=2
                            for(let i=0,o=false,z=0;i<b8.length||o;i++){
                                if(b8[i]==='0'&&!o){continue;}
                                z=(Number(b8[i]??0)<<1)+(o?1:0);
                                if(z>=8){
                                    b8[i]=String(z-8);
                                    o=true;
                                }else{
                                    b8[i]=String(z);
                                    o=false;
                                }
                            }
                        }
                        if(this.#digits[i]&(1<<j)){b8[0]=String(Number(b8[0])|1);}
                    }
                }
                b8.push("0o");
                out=b8.reverse().join('');
                break;
            case'd':case"dec":case"decimal":case"10":
                /**@type {string[]} - digit-array base 10 */
                let b10=['0'];
                for(let i=this.length-1;i>=0;i--){
                    for(let j=7;j>=0;j--){
                        if(b10.length>1||b10[0]!=='0'){//~ b10 *=2
                            for(let i=0,o=false,z=0;i<b10.length||o;i++){
                                if(b10[i]==='0'&&!o){continue;}
                                z=(Number(b10[i]??0)<<1)+(o?1:0);
                                if(z>=10){
                                    b10[i]=String(z-10);
                                    o=true;
                                }else{
                                    b10[i]=String(z);
                                    o=false;
                                }
                            }
                        }
                        if(this.#digits[i]&(1<<j)){b10[0]=String(Number(b10[0])|1);}
                    }
                }
                out=b10.reverse().join('');
                break;
            case'n':case"nibble":case'x':case'h':case"hex":case"hexadecimal":case"16":out="0x"+this.#digits[this.length-1].toString(16).toUpperCase();for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(16).toUpperCase().padStart(2,'0');}break;
            case't':case"text":case"bin-text":case"36":
                /**@type {string[]} - digit-array base 36 */
                let b36=['0'];
                for(let i=this.length-1;i>=0;i--){
                    for(let j=7;j>=0;j--){
                        if(b36.length>1||b36[0]!=='0'){//~ b36 *=2
                            for(let i=0,o=false,z=0;i<b36.length||o;i++){
                                if(b36[i]==='0'&&!o){continue;}
                                z=(Number.parseInt(b36[i]??0,36)<<1)+(o?1:0);
                                if(z>=36){
                                    b36[i]=(z-36).toString(36).toUpperCase();
                                    o=true;
                                }else{
                                    b36[i]=z.toString(36).toUpperCase();
                                    o=false;
                                }
                            }
                        }
                        if(this.#digits[i]&(1<<j)){b36[0]=(Number.parseInt(b36[0],36)|1).toString(36).toUpperCase();}
                    }
                }
                out=b36.reverse().join('');
                break;
            case"braille":for(let i=this.length-1;i>=0;i--){out+=String.fromCharCode(10240+this.#digits[i]);}break;
            case"byte":case"256":for(let i=this.length-1;i>=0;i--){out+=String(this.#digits[i])+(i!==0?',':'');}break;
            default:throw new SyntaxError("[toString] base is not an available option");
        }
        if(!this.#sign){out='-'+out;}
        return out;
    }
    /**
     * __logs number as string (in base `base`) to console and returns itself (`this`)__
     * @param {string|number} base - base of number/digit string - case insensitive - _default `'x`_
     * + base 2 can be      `'b'`, `"bin"`, `"bit"`, `"binary"`, `'2'` or `2`                           → `'0'`-`'1'` (prefix `0b`)
     * + base 4 can be      `'c'`, `"crumb"`, `'q'`, `"quaternary"`, `'4'` or `4`                       → `'0'`-`'3'`
     * + base 8 can be      `'o'`, `"oct"`, `"octal"`, `'8'` or `8`                                     → `'0'`-`'7'` (prefix `0o`)
     * + base 10 can be     `'d'`, `"dec"`, `"decimal"`, `"10"` or `10`                                 → `'0'`-`'9'`
     * + base 16 can be     `'x'`, `'h'`, `"hex"`, `"hexadecimal"`, `'n'`, `"nibble"`, `"16"` or `16`   → `'0'`-`'9'` & `'A'`-`'F'` (prefix `0x`)
     * + base 36 can be     `'t'`, `"text"`, `"bin-text"`, `"36"` or `36`                               → `'0'`-`'9'` & `'A'`-`'Z'`
     * + base 256 can be    `"byte"`, `"256"` or `256`                                                  → `"0"`-`"255"` (comma-separated list)
     * + or                 `"braille"`,                                                                → `'⠀'`-`'⣿'` (Unicode Braille Pattern) `0x2800`-`0x28FF`
     * @returns {BigIntType} `this` with no changes
     * @throws {SyntaxError} if `base` is not an available option
     */
    logConsole(base='x'){
        switch(String(base).toLowerCase()){
            case'b':case"bin":case"bit":case"binary":case'2':base='2';break;
            case'c':case"crumb":case'q':case"quaternary":case'4':base='4';break;
            case'o':case"oct":case"octal":case'8':base='8';break;
            case'd':case"dec":case"decimal":case"10":base="10";break;
            case'n':case"nibble":case'x':case'h':case"hex":case"hexadecimal":case"16":base="16";break;
            case't':case"text":case"bin-text":case"36":base="36";break;
            case"byte":case"256":base="256";break;
            case"braille":base="braille";break;
            default:throw new SyntaxError("[logConsole] base is not an available option");
        }
        console.log(
            "%c[%i]: (%i Bytes) %s (base %s)",
            "background-color:#000;color:#0f0;font-family:'consolas',monospace;font-size:large",
            Date.now(),
            this.length,
            this.toString(base),
            (base==="braille"?"256 Braille-Patterns":base)
        );
        return this;
    }
    // TODO ↑ more base (WIP)
    /**
     * __makes a copy of `this` number__
     * @returns {BigIntType} a copy of `this` number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    copy(){return this.#sign?new BigIntType(this.#digits.slice(),"256"):new BigIntType(this.#digits.slice(),"256").neg();}
    /**
     * __copy values from `this` to `n`__
     * @param {BigIntType} n - number to set equal to `this` (will be modified)
     * @returns {BigIntType} `this` (unmodified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    reverseCopy(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[reverseCopy] n is not an instance of BigIntType");}
        n.setEqualTo(this);
        return this;
    }
    /**
     * __set `this` number equal to `n`__
     * @param {BigIntType} n - number to set equal to (copy values from)
     * @returns {BigIntType} `this = n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    setEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[setEqualTo] n is not an instance of BigIntType");}
        this.#digits=n.#digits.slice();
        this.#sign=n.#sign;
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
     * __returns a number in respect to the sign of `this` number__ \
     * not to be confused with `this.sign` wich returns the sign as a boolean _(if negative zero returns `false`)_
     * @returns {BigIntType} if zero `+0`, if positive `+1` and if negative `-1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    sign(){return(this.isZero()?BigIntType.Zero:(this.#sign?BigIntType.One:BigIntType.NOne));}
    /**
     * __determines if `this` number is odd__
     * @returns {boolean} `this % 2 === 1`
     */
    isOdd(){return (this.#digits[0]&1)===1;}
    /**
     * __determines if `this` number is even__
     * @returns {boolean} `this % 2 === 0`
     */
    isEven(){return !this.isOdd();}
    /**
     * __determines if `this` number is equal to 0__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 0`
     */
    isZero(){return(this.length===1&&this.#digits[0]===0);}
    /**
     * __determines if `this` number is equal to 1__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 1`
     */
    isOne(){return(this.length===1&&this.#digits[0]===1);}
    /**
     * __determines if `this` number is equal to 2__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 2`
     */
    isTwo(){return(this.length===1&&this.#digits[0]===2);}
    /**
     * __determines if `this` number is equal to positive 0__
     * @returns {boolean} `this === +0`
     */
    isPZero(){return(this.#sign&&this.isZero());}
    /**
     * __determines if `this` number is equal to positive 1__
     * @returns {boolean} `this === +1`
     */
    isPOne(){return(this.#sign&&this.isOne());}
    /**
     * __determines if `this` number is equal to positive 2__
     * @returns {boolean} `this === +2`
     */
    isPTwo(){return(this.#sign&&this.isTwo());}
    /**
     * __determines if `this` number is equal to negative 0__
     * @returns {boolean} `this === -0`
     */
    isNZero(){return(!this.#sign&&this.isZero());}
    /**
     * __determines if `this` number is equal to negative 1__
     * @returns {boolean} `this === -1`
     */
    isNOne(){return(!this.#sign&&this.isOne());}
    /**
     * __determines if `this` number is equal to negative 2__
     * @returns {boolean} `this === -2`
     */
    isNTwo(){return(!this.#sign&&this.isTwo());}
    /**
     * __determines if `this` number is smaller than `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this < n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isSmallerThan] n is not an instance of BigIntType");}
        if(!this.#sign&&n.#sign){return true;}
        if(this.#sign&&!n.#sign){return false;}
        if(this.#sign){
            if(this.length<n.length){return true;}
            if(this.length>n.length){return false;}
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i]){return true;}
                if(this.#digits[i]>n.#digits[i]){return false;}
            }
            return false;
        }else{
            if(this.length>n.length){return true;}
            if(this.length<n.length){return false;}
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i]){return true;}
                if(this.#digits[i]<n.#digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number abs is smaller than `n` abs__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) < abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsSmallerThanAbs(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isAbsSmallerThanAbs] n is not an instance of BigIntType");}
        if(this.length<n.length){return true;}
        if(this.length>n.length){return false;}
        for(let i=this.length-1;i>=0;i--){
            if(this.#digits[i]<n.#digits[i]){return true;}
            if(this.#digits[i]>n.#digits[i]){return false;}
        }
        return false;
    }
    /**
     * __determines if `this` number is greater than `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this > n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isGreaterThan(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isGreaterThan] n is not an instance of BigIntType");}
        if(this.#sign&&!n.#sign){return true;}
        if(!this.#sign&&n.#sign){return false;}
        if(this.#sign){
            if(this.length>n.length){return true;}
            if(this.length<n.length){return false;}
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i]){return true;}
                if(this.#digits[i]<n.#digits[i]){return false;}
            }
            return false;
        }else{
            if(this.length<n.length){return true;}
            if(this.length>n.length){return false;}
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i]){return true;}
                if(this.#digits[i]>n.#digits[i]){return false;}
            }
            return false;
        }
    }
    /**
     * __determines if `this` number abs is greater than `n` abs__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) > abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsGreaterThanAbs(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isAbsGreaterThanAbs] n is not an instance of BigIntType");}
        if(this.length>n.length){return true;}
        if(this.length<n.length){return false;}
        for(let i=this.length-1;i>=0;i--){
            if(this.#digits[i]>n.#digits[i]){return true;}
            if(this.#digits[i]<n.#digits[i]){return false;}
        }
        return false;
    }
    /**
     * __determines if `this` number is equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this == n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isEqualTo] n is not an instance of BigIntType");}
        if(this.#sign!==n.#sign){return false;}
        if(this.length!==n.length){return false;}
        return this.#digits.every((value,index)=>value===n.#digits[index]);
    }
    /**
     * __determines if `this` number abs is equal to `n` abs__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) == abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsEqualToAbs(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isAbsEqualToAbs] n is not an instance of BigIntType");}
        if(this.length!==n.length){return false;}
        return this.#digits.every((value,index)=>value===n.#digits[index]);
    }
    /**
     * __determines if `this` number is greater or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this >= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isGreaterOrEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isGreaterOrEqualTo] n is not an instance of BigIntType");}
        return !(this.isSmallerThan(n));
    }
    /**
     * __determines if `this` number abs is greater or equal to `n` abs__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) >= abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsGreaterOrEqualToAbs(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isAbsGreaterOrEqualToAbs] n is not an instance of BigIntType");}
        return !(this.isAbsSmallerThanAbs(n));
    }
    /**
     * __determines if `this` number is smaller or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this <= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerOrEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isSmallerOrEqualTo] n is not an instance of BigIntType");}
        return !(this.isGreaterThan(n));
    }
    /**
     * __determines if `this` number abs is smaller or equal to `n` abs__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) <= abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerOrEqualTo(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[isAbsSmallerOrEqualToAbs] n is not an instance of BigIntType");}
        return !(this.isAbsGreaterThanAbs(n));
    }
    /**
     * __removes (unnecessary) leading zeros from `digits`__
     * @param {Uint8Array|string[]} digits - digits-array (if `string[]` original will be altered)
     * @returns {Uint8Array|string[]} `digits` after removing all leading zeros (output type matches input type)
     */
    static #removeLeadingZeros(digits){
        /**@type {number} - index of first non-zero digit (from left)*/
        let first=digits.length-1;
        if(digits instanceof Uint8Array){
            for(;first>0&&digits[first]===0;first--);
            return digits.slice(0,first+1);
        }
        for(;first>0&&digits[first]==='\x00';first--);
        digits.splice(first+1);
        return digits;
    }
    /**
     * __constructs a new Uint8Array out of the given digit-string-array__
     * @param {string[]} digits - digit-array as string-array (char codes for digit values)
     * @returns {Uint8Array} digit-array as unsigned 8bit integer array
     */
    static #toUint8Array(digits){
        let tmp=new Uint8Array(digits.length);
        tmp.forEach((v,i,a)=>a[i]=digits[i].charCodeAt(0));
        return tmp;
    }
    /**
     * __constructs a new string-digit-array out of the given Uint8Array__
     * @param {Uint8Array} digits - digit-array as unsigned 8bit integer array
     * @returns {string[]} digit-array as string-array (char codes for digit values)
     */
    static #toStringArray(digits){return String.fromCharCode(...digits).split('');}
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
        for(;digits[i+j]==='\x00';digits[i+j++]='\xFF');
        digits[i+j]=String.fromCharCode(digits[i+j].charCodeAt(0)-1);
        return(digits[i+j]==='\x00'&&i+j===first)?--first:first;
    }
    /**
     * __increment `digits` once__ \
     * _ignoring  initial sign_ \
     * does not remove leading zeros
     * @param {string[]} digits - digits-array (original will be altered)
     * @returns {string[]} digits-array after incrementing
     */
    static #calcInc(digits){
        digits[0]=String.fromCharCode(digits[0].charCodeAt(0)+1);
        for(let i=0;i<digits.length;i++){
            if(digits[i].charCodeAt(0)>=256){
                digits[i]=String.fromCharCode(digits[i].charCodeAt(0)%256);
                digits[i+1]='\x01';
            }else{break;}
        }
        return digits;
    }
    /**
     * __decrement `this` number by `1`__ \
     * _ignoring  initial sign_ \
     * does not remove leading zeros
     * @param {string[]} digits - digits-array (original will be altered)
     * @returns {Readonly<{_sign:boolean;_digits:string[]}>} `digits` and sign after decrementing
     */
    static #calcDec(digits){
        /**@type {boolean} - sign for digits */
        let sign=true;
        if(digits[0]==='\x00'){
            if(digits.length===1){
                sign=false;
                digits[0]='\x01';
            }else{
                digits[0]='\xFF';
                BigIntType.#minusCarry(digits,0,digits.length-1);
            }
        }else{digits[0]=String.fromCharCode(digits[0].charCodeAt(0)-1);}
        return Object.freeze({_sign:sign,_digits:digits});
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
        let _tmp=BigIntType.#toStringArray(this.#digits);
        if(this.#sign){//~ (+)++
            BigIntType.#removeLeadingZeros(BigIntType.#calcInc(_tmp));
            if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError("[inc] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(_tmp);
        }else{//~ (-)++
            this.#sign=!BigIntType.#calcDec(_tmp)._sign;
            BigIntType.#removeLeadingZeros(_tmp);
            if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError("[inc] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(_tmp);
        }
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
        let _tmp=BigIntType.#toStringArray(this.#digits);
        if(this.#sign){
            this.#sign=BigIntType.#calcDec(_tmp)._sign;
            BigIntType.#removeLeadingZeros(_tmp);
            if(_tmp.length>BigIntType.MAX_SIZE){this.#sign=true;throw new RangeError("[dec] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(_tmp);
        }else{
            BigIntType.#removeLeadingZeros(BigIntType.#calcInc(_tmp));
            if(_tmp.length>BigIntType.MAX_SIZE){throw new RangeError("[dec] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(_tmp);
        }
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
        for(let i=0,o=false,z=0;i<len||o;i++){//~ o:boolean overflow to next digit | z:number last calculation
            z=(A[i]??'\x00').charCodeAt(0)+(B[i]??'\x00').charCodeAt(0)+(o?1:0);
            if(z>=256){
                z%=256;
                o=true;
            }else{o=false;}
            A[i]=String.fromCharCode(z);
        }
        return A;
    }
    /**
     * __subtracts two numbers from one another__ \
     * _ignoring initial sign_ \
     * does not remove leading zeros
     * @param {string[]} A - minuend digits-array (original will be altered)
     * @param {string[]} B - subtrahend digits-array
     * @returns {Readonly<{_sign:boolean;_digits:string[]}>} `A - B` (modified `A` with sign)
     */
    static #calcSub(A,B){
        /**@type {number} - length of the longer number */
        const len=Math.max(A.length,B.length);
        /**@type {boolean} - current sign of number */
        let sign=true;
        for(let i=len-1,z=0,first=i;i>=0;i--){//~ z:number last calculation | first:number current index of the first digit
            z=(A[i]??'\x00').charCodeAt(0)-(B[i]??'\x00').charCodeAt(0);
            if(z===0){
                A[i]='\x00';
                if(i===first){first--;}
            }else if(z<0){
                if(!sign){A[i]=String.fromCharCode(Math.abs(z));}
                else if(i===first){
                    sign=false;
                    A[i]=String.fromCharCode(Math.abs(z));
                }else{
                    A[i]=String.fromCharCode(256+z);
                    first=BigIntType.#minusCarry(A,i,first);
                }
            }else if(!sign){
                A[i]=String.fromCharCode(Math.abs(z-256));
                first=BigIntType.#minusCarry(A,i,first);
            }else{A[i]=String.fromCharCode(z);}
        }
        return Object.freeze({_sign:sign,_digits:A});
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
        let [A,B]=[BigIntType.#toStringArray(this.#digits),BigIntType.#toStringArray(n.#digits)];
        if(this.#sign===n.#sign){//~ (+)+(+) || (-)+(-)
            BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(A,B));
            if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(A);
        }else{
            if(this.#sign){//~ (+)+(-)
                this.#sign=BigIntType.#calcSub(A,B)._sign;
                BigIntType.#removeLeadingZeros(A);
                if(A.length>BigIntType.MAX_SIZE){this.#sign=true;throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
                this.#digits=BigIntType.#toUint8Array(A);
            }else{//~ (-)+(+)
                this.#sign=BigIntType.#calcSub(B,A)._sign;
                BigIntType.#removeLeadingZeros(B);
                if(B.length>BigIntType.MAX_SIZE){this.#sign=false;throw new RangeError("[add] would result in a number longer than MAX_SIZE");}
                this.#digits=BigIntType.#toUint8Array(B);
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
        let [A,B]=[BigIntType.#toStringArray(this.#digits),BigIntType.#toStringArray(n.#digits)];
        if(this.#sign!==n.#sign){//~ (+)-(-) || (-)-(+)
            BigIntType.#calcAdd(A,B);
            BigIntType.#removeLeadingZeros(A);
            if(A.length>BigIntType.MAX_SIZE){throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
            this.#digits=BigIntType.#toUint8Array(A);
        }else{
            if(this.#sign){//~ (+)-(+)
                this.#sign=BigIntType.#calcSub(A,B)._sign;
                BigIntType.#removeLeadingZeros(A);
                if(A.length>BigIntType.MAX_SIZE){this.#sign=true;throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
                this.#digits=BigIntType.#toUint8Array(A);
            }else{//~ (-)-(-)
                this.#sign=BigIntType.#calcSub(B,A)._sign;
                BigIntType.#removeLeadingZeros(B);
                if(B.length>BigIntType.MAX_SIZE){this.#sign=false;throw new RangeError("[sub] would result in a number longer than MAX_SIZE");}
                this.#digits=BigIntType.#toUint8Array(B);
            }
        }
        return this;
    }
    /**
     * __multiplies `this` number with 256 to the power of `x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding` in respect to base 256_ \
     * _modifies the original_
     * @param {number} x - exponent - save integer
     * @param {string} rounding - how to round when digit-shifting right _default `'r'`_
     * + `'r'` or `"round"` auto rounds possible decimal places
     * + `'f'` or `"floor"` rounds down possible decimal places
     * + `'c'` or `"ceil"` rounds up possible decimal places
     * @returns {BigIntType} `this` number after multiplication/digit-shifts (`this` modified)
     * @throws {TypeError} - if `x` is not a save integer
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    times256ToThePowerOf(x,rounding='r'){
        x=Number(x);if(!Number.isSafeInteger(x)){throw new TypeError("[times256ToThePowerOf] x is not a save integer");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[times256ToThePowerOf] rounding is not a valid option");}
        if(this.isZero()){return this;}
        if(x>0){
            if(x+this.length>BigIntType.MAX_SIZE){throw new RangeError(`[times256ToThePowerOf] n digit-shifts would result in a number longer than MAX_SIZE`);}
            let tmp=new Uint8Array(x+this.length);
            tmp.set(this.#digits,x);
            this.#digits=tmp;
        }else if(x<0){
            x=Math.abs(x);
            if(x>=this.length){
                switch(rounding){
                    case'c':case"ceil":this.#digits=new Uint8Array([1]);break;
                    case'f':case"floor":this.#digits=new Uint8Array([0]);break;
                    case'r':case"round":this.#digits=new Uint8Array([x===this.length?(this.#digits[x-1]>=128?1:0):0]);break;
                }
            }else{
                const _last=this.#digits[x-1];
                this.#digits=this.#digits.slice(x);
                switch(rounding){
                    case'c':case"ceil":if(_last!==0){this.inc();}break;
                    case'r':case"round":if(_last>=128){this.inc();}break;
                }
            }
        }
        return this;
    }
    /**
     * __shifts the bits of `this` number to the right `x` amount__ \
     * sign is not affected
     * @param {number} x - number of times to bitshift to the right (save integer) - _default `1`_
     * @returns {BigIntType} `this >>> x` (`this` modified)
     * @throws {TypeError} - if `x` is not a positive save integer
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitShiftR(x=1){
        x=Number(x);if(x<0||!Number.isSafeInteger(x)){throw new TypeError("[bitshiftR] x is not a positive save integer");}
        this.times256ToThePowerOf(-(Math.floor(x/8)),'f');
        x&=7;
        if(x===0){return this;}
        for(let i=0;i<this.length;i++){
            this.#digits[i]>>>=x;
            this.#digits[i]|=((this.#digits[i+1]??0)&((1<<x)-1))<<(8-x);//~ add the right x bits from [i+1] to the left of [i] (8bits)
        }
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        return this;
    }
    /**
     * __shifts the bits of `this` number to the left `x` amount__ \
     * sign is not affected \
     * _modifies the original_
     * @param {number} x - number of times to bitshift to the left (save integer) - _default `1`_
     * @returns {BigIntType} `this << x` (`this` modified)
     * @throws {TypeError} - if `x` is not a positive save integer
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitShiftL(x=1){
        x=Number(x);if(x<0||!Number.isSafeInteger(x)){throw new TypeError("[bitshiftL] x is not a positive save integer");}
        if(Math.floor(x/8)+this.length>BigIntType.MAX_SIZE){throw new RangeError(`[bitshiftL] would result in a number longer than MAX_SIZE`);}
        this.times256ToThePowerOf(Math.floor(x/8));
        x&=7;
        if(x===0){return this;}
        /**@type {Uint8Array} - temporary/new digit-array */
        let tmp=new Uint8Array(this.length+1);
        tmp.set(this.#digits,0);
        for(let i=this.length-1;i>=0;i--){
            tmp[i]<<=x;
            tmp[i]|=((tmp[i-1]??0)&(((1<<x)-1)<<(8-x)))>>>(8-x);//~ add the left x bits from [i-1] to the right of [i] (8bits)
        }
        tmp=BigIntType.#removeLeadingZeros(tmp);
        if(tmp.length>BigIntType.MAX_SIZE){throw new RangeError("[bitshiftL] would result in a number longer than MAX_SIZE");}
        this.#digits=tmp;
        return this;
    }
    /**
     * __applies bitwise AND with `this` and `n`__ \
     * sign is not affected \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this & n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitAND(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[bitAND] n is not an instance of BigIntType");}
        /**@type {Uint8Array} - temporary/new digit-array */
        let tmp=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<tmp.length;i++){tmp[i]=(this.#digits[i]??0)&(n.#digits[i]??0);}
        this.#digits=BigIntType.#removeLeadingZeros(tmp);
        return this;
    }
    /**
     * __applies bitwise OR with `this` and `n`__ \
     * sign is not affected \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this | n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitOR(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[bitOR] n is not an instance of BigIntType");}
        /**@type {Uint8Array} - temporary/new digit-array */
        let tmp=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<tmp.length;i++){tmp[i]=(this.#digits[i]??0)|(n.#digits[i]??0);}
        this.#digits=BigIntType.#removeLeadingZeros(tmp);
        return this;
    }
    /**
     * __applies bitwise XOR with `this` and `n`__ \
     * sign is not affected \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this ^ n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitXOR(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[bitXOR] n is not an instance of BigIntType");}
        /**@type {Uint8Array} - temporary/new digit-array */
        let tmp=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<tmp.length;i++){tmp[i]=(this.#digits[i]??0)^(n.#digits[i]??0);}
        this.#digits=BigIntType.#removeLeadingZeros(tmp);
        return this;
    }
    /**
     * __applies bitwise NOT with `this` number__ \
     * sign is not affected \
     * _modifies the original_
     * @returns {BigIntType} `~ this` (`this` modified)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitNOT(){
        for(let i=0;i<this.length;i++){this.#digits[i]=~this.#digits[i];}
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        return this;
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
    half(rounding='c'){
        rounding=String(rounding);if(!/^(c|ceil|f|floor)$/.test(rounding)){throw new SyntaxError("[half] rounding is not a valid option");}
        if(this.isZero()){return this;}
        if(this.isOdd()&&(rounding==='c'||rounding==="ceil")){return this.bitShiftR(1).inc();}
        else{return this.bitShiftR(1);}
    }
    /**
     * __calculates double of `this` number__ \
     * _modifies the original_
     * @returns {BigIntType} `this * 2` (`this` modified)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    double(){
        try{this.bitShiftL(1);}
        catch(error){throw (error instanceof RangeError)?new RangeError(`[double] would result in a number longer than MAX_SIZE`):error;}
        return this;
    }
    /**
     * __divides one number from another one__ \
     * _ignoring initial sign_ \
     * [!] `A`>`B`>0
     * @param {Uint8Array} A - dividend (>`B`)
     * @param {Uint8Array} B - divisor (>0)
     * @returns {Readonly<{quotient:Uint8Array;remainder:Uint8Array}>} `A / B` (quotient with remainder)
     */
    static #calcDivRest(A,B){
        let Q=new Uint8Array(A.length+1),
            R=new Uint8Array(B.length+1);
        /**
         * @param {Uint8Array} a - digit-array R
         * @param {Uint8Array} b - digit-array B
         * @returns {boolean} `a>=b`
         */
        const greaterEqual=(a,b)=>{
            for(let i=a.length-2;i>=0;i--){
                if(a[i]<b[i]){return false;}
                if(a[i]>b[i]){return true;}
            }
            return true;
        };
        for(let i=A.length-1,j=7,k=0,z=0,m=0,l=0;i>=0;(j===0?(--i,j=7):--j)){//~ [i,j] for bit position / [k,m,l] other for-loop indexes / [z] the result of last R-B calculation
            for(k=R.length-1;k>=0;k--){//~ R<<=1
                R[k]<<=1;
                R[k]|=((R[k-1]??0)&128)>>>7;
            }
            R[0]|=(A[i]&(1<<j))>>>j;
            if(R[R.length-1]>0||greaterEqual(R,B)){//~ R>=B
                for(l=R.length-1;l>=0;l--){//~ R-=B
                    z=R[l]-(B[l]??0);
                    if(z<0){
                        R[l]=256+z;
                        for(m=l+1;R[m]===0;R[m++]=255);//~ minus carry
                        R[m]--;
                    }else{R[l]=z;}
                }
                Q[i]|=1<<j;
            }
        }
        return Object.freeze({quotient:BigIntType.#removeLeadingZeros(Q),remainder:BigIntType.#removeLeadingZeros(R)});
    }
    /**
     * __divides another number from `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - divisor
     * @param {string} rounding - _default `'r'`_
     * + `'r'` or `"round"` for rounded division result
     * + `'f'` or `"floor"` for floored division result
     * + `'c'` or `"ceil"` for ceiled division result
     * @returns {BigIntType} `this / n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    div(n,rounding='r'){
        if(!(n instanceof BigIntType)){throw new TypeError("[div] n is not an instance of BigIntType");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[div] rounding is not a valid option");}
        // dividend / divisor = quotient + remainder / divisor
        if(n.isZero()){throw new RangeError("[div] n is 0");}
        if(this.isZero()||n.isOne()){return n.#sign?this:this.neg();}
        if(n.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){this.times256ToThePowerOf(1-n.length,rounding);}
        else if(this.isAbsSmallerThanAbs(n)){
            switch(rounding){
                case'c':case"ceil":this.#digits=new Uint8Array([1]);break;
                case'f':case"floor":this.#digits=new Uint8Array([0]);break;
                case'r':case"round":this.#digits=new Uint8Array([n.isAbsGreaterThanAbs(this.copy().double())?0:1]);break;
            }
        }else if(this.isEqualTo(n)){this.#digits=new Uint8Array([1]);}
        else{
            /**@type {BigIntType[]}*/
            let [q,r]=(({quotient,remainder})=>[
                new BigIntType(quotient,"256"),
                new BigIntType(remainder,"256")
            ])(BigIntType.#calcDivRest(this.#digits,n.#digits));
            switch(rounding){
                case'c':case"ceil":
                    if(!(r.isZero())){q.inc();}
                    this.#digits=q.#digits;
                    break;
                case'f':case"floor":this.#digits=q.#digits;break;
                case'r':case"round":
                    if(r.isZero()||r.copy().double().isSmallerThan(q)){this.#digits=q.#digits;}
                    else{this.#digits=q.inc().#digits;}
                    break;
            }
        }
        this.#sign=!(this.#sign^n.#sign);
        return this;
    }
    // TODO ↓
    /**
     * __calculates modulo `n` of `this` number__ \
     * _modifies the original_
     * @param {BigIntType} n - second number (!=0)
     * @param {string} type - _default `'e'`_
     * + `'e'` or `"euclid"` for euclidean modulo remainder
     * + `'t'` or `"trunc"` for truncated modulo remainder - (like js `%`operator)
     * + `'f'` or `"floor"` for floored modulo remainder
     * + `'c'` or `"ceil"` for ceiled modulo remainder
     * + `'r'` or `"round"` for rounded modulo remainder
     * @returns {BigIntType} the modulo according to `type` as a new `BigIntType` number
     * @throws {TypeError} - if `n` is not a `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `type` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    modulo(n,type='e'){
        if(!(n instanceof BigIntType)){throw new TypeError("[modulo] n is not an instance of BigIntType");}
        type=String(type);if(!/^(e|euclid|t|trunc|f|floor|c|ceil|r|round)$/.test(type)){throw new SyntaxError("[modulo] type is not a valid option");}
        if(n.isZero()){throw new RangeError("[modulo] cannot divide by 0");}
        // ! round → Q = round(A/B) → R = A-(B*Q)
        // ! trunc → Q = trunc(A/B) → R = A-(B*Q)
        // ! raise → Q = raise(A/B) → R = A-(B*Q)
        // ! floor → Q = floor(A/B) → R = A-(B*Q)
        // ! ceil → Q = ceil(A/B) → R = A-(B*Q)
        // ! euclid → Q = sign(B)*floor(A/abs(B)) → R = A-abs(B)*floor(A/abs(B)) == R = A-(B*Q)
        // TODO new with return Q and R with type !!
        if(this.isZero()||n.isOne){
            // TODO !!!! make extra divRest public method and use it here and in div ~maybe? !!!!
            // TODO !!!! best make use of #calc functions whenever possible !!!!
            switch(type){
                case'e':case"euclid":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:BigIntType.Zero});
                case'f':case"floor":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:n.#sign?BigIntType.Zero:BigIntType.NZero});
                case't':case"trunc":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:this.copy()});
                case'r':case"round":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:this.copy()});//~ sign pattern changes with rounding direction (here it's down - arbitrarily)
                case'a':case"raise":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:this.copy().neg()});
                case'c':case"ceil":return Object.freeze({quotient:this.#sign^n.sign?this.copy().abs().neg():this.copy().abs(),remainder:n.#sign?BigIntType.NZero:BigIntType.Zero});
            }
        }
        // switch(type){
        //     case'e':case"euclid":break;
        //     case't':case"trunc":break;
        //     case'f':case"floor":break;
        //     case'c':case"ceil":break;
        //     case'r':case"round":break;
        // }
        // TODO
        if(this.isZero()||n.isOne()){
            this.#digits=new Uint8Array([0]);
            return this;
        }
        // TODO if(n.isTwo()){this.#digits=new Uint8Array([(this.isOdd()?1:0)]);return this;}
        //hk_ if(n.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){return this.slice(0,n.length-2);}//~ [0,1,2,3,4,5] % [0,0,0,0,1] = [0,1,2,3]
        /**@type {BigIntType} - rest */
        let R;
        if(this.isAbsSmallerThanAbs(n)){R=this.copy().abs();}
        else if(this.isAbsEqualToAbs(n)){R=BigIntType.Zero;}
        else{R=new BigIntType(BigIntType.#calcDivRest(this.#digits,n.#digits).remainder,"256");}
        switch(type){
            case'e':case"euclid":this.setEqualTo(this.#sign?R:n.copy().abs().sub(R));break;
            case't':case"trunc":this.setEqualTo(this.#sign?R:R.neg());break;
            case'f':case"floor":this.setEqualTo(n.#sign?(this.#sign?R:n.copy().abs().sub(R)):(this.#sign?R.sub(n.copy().abs()):R.neg()));break;
            case'c':case"ceil":this.setEqualTo(n.#sign?(this.#sign?R.sub(n.copy().abs()):R.neg()):(this.#sign?R:n.copy().abs().sub(R)));break;
            case'r':case"round":this.setEqualTo(R.copy().sub(n.copy().abs().half('c')).#sign?(this.#sign?R.sub(n.copy().abs()):n.copy().abs().sub(R)):(this.#sign?R:R.neg()));break;
        }
        return this;
    }
    // TODO string[] → [...String.fromCharCode(...x)].charCodeAt(i) / '\x00'-'\xFF'
    // TODO     let _tmp=BigIntType.#toStringArray(this.#digits);
    // TODO     BigIntType.#removeLeadingZeros(_tmp);//~ ...
    // TODO     this.#digits=BigIntType.#toUint8Array;
    /**
     * __Karatsubas Multiplication Algorithm__ \
     * _with recursion_ \
     * for `mul()`
     * @param {string[]} X - multiplicand digits-array
     * @param {string[]} Y - multiplicator digits-array
     * @description [!] initial `X` and `Y` same length → power of 2 (pad end with `0`)
     * @returns {string[]} `X * Y`
     */
    static #calcKaratsuba(X,Y){
        if(X.every(v=>v==='\x00')||Y.every(v=>v==='\x00')){return ['\x00'];}
        //~ assume here that`X` and `Y` are of same length and the length is a power of 2
        if(X.length===1){//~ small enough to conpute savely with JS-Number ([!] from 8bit unsigned integer to 52bit signed save integer ~ trunc to 32bit signed integer during bitwise operations ~ need 16bit un-/signed for potential overflow [!])
            const A=X[0].charCodeAt(0)*Y[0].charCodeAt(0);
            return[String.fromCharCode(A&255),String.fromCharCode(A>>>8)];
        }
        let Xl=X.slice(0,Math.floor(X.length*.5)),Xh=X.slice(Math.floor(X.length*.5)),
            Yl=Y.slice(0,Math.floor(Y.length*.5)),Yh=Y.slice(Math.floor(Y.length*.5));
        let P3Calc1=BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(Xh.slice(),Xl)),
            P3Calc2=BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(Yh.slice(),Yl)),P3Count=1;
        for(const max=Math.max(P3Calc1.length,P3Calc2.length);P3Count<max;P3Count*=2);
        let [P1,P2,P3]=[
            BigIntType.#calcKaratsuba(Xh,Yh),
            BigIntType.#calcKaratsuba(Xl,Yl),
            BigIntType.#calcKaratsuba([...P3Calc1,...new Array(P3Count-P3Calc1.length).fill('0')],[...P3Calc2,...new Array(P3Count-P3Calc2.length).fill('0')])
        ];
        return BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(
            BigIntType.#calcAdd(
                [...new Array(X.length).fill('0'),...P1.slice()],
                [...new Array(Xh.length).fill('0'),...BigIntType.#removeLeadingZeros(BigIntType.#calcSub(P3,BigIntType.#calcAdd(P1.slice(),P2))._digits)]
            ),P2
        ));
    }
    /**
     * __multiplies `this` number by `n`__ \
     * _modifies the original_
     * _using Karatsubas algorithm_
     * @param {BigIntType} n - multiplicator
     * @returns {BigIntType} `this * n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    mul(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[mul] n is not an instance of BigIntType");}
        if(this.isOne()&&n.isOne());
        else if(this.isOne()){this.#digits=n.#digits.slice();}
        else if(n.isOne());
        else if(n.isTwo()){
            try{this.double();}
            catch(e){throw (e instanceof RangeError)?new RangeError("[mul] would result in a number longer than MAX_SIZE"):e;}
        }else if(this.isTwo()){
            try{this.#digits=n.copy().double().#digits;}
            catch(e){throw (e instanceof RangeError)?new RangeError("[mul] would result in a number longer than MAX_SIZE"):e;}
        }else if(n.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){
            if((n.length-1)+this.length>BigIntType.MAX_SIZE){throw new RangeError("[mul] would result in a number longer than MAX_SIZE");}
            this.times256ToThePowerOf(n.length-1,'f');
        }else{
            /**@type {number} - length (a power of 2) for karatsuba-algorithm-numbers */
            let len=1;
            for(const max=Math.max(this.length,n.length);len<max;len*=2);
            try{
                this.#digits=new Uint8Array(BigIntType.#removeLeadingZeros(BigIntType.#calcKaratsuba(
                    [...Array.from(this.#digits,String),...new Array(len-this.length).fill('0')],
                    [...Array.from(n.#digits,String),...new Array(len-n.length).fill('0')]
                )));
            }catch(e){throw(e instanceof RangeError)?new RangeError("[mul] would result in a number longer than MAX_SIZE"):e;}
            if(this.length>BigIntType.MAX_SIZE){new RangeError("[mul] would result in a number longer than MAX_SIZE");}
        }
        this.#sign=this.#sign===n.#sign;
        return this;
    }
    /**
     * __raises `this` number to the power of `n`__ \
     * _modifies the original_
     * @param {BigIntType} n - exponent
     * @returns {BigIntType} `this ** n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if `this` is 0 and `n` is negative (inverse of 0 → division by 0)
     * @throws {RangeError} - if `n` is negative (and `this` not 1 or 0) (inverse of integers does not exist except for 1)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    pow(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[pow] n is not an instance of BigIntType");}
        if(n.isZero()){return this.setEqualTo(BigIntType.One);}
        if(this.isZero()){
            if(n.#sign){return this;}
            throw new RangeError("[pow] can not calculate zero to the power of a negative exponent");
        }
        if(this.isOne()){return this;}
        if(n.isOne()&&n.#sign){return this;}
        if(!n.#sign){throw new RangeError("[pow] can not calculate the inverse of integers other than 1");}
        /**@type {string[]} - final number */
        let result=['1'];
        for(let karatsubaLen=0,base=Array.from(this.#digits,String),exp=Array.from(n.#digits,String);;){
            if(Number(exp[0])&1){
                BigIntType.#removeLeadingZeros(result);
                BigIntType.#removeLeadingZeros(base);
                for(karatsubaLen=1;karatsubaLen<Math.max(result.length,base.length);karatsubaLen*=2);//~ result*=base
                result=BigIntType.#calcKaratsuba(
                    [...result,...new Array(karatsubaLen-result.length).fill('0')],
                    [...base,...new Array(karatsubaLen-base.length).fill('0')]
                );
            }
            for(let i=0;i<exp.length;i++){//~ exp>>>=1
                exp[i]=String(Number(exp[i])>>>1);
                exp[i]=String(Number(exp[i])|(Number(exp[i+1]??0)&1)<<7);
            }
            if(exp.every(v=>v==='0')){break;}
            BigIntType.#removeLeadingZeros(base);
            for(karatsubaLen=1;karatsubaLen<base.length;karatsubaLen*=2);//~ base*=base
            base=BigIntType.#calcKaratsuba(
                [...base,...new Array(karatsubaLen-base.length).fill('0')],
                [...base,...new Array(karatsubaLen-base.length).fill('0')]
            );
            if(result.length>2147483648||base.length>2147483648){throw new RangeError("[pow] would result in a number longer than MAX_SIZE");}//~ safety? (2GiB)
        }
        BigIntType.#removeLeadingZeros(result);
        if(result.length>BigIntType.MAX_SIZE){throw new RangeError("[pow] would result in a number longer than MAX_SIZE");}
        this.#digits=new Uint8Array(result);
        if(n.isEven()){this.abs();}
        return this;
    }
    /**
     * __maps `this` number from one range to another__ \
     * _modifies the original_
     * @param {BigIntType} initialLow - initial lower bound
     * @param {BigIntType} initialHigh - initial higher bound
     * @param {BigIntType} finalLow - final lower bound
     * @param {BigIntType} finalHigh - final higher bound
     * @param {string} rounding - _default `'r'`_
     * + `'r'` or `"round"` for rounded result
     * + `'f'` or `"floor"` for floored result
     * + `'c'` or `"ceil"` for ceiled result
     * @param {boolean} limit - if `true` caps the result at final bound
     * @returns {BigIntType} `this` in `finalLow` to `finalHigh` range (rounded/caped as set) (`this` modified)
     * @throws {TypeError} - if `initialLow`,`initialHigh`,`finalLow` or `finalHigh` are not instances of `BigIntType`
     * @throws {RangeError} - if `initialLow` and `initialHigh` or `finalLow` and `finalHigh` are the same value
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    mapRange(initialLow,initialHigh,finalLow,finalHigh,rounding='r',limit=false){
        if(!(initialLow instanceof BigIntType)){throw new TypeError("[mapRange] initialLow is not an instance of BigIntType");}
        if(!(initialHigh instanceof BigIntType)){throw new TypeError("[mapRange] initialHigh is not an instance of BigIntType");}
        if(!(finalLow instanceof BigIntType)){throw new TypeError("[mapRange] finalLow is not an instance of BigIntType");}
        if(!(finalHigh instanceof BigIntType)){throw new TypeError("[mapRange] finalHigh is not an instance of BigIntType");}
        if(initialLow.isEqualTo(initialHigh)){throw new RangeError("[mapRange] initialLow and initialHigh are the same value");}
        if(finalLow.isEqualTo(finalHigh)){throw new RangeError("[mapRange] finalLow and finalHigh are the same value");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[mapRange] rounding is not a valid option");}
        limit=Boolean(limit);
        try{
            // TODO ~ could be faster with BigIntType.#calc... methods (divRest and karazuba need extra handeling) also no false "larger than max size" throw
            let _this=this
            BigIntType.#calcSub
            initialHigh=initialHigh.copy().sub(initialLow);
            this.sub(initialLow)
                .mul(finalHigh.copy().sub(finalLow))
                .add(initialHigh.copy().mul(finalLow))
                .div(initialHigh,rounding);
        }catch(error){
            if(error instanceof RangeError){throw new RangeError("[mapRange] would result in a number longer than MAX_SIZE");}
            throw error;
        }
        if(limit){
            if(this.isSmallerThan(finalLow)){this.setEqualTo(finalLow);}
            else if(this.isGreaterThan(finalHigh)){this.setEqualTo(finalHigh);}
        }
        if(this.length>BigIntType.MAX_SIZE){throw new RangeError("[mapRange] would result in a number longer than MAX_SIZE");}
        return this;
    }
    /**
     * __calculates the greatest common divisor of `a` and `b`__
     * @param {BigIntType} a - first number
     * @param {BigIntType} b - second number
     * @returns {BigIntType} gcd of `a` and `b` so that `(a/gcd) / (b/gcd)` will be the smallest possible (integer) fraction
     * @throws {TypeError} - if `a` or `b` are not instances of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static GCD(a,b){
        if(!(a instanceof BigIntType)){throw new TypeError("[GCD] a is not an instance of BigIntType");}
        if(!(b instanceof BigIntType)){throw new TypeError("[GCD] b is not an instance of BigIntType");}
        let [A,B]=(a.isSmallerThan(b))?[b.#digits,a.#digits]:[a.#digits,b.#digits];
        for(let last=new Uint8Array(1);(last=BigIntType.#calcDivRest(A,B).remainder,(last.length>1||last[0]!==0));[A,B]=[B,last]);
        return new BigIntType(B.slice(),"256");
    }
    /**
     * __creates a random number using `Math.random()`'s binary output__ \
     * _! not cryptographically secure output !_ \
     * original random number generated is 52bit unsigned (`0` to `2**52-1`)
     * @param {BigIntType} min - lower limit (included) - _default `0`_
     * @param {BigIntType} max - upper limit (included) - _default `1.79e308` (`BigIntType.Infinity`)_
     * @returns {BigIntType} random number between `min` and `max`
     * @throws {TypeError} - if `min` or `max` are not instances of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static randomInt(min=BigIntType.Zero,max=BigIntType.Infinity){
        try{
            return new BigIntType(new Uint8Array([...Math.random().toString(2).substring(2)]),'2').mapRange(
                BigIntType.Zero,
                new BigIntType(new Uint8Array([255,255,255,255,255,255,15]),"256"),
                min,max,
                'r',true
            );
        }catch(error){
            if(error instanceof RangeError)throw new RangeError("[randomInt] would result in a number longer than MAX_SIZE");
            throw error;
        }
    }
    /* TODO's

        [!] values of `this` only change if all possible throws are behind !! (on throw `this` is still unchanged !)

        [!] floor round towards -infinity allways
        [!] ceil round towards +infinity allways
        [!] trunc round towards 0 allways
        [!] ?outwards? round away from 0 allways
        [!] round round towards nearest integer (base/2 rounds 'up' and anything smaller rounds 'down', relative to 0)

        [!] the regexp function below
        [!] make a url save base ui32 string for short-ish links
        [!] "save" function to ui32array and back (no calc just save !)

        [?] pow/mul more stable for large numbers ? test on MAZ01001.github.io/site/BigIntType_calc.html
        [!] in constructor auto detect base from prefix or base10 (base=null → prefix? || 10)
        [!] use String.fromCharCode(10240+n) and (10240-s.charCodeAt(0)) (2Byte per number) in stead of "0"-"256" (wich uses up to 6Bytes per number)
        [!] private method for converting from every base (2-256) to every base (2-256) (string[]/Uint8Array) (see base 10 conversion ~)
            to use in constructor and toString method
        [!] also an extra private method for "hexadecimal"=16 conversion/translation (switch in constructor, toString and logConsole) with every known base names ~
        [!] todo in mapRange and function for regexp below
        [!] number output padding with '_' for base 2/4/16 after prefix (like padding with '0' wich is not allowed by the regexps currently)
            number input set regexp to ignore '_' after prefix and between digits (not for comma separated lists)

        lerp(a,b,t,rounding) -> mapRange(t,0,100,a,b,rounding)

        root(n)
        ( n-root(n,x) => pow(x,1/n) ) ~ 1/x if x>2 is rounded 0 !

        log(x)(y)=z <-> (x^z=y) https://en.wikipedia.org/wiki/Logarithm#Change_of_base
        log(x)(y) = ( log(2)(y) / log(2)(x) ) log of 2 to log of any base


        (；￢＿￢) basically BigInt but slower (just a proof of concept and a fun math challenge)

        probably for the best to use BigInt (in fraction-class) and copy methods from here as needed, 'cause speed

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
} //~ or just u know use the actual BigInt xD - it might not have base 256 and a few of the methods here but it's a lot faster since it's coded on a lower level ^^

try{//~ Test number to console
    console.log(
        "TEST NUMBER: %c %s",
        "background-color:#000;color:#0f0;font-family:consolas;font-size:2em;",
        BigIntType.HelloThere.toString("braille")
    );
}catch(error){
    console.log("{%s} : \"%s\"",error.name,error.message);//~ show only recent message (on screen) and not the whole stack
    console.error(error);//~ but do log the whole error message with stack to console
}
