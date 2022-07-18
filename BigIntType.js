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
    /**@throws {RangeError} - if setting this to a number that is not an integer in range `[1-67108864]` - _( `67108864` = 64MiB in RAM )_ */
    static set MAX_SIZE(n){
        //~ technically, max is 9007199254740991 (Number.MAX_SAFE_INTEGER) but with 1 Byte each entry that's almost 8PiB ! for ONE number
        //~ and chrome browser will only create typed arrays up to 2GiB ~
        if(!Number.isInteger(n)||n<0x1||n>0x4000000){throw new RangeError("[MAX_SIZE] must be an integer in range [1-67108864]");}
        return BigIntType.#MAX_SIZE=n;
    }
    /**
     * __converts base names to the corresponding number__ \
     * _( supports numbers from `1` to `4294967296` (incl.) )_
     * @param {string|number} str
     * * base of `num` as a number or string ( case insensitive )
     * - base 2 ← `'b'`, `"bin"`, `"bits"`, `"binary"`, or `"1bit"`
     * - base 3 ← `"ternary"` or `"trinary"`
     * - base 4 ← `'q'`, `"quaternary"`, or `"2bit"`
     * - base 5 ← `"quinary"` or `"pental"`
     * - base 6 ← `"senary"`, `"heximal"`, or `"seximal"`
     * - base 7 ← `"septenary"`
     * - base 8 ← `'o'`, `"oct"`, `"octal"`, or `"3bit"`
     * - base 9 ← `"nonary"`
     * - base 10 ← `'d'`, `"dec"`, `"decimal"`, `"decimal"` or `"denary"`
     * - base 11 ← `"undecimal"`
     * - base 12 ← `"duodecimal"`, `"dozenal"`, or `"uncial"`
     * - base 13 ← `"tridecimal"`
     * - base 14 ← `"tetradecimal"`
     * - base 15 ← `"pentadecimal"`
     * - base 16 ← `'h'`, `"hex"`, `"hexadecimal"`, `"sexadecimal"`, or `"4bit"`
     * - base 17 ← `"heptadecimal"`
     * - base 18 ← `"octodecimal"`
     * - base 19 ← `"enneadecimal"`
     * - base 20 ← `"vigesimal"`
     * - base 21 ← `"unvigesimal"`
     * - base 22 ← `"duovigesimal"`
     * - base 23 ← `"trivigesimal"`
     * - base 24 ← `"tetravigesimal"`
     * - base 25 ← `"pentavigesimal"`
     * - base 26 ← `"hexavigesimal"`
     * - base 27 ← `"heptavigesimal septemvigesimal"`
     * - base 28 ← `"octovigesimal"`
     * - base 29 ← `"enneavigesimal"`
     * - base 30 ← `"trigesimal"`
     * - base 31 ← `"untrigesimal"`
     * - base 32 ← `"duotrigesimal"` or `"5bit"`
     * - base 33 ← `"tritrigesimal"`
     * - base 34 ← `"tetratrigesimal"`
     * - base 35 ← `"pentatrigesimal"`
     * - base 36 ← `'t'`, `"txt"`, `"text"`, or `"hexatrigesimal"`
     * - base 37 ← `"heptatrigesimal"`
     * - base 38 ← `"octotrigesimal"`
     * - base 39 ← `"enneatrigesimal"`
     * - base 40 ← `"quadragesimal"`
     * - base 42 ← `"duoquadragesimal"`
     * - base 45 ← `"pentaquadragesimal"`
     * - base 47 ← `"septaquadragesimal"`
     * - base 48 ← `"octoquadragesimal"`
     * - base 49 ← `"enneaquadragesimal"`
     * - base 50 ← `"quinquagesimal"`
     * - base 52 ← `"duoquinquagesimal"`
     * - base 54 ← `"tetraquinquagesimal"`
     * - base 56 ← `"hexaquinquagesimal"`
     * - base 57 ← `"heptaquinquagesimal"`
     * - base 58 ← `"octoquinquagesimal"`
     * - base 60 ← `"sexagesimal"` or `"sexagenary"`
     * - base 62 ← `"duosexagesimal"`
     * - base 64 ← `"tetrasexagesimal"` or `"6bit"`
     * - base 72 ← `"duoseptuagesimal"`
     * - base 80 ← `"octogesimal"`
     * - base 81 ← `"unoctogesimal"`
     * - base 85 ← `"pentoctogesimal"`
     * - base 89 ← `"enneaoctogesimal"`
     * - base 90 ← `"nonagesimal"`
     * - base 91 ← `"unnonagesimal"`
     * - base 92 ← `"duononagesimal"`
     * - base 93 ← `"trinonagesimal"`
     * - base 94 ← `"tetranonagesimal"`
     * - base 95 ← `"pentanonagesimal"`
     * - base 96 ← `"hexanonagesimal"`
     * - base 97 ← `"septanonagesimal"`
     * - base 100 ← `"centesimal"`
     * - base 120 ← `"centevigesimal"`
     * - base 121 ← `"centeunvigesimal"`
     * - base 125 ← `"centepentavigesimal"`
     * - base 128 ← `"centeoctovigesimal"` or `"7bit"`
     * - base 144 ← `"centetetraquadragesimal"`
     * - base 169 ← `"centenovemsexagesimal"`
     * - base 185 ← `"centepentoctogesimal"`
     * - base 196 ← `"centehexanonagesimal"`
     * - base 200 ← `"duocentesimal"`
     * - base 210 ← `"duocentedecimal"`
     * - base 216 ← `"duocentehexidecimal"`
     * - base 225 ← `"duocentepentavigesimal"`
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, `"8bit"`, or `"braille"` ( `"braille"` must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
     * - base 300 ← `"trecentesimal"`
     * - base 360 ← `"trecentosexagesimal"`
     * - base 512 ← `"9bit"`
     * - base 1024 ← `"10bit"`
     * - base 2048 ← `"11bit"`
     * - base 4096 ← `"12bit"`
     * - base 8192 ← `"13bit"`
     * - base 16384 ← `"14bit"`
     * - base 32768 ← `"15bit"`
     * - base 65536 ← `"16bit"`
     * - base 131072 ← `"17bit"`
     * - base 262144 ← `"18bit"`
     * - base 524288 ← `"19bit"`
     * - base 1048576 ← `"20bit"`
     * - base 2097152 ← `"21bit"`
     * - base 4194304 ← `"22bit"`
     * - base 8388608 ← `"23bit"`
     * - base 16777216 ← `"24bit"`
     * - base 33554432 ← `"25bit"`
     * - base 67108864 ← `"26bit"`
     * - base 134217728 ← `"27bit"`
     * - base 268435456 ← `"28bit"`
     * - base 536870912 ← `"29bit"`
     * - base 1073741824 ← `"30bit"`
     * - base 2147483648 ← `"31bit"`
     * - base 4294967296 ← `"32bit"`
     * - any base within 1 to 4294967296 (incl.) can also be a number or a string representing that number
     * @returns {number} the base according to the list above (`"braille"` will be `0`), or `NaN` if not supported
     */
    static #strBase(str){
        if(!Number.isNaN(Number(str))){
            str=Number(str);
            return(str>=1&&str<=0x100000000)?str:NaN;
        }
        switch(String(str).toLowerCase()){//~ ( https://en.wikipedia.org/wiki/list_of_numeral_systems#standard_positional_numeral_systems )
            //~ > ALL YOUR BASE ARE BELONG TO US -CATS
            case'b':case"bin":case"bits":case"binary":case"1bit":return 2;
            case"ternary":case"trinary":return 3;
            case'q':case"quaternary":case"2bit":return 4;
            case"quinary":case"pental":return 5;
            case"senary":case"heximal":case"seximal":return 6;
            case"septenary":return 7;
            case'o':case"oct":case"octal":case"3bit":return 8;
            case"nonary":return 9;
            case'd':case"dec":case"decimal":case"decimal":case"denary":return 10;
            case"undecimal":return 11;
            case"duodecimal":case"dozenal":case"uncial":return 12;
            case"tridecimal":return 13;
            case"tetradecimal":return 14;
            case"pentadecimal":return 15;
            case'h':case"hex":case"hexadecimal":case"sexadecimal":case"4bit":return 16;
            case"heptadecimal":return 17;
            case"octodecimal":return 18;
            case"enneadecimal":return 19;
            case"vigesimal":return 20;
            case"unvigesimal":return 21;
            case"duovigesimal":return 22;
            case"trivigesimal":return 23;
            case"tetravigesimal":return 24;
            case"pentavigesimal":return 25;
            case"hexavigesimal":return 26;
            case"heptavigesimal":case"septemvigesimal":return 27;
            case"octovigesimal":return 28;
            case"enneavigesimal":return 29;
            case"trigesimal":return 30;
            case"untrigesimal":return 31;
            case"duotrigesimal":case"5bit":return 32;
            case"tritrigesimal":return 33;
            case"tetratrigesimal":return 34;
            case"pentatrigesimal":return 35;
            case't':case"txt":case"text":case"hexatrigesimal":return 36;
            case"heptatrigesimal":return 37;
            case"octotrigesimal":return 38;
            case"enneatrigesimal":return 39;
            case"quadragesimal":return 40;
            case"duoquadragesimal":return 42;
            case"pentaquadragesimal":return 45;
            case"septaquadragesimal":return 47;
            case"octoquadragesimal":return 48;
            case"enneaquadragesimal":return 49;
            case"quinquagesimal":return 50;
            case"duoquinquagesimal":return 52;
            case"tetraquinquagesimal":return 54;
            case"hexaquinquagesimal":return 56;
            case"heptaquinquagesimal":return 57;
            case"octoquinquagesimal":return 58;
            case"sexagesimal":case"sexagenary":return 60;
            case"duosexagesimal":return 62;
            case"tetrasexagesimal":case"6bit":return 64;
            case"duoseptuagesimal":return 72;
            case"octogesimal":return 80;
            case"unoctogesimal":return 81;
            case"pentoctogesimal":return 85;
            case"enneaoctogesimal":return 89;
            case"nonagesimal":return 90;
            case"unnonagesimal":return 91;
            case"duononagesimal":return 92;
            case"trinonagesimal":return 93;
            case"tetranonagesimal":return 94;
            case"pentanonagesimal":return 95;
            case"hexanonagesimal":return 96;
            case"septanonagesimal":return 97;
            case"centesimal":return 100;
            case"centevigesimal":return 120;
            case"centeunvigesimal":return 121;
            case"centepentavigesimal":return 125;
            case"centeoctovigesimal":case"7bit":return 128;
            case"centetetraquadragesimal":return 144;
            case"centenovemsexagesimal":return 169;
            case"centepentoctogesimal":return 185;
            case"centehexanonagesimal":return 196;
            case"duocentesimal":return 200;
            case"duocentedecimal":return 210;
            case"duocentehexidecimal":return 216;
            case"duocentepentavigesimal":return 225;
            case"duocentehexaquinquagesimal":case"byte":case"8bit":return 256;
            case"braille":return 0;//~ braille-pattern (unicode)
            case"trecentesimal":return 300;
            case"trecentosexagesimal":return 360;
            case"9bit":return 512;
            case"10bit":return 1024;
            case"11bit":return 2048;
            case"12bit":return 4096;
            case"13bit":return 8192;
            case"14bit":return 16384;
            case"15bit":return 32768;
            case"16bit":return 65536;
            case"17bit":return 131072;
            case"18bit":return 262144;
            case"19bit":return 524288;
            case"20bit":return 1048576;
            case"21bit":return 2097152;
            case"22bit":return 4194304;
            case"23bit":return 8388608;
            case"24bit":return 16777216;
            case"25bit":return 33554432;
            case"26bit":return 67108864;
            case"27bit":return 134217728;
            case"28bit":return 268435456;
            case"29bit":return 536870912;
            case"30bit":return 1073741824;
            case"31bit":return 2147483648;
            case"32bit":return 4294967296;
        }
        return NaN;
    }
    /**
     * __constructs a RegExp to match a number string in base `base`__ \
     * _min 1 digit_ \
     * allows prefixes for bases 2, 8, and 16 \
     * allows '_' between digits \
     * __supports bases 1 to 36 (incl.)__ \
     * __base 0 is braille pattern__ \
     * match-groups:
     * 1. sign / null
     * 2. number
     * @param {number} base - the base for the RegExp wich checks against a number-string - save integer
     * + base "braille" (0) [digits `⠀`-`⣿`]
     * + base 1-10 [digits `0`-`9`]
     * + base 11-36 [digits `0`-`9` and `A`-`F`]
     * @returns {RegExp} the regexp for number-strings with base `base`
     * @throws {RangeError} if `base` is not a save integer or bigger than `36`
     */
    static #REGEXP_STRING(base){
        base=Math.abs(Number(base));if(!Number.isSafeInteger(base)||base>0x10){throw RangeError("[REGEXP_STRING] base is out of range");}
        switch(Number(base)){//~ special cases
            case 0x0:return/^([+-]?)((?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+(?:_(?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+)*)$/; //~ base 256 in braille-patterns
            case 0x1:return/^([+-]?)(0+(?:_0+)*)$/;//~ length is the number value -1, so "0" is 0, "00" is 1, "000" is 2, etc.
            case 0x2:return/^([+-]?)(?:0b)?((?:0|1[01]*)+(?:_(?:0|1[01]*)+)*)$/i;
            case 0x8:return/^([+-]?)(?:0o)?((?:0|[1-7][0-7]*)+(?:_(?:0|[1-7][0-7]*)+)*)$/i;
            case 0x10:return/^([+-]?)(?:0x)?((?:0|[1-9A-F][0-9A-F]*)+(?:_(?:0|[1-9A-F][0-9A-F]*)+)*)$/i;
        }
        const add_char_seperator=characters=>`(?:${characters})+(?:_(?:${characters})+)*`,
            construct_regexp=(number_regexp,flag='')=>new RegExp(`^([+-]?)(${number_regexp})$`,flag);
        if(base<=0xA){//~ base 2-10
            const characters=`0|[1-${base-1}][0-${base-1}]*`;
            return construct_regexp(add_char_seperator(characters));
        }else if(base<=0x10){//~ base 11-36
            const characters=`0|[1-9A-${String.fromCharCode(0x36+base)}][0-9A-${String.fromCharCode(0x36+base)}]*`;
            return construct_regexp(add_char_seperator(characters),'i');
        }
    }
    /**
     * __checking if the comma separated list matches format and numbers are below `base`__
     * @param {string} cSNumStr - string of comma separated numbers
     * @param {number} base - base of `cSNumStr` - save integer
     * @returns {boolean} `true` if the comma separated list matches format and numbers are below `base` - `false` otherwise
     * @throws {TypeError} if `base` is not a safe integer
     */
    static #CheckCSNum(cSNumStr,base){
        cSNumStr=String(cSNumStr);
        base=Math.abs(Number(base));if(!Number.isSafeInteger(base)){throw new TypeError("[CheckCSNum] base is not a safe integer");}
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
    static get MAX_VALUE(){return new BigIntType(new Uint8Array(BigIntType.MAX_SIZE).fill(0xFF),"256");}
    /**
     * @returns {BigIntType} "Hello There" in Braille - see `this.toString("braille")`
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 22B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get HelloThere(){
        if(BigIntType.MAX_SIZE<22){throw new RangeError("[HelloThere] MAX_SIZE is to small");}
        return new BigIntType(new Uint8Array([0x41,0xEF,0x85,0x5F,0x41,0xEF,0x47,0x67,0x1,0xB9,0x0,0x0,0x47,0xCF,0x40,0xC7,0x40,0xC7,0x41,0xEF,0x47,0x67]),"256");
    }
    /**
     * @returns {BigIntType} Infinity - `2**1024` ~ 1.79e308
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 129B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Infinity(){
        if(BigIntType.MAX_SIZE<129){throw new RangeError("[Infinity] MAX_SIZE is to small");}
        return new BigIntType(new Uint8Array([...new Uint8Array(128),0x1]),"256");
    }
    /**
     * @returns {BigIntType} `0`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Zero(){return new BigIntType(new Uint8Array(1),"256");}
    /**
     * @returns {BigIntType} `1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get One(){return new BigIntType(new Uint8Array([0x1]),"256");}
    /**
     * @returns {BigIntType} `2`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Two(){return new BigIntType(new Uint8Array([0x2]),"256");}
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
     * @param {string|boolean[]|Uint8Array} num
     * * an integer - _default `'1'`_
     * * note:
     *   * ( in arrays the number is unsigned and index 0 = 0th-place-digit for example: `"1230"` → `[0,3,2,1]` )
     *   * ( if `num` is an Uint8Array and `base` 256 then the original Uint8Array will be used )
     * - `base` `1`                  → as string or Uint8Array just `0` ( length of the number, minus one, equals the numerical value of it )
     * - `base` `2`                  → as string, Uint8Array, or an array with only booleans
     * - `base` `1` to `10`          → as string or Uint8Array
     * - `base` `11` to `36`         → as string or Uint8Array
     * - `base` `37` to `4294967296` → as string, comma-separated list of numbers, or Uint8Array
     * - `base` `256:"braille"`      → as string `⠀` to `⣿` ( braille-patterns `0x2800` to `0x28FF` ), comma-separated list of numbers, or Uint8Array
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `'d'`_
     * - base 2 ← `'b'`, `"bin"`, `"bits"`, `"binary"`, or `"1bit"`
     * - base 3 ← `"ternary"` or `"trinary"`
     * - base 4 ← `'q'`, `"quaternary"`, or `"2bit"`
     * - base 5 ← `"quinary"` or `"pental"`
     * - base 6 ← `"senary"`, `"heximal"`, or `"seximal"`
     * - base 7 ← `"septenary"`
     * - base 8 ← `'o'`, `"oct"`, `"octal"`, or `"3bit"`
     * - base 9 ← `"nonary"`
     * - base 10 ← `'d'`, `"dec"`, `"decimal"`, `"decimal"` or `"denary"`
     * - base 11 ← `"undecimal"`
     * - base 12 ← `"duodecimal"`, `"dozenal"`, or `"uncial"`
     * - base 13 ← `"tridecimal"`
     * - base 14 ← `"tetradecimal"`
     * - base 15 ← `"pentadecimal"`
     * - base 16 ← `'h'`, `"hex"`, `"hexadecimal"`, `"sexadecimal"`, or `"4bit"`
     * - base 17 ← `"heptadecimal"`
     * - base 18 ← `"octodecimal"`
     * - base 19 ← `"enneadecimal"`
     * - base 20 ← `"vigesimal"`
     * - base 21 ← `"unvigesimal"`
     * - base 22 ← `"duovigesimal"`
     * - base 23 ← `"trivigesimal"`
     * - base 24 ← `"tetravigesimal"`
     * - base 25 ← `"pentavigesimal"`
     * - base 26 ← `"hexavigesimal"`
     * - base 27 ← `"heptavigesimal septemvigesimal"`
     * - base 28 ← `"octovigesimal"`
     * - base 29 ← `"enneavigesimal"`
     * - base 30 ← `"trigesimal"`
     * - base 31 ← `"untrigesimal"`
     * - base 32 ← `"duotrigesimal"` or `"5bit"`
     * - base 33 ← `"tritrigesimal"`
     * - base 34 ← `"tetratrigesimal"`
     * - base 35 ← `"pentatrigesimal"`
     * - base 36 ← `'t'`, `"txt"`, `"text"`, or `"hexatrigesimal"`
     * - base 37 ← `"heptatrigesimal"`
     * - base 38 ← `"octotrigesimal"`
     * - base 39 ← `"enneatrigesimal"`
     * - base 40 ← `"quadragesimal"`
     * - base 42 ← `"duoquadragesimal"`
     * - base 45 ← `"pentaquadragesimal"`
     * - base 47 ← `"septaquadragesimal"`
     * - base 48 ← `"octoquadragesimal"`
     * - base 49 ← `"enneaquadragesimal"`
     * - base 50 ← `"quinquagesimal"`
     * - base 52 ← `"duoquinquagesimal"`
     * - base 54 ← `"tetraquinquagesimal"`
     * - base 56 ← `"hexaquinquagesimal"`
     * - base 57 ← `"heptaquinquagesimal"`
     * - base 58 ← `"octoquinquagesimal"`
     * - base 60 ← `"sexagesimal"` or `"sexagenary"`
     * - base 62 ← `"duosexagesimal"`
     * - base 64 ← `"tetrasexagesimal"` or `"6bit"`
     * - base 72 ← `"duoseptuagesimal"`
     * - base 80 ← `"octogesimal"`
     * - base 81 ← `"unoctogesimal"`
     * - base 85 ← `"pentoctogesimal"`
     * - base 89 ← `"enneaoctogesimal"`
     * - base 90 ← `"nonagesimal"`
     * - base 91 ← `"unnonagesimal"`
     * - base 92 ← `"duononagesimal"`
     * - base 93 ← `"trinonagesimal"`
     * - base 94 ← `"tetranonagesimal"`
     * - base 95 ← `"pentanonagesimal"`
     * - base 96 ← `"hexanonagesimal"`
     * - base 97 ← `"septanonagesimal"`
     * - base 100 ← `"centesimal"`
     * - base 120 ← `"centevigesimal"`
     * - base 121 ← `"centeunvigesimal"`
     * - base 125 ← `"centepentavigesimal"`
     * - base 128 ← `"centeoctovigesimal"` or `"7bit"`
     * - base 144 ← `"centetetraquadragesimal"`
     * - base 169 ← `"centenovemsexagesimal"`
     * - base 185 ← `"centepentoctogesimal"`
     * - base 196 ← `"centehexanonagesimal"`
     * - base 200 ← `"duocentesimal"`
     * - base 210 ← `"duocentedecimal"`
     * - base 216 ← `"duocentehexidecimal"`
     * - base 225 ← `"duocentepentavigesimal"`
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, `"8bit"`, or `"braille"` ( `"braille"` must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
     * - base 300 ← `"trecentesimal"`
     * - base 360 ← `"trecentosexagesimal"`
     * - base 512 ← `"9bit"`
     * - base 1024 ← `"10bit"`
     * - base 2048 ← `"11bit"`
     * - base 4096 ← `"12bit"`
     * - base 8192 ← `"13bit"`
     * - base 16384 ← `"14bit"`
     * - base 32768 ← `"15bit"`
     * - base 65536 ← `"16bit"`
     * - base 131072 ← `"17bit"`
     * - base 262144 ← `"18bit"`
     * - base 524288 ← `"19bit"`
     * - base 1048576 ← `"20bit"`
     * - base 2097152 ← `"21bit"`
     * - base 4194304 ← `"22bit"`
     * - base 8388608 ← `"23bit"`
     * - base 16777216 ← `"24bit"`
     * - base 33554432 ← `"25bit"`
     * - base 67108864 ← `"26bit"`
     * - base 134217728 ← `"27bit"`
     * - base 268435456 ← `"28bit"`
     * - base 536870912 ← `"29bit"`
     * - base 1073741824 ← `"30bit"`
     * - base 2147483648 ← `"31bit"`
     * - base 4294967296 ← `"32bit"`
     * - any base within 1 to 4294967296 (incl.) can also be a number or a string representing that number
     * @throws {SyntaxError} - if `base` is not an available option _( outside the range of [1-4294967296] (incl.) )_
     * @throws {SyntaxError} - if `base` is `"braille"` and `num` is not a string
     * @throws {SyntaxError} - if `num` does not have the correct format for this `base`
     * @throws {RangeError} - if `num` exceedes `MAX_SIZE` ( after conversion in base 256 )
     * @throws {RangeError} - _if some Array could not be allocated ( system-specific & memory size )_
     */
    constructor(num='1',base='d'){
        base=BigIntType.#strBase(base);
        if(Number.isNaN(base)){throw new SyntaxError("[new BigIntType] base is not an available option");}
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
            num=String(num).toUpperCase();
            if(num==='0'||num==='\u2800'){this.#digits=new Uint8Array(1);return;}
            if(num==='1'||num==='\u2801'){this.#digits=new Uint8Array([1]);return;}
        }
        /**@type {boolean} - sign of the number (after the conversion) */
        let _sign=true;
        if(typeof num==="string"){
            if(base<=36){
                /**@type {RegExpMatchArray|null} - sign and number from string or `null` if no match*/
                let _match=num.match(BigIntType.#REGEXP_STRING(base));
                if(!_match){throw new SyntaxError(`[new BigIntType] num (string) does not have the correct format for base ${base===0?'256 (braille)':base}`);}
                _sign=_match[1]!=='-';
                _match[2]=_match[2].replace('_','');
                if(base===0){//~ braille-pattern
                    num=new Uint8Array([..._match[2]].map(v=>v.charCodeAt(0)-10240).reverse());
                    base=256;
                }else if(base===1){//~ length-1 = numerical value
                    if(_match[2].length===1){this.#sign=_sign;this.#digits=new Uint8Array(1);return;}
                    if(_match[2].length===2){this.#sign=_sign;this.#digits=new Uint8Array([0x1]);return;}
                    base=16;
                    num=new Uint8Array([...(_match[2].length-1).toString(base)].map(v=>Number.parseInt(v,base)).reverse());
                }else if(base<=10){num=new Uint8Array([..._match[2]].reverse());}
                else{num=new Uint8Array([..._match[2]].map(v=>Number.parseInt(v,base)).reverse());}
            }else{
                if(BigIntType.#CheckCSNum(num,base)){
                    if(base<=0x100){num=new Uint8Array(num.split(',').reverse());}
                    else if(base<=0x10000){num=new Uint16Array(num.split(',').reverse());}
                    else if(base<=0x1000000){num=new Uint32Array(num.split(',').reverse());}
                    else{num=Array.from(num.split(',').reverse(),Number);}
                }else{throw new SyntaxError(`[new BigIntType] num (string / comma separated list) does not have the correct format for base ${base}`);}
            }
        }else{
            if(base<=0x100&&num.some(v=>v>=base)){throw new SyntaxError(`[new BigIntType] num (Uint8Array) has incorrect values for base ${base}`);}
            if(base===1){//~ length-1 = numerical value
                if(num.length===1){this.#digits=new Uint8Array(1);return;}
                if(num.length===2){this.#digits=new Uint8Array([0x1]);return;}
                base=16;
                num=new Uint8Array([...(num.length-1).toString(base)].map(v=>Number.parseInt(v,base)).reverse());
            }
        }
        //~ (be aware that if num is not a string it can be Uint8Array, Uint16Array, Uint32Array, or number[] depending of base (to support the size of each digit))
        switch(base){
            case 0x2://~ 8* digits are 1 8bit digit
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
            case 0x4://~ 3* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(num.length/4));
                for(let i=0;i<this.length;i++){
                    this.#digits[i]=num[i*4]+
                        ((num[i*4+1]??0)*4)+
                        ((num[i*4+2]??0)*16)+ //~ 4**2
                        ((num[i*4+3]??0)*64); //~ 4**3
                }
                break;
            case 0x10://~ 2* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(num.length/2));
                for(let i=0;i<this.length;i++){this.#digits[i]=num[i*2]+((num[i*2+1]??0)*16);}
                break;
            case 0x100:this.#digits=num;break;//~ copy memory adress of original
            case 0x10000://~ each digit is two 8bit digits (2**(2*8) = 65_536)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(num.length*2>BigIntType.MAX_SIZE){throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);}
                this.#digits=new Uint8Array(num.length*2);
                for(let i=0;i<num.length;i++){
                    this.#digits[2*i  ]=num[i]&0x00FF;//~ (2**8-1) = 255
                    this.#digits[2*i+1]=num[i]&0xFF00;//~ (2**16-1)-(2**8-1) = 65_280
                }
                break;
            case 0x1000000://~ each digit is three 8bit digits (2**(3*8) = 16_777_216)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(num.length*3>BigIntType.MAX_SIZE){throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);}
                this.#digits=new Uint8Array(num.length*3);
                for(let i=0;i<num.length;i++){
                    this.#digits[3*i  ]=num[i]&0x0000FF;//~ (2**8-1) = 255
                    this.#digits[3*i+1]=num[i]&0x00FF00;//~ (2**16-1)-(2**8-1) = 65_280
                    this.#digits[3*i+2]=num[i]&0xFF0000;//~ (2**24-1)-(2**16-1) = 16_711_680
                }
                break;
            case 0x100000000://~ each digit is four 8bit digits (2**(4*8) = 4_294_967_296)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(num.length*4>BigIntType.MAX_SIZE){throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);}
                this.#digits=new Uint8Array(num.length*4);
                for(let i=0;i<num.length;i++){
                    //~ ()>>>0 to make the 32bit number unsigned (it is 32bit because of the use of bitwise operations - but also default signed so realy only 31bit)
                    this.#digits[4*i  ]=(num[i]&0x000000FF)>>>0;//~ (2**8-1) = 255
                    this.#digits[4*i+1]=(num[i]&0x0000FF00)>>>0;//~ (2**16-1)-(2**8-1) = 65_280
                    this.#digits[4*i+2]=(num[i]&0x00FF0000)>>>0;//~ (2**24-1)-(2**16-1) = 16_711_680
                    this.#digits[4*i+3]=(num[i]&0xFF000000)>>>0;//~ (2**32-1)-(2**24-1) = 4_294_967_296
                }
                break;
            default:
                //~ (because of the use of bitwise operations the numbers of the "base" var and each digit in bN can only get to 32bit (and allways needs `>>>` because of sign support of js bitwise operations))
                //! here type of num can be {Uint8Array|Uint16Array|Uint32Array|Number[]}
                /**@type {string[]} - digits in base `base`*/
                let bN=Array.from(num,String),
                    /**@type {string[]} - digits for base 256*/
                    b256__=[];
                for(let z=0;bN.length>1||bN[0]!=='0';z=0){//~ bN > 0
                    for(let iBit=0;iBit<8;iBit++){
                        //~ if the base is odd AND bN is not smaller than its base (i.e. more than one digit), invert the standard behavior, which is → when bN is odd, push a bit to the end of b256__
                        if(((base&1)&(bN.length>1))^(Number(bN[0])&1)){z+=(1<<iBit);}
                        //~ bN >>>= 1
                        if(bN.length===1&&bN[0]==='0'){break;}
                        else if(bN.length===1&&bN[0]==='1'){bN[0]='0';break;}
                        else{
                            if(base&1){//~ if base is odd the carry is...special
                                /**@type {undefined[]|null[]} - carry if `[i]` is `null`*/
                                let numCarry=Array(bN.length).fill(undefined),
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
                                //~ with rounding this would be added → if(numCarryLast){bN[0]=String(Number(bN[0])+1);}
                            }else{
                                bN[0]=String(Number(bN[0])>>>1);
                                for(let i=1;i<bN.length;i++){
                                    if(Number(bN[i])&1){bN[i-1]=String(Number(bN[i-1])+Math.floor(base*.5));}
                                    bN[i]=String(Number(bN[i])>>>1);
                                }
                            }
                            if(bN.length>1&&bN[bN.length-1]==='0'){bN.splice(-1,1);}
                        }
                    }
                    b256__.push(String.fromCharCode(z));
                }
                this.#digits=BigIntType.#toUint8Array(b256__);
                break;
        }
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        this.#sign=_sign;
        if(this.length>BigIntType.MAX_SIZE){throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);}
    }
    /**
     * __initialize iterator for `this` number__ \
     * iterate through each number in base 256 (starting with biggest numerical index) \
     * _( makes this element able to be used in a `for-of` loop )_
     * @returns {{next():{value:number;done:boolean;}}} iterator to get the next element in a loop
     */
    [Symbol.iterator](){
        const list=this.#digits.slice();
        let i=list.length;
        return{
            /**
             * __get the next element in a loop__
             * @returns {{value:number;done:boolean;}} value of next element and sets `done` `true` if it's the last element
             */
            next(){
                i--;
                return{value:list[i],done:i>0};
            }
        };
    };
    /**
     * __converts `this` number to `Number` type__ \
     * _may be +/- `Infinity`_
     * @returns {Number} `this` number as a `Number` type
     */
    toNumber(){return this.isFinite()?Number.parseInt(this.toString("16"),16):(this.#sign?Infinity:-Infinity);}
    /**
     * __convert `this` number to string__
     * @description
     * - output:
     *   - base `2` will have the prefix `"0b"`
     *   - base `8` will have the prefix `"0o"`
     *   - base `16` will have the prefix `"0x"`
     *   - base `"braille"` will be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`)
     *   - bases `2` to `10` use `'0'`-`'9'`
     *   - bases `11` to `36` use `'0'`-`'9'` and `'A'`-`'Z'`
     *   - bases `37` and above will be comma-separated lists of numbers, where each number represents the numerical value (in base 10) of the character at that location
     * * base `1` is not feasible at all because it gets way too big way too quick \
     *   and I also dont know how I would even start generating it xD
     * * `[!]` every base except "braille" would be impossible to generate eventually \
     *   because of strings maximum length of `2**53-1` (`9007199254740991`) \
     *   characters (`MAX_SAVE_INTEGER`)
     * * `[!]` also see https://stackoverflow.com/a/65570725/13282166 as example \
     *   of a realistic limit of string size would be in modern browsers \
     *   (spoiler: it's way less than the spec limit)
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `'h'`_
     * - base 2 ← `'b'`, `"bin"`, `"bits"`, `"binary"`, or `"1bit"`
     * - base 3 ← `"ternary"` or `"trinary"`
     * - base 4 ← `'q'`, `"quaternary"`, or `"2bit"`
     * - base 5 ← `"quinary"` or `"pental"`
     * - base 6 ← `"senary"`, `"heximal"`, or `"seximal"`
     * - base 7 ← `"septenary"`
     * - base 8 ← `'o'`, `"oct"`, `"octal"`, or `"3bit"`
     * - base 9 ← `"nonary"`
     * - base 10 ← `'d'`, `"dec"`, `"decimal"`, `"decimal"` or `"denary"`
     * - base 11 ← `"undecimal"`
     * - base 12 ← `"duodecimal"`, `"dozenal"`, or `"uncial"`
     * - base 13 ← `"tridecimal"`
     * - base 14 ← `"tetradecimal"`
     * - base 15 ← `"pentadecimal"`
     * - base 16 ← `'h'`, `"hex"`, `"hexadecimal"`, `"sexadecimal"`, or `"4bit"`
     * - base 17 ← `"heptadecimal"`
     * - base 18 ← `"octodecimal"`
     * - base 19 ← `"enneadecimal"`
     * - base 20 ← `"vigesimal"`
     * - base 21 ← `"unvigesimal"`
     * - base 22 ← `"duovigesimal"`
     * - base 23 ← `"trivigesimal"`
     * - base 24 ← `"tetravigesimal"`
     * - base 25 ← `"pentavigesimal"`
     * - base 26 ← `"hexavigesimal"`
     * - base 27 ← `"heptavigesimal septemvigesimal"`
     * - base 28 ← `"octovigesimal"`
     * - base 29 ← `"enneavigesimal"`
     * - base 30 ← `"trigesimal"`
     * - base 31 ← `"untrigesimal"`
     * - base 32 ← `"duotrigesimal"` or `"5bit"`
     * - base 33 ← `"tritrigesimal"`
     * - base 34 ← `"tetratrigesimal"`
     * - base 35 ← `"pentatrigesimal"`
     * - base 36 ← `'t'`, `"txt"`, `"text"`, or `"hexatrigesimal"`
     * - base 37 ← `"heptatrigesimal"`
     * - base 38 ← `"octotrigesimal"`
     * - base 39 ← `"enneatrigesimal"`
     * - base 40 ← `"quadragesimal"`
     * - base 42 ← `"duoquadragesimal"`
     * - base 45 ← `"pentaquadragesimal"`
     * - base 47 ← `"septaquadragesimal"`
     * - base 48 ← `"octoquadragesimal"`
     * - base 49 ← `"enneaquadragesimal"`
     * - base 50 ← `"quinquagesimal"`
     * - base 52 ← `"duoquinquagesimal"`
     * - base 54 ← `"tetraquinquagesimal"`
     * - base 56 ← `"hexaquinquagesimal"`
     * - base 57 ← `"heptaquinquagesimal"`
     * - base 58 ← `"octoquinquagesimal"`
     * - base 60 ← `"sexagesimal"` or `"sexagenary"`
     * - base 62 ← `"duosexagesimal"`
     * - base 64 ← `"tetrasexagesimal"` or `"6bit"`
     * - base 72 ← `"duoseptuagesimal"`
     * - base 80 ← `"octogesimal"`
     * - base 81 ← `"unoctogesimal"`
     * - base 85 ← `"pentoctogesimal"`
     * - base 89 ← `"enneaoctogesimal"`
     * - base 90 ← `"nonagesimal"`
     * - base 91 ← `"unnonagesimal"`
     * - base 92 ← `"duononagesimal"`
     * - base 93 ← `"trinonagesimal"`
     * - base 94 ← `"tetranonagesimal"`
     * - base 95 ← `"pentanonagesimal"`
     * - base 96 ← `"hexanonagesimal"`
     * - base 97 ← `"septanonagesimal"`
     * - base 100 ← `"centesimal"`
     * - base 120 ← `"centevigesimal"`
     * - base 121 ← `"centeunvigesimal"`
     * - base 125 ← `"centepentavigesimal"`
     * - base 128 ← `"centeoctovigesimal"` or `"7bit"`
     * - base 144 ← `"centetetraquadragesimal"`
     * - base 169 ← `"centenovemsexagesimal"`
     * - base 185 ← `"centepentoctogesimal"`
     * - base 196 ← `"centehexanonagesimal"`
     * - base 200 ← `"duocentesimal"`
     * - base 210 ← `"duocentedecimal"`
     * - base 216 ← `"duocentehexidecimal"`
     * - base 225 ← `"duocentepentavigesimal"`
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, `"8bit"`, or `"braille"`
     * - base 300 ← `"trecentesimal"`
     * - base 360 ← `"trecentosexagesimal"`
     * - base 512 ← `"9bit"`
     * - base 1024 ← `"10bit"`
     * - base 2048 ← `"11bit"`
     * - base 4096 ← `"12bit"`
     * - base 8192 ← `"13bit"`
     * - base 16384 ← `"14bit"`
     * - base 32768 ← `"15bit"`
     * - base 65536 ← `"16bit"`
     * - base 131072 ← `"17bit"`
     * - base 262144 ← `"18bit"`
     * - base 524288 ← `"19bit"`
     * - base 1048576 ← `"20bit"`
     * - base 2097152 ← `"21bit"`
     * - base 4194304 ← `"22bit"`
     * - base 8388608 ← `"23bit"`
     * - base 16777216 ← `"24bit"`
     * - base 33554432 ← `"25bit"`
     * - base 67108864 ← `"26bit"`
     * - base 134217728 ← `"27bit"`
     * - base 268435456 ← `"28bit"`
     * - base 536870912 ← `"29bit"`
     * - base 1073741824 ← `"30bit"`
     * - base 2147483648 ← `"31bit"`
     * - base 4294967296 ← `"32bit"`
     * - any base within 2 to 4294967296 (incl.) can also be a number or a string representing that number
     * @returns {string} `this` number as string (in base `base`)
     * @throws {SyntaxError} if `base` is not an available option _( outside the range of [2-4294967296] (incl.) )_
     * @throws {RangeError} - _if the string could not be allocated ( system-specific & memory size )_
     */
    toString(base=16){
        let out="";
        base=BigIntType.#strBase(base);
        if(Number.isNaN(base)||base===1){throw new SyntaxError("[toString] base is not an available option");}
        switch(base){
            case 0://~ braille-pattern
                for(let i=this.length-1;i>=0;i--){out+=String.fromCharCode(10240+this.#digits[i]);}
                break;
            case 0x2://~ [2] 8* digits are 1 8bit digit
                out="0b"+this.#digits[this.length-1].toString(2);
                for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(2).padStart(8,'0');}
                break;
            case 0x4://~ [4] 3* digits are 1 8bit digit
                out=this.#digits[this.length-1].toString(4);
                for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(4).padStart(4,'0');}
                break;
            case 0x10://~ [16] 2* digits are 1 8bit digit
                out="0x"+this.#digits[this.length-1].toString(16).toUpperCase();
                for(let i=this.length-2;i>=0;i--){out+=this.#digits[i].toString(16).toUpperCase().padStart(2,'0');}
                break;
            case 0x100://~ [256]
                for(let i=this.length-1;i>=0;i--){out+=String(this.#digits[i])+(i!==0?',':'');}
                break;
            case 0x10000://~ [65536] each digit is two 8bit digits (2**(2*8) = 65_536)
                for(let i=0;i<this.length;i+=2){
                    out=String(
                        this.#digits[2*i]+
                        (this.#digits[2*i+1]<<8)
                    )+(i!==0?',':'')+out;
                }
                break;
            case 0x1000000://~ [16777216] each digit is three 8bit digits (2**(3*8) = 16_777_216)
                for(let i=0;i<this.length;i+=3){
                    out=String(
                        this.#digits[3*i]+
                        (this.#digits[3*i+1]<<8)+
                        (this.#digits[3*i+2]<<16)
                    )+(i!==0?',':'')+out;
                }
                break;
            case 0x100000000://~ [4294967296] each digit is four 8bit digits (2**(4*8) = 4_294_967_296)
                for(let i=0;i<this.length;i+=4){
                    out=String(
                        //~ ()>>>0 to make the 32bit number unsigned (it is 32bit because of the use of bitwise operations - but also default signed so realy only 31bit)
                        (this.#digits[4*i]>>>0)+
                        ((this.#digits[4*i+1]<<8)>>>0)+
                        ((this.#digits[4*i+2]<<16)>>>0)+
                        ((this.#digits[4*i+3]<<24)>>>0)
                    )+(i!==0?',':'')+out;
                }
                break;
            default:
                if(base>=11&&base<=36){//~ i.e. use `Number.parseInt(X,base)` and `N.toString(base).toUpperCase()`
                    /**@type {string[]} - digit-array for output in base `base`*/
                    let bN=['0'];
                    for(let i=this.length-1;i>=0;i--){
                        for(let j=7;j>=0;j--){
                            //~ go through each bit ( pos = digits[i]&(1<<j) )
                            if(bN.length>1||bN[0]!=='0'){//~ ( bN > 0 ) → bN <<= 1
                                for(let k=0,o=false,z=0;k<bN.length||o;k++){
                                    if(bN[k]==='0'&&!o){continue;}
                                    z=(Number.parseInt(bN[k]??0,base)<<1)+(o?1:0);
                                    if(z>=base){
                                        bN[k]=(z-base).toString(base).toUpperCase();
                                        o=true;
                                    }else{
                                        bN[k]=z.toString(base).toUpperCase();
                                        o=false;
                                    }
                                }
                            }
                            //~ add current bit to the beginning of bN and if the base is odd handle potential digit overflow
                            if((this.#digits[i]&(1<<j))!==0){
                                if(base&1){
                                    const bN_0=Number.parseInt(bN[0],base)+1;
                                    if(bN_0>=base){
                                        bN[0]=(bN_0%base).toString(base).toUpperCase();
                                        for(let k=1,o=true;k<bN.length;k++){//~ handle overflow
                                            if(bN[k]==='0'&&!o){continue;}
                                            z=(Number.parseInt(bN[k]??0,base)<<1)+(o?1:0);
                                            if(z>=base){
                                                bN[k]=(z-base).toString(base).toUpperCase();
                                                o=true;
                                            }else{
                                                bN[k]=z.toString(base).toUpperCase();
                                                o=false;
                                            }
                                        }
                                    }else{bN[0]=(bN_0).toString(base).toUpperCase();}
                                }else{bN[0]=(Number.parseInt(bN[0],base)|1).toString(base).toUpperCase();}
                            }
                        }
                    }
                    out=bN.reverse().join('');
                }else{//~ just use `Number(X)` and `String(N)`
                    /** @type {string[]} - digit-array for output in base `base` */
                    let bN=['0'];
                    for(let i=this.length-1;i>=0;i--){
                        for(let j=7;j>=0;j--){
                            //~ go through each bit ( pos = digits[i]&(1<<j) )
                            if(bN.length>1||bN[0]!=='0'){//~ ( bN > 0 ) → bN <<= 1
                                for(let k=0,o=false,z=0;k<bN.length||o;k++){
                                    if(bN[k]==='0'&&!o){continue;}
                                    z=(Number(bN[k]??0)<<1)+(o?1:0);
                                    if(z>=base){
                                        bN[k]=String(z-base);
                                        o=true;
                                    }else{
                                        bN[k]=String(z);
                                        o=false;
                                    }
                                }
                            }
                            //~ add current bit to the beginning of bN and if the base is odd handle potential digit overflow
                            if(((this.#digits[i]&(1<<j))!==0)){
                                if(base&1){
                                    const bN_0=Number(bN[0])+1;
                                    if(bN_0>=base){
                                        bN[0]=String(bN_0%base);
                                        for(let k=1,o=true;k<bN.length;k++){//~ handle overflow
                                            if(bN[k]==='0'&&!o){continue;}
                                            z=(Number(bN[k]??0)<<1)+(o?1:0);
                                            if(z>=base){
                                                bN[k]=String(z-base);
                                                o=true;
                                            }else{
                                                bN[k]=String(z);
                                                o=false;
                                            }
                                        }
                                    }else{bN[0]=String(bN_0);}
                                }else{bN[0]=String(Number(bN[0])|1);}
                            }
                        }
                    }
                    out=bN.reverse().join((base<=10?'':','));
                }
        }
        if(!this.#sign){out='-'+out;}
        return out;
    }
    /**
     * __logs number as string (in base `base`) to console and returns itself (`this`)__ \
     * _( uses the `toString` method from `this` number )_
     * @description
     * - special cases:
     *   - base `2` will have the prefix `"0b"`
     *   - base `8` will have the prefix `"0o"`
     *   - base `16` will have the prefix `"0x"`
     *   - base `"braille"` will be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`)
     *   - bases `2` to `10` use `'0'`-`'9'`
     *   - bases `11` to `36` use `'0'`-`'9'` and `'A'`-`'Z'`
     *   - bases `37` and above will be comma-separated lists of numbers, where each number represents the numerical value (in base 10) of the character at that location
     * * base `1` is not feasible at all because it gets way too big way too quick \
     *   and I also dont know how I would even start generating it xD
     * * `[!]` every base except "braille" would be impossible to generate eventually \
     *   because of strings maximum length of `2**53-1` (`9007199254740991`) \
     *   characters (`MAX_SAVE_INTEGER`)
     * * `[!]` also see https://stackoverflow.com/a/65570725/13282166 as example \
     *   of a realistic limit of string size would be in modern browsers \
     *   (spoiler: it's way less than the spec limit)
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `'h'`_
     * - base 2 ← `'b'`, `"bin"`, `"bits"`, `"binary"`, or `"1bit"`
     * - base 3 ← `"ternary"` or `"trinary"`
     * - base 4 ← `'q'`, `"quaternary"`, or `"2bit"`
     * - base 5 ← `"quinary"` or `"pental"`
     * - base 6 ← `"senary"`, `"heximal"`, or `"seximal"`
     * - base 7 ← `"septenary"`
     * - base 8 ← `'o'`, `"oct"`, `"octal"`, or `"3bit"`
     * - base 9 ← `"nonary"`
     * - base 10 ← `'d'`, `"dec"`, `"decimal"`, `"decimal"` or `"denary"`
     * - base 11 ← `"undecimal"`
     * - base 12 ← `"duodecimal"`, `"dozenal"`, or `"uncial"`
     * - base 13 ← `"tridecimal"`
     * - base 14 ← `"tetradecimal"`
     * - base 15 ← `"pentadecimal"`
     * - base 16 ← `'h'`, `"hex"`, `"hexadecimal"`, `"sexadecimal"`, or `"4bit"`
     * - base 17 ← `"heptadecimal"`
     * - base 18 ← `"octodecimal"`
     * - base 19 ← `"enneadecimal"`
     * - base 20 ← `"vigesimal"`
     * - base 21 ← `"unvigesimal"`
     * - base 22 ← `"duovigesimal"`
     * - base 23 ← `"trivigesimal"`
     * - base 24 ← `"tetravigesimal"`
     * - base 25 ← `"pentavigesimal"`
     * - base 26 ← `"hexavigesimal"`
     * - base 27 ← `"heptavigesimal septemvigesimal"`
     * - base 28 ← `"octovigesimal"`
     * - base 29 ← `"enneavigesimal"`
     * - base 30 ← `"trigesimal"`
     * - base 31 ← `"untrigesimal"`
     * - base 32 ← `"duotrigesimal"` or `"5bit"`
     * - base 33 ← `"tritrigesimal"`
     * - base 34 ← `"tetratrigesimal"`
     * - base 35 ← `"pentatrigesimal"`
     * - base 36 ← `'t'`, `"txt"`, `"text"`, or `"hexatrigesimal"`
     * - base 37 ← `"heptatrigesimal"`
     * - base 38 ← `"octotrigesimal"`
     * - base 39 ← `"enneatrigesimal"`
     * - base 40 ← `"quadragesimal"`
     * - base 42 ← `"duoquadragesimal"`
     * - base 45 ← `"pentaquadragesimal"`
     * - base 47 ← `"septaquadragesimal"`
     * - base 48 ← `"octoquadragesimal"`
     * - base 49 ← `"enneaquadragesimal"`
     * - base 50 ← `"quinquagesimal"`
     * - base 52 ← `"duoquinquagesimal"`
     * - base 54 ← `"tetraquinquagesimal"`
     * - base 56 ← `"hexaquinquagesimal"`
     * - base 57 ← `"heptaquinquagesimal"`
     * - base 58 ← `"octoquinquagesimal"`
     * - base 60 ← `"sexagesimal"` or `"sexagenary"`
     * - base 62 ← `"duosexagesimal"`
     * - base 64 ← `"tetrasexagesimal"` or `"6bit"`
     * - base 72 ← `"duoseptuagesimal"`
     * - base 80 ← `"octogesimal"`
     * - base 81 ← `"unoctogesimal"`
     * - base 85 ← `"pentoctogesimal"`
     * - base 89 ← `"enneaoctogesimal"`
     * - base 90 ← `"nonagesimal"`
     * - base 91 ← `"unnonagesimal"`
     * - base 92 ← `"duononagesimal"`
     * - base 93 ← `"trinonagesimal"`
     * - base 94 ← `"tetranonagesimal"`
     * - base 95 ← `"pentanonagesimal"`
     * - base 96 ← `"hexanonagesimal"`
     * - base 97 ← `"septanonagesimal"`
     * - base 100 ← `"centesimal"`
     * - base 120 ← `"centevigesimal"`
     * - base 121 ← `"centeunvigesimal"`
     * - base 125 ← `"centepentavigesimal"`
     * - base 128 ← `"centeoctovigesimal"` or `"7bit"`
     * - base 144 ← `"centetetraquadragesimal"`
     * - base 169 ← `"centenovemsexagesimal"`
     * - base 185 ← `"centepentoctogesimal"`
     * - base 196 ← `"centehexanonagesimal"`
     * - base 200 ← `"duocentesimal"`
     * - base 210 ← `"duocentedecimal"`
     * - base 216 ← `"duocentehexidecimal"`
     * - base 225 ← `"duocentepentavigesimal"`
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, `"8bit"`, or `"braille"`
     * - base 300 ← `"trecentesimal"`
     * - base 360 ← `"trecentosexagesimal"`
     * - base 512 ← `"9bit"`
     * - base 1024 ← `"10bit"`
     * - base 2048 ← `"11bit"`
     * - base 4096 ← `"12bit"`
     * - base 8192 ← `"13bit"`
     * - base 16384 ← `"14bit"`
     * - base 32768 ← `"15bit"`
     * - base 65536 ← `"16bit"`
     * - base 131072 ← `"17bit"`
     * - base 262144 ← `"18bit"`
     * - base 524288 ← `"19bit"`
     * - base 1048576 ← `"20bit"`
     * - base 2097152 ← `"21bit"`
     * - base 4194304 ← `"22bit"`
     * - base 8388608 ← `"23bit"`
     * - base 16777216 ← `"24bit"`
     * - base 33554432 ← `"25bit"`
     * - base 67108864 ← `"26bit"`
     * - base 134217728 ← `"27bit"`
     * - base 268435456 ← `"28bit"`
     * - base 536870912 ← `"29bit"`
     * - base 1073741824 ← `"30bit"`
     * - base 2147483648 ← `"31bit"`
     * - base 4294967296 ← `"32bit"`
     * - any base within 2 to 4294967296 (incl.) can also be a number or a string representing that number
     * @returns {BigIntType} `this` with no changes
     * @throws {SyntaxError} if `base` is not an available option _( outside the range of [2-4294967296] (incl.) )_
     * @throws {RangeError} - _if the string could not be allocated ( system-specific & memory size )_
     */
    logConsole(base=16){
        base=BigIntType.#strBase(base);
        if(Number.isNaN(base)||base===1){throw new SyntaxError("[new BigIntType] base is not an available option");}
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
     * __swap `this` and `n`__
     * @param {BigIntType} n - number to swap values with (will be `this`)
     * @returns {BigIntType} `this` (will be `n`)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    swapWith(n){
        if(!(n instanceof BigIntType)){throw new TypeError("[reverseCopy] n is not an instance of BigIntType");}
        [this.#digits,n.#digits]=[n.#digits,this.#digits];
        [this.#sign,n.#sign]=[n.#sign,this.#sign];
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
     * __determines if `this` number is finite (`Number`)__ \
     * i.e. smaller than `BigIntType.Infinity` (`2**1024`)
     * @returns {boolean} `true` if `this` number is finite (`Number`)
     */
    isFinite(){return this.isSmallerThan(BigIntType.Infinity);}
    /**
     * __determines if `this` number is a safe integer (`Number`)__ \
     * i.e. smaller or equal to `9007199254740991` (`2**53−1`)
     * @returns {boolean} `true` if `this` number is a safe integer (`Number`)
     */
    isSafeInteger(){return this.isSmallerOrEqualTo(new BigIntType(new Uint8Array([0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0x1F]),"256"));}
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
        /**@type {Uint8Array} - new `Uint8Array`*/
        let tmp=new Uint8Array(digits.length);
        tmp.forEach((v,i,a)=>a[i]=digits[i].charCodeAt(0));
        return tmp;
    }
    /**
     * __constructs a new string-digit-array out of the given Uint8Array__
     * @param {Uint8Array} digits - digit-array as unsigned 8bit integer array
     * @returns {string[]} digit-array as string-array (char codes for digit values)
     */
    static #toStringArray(digits){
        /**@type {string[]} - new string array*/
        let _out=new Array(digits.length);
        digits.forEach((v,i)=>_out[i]=String.fromCharCode(v));
        return _out;
    }
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
        /**@type {number} - length of the smaller number */
        const len=Math.min(A.length,B.length);
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
        /**@type {number} - length of the smaller number */
        const len=Math.min(A.length,B.length);
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
    times256ToThePowerOf(x,rounding='r'){// TODO more rounding types
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
                    case'r':case"round":this.#digits=new Uint8Array([x===this.length?(this.#digits[x-1]>=0x80?1:0):0]);break;
                }
            }else{
                const _last=this.#digits[x-1];
                this.#digits=this.#digits.slice(x);
                switch(rounding){
                    case'c':case"ceil":if(_last!==0x0){this.inc();}break;
                    case'r':case"round":if(_last>=0x80){this.inc();}break;
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
        for(let i=tmp.length-1;i>=0;i--){
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
     * @param {string} rounding - _default `'r'`_
     * + `'r'` or `"round"` for rounding to the nearest integer
     * + `'c'` or `"ceil"` for rounding up the result
     * + `'f'` or `"floor"` for rounding down the result
     * @returns {BigIntType} `this / 2` (`this` modified)
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    half(rounding='r'){// TODO more rounding types
        rounding=String(rounding);if(!/^(c|ceil|f|floor)$/.test(rounding)){throw new SyntaxError("[half] rounding is not a valid option");}
        if(this.isZero()){return this;}
        const this_isOdd=this.isOdd();
        this.bitShiftR(1);
        if(this_isOdd){
            switch(rounding){
                case'c':case"ceil":
                case'r':case"round":
                    this.inc();
                break;
                // case'f':case"floor":break;
            }
        }
        return this;
    }
    /**
     * __calculates double of `this` number__ \
     * _modifies the original_
     * @returns {BigIntType} `this * 2` (`this` modified)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    double(){
        if(this.isZero()){return this;}
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
     * - `'r'` or `"round"` - round to nearest integer
     * - `'t'` or `"trunc"` - rounds towards `0`
     * - `'a'` or `"raise"` - rounds away from `0`
     * - `'f'` or `"floor"` - rounds towards `- Infinity`
     * - `'c'` or `"ceil"`  - rounds towards `+ Infinity`
     * @returns {BigIntType} `this / n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    div(n,rounding='r'){// TODO more rounding types
        if(!(n instanceof BigIntType)){throw new TypeError("[div] n is not an instance of BigIntType");}
        rounding=String(rounding);if(!/^(r|round|t|trunc|a|raise|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[div] rounding is not a valid option");}
        // dividend / divisor = quotient + remainder / divisor
        if(n.isZero()){throw new RangeError("[div] n is 0");}
        if(this.isZero()||n.isOne()){return n.#sign?this:this.neg();}
        if(n.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){this.times256ToThePowerOf(1-n.length,rounding);}
        else if(this.isAbsSmallerThanAbs(n)){
            this.#round_qr(rounding,this,n);
            switch(rounding){
                // TODO ~ sign ? before ?
                // case't':case"trunc":return this;
                // case'a':case"raise":return this.inc();
                case'c':case"ceil":this.#digits=new Uint8Array([0x1]);break;
                case'f':case"floor":this.#digits=new Uint8Array([0x0]);break;
                case'r':case"round":this.#digits=new Uint8Array([this.isAbsSmallerThanAbs(n.copy().half('r'))?0x1:0x0]);break;
            }
        }else if(this.isEqualTo(n)){this.#digits=new Uint8Array([0x1]);}
        else{
            /**@type {BigIntType[]}*/
            let [q,r]=(({quotient,remainder})=>[
                new BigIntType(quotient,"256"),
                new BigIntType(remainder,"256")
            ])(BigIntType.#calcDivRest(this.#digits,n.#digits));
            switch(rounding){
                // TODO
                // case't':case"trunc":return this;
                // case'a':case"raise":return this.inc();
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
    modulo(n,type='e'){// TODO
        if(!(n instanceof BigIntType)){throw new TypeError("[modulo] n is not an instance of BigIntType");}
        type=String(type);if(!/^(e|euclid|t|trunc|f|floor|c|ceil|r|round)$/.test(type)){throw new SyntaxError("[modulo] type is not a valid option");}
        if(n.isZero()){throw new RangeError("[modulo] cannot divide by 0");}
        // !  round → Q = round(A/B) → R = A-(B*Q) | round to nearest integer (>=floor(base/2) → round up)
        // !  trunc → Q = trunc(A/B) → R = A-(B*Q) | round to zero
        // !  raise → Q = raise(A/B) → R = A-(B*Q) | round away from zero
        // !  floor → Q = floor(A/B) → R = A-(B*Q) | round to negative infinity
        // !   ceil → Q = ceil(A/B) → R = A-(B*Q) | round to positive infinity
        // ! euclid → Q = sign(B)*floor(A/abs(B)) → R = A-abs(B)*floor(A/abs(B)) == R = A-(B*Q)
        // TODO new with return Q and R with type !!
        /*
            if(this.isZero()||n.isOne()){
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
        */
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
        // TODO ↓ ?
        //? if(n.isTwo()){this.#digits=new Uint8Array([(this.isOdd()?1:0)]);return this;}
        //? if(n.length>1&&n.#digits.every((v,i,a)=>(i<a.length-1&&v===0)||(i===a.length-1&&v===1))){return this.slice(0,n.length-2);}//~ [0,1,2,3,4,5] % [0,0,0,0,1] = [0,1,2,3]
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
            case'r':case"round":this.setEqualTo(R.copy().sub(n.copy().abs().half('r')).#sign?(this.#sign?R.sub(n.copy().abs()):n.copy().abs().sub(R)):(this.#sign?R:R.neg()));break;
        }
        return this;
        /* TODO more testing on types
            A % B = {Q;R} (Integers only !)

            +-N +-0 = ERROR

            +0  +N  = trunc{ Q: +0 R: +0 } floor{ Q: +0 R: +0 } euclid{ Q: +0 R: +0 } round{ Q: +0 R: +-0 } ceil{ Q: +0 R: -0 } raise{ Q: +0 R: -0 }
            +0  -N  = trunc{ Q: -0 R: +0 } floor{ Q: -0 R: -0 } euclid{ Q: -0 R: +0 } round{ Q: -0 R: +-0 } ceil{ Q: -0 R: +0 } raise{ Q: -0 R: -0 }
            -0  +N  = trunc{ Q: -0 R: -0 } floor{ Q: -0 R: +0 } euclid{ Q: -0 R: +0 } round{ Q: -0 R: -+0 } ceil{ Q: -0 R: -0 } raise{ Q: -0 R: +0 }
            -0  -N  = trunc{ Q: +0 R: -0 } floor{ Q: +0 R: -0 } euclid{ Q: +0 R: +0 } round{ Q: +0 R: -+0 } ceil{ Q: +0 R: +0 } raise{ Q: +0 R: +0 }

            +N  +1  = trunc{ Q: +N R: +0 } floor{ Q: +N R: +0 } euclid{ Q: +N R: +0 } round{ Q: +N R: +-0 } ceil{ Q: +N R: -0 } raise{ Q: +N R: -0 }
            +N  -1  = trunc{ Q: -N R: +0 } floor{ Q: -N R: -0 } euclid{ Q: -N R: +0 } round{ Q: -N R: +-0 } ceil{ Q: -N R: +0 } raise{ Q: -N R: -0 }
            -N  +1  = trunc{ Q: -N R: -0 } floor{ Q: -N R: +0 } euclid{ Q: -N R: +0 } round{ Q: -N R: -+0 } ceil{ Q: -N R: -0 } raise{ Q: -N R: +0 }
            -N  -1  = trunc{ Q: +N R: -0 } floor{ Q: +N R: -0 } euclid{ Q: +N R: +0 } round{ Q: +N R: -+0 } ceil{ Q: +N R: +0 } raise{ Q: +N R: +0 }

            +3  +5  = trunc{ Q: +0 R: +3 } floor{ Q: +0 R: +3 } euclid{ Q: +0 R: +3 } round{ Q: +1 R: -2 } ceil{ Q: +1 R: -2 } raise{ Q: +1 R: -2 }
            +3  -5  = trunc{ Q: -0 R: +3 } floor{ Q: -1 R: -2 } euclid{ Q: -0 R: +3 } round{ Q: -1 R: -2 } ceil{ Q: -0 R: +3 } raise{ Q: -1 R: -2 }
            -3  +5  = trunc{ Q: -0 R: -3 } floor{ Q: -1 R: +2 } euclid{ Q: -1 R: +2 } round{ Q: -1 R: +2 } ceil{ Q: -0 R: -3 } raise{ Q: -1 R: +2 }
            -3  -5  = trunc{ Q: +0 R: -3 } floor{ Q: +0 R: -3 } euclid{ Q: +1 R: +2 } round{ Q: +1 R: +2 } ceil{ Q: +1 R: +2 } raise{ Q: +1 R: +2 }

            +5  +3  = trunc{ Q: +1 R: +2 } floor{ Q: +1 R: +2 } euclid{ Q: +1 R: +2 } round{ Q: +2 R: -1 } ceil{ Q: +2 R: -1 } raise{ Q: +2 R: -1 }
            +5  -3  = trunc{ Q: -1 R: +2 } floor{ Q: -2 R: -1 } euclid{ Q: -1 R: +2 } round{ Q: -2 R: -1 } ceil{ Q: -1 R: +2 } raise{ Q: -2 R: -1 }
            -5  +3  = trunc{ Q: -1 R: -2 } floor{ Q: -2 R: +1 } euclid{ Q: -2 R: +1 } round{ Q: -2 R: +1 } ceil{ Q: -1 R: -2 } raise{ Q: -2 R: +1 }
            -5  -3  = trunc{ Q: +1 R: -2 } floor{ Q: +1 R: -2 } euclid{ Q: +2 R: +1 } round{ Q: +2 R: +1 } ceil{ Q: +2 R: +1 } raise{ Q: +2 R: +1 }

            ? 5/3 = 1 2/3 ~ 1.6666...
            ? 3/5 = 3/5 ~ 0.6

            ! round is, when rounding up, like raise (above) and when rounding down, like trunc (below)

            ? 4/3 = 1 1/3 ~ 1.3333...

            +4  +3  = round{ Q: +1 R: +1 } trunc{ Q: +1 R: +1 }
            +4  -3  = round{ Q: -1 R: +1 } trunc{ Q: -1 R: +1 }
            -4  +3  = round{ Q: -1 R: -1 } trunc{ Q: -1 R: -1 }
            -4  -3  = round{ Q: +1 R: -1 } trunc{ Q: +1 R: -1 }

            to achive A%B → Q;R → A=B*Q+R (thus R=A-B*Q in all cases)
            also usefull for A/B to Q+(R/B) (improper fraction to mixed fraction) (to improper fraction → N+(A/B) == ((N*B)+A)/B )

            ! the floor function rounds towards negative infinity (downwards always)
            ! the ceil function rounds towards positive infinity (upwards always)
            ! the round function rounds towards the nearest integer (base/2 rounds up, anything smaller rounds down, relative to zero) (~ 'cause it's undecided for top 2 cases use rounded down the sign for R ~)
            ! the trunc function rounds towards zero (removes the digits after decimal point ~ next (abs) smaller integer)
            ! ~~ the raise function rounds away from zero (reverse direction of trunc ~ next (abs) larger integer) (~ no official name ~)
            ! the sign function returns ([=0] → 0), ([>0] → +1), or ([<0] → -1)
            ! the abs function returns the absolute value of a number (sign set positive)

            round → Q = round(A/B) → R = A-(B*Q)
            trunc → Q = trunc(A/B) → R = A-(B*Q)
            raise → Q = raise(A/B) → R = A-(B*Q)
            floor → Q = floor(A/B) → R = A-(B*Q)
            ceil → Q = ceil(A/B) → R = A-(B*Q)
            euclid ↓
                [B>0] → Q = floor(A/B)
                [B<0] → Q = ceil(A/B)
                or  Q = sign(B)*floor(A/abs(B)) → R = A-abs(B)*floor(A/abs(B)) ~~ R = A-(B*Q)
        */
    }
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
            P3Calc2=BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(Yh.slice(),Yl)),
            P3Count=1;
        for(const max=Math.max(P3Calc1.length,P3Calc2.length);P3Count<max;P3Count*=2);
        let [P1,P2,P3]=[
            BigIntType.#calcKaratsuba(Xh,Yh),
            BigIntType.#calcKaratsuba(Xl,Yl),
            BigIntType.#calcKaratsuba(
                [...P3Calc1,...new Array(P3Count-P3Calc1.length).fill('\x00')],
                [...P3Calc2,...new Array(P3Count-P3Calc2.length).fill('\x00')]
            )
        ];
        return BigIntType.#removeLeadingZeros(BigIntType.#calcAdd(
            BigIntType.#calcAdd(
                [...new Array(X.length).fill('\x00'),...P1.slice()],
                [...new Array(Xh.length).fill('\x00'),...BigIntType.#removeLeadingZeros(BigIntType.#calcSub(P3,BigIntType.#calcAdd(P1.slice(),P2))._digits)]
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
        else if(this.isZero());
        else if(n.isZero()||this.isOne()){this.#digits=n.#digits.slice();}
        else if(n.isOne());
        else if(this.isAbsEqualToAbs(n)){
            try{this.pow(BigIntType.Two);}
            catch(e){throw (e instanceof RangeError)?new RangeError("[mul] would result in a number longer than MAX_SIZE"):e;}
        }else if(n.isTwo()){
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
                this.#digits=BigIntType.#toUint8Array(BigIntType.#removeLeadingZeros(BigIntType.#calcKaratsuba(
                    [...BigIntType.#toStringArray(this.#digits),...new Array(len-this.length).fill('\x00')],
                    [...BigIntType.#toStringArray(n.#digits),...new Array(len-n.length).fill('\x00')]
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
        let result=['\x01'];
        for(let karatsubaLen=0,base=BigIntType.#toStringArray(this.#digits),exp=BigIntType.#toStringArray(n.#digits);;){
            if(exp[0].charCodeAt(0)&0x1){
                BigIntType.#removeLeadingZeros(result);
                BigIntType.#removeLeadingZeros(base);
                for(karatsubaLen=1;karatsubaLen<Math.max(result.length,base.length);karatsubaLen*=2);//~ result*=base
                result=BigIntType.#calcKaratsuba(
                    [...result,...new Array(karatsubaLen-result.length).fill('\x00')],
                    [...base,...new Array(karatsubaLen-base.length).fill('\x00')]
                );
            }
            for(let i=0;i<exp.length;i++){//~ exp>>>=1
                exp[i]=String.fromCharCode((exp[i]).charCodeAt(0)>>>1);
                exp[i]=String.fromCharCode((exp[i]).charCodeAt(0)|((exp[i+1]??'\x00').charCodeAt(0)&1)<<7);
            }
            if(BigIntType.#removeLeadingZeros(exp).every(v=>v==='\x00')){break;}
            BigIntType.#removeLeadingZeros(base);
            for(karatsubaLen=1;karatsubaLen<base.length;karatsubaLen*=2);//~ base*=base
            base=BigIntType.#calcKaratsuba(
                [...base,...new Array(karatsubaLen-base.length).fill('\x00')],
                [...base,...new Array(karatsubaLen-base.length).fill('\x00')]
            );
            if(result.length>0x80000000||base.length>0x80000000){throw new RangeError("[pow] numbers exceeded 2GB during calculation");}//~ safety? (2GiB)
        }
        BigIntType.#removeLeadingZeros(result);
        if(result.length>BigIntType.MAX_SIZE){throw new RangeError("[pow] would result in a number longer than MAX_SIZE");}
        this.#digits=BigIntType.#toUint8Array(result);
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
    mapRange(initialLow,initialHigh,finalLow,finalHigh,rounding='r',limit=false){// TODO more rounding types
        if(!(initialLow instanceof BigIntType)){throw new TypeError("[mapRange] initialLow is not an instance of BigIntType");}
        if(!(initialHigh instanceof BigIntType)){throw new TypeError("[mapRange] initialHigh is not an instance of BigIntType");}
        if(!(finalLow instanceof BigIntType)){throw new TypeError("[mapRange] finalLow is not an instance of BigIntType");}
        if(!(finalHigh instanceof BigIntType)){throw new TypeError("[mapRange] finalHigh is not an instance of BigIntType");}
        if(initialLow.isEqualTo(initialHigh)){throw new RangeError("[mapRange] initialLow and initialHigh are the same value");}
        if(finalLow.isEqualTo(finalHigh)){throw new RangeError("[mapRange] finalLow and finalHigh are the same value");}
        rounding=String(rounding);if(!/^(r|round|f|floor|c|ceil)$/.test(rounding)){throw new SyntaxError("[mapRange] rounding is not a valid option");}
        limit=Boolean(limit);
        try{
            initialHigh=initialHigh.copy().sub(initialLow);
            this.setEqualTo(
                this.copy().sub(initialLow)
                .mul(finalHigh.copy().sub(finalLow))
                .add(initialHigh.copy().mul(finalLow))
                .div(initialHigh,rounding)
            );
        }catch(e){throw(e instanceof RangeError)?new RangeError("[mapRange] would result in a number longer than MAX_SIZE"):e;}
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
        for(let last=new Uint8Array(1);(last=BigIntType.#calcDivRest(A,B).remainder,(last.length>1||last[0]!==0x0));[A,B]=[B,last]);
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
                new BigIntType(new Uint8Array([0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0x0F]),"256"),
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

        [?] extra method for rounding types ? param ?!
        [!] floor round towards -infinity allways
        [!] ceil round towards +infinity allways
        [!] trunc round towards 0 allways
        [!] ?raise? round away from 0 allways
        [!] round round towards nearest integer (base/2 rounds 'up' and anything smaller rounds 'down', relative to 0)

        [!] make a url save base ui32 string for short-ish links
        [!] "save" function to ui32array and back (no calc just save !)

        [?] pow/mul more stable for large numbers ? test on MAZ01001.github.io/site/BigIntType_calc.html
        [!] in constructor auto detect base from prefix or base10 (base=null → prefix? || 10)
        [!] also an extra private method for "hexadecimal"=16 conversion/translation (switch in constructor, toString and logConsole) with every known base names ~
        [!] todo in mapRange and function for regexp below

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
} //~ or just u know use the actual BigInt xD - it might not have all the base conversions and a few of the other methods here but it's a lot faster since it's coded on a lower level ^^

try{//~ Test number to console
    const timing=performance.now();
    console.log(
        "TEST NUMBER: %c %s",
        "background-color:#000;color:#0f0;font-family:consolas;font-size:2em;",
        BigIntType.HelloThere.toString("braille")
    );
    console.log("base 7");
    new BigIntType("1201",7).logConsole(2).logConsole(10).logConsole(256);//=> 110111010(2) 442(10) 1,186(256)
    console.log("base 3");
    new BigIntType("1201",3).logConsole(3).logConsole(7).logConsole(10);//=> 1201(3) 64(7) 46(10)
    console.log("base 4300");
    new BigIntType("3253,4243,423,53,2,53",4300).logConsole(10).logConsole(256).logConsole(4300);//=> 4783635281686740978653(10) 1,3,82,70,127,232,123,221,203,221(256) 3253,4243,423,53,2,53(4300)
    console.log("base 256");
    new BigIntType(new Uint8Array([221,203,221,123,232,127,70,82,3,1]),256).logConsole(256);
    console.log("\ndone in %ims",performance.now()-timing);//=> 5ms :D
}catch(error){
    console.log("{%s} : \"%s\"",error.name,error.message);//~ show only recent message (on screen) and not the whole stack
    console.error(error);//~ but do log the whole error message with stack to console
}
