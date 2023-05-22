//@ts-check
"use strict";
/**
 * __Class for arbitrarily large integers with typed arrays__ \
 * can natively convert `BigIntType` numbers to `BigInt` or `String` when needed
 * @class
 * @author MAZ <https://MAZ01001.GitHub.io/>
 */
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
    /**
     * @type {number} - maximum possible length of a number _(excluding sign)_ - originally `500` = 0.5KB in RAM
     */
    static #MAX_SIZE=0x1F4;
    /**@returns {number} _current_ maximum possible length of a number _(excluding sign)_*/
    static get MAX_SIZE(){return BigIntType.#MAX_SIZE;}
    /**@throws {RangeError} - if setting this to a number that is not an integer in range `[1-67108864]` - _( `67108864` = 64MiB in RAM )_*/
    static set MAX_SIZE(n){
        //~ technically, max is 9007199254740991 (Number.MAX_SAFE_INTEGER) but with 1 Byte each entry that's almost 8PiB ! for ONE number
        //~ and chrome browser will only create typed arrays up to 2GiB ~
        if(!Number.isInteger(n)||n<1||n>0x4000000)throw new RangeError("[MAX_SIZE] must be an integer in range [1-67108864]");
        BigIntType.#MAX_SIZE=n;
    }
    /**
     * __converts base names to the corresponding number__ \
     * _( supports numbers from `0` to `4294967296` (incl.) )_
     * @param {string|number} str
     * * base of `num` as a number or string ( case insensitive )
     * - base braille ← `0` or `"braille"` ( must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
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
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, or `"8bit"`
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
            return str>=0&&str<=0x100000000?str:NaN;
        }
        switch(String(str).toLowerCase()){//~ ( https://en.wikipedia.org/wiki/list_of_numeral_systems#standard_positional_numeral_systems )
            //~ > "ALL YOUR BASE ARE BELONG TO US" --CATS
            case'b':case"bin":case"bits":case"binary":case"1bit":return 2;
            case"ternary":case"trinary":return 3;
            case'q':case"quaternary":case"2bit":return 4;
            case"quinary":case"pental":return 5;
            case"senary":case"heximal":case"seximal":return 6;
            case"septenary":return 7;
            case'o':case"oct":case"octal":case"3bit":return 8;
            case"nonary":return 9;
            case'd':case"dec":case"decimal":case"decimal":case"denary":return 0xA;
            case"undecimal":return 0xB;
            case"duodecimal":case"dozenal":case"uncial":return 0xC;
            case"tridecimal":return 0xD;
            case"tetradecimal":return 0xE;
            case"pentadecimal":return 0xF;
            case'h':case"hex":case"hexadecimal":case"sexadecimal":case"4bit":return 0x10;
            case"heptadecimal":return 0x11;
            case"octodecimal":return 0x12;
            case"enneadecimal":return 0x13;
            case"vigesimal":return 0x14;
            case"unvigesimal":return 0x15;
            case"duovigesimal":return 0x16;
            case"trivigesimal":return 0x17;
            case"tetravigesimal":return 0x18;
            case"pentavigesimal":return 0x19;
            case"hexavigesimal":return 0x1A;
            case"heptavigesimal":case"septemvigesimal":return 0x1B;
            case"octovigesimal":return 0x1C;
            case"enneavigesimal":return 0x1D;
            case"trigesimal":return 0x1E;
            case"untrigesimal":return 0x1F;
            case"duotrigesimal":case"5bit":return 0x20;
            case"tritrigesimal":return 0x21;
            case"tetratrigesimal":return 0x22;
            case"pentatrigesimal":return 0x23;
            case't':case"txt":case"text":case"hexatrigesimal":return 0x24;
            case"heptatrigesimal":return 0x25;
            case"octotrigesimal":return 0x26;
            case"enneatrigesimal":return 0x27;
            case"quadragesimal":return 0x28;
            case"duoquadragesimal":return 0x2A;
            case"pentaquadragesimal":return 0x2D;
            case"septaquadragesimal":return 0x2F;
            case"octoquadragesimal":return 0x30;
            case"enneaquadragesimal":return 0x31;
            case"quinquagesimal":return 0x32;
            case"duoquinquagesimal":return 0x34;
            case"tetraquinquagesimal":return 0x36;
            case"hexaquinquagesimal":return 0x38;
            case"heptaquinquagesimal":return 0x39;
            case"octoquinquagesimal":return 0x3A;
            case"sexagesimal":case"sexagenary":return 0x3C;
            case"duosexagesimal":return 0x3E;
            case"tetrasexagesimal":case"6bit":return 0x40;
            case"duoseptuagesimal":return 0x48;
            case"octogesimal":return 0x50;
            case"unoctogesimal":return 0x51;
            case"pentoctogesimal":return 0x55;
            case"enneaoctogesimal":return 0x59;
            case"nonagesimal":return 0x5A;
            case"unnonagesimal":return 0x5B;
            case"duononagesimal":return 0x5C;
            case"trinonagesimal":return 0x5D;
            case"tetranonagesimal":return 0x5E;
            case"pentanonagesimal":return 0x5F;
            case"hexanonagesimal":return 0x60;
            case"septanonagesimal":return 0x61;
            case"centesimal":return 0x64;
            case"centevigesimal":return 0x78;
            case"centeunvigesimal":return 0x79;
            case"centepentavigesimal":return 0x7D;
            case"centeoctovigesimal":case"7bit":return 0x80;
            case"centetetraquadragesimal":return 0x90;
            case"centenovemsexagesimal":return 0xA9;
            case"centepentoctogesimal":return 0xB9;
            case"centehexanonagesimal":return 0xC4;
            case"duocentesimal":return 0xC8;
            case"duocentedecimal":return 0xD2;
            case"duocentehexidecimal":return 0xD8;
            case"duocentepentavigesimal":return 0xE1;
            case"duocentehexaquinquagesimal":case"byte":case"8bit":return 0x100;
            case"braille":return 0;//~ braille-pattern (unicode)
            case"trecentesimal":return 0x12C;
            case"trecentosexagesimal":return 0x168;
            case"9bit":return 0x200;
            case"10bit":return 0x400;
            case"11bit":return 0x800;
            case"12bit":return 0x1000;
            case"13bit":return 0x2000;
            case"14bit":return 0x4000;
            case"15bit":return 0x8000;
            case"16bit":return 0x10000;
            case"17bit":return 0x20000;
            case"18bit":return 0x40000;
            case"19bit":return 0x80000;
            case"20bit":return 0x100000;
            case"21bit":return 0x200000;
            case"22bit":return 0x400000;
            case"23bit":return 0x800000;
            case"24bit":return 0x1000000;
            case"25bit":return 0x2000000;
            case"26bit":return 0x4000000;
            case"27bit":return 0x8000000;
            case"28bit":return 0x10000000;
            case"29bit":return 0x20000000;
            case"30bit":return 0x40000000;
            case"31bit":return 0x80000000;
            case"32bit":return 0x100000000;
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
        base=Math.abs(Number(base));if(!Number.isSafeInteger(base)||base>0x10)throw RangeError("[REGEXP_STRING] base is out of range");
        switch(Number(base)){//~ special cases
            case 0:return/^([+-]?)((?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+(?:_(?:\u2800|[\u2801-\u28FF][\u2800-\u28FF]*)+)*)$/;//~ base 256 in braille-patterns
            case 1:return/^([+-]?)(0+(?:_0+)*)$/;//~ length is the number value -1, so "0" is 0, "00" is 1, "000" is 2, etc.
            case 2:return/^([+-]?)(?:0b)?((?:0|1[01]*)+(?:_(?:0|1[01]*)+)*)$/i;
            case 8:return/^([+-]?)(?:0o)?((?:0|[1-7][0-7]*)+(?:_(?:0|[1-7][0-7]*)+)*)$/i;
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
        return /^([+-]?)(0?)$/i;
    }
    /**
     * @readonly
     * @returns {RegExp} regexp for comma separated number (list) - match groups: [sign, number]
     */
    static get #REGEXP_CSNUM(){return/^([+-]?)((?:0|[1-9][0-9]*(?:_[0-9]+)*)(?:\,(?:0|[1-9][0-9]*(?:_[0-9]+)*))*)$/;}
    /**
     * @type {boolean} - sign of the number - `true` = positive
     */
    #sign=true;
    /**
     * @readonly
     * @returns {boolean} sign of the number - `true` = positive
     */
    get sign(){return this.#sign;}
    /**
     * @type {Uint8Array} - the number as unsigned 8bit integer array (base 256) - index 0 is the 0st-digit of the number
     */
    #digits=new Uint8Array(1);
    /**
     * @readonly
     * @returns {Uint8Array} a copy of the digits as an unsigned 8bit integer array (base 256) - index 0 is the 0st-digit of the number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    get digits(){return this.#digits.slice();}
    /**
     * @readonly
     * @returns {number} number of digits (base 256)
     */
    get length(){return this.#digits.length;}
    /**
     * @readonly
     * @returns {BigIntType} biggest possible number according to `MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get MAX_VALUE(){return new BigIntType(new Uint8Array(BigIntType.MAX_SIZE).fill(0xFF),0x100);}
    /**
     * @readonly
     * @returns {BigIntType} "Hello There" in Braille - see `toString("braille")`
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 22B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get HelloThere(){
        if(BigIntType.MAX_SIZE<0x16)throw new RangeError("[HelloThere] MAX_SIZE is to small");
        return new BigIntType(Uint8Array.of(0x41,0xEF,0x85,0x5F,0x41,0xEF,0x47,0x67,1,0xB9,0,0,0x47,0xCF,0x40,0xC7,0x40,0xC7,0x41,0xEF,0x47,0x67),0x100);
    }
    /**
     * @readonly
     * @returns {BigIntType} `Infinity` (`Number`) - `2**1024` (use `isFinite` for checking a number below or equal to `Number.MAX_VALUE`)
     * @throws {RangeError} - if current `MAX_SIZE` is to small - requires 129B
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Infinity(){
        if(BigIntType.MAX_SIZE<0x81)throw new RangeError("[Infinity] MAX_SIZE is to small");
        return new BigIntType(Uint8Array.of(...new Uint8Array(0x80),1),0x100);
    }
    /**
     * @readonly
     * @returns {BigIntType} `0`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Zero(){return new BigIntType(Uint8Array.of(0),0x100);}
    /**
     * @readonly
     * @returns {BigIntType} `1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get One(){return new BigIntType(Uint8Array.of(1),0x100);}
    /**
     * @readonly
     * @returns {BigIntType} `2`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get Two(){return new BigIntType(Uint8Array.of(2),0x100);}
    /**
     * @readonly
     * @returns {BigIntType} `-1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get NOne(){return BigIntType.One.neg();}
    /**
     * @readonly
     * @returns {BigIntType} `-2`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static get NTwo(){return BigIntType.Two.neg();}
    /**
     * __constructs a BigIntType number__
     * @param {string|bigint|number|number[]|Uint8Array} num
     * * an integer - _default `'1'`_
     * * note:
     *   * ( `base` is ignored if `num` is of type `bigint` or `number` )
     *   * ( in arrays the number is unsigned/positive and index 0 = 0th-place-digit for example: `"1230"` → `[0,3,2,1]` )
     *   * ( if `num` is an Uint8Array and `base` 256 then the original Uint8Array will be used )
     * - type `number` and `number[]` must be integers
     * - `base` `1`                  → as a string or an array of just 0s ( length of the number, minus one, equals the numerical value of it )
     * - `base` `2` to `36`          → as a string with alphanumeric symbols (0 to 9 and A to Z) or an array
     * - `base` `37` to `4294967296` → as a string as comma-separated list of numbers ( can use sign ) or an array
     * - `base` `"braille"` (256)    → as a string with characters "⠀" to "⣿" ( braille-patterns U+2800 to U+28FF ) (can use sign)
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `10`_
     * - base braille ← `0` or `"braille"` ( must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
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
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, or `"8bit"`
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
     * @throws {SyntaxError} if `base` is not an available option _( outside the range of [0-4294967296] (incl.) )_
     * @throws {RangeError} if `num` is not an integer when type `number` or an integer array when type `number[]`
     * @throws {RangeError} if `num` as array has incorrect values according to `base`
     * @throws {SyntaxError} if `base` is `"braille"` and `num` is not a string
     * @throws {SyntaxError} if `num` does not have the correct format for this `base`
     * @throws {RangeError} if `num` exceedes `MAX_SIZE` ( after conversion in base 256 )
     * @throws {RangeError} _if some Array could not be allocated ( system-specific & memory size )_
     */
    constructor(num='1',base=0xA){
        /**@type {string|bigint|number|number[]|Uint8Array} current digits array - content and type might change*/
        let currentDigits=num,
            /**@type {number} current base of `currentDigits` - value might change*/
            currentBase=BigIntType.#strBase(base);
        if(Number.isNaN(currentBase))throw new SyntaxError("[new BigIntType] base is not an available option");
        this.#sign=true;
        if(currentDigits instanceof Uint8Array){
            if(currentDigits.some(v=>v>=currentBase))throw new RangeError(`[new BigIntType] num (Uint8Array) has incorrect values for base ${currentBase}`);
        }else if(Array.isArray(currentDigits)){
            let count=0;
            currentDigits.forEach(v=>{
                if(typeof v!=="number")throw new SyntaxError("[new BigIntType] num is not an integer array");
                if(v<0||v>=currentBase)throw new RangeError(`[new BigIntType] num (integer array) has incorrect values for base ${currentBase}`);
                count++;
            });
            if(currentDigits.length!==count)throw new SyntaxError("[new BigIntType] num (array) has empty entries / holes");
            if(currentBase<=0x100)currentDigits=Uint8Array.from(currentDigits);
        }else if(typeof currentDigits==="number"){
            if(!Number.isInteger(currentDigits))throw new RangeError("[new BigIntType] num is not an integer");
            currentDigits=currentDigits.toString(0x10);
            currentBase=0x10;
        }else if(typeof currentDigits==="bigint"){
            currentDigits=currentDigits.toString(0x10);
            currentBase=0x10;
        }else currentDigits=String(currentDigits).toUpperCase();
        if(currentBase===0&&typeof currentDigits!=="string")throw new SyntaxError("[new BigIntType] base \"braille\" requires num to be a string");
        if(typeof currentDigits==="string"){
            if(currentBase<=0x24){
                /**@type {RegExpMatchArray|null} - sign and number from string or `null` if no match*/
                let _match=currentDigits.match(BigIntType.#REGEXP_STRING(currentBase));
                if(!_match)throw new SyntaxError(`[new BigIntType] num (string) does not have the correct format for base ${currentBase===0?'256 (braille)':currentBase}`);
                this.#sign=_match[1]!=='-';
                _match[2]=_match[2].replace('_','');
                if(currentBase===0){//~ braille-pattern
                    currentBase=0x100;
                    currentDigits=Uint8Array.from(_match[2].split('').reverse(),v=>v.charCodeAt(0)-0x2800);
                }else if(currentBase===1){//~ length-1 = numerical value
                    currentBase=0x10;
                    currentDigits=Uint8Array.from((_match[2].length-1).toString(currentBase).split('').reverse(),v=>Number.parseInt(v,currentBase));
                }else currentDigits=Uint8Array.from(_match[2].split('').reverse(),v=>Number.parseInt(v,currentBase));
            }else{
                const CSNumError=new SyntaxError(`[new BigIntType] num (string / comma separated list) does not have the correct format for base ${currentBase}`);
                let _match=currentDigits.match(BigIntType.#REGEXP_CSNUM);
                if(!_match)throw CSNumError;
                const _digits=_match[2].replace('_','').split(',').reverse(),
                    baseStr=String(currentBase);
                for(let i=0;i<_digits.length;i++){
                    if(_digits[i].length>baseStr.length)throw CSNumError;
                    if(_digits[i].length===baseStr.length)
                        for(let j=0;j<baseStr.length;j++){
                            if(_digits[i].charCodeAt(j)>baseStr.charCodeAt(j))throw CSNumError;
                            if(_digits[i].charCodeAt(j)<baseStr.charCodeAt(j))break;
                            if(j===baseStr.length-1)throw CSNumError;
                        }
                }
                this.#sign=_match[1]!=='-';
                if(currentBase<=0x100)currentDigits=Uint8Array.from(_digits,Number);
                else currentDigits=Array.from(_digits,Number);
            }
        }else if(currentBase===1){//~ length-1 = numerical value
            currentBase=0x10;
            currentDigits=Uint8Array.from((currentDigits.length-1).toString(currentBase).split('').reverse(),v=>Number.parseInt(v,currentBase));
        }
        //! here type of currentDigits is Uint8Array or number[] when base > 256
        switch(currentBase){
            case 2://~ 8* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(currentDigits.length/8));
                for(let i=0;i<this.length;i++)
                    this.#digits[i]=currentDigits[i*8]
                        +((currentDigits[i*8+1]??0)<<1)
                        +((currentDigits[i*8+2]??0)<<2)
                        +((currentDigits[i*8+3]??0)<<3)
                        +((currentDigits[i*8+4]??0)<<4)
                        +((currentDigits[i*8+5]??0)<<5)
                        +((currentDigits[i*8+6]??0)<<6)
                        +((currentDigits[i*8+7]??0)<<7);
            break;
            case 4://~ 4* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(currentDigits.length/4));
                for(let i=0;i<this.length;i++)
                    this.#digits[i]=currentDigits[i*4]
                        +((currentDigits[i*4+1]??0)<<2)
                        +((currentDigits[i*4+2]??0)<<4)
                        +((currentDigits[i*4+3]??0)<<6);
            break;
            case 0x10://~ 2* digits are 1 8bit digit
                this.#digits=new Uint8Array(Math.ceil(currentDigits.length/2));
                for(let i=0;i<this.length;i++)
                    this.#digits[i]=currentDigits[i*2]
                        +((currentDigits[i*2+1]??0)<<4);
            break;
            case 0x100://~ copy memory adress of original
                //@ts-ignore currentDigits type here is Uint8Array only
                this.#digits=currentDigits;
            break;
            case 0x10000://~ each digit is two 8bit digits (2**(2*8) = 65536)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(currentDigits.length*2>BigIntType.MAX_SIZE)throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);
                this.#digits=new Uint8Array(currentDigits.length*2);
                for(let i=0;i<currentDigits.length;i++){
                    this.#digits[2*i]=currentDigits[i]&0xFF;//~ (2**8-1) = 255
                    this.#digits[2*i+1]=currentDigits[i]&0xFF00;//~ (2**16-1)-(2**8-1) = 65280
                }
            break;
            case 0x1000000://~ each digit is three 8bit digits (2**(3*8) = 16777216)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(currentDigits.length*3>BigIntType.MAX_SIZE)throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);
                this.#digits=new Uint8Array(currentDigits.length*3);
                for(let i=0;i<currentDigits.length;i++){
                    this.#digits[3*i]=currentDigits[i]&0xFF;//~ (2**8-1) = 255
                    this.#digits[3*i+1]=currentDigits[i]&0xFF00;//~ (2**16-1)-(2**8-1) = 65280
                    this.#digits[3*i+2]=currentDigits[i]&0xFF0000;//~ (2**24-1)-(2**16-1) = 16711680
                }
            break;
            case 0x100000000://~ each digit is four 8bit digits (2**(4*8) = 4294967296)
                //~ (check the size before creating because it could be bigger than MAX_SAVE_INTEGER and is impossible for Uint8Array to create)
                if(currentDigits.length*4>BigIntType.MAX_SIZE)throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);
                this.#digits=new Uint8Array(currentDigits.length*4);
                for(let i=0;i<currentDigits.length;i++){
                    //~ ()>>>0 to make the 32bit number unsigned (it is 32bit because of the use of bitwise operations - but also default signed so realy only 31bit)
                    this.#digits[4*i]=(currentDigits[i]&0xFF)>>>0;//~ (2**8-1) = 255
                    this.#digits[4*i+1]=(currentDigits[i]&0xFF00)>>>0;//~ (2**16-1)-(2**8-1) = 65280
                    this.#digits[4*i+2]=(currentDigits[i]&0xFF0000)>>>0;//~ (2**24-1)-(2**16-1) = 16711680
                    this.#digits[4*i+3]=(currentDigits[i]&0xFF000000)>>>0;//~ (2**32-1)-(2**24-1) = 4294967296
                }
            break;
            default:
                //~ (because of the use of bitwise operations the numbers of the "base" var and each digit in bN can only get to 32bit (and allways needs `>>>` because of sign support of js bitwise operations))
                /**@type {number[]} - digits in base `base`*/
                let bN=Array.from(currentDigits,Number),
                    /**@type {string} - digits for base 256*/
                    b256__="";
                for(let z=0;bN.length>1||bN[0]!==0;z=0){//~ bN > 0
                    for(let iBit=0;iBit<8;iBit++){
                        //~ if the base is odd AND bN is not smaller than its base (i.e. more than one digit), invert the standard behavior, which is → when bN is odd, push a bit to the end of b256__
                        if(((currentBase&1)&(bN.length>1?1:0))^(bN[0]&1))z+=1<<iBit;
                        //~ bN >>>= 1
                        if(bN.length===1&&bN[0]===0)break;
                        else if(bN.length===1&&bN[0]===1){
                            bN[0]=0;
                            break;
                        }else{
                            if((currentBase&1)===1){//~ if base is odd the carry is...special
                                /**@type {undefined[]|null[]} - carry if `[i]` is `null`*/
                                let numCarry=Array(bN.length).fill(undefined),
                                    /**@type {boolean} - true if it's currently durring a carry*/
                                    numCarryLast=false
                                for(let i=0;i<bN.length;i++){//~ bN>>>=1 and save carry
                                    if((bN[i]&1)===1)numCarry[i]=null;
                                    bN[i]>>>=1;
                                }
                                for(let i=numCarry.length-1;i>=0;i--){//~ apply carry
                                    if(numCarryLast)bN[i]+=Math.floor(currentBase*.5);
                                    if(numCarry[i]===null){
                                        if(numCarryLast)bN[i]++;
                                        numCarryLast=!numCarryLast;
                                    }
                                }
                                //~ with rounding this would be added → if(numCarryLast){bN[0]=String(Number(bN[0])+1);}
                            }else{
                                bN[0]>>>=1;
                                for(let i=1;i<bN.length;i++){
                                    if((bN[i]&1)===1)bN[i-1]+=Math.floor(currentBase*.5);
                                    bN[i]>>>=1;
                                }
                            }
                            if(bN.length>1&&bN[bN.length-1]===0)bN.pop();
                        }
                    }
                    b256__+=String.fromCharCode(z);
                }
                this.#digits=b256__===""?Uint8Array.of(0):Uint8Array.from(b256__,v=>v.charCodeAt(0));
            break;
        }
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);//~ should always return self (unmodified/original)
        if(this.length>BigIntType.MAX_SIZE)throw new RangeError(`[new BigIntType] new number is longer than [MAX_SIZE]`);
    }
    /**
     * __initialize iterator for `this` number__ \
     * iterate through each digit in base 256 in reading order (starting with biggest numerical index - reverse of `digits`) \
     * generator makes a copy of the digits array at start (modifications to `this` number during iteration do not affect this generator) \
     * _( makes `this` able to be used in a `for-of` loop )_
     * @readonly
     * @returns {Generator<number,void,unknown>} generator/iterator to get the next digit (8 bit `Number`) in a loop
     */
    get[Symbol.iterator](){return (function*(digits){for(let i=digits.length-1;i>=0;i--)yield digits[i];})(this.#digits.slice());}
    /**
     * __get the object (string) descriptor__
     * @readonly
     */
    get[Symbol.toStringTag](){return "BigIntType"}
    /**
     * __convert `this` number to the closest (numeric) primitive (`BigInt`)__
     * @returns {bigint} `this` number as a `BigInt` number
     */
    valueOf(){return this.toBigInt();}
    /**
     * __converts `this` number to `Number` type__ \
     * _may be +/- `Infinity`_
     * @returns {Number} `this` number as a `Number` type
     */
    toNumber(){return this.isFinite()?Number.parseInt(this.toString(0x10),0x10):(this.#sign?Infinity:-Infinity);}
    /**
     * __converts `this` number to `BigInt` type__
     * @returns {bigint} `this` number as a `BigInt` type
     */
    toBigInt(){
        if(this.#sign)return BigInt(this.toString(0x10));
        const out=BigInt(this.abs().toString(0x10))*-1n;
        this.neg();
        return out;
    }
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
     * * base `1` is not feasible at all because it gets way too big way too quick!
     * * `[!]` every base except "braille" would be impossible to generate eventually \
     *   because of strings maximum length of `2**53-1` (`9007199254740991`) \
     *   characters (`MAX_SAVE_INTEGER`)
     * * `[!]` also see https://stackoverflow.com/a/65570725/13282166 as example \
     *   of a realistic limit of string size would be in modern browsers \
     *   (spoiler: it's way less than the spec limit)
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `16`_
     * - base braille ← `0` or `"braille"` ( must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
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
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, or `"8bit"`
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
     * @throws {SyntaxError} if `base` is not an available option _( outside the range of [0;2-4294967296] (incl.) )_
     * @throws {RangeError} - _if the string could not be allocated ( system-specific & memory size )_
     */
    toString(base=0x10){
        let out="";
        base=BigIntType.#strBase(base);
        if(Number.isNaN(base)||base===1)throw new SyntaxError("[toString] base is not an available option");
        switch(base){
            case 0://~ braille-pattern
                for(let i=this.length-1;i>=0;i--)out+=String.fromCharCode(0x2800+this.#digits[i]);
            break;
            case 2://~ [2] 8* digits are 1 8bit digit
                out="0b"+this.#digits[this.length-1].toString(2);
                for(let i=this.length-2;i>=0;i--)out+=this.#digits[i].toString(2).padStart(8,'0');
            break;
            case 4://~ [4] 3* digits are 1 8bit digit
                out=this.#digits[this.length-1].toString(4);
                for(let i=this.length-2;i>=0;i--)out+=this.#digits[i].toString(4).padStart(4,'0');
            break;
            case 0x10://~ [16] 2* digits are 1 8bit digit
                out="0x"+this.#digits[this.length-1].toString(0x10).toUpperCase();
                for(let i=this.length-2;i>=0;i--)out+=this.#digits[i].toString(0x10).toUpperCase().padStart(2,'0');
            break;
            case 0x100://~ [256]
                for(let i=this.length-1;i>=0;i--)out+=String(this.#digits[i])+(i!==0?',':'');
            break;
            case 0x10000://~ [65536] each digit is two 8bit digits (2**(2*8))
                for(let i=0;i<this.length;i+=2)
                    out=String(
                        this.#digits[i]
                        +(this.#digits[i+1]<<8)
                    )+(i!==0?',':'')+out;
            break;
            case 0x1000000://~ [16777216] each digit is three 8bit digits (2**(3*8))
                for(let i=0;i<this.length;i+=3)
                    out=String(
                        this.#digits[i]
                        +(this.#digits[i+1]<<8)
                        +(this.#digits[i+2]<<0x10)
                    )+(i!==0?',':'')+out;
            break;
            case 0x100000000://~ [4294967296] each digit is four 8bit digits (2**(4*8))
                for(let i=0;i<this.length;i+=4)
                    out=String(
                        //~ ()>>>0 to make the 32bit number unsigned (it is 32bit because of the use of bitwise operations - but also default signed so realy only 31bit)
                        (this.#digits[i]>>>0)
                        +((this.#digits[i+1]<<8)>>>0)
                        +((this.#digits[i+2]<<0x10)>>>0)
                        +((this.#digits[i+3]<<0x18)>>>0)
                    )+(i!==0?',':'')+out;
            break;
            default:
                if(base>=0xB&&base<=0x24){//~ i.e. use `Number.parseInt(X,base)` and `N.toString(base).toUpperCase()`
                    /**@type {string[]} - digit-array for output in base `base`*/
                    let bN=['0'];
                    for(let i=this.length-1;i>=0;i--)
                        for(let j=7;j>=0;j--){
                            //~ go through each bit ( pos = digits[i]&(1<<j) )
                            if(bN.length>1||bN[0]!=='0')//~ ( bN > 0 ) → bN <<= 1
                                for(let k=0,o=false,z=0;k<bN.length||o;k++){
                                    if(bN[k]==='0'&&!o)continue;
                                    z=(Number.parseInt(bN[k]??0,base)<<1)+(o?1:0);
                                    if(z>=base){
                                        bN[k]=(z-base).toString(base).toUpperCase();
                                        o=true;
                                    }else{
                                        bN[k]=z.toString(base).toUpperCase();
                                        o=false;
                                    }
                                }
                            //~ add current bit to the beginning of bN and if the base is odd handle potential digit overflow
                            if((this.#digits[i]&(1<<j))!==0){
                                if(base&1){
                                    const bN_0=Number.parseInt(bN[0],base)+1;
                                    if(bN_0>=base){
                                        bN[0]=(bN_0%base).toString(base).toUpperCase();
                                        for(let k=1,o=true,z=0;k<bN.length;k++){//~ handle overflow
                                            if(bN[k]==='0'&&!o)continue;
                                            z=(Number.parseInt(bN[k]??0,base)<<1)+(o?1:0);
                                            if(z>=base){
                                                bN[k]=(z-base).toString(base).toUpperCase();
                                                o=true;
                                            }else{
                                                bN[k]=z.toString(base).toUpperCase();
                                                o=false;
                                            }
                                        }
                                    }else bN[0]=(bN_0).toString(base).toUpperCase();
                                }else bN[0]=(Number.parseInt(bN[0],base)|1).toString(base).toUpperCase();
                            }
                        }
                    out=bN.reverse().join('');
                }else{//~ just use `Number(X)` and `String(N)`
                    /** @type {string[]} - digit-array for output in base `base` */
                    let bN=['0'];
                    for(let i=this.length-1;i>=0;i--)
                        for(let j=7;j>=0;j--){
                            //~ go through each bit ( pos = digits[i]&(1<<j) )
                            if(bN.length>1||bN[0]!=='0')//~ ( bN > 0 ) → bN <<= 1
                                for(let k=0,o=false,z=0;k<bN.length||o;k++){
                                    if(bN[k]==='0'&&!o)continue;
                                    z=(Number(bN[k]??0)<<1)+(o?1:0);
                                    if(z>=base){
                                        bN[k]=String(z-base);
                                        o=true;
                                    }else{
                                        bN[k]=String(z);
                                        o=false;
                                    }
                                }
                            //~ add current bit to the beginning of bN and if the base is odd handle potential digit overflow
                            if(((this.#digits[i]&(1<<j))!==0)){
                                if(base&1){
                                    const bN_0=Number(bN[0])+1;
                                    if(bN_0>=base){
                                        bN[0]=String(bN_0%base);
                                        for(let k=1,o=true,z=0;k<bN.length;k++){//~ handle overflow
                                            if(bN[k]==='0'&&!o)continue;
                                            z=(Number(bN[k]??0)<<1)+(o?1:0);
                                            if(z>=base){
                                                bN[k]=String(z-base);
                                                o=true;
                                            }else{
                                                bN[k]=String(z);
                                                o=false;
                                            }
                                        }
                                    }else bN[0]=String(bN_0);
                                }else bN[0]=String(Number(bN[0])|1);
                            }
                        }
                    out=bN.reverse().join(base<=0xA?'':',');
                }
        }
        if(!this.#sign)out='-'+out;
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
     * * base `1` is not feasible at all because it gets way too big way too quick!
     * * `[!]` every base except "braille" would be impossible to generate eventually \
     *   because of strings maximum length of `2**53-1` (`9007199254740991`) \
     *   characters (`MAX_SAVE_INTEGER`)
     * * `[!]` also see https://stackoverflow.com/a/65570725/13282166 as example \
     *   of a realistic limit of string size would be in modern browsers \
     *   (spoiler: it's way less than the spec limit)
     * @param {string|number} base
     * * base of `num` as a number or string ( case insensitive ) - _default `'h'`_
     * - base braille ← `0` or `"braille"` ( must be a string with `'⠀'`-`'⣿'` (Unicode Braille Pattern `0x2800`-`0x28FF`) )
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
     * - base 256 ← `"duocentehexaquinquagesimal"`, `"byte"`, or `"8bit"`
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
     * @throws {SyntaxError} if `base` is not an available option _( outside the range of [0;2-4294967296] (incl.) )_
     * @throws {RangeError} - _if the string could not be allocated ( system-specific & memory size )_
     */
    logConsole(base=0x10){
        base=BigIntType.#strBase(base);
        if(Number.isNaN(base)||base===1)throw new SyntaxError("[logConsole] base is not an available option");
        console.log(
            "%c[%i]: (%i Bytes) %s (base %s)",
            "background-color:#000;color:#0f0;font-family:'consolas',monospace;font-size:large",
            Date.now(),
            this.length,
            this.toString(base),
            base===0?"256 Braille-Patterns":base
        );
        return this;
    }
    /**
     * __makes a copy of `this` number__
     * @returns {BigIntType} a copy of `this` number
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    copy(){return this.#sign?new BigIntType(this.#digits.slice(),0x100):new BigIntType(this.#digits.slice(),0x100).neg();}
    /**
     * __copy values from `this` to `n`__
     * @param {BigIntType} n - number to set equal to `this` (will be modified)
     * @returns {BigIntType} `this` (unmodified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    reverseCopy(n){
        if(!(n instanceof BigIntType))throw new TypeError("[reverseCopy] n is not an instance of BigIntType");
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
        if(!(n instanceof BigIntType))throw new TypeError("[reverseCopy] n is not an instance of BigIntType");
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
        if(!(n instanceof BigIntType))throw new TypeError("[setEqualTo] n is not an instance of BigIntType");
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
     * not to be confused with `sign` wich returns the sign as a boolean _(returns `false` for `-0`)_
     * @returns {BigIntType} if zero `+0`, if positive `+1` and if negative `-1`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    signNum(){return this.isZero()?BigIntType.Zero:this.#sign?BigIntType.One:BigIntType.NOne;}
    /**
     * __determines if `this` number is odd__
     * @returns {boolean} `this % 2 === 1`
     */
    isOdd(){return(this.#digits[0]&1)===1;}
    /**
     * __determines if `this` number is even__
     * @returns {boolean} `this % 2 === 0`
     */
    isEven(){return!this.isOdd();}
    /**
     * __determines if `this` number is equal to 0__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 0`
     */
    isZero(){return this.length===1&&this.#digits[0]===0;}
    /**
     * __determines if `this` number is equal to 1__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 1`
     */
    isOne(){return this.length===1&&this.#digits[0]===1;}
    /**
     * __determines if `this` number is equal to 2__ \
     * _only compares digit not sign_
     * @returns {boolean} `abs(this) === 2`
     */
    isTwo(){return this.length===1&&this.#digits[0]===2;}
    /**
     * __determines if `this` number is equal to positive 1__
     * @returns {boolean} `this === +1`
     */
    isPOne(){return this.#sign&&this.isOne();}
    /**
     * __determines if `this` number is equal to positive 2__
     * @returns {boolean} `this === +2`
     */
    isPTwo(){return this.#sign&&this.isTwo();}
    /**
     * __determines if `this` number is equal to negative 1__
     * @returns {boolean} `this === -1`
     */
    isNOne(){return!this.#sign&&this.isOne();}
    /**
     * __determines if `this` number is equal to negative 2__
     * @returns {boolean} `this === -2`
     */
    isNTwo(){return!this.#sign&&this.isTwo();}
    /**
     * __determines if `this` number is smaller than `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this < n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerThan(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isSmallerThan] n is not an instance of BigIntType");
        if(!this.#sign&&n.#sign)return true;
        if(this.#sign&&!n.#sign)return false;
        if(this.#sign){
            if(this.length<n.length)return true;
            if(this.length>n.length)return false;
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i])return true;
                if(this.#digits[i]>n.#digits[i])return false;
            }
            return false;
        }else{
            if(this.length>n.length)return true;
            if(this.length<n.length)return false;
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i])return true;
                if(this.#digits[i]<n.#digits[i])return false;
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is smaller than `n`__ \
     * _only compares digit not sign_
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) < abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsSmallerThanAbs(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isAbsSmallerThanAbs] n is not an instance of BigIntType");
        if(this.length<n.length)return true;
        if(this.length>n.length)return false;
        for(let i=this.length-1;i>=0;i--){
            if(this.#digits[i]<n.#digits[i])return true;
            if(this.#digits[i]>n.#digits[i])return false;
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
        if(!(n instanceof BigIntType))throw new TypeError("[isGreaterThan] n is not an instance of BigIntType");
        if(this.#sign&&!n.#sign)return true;
        if(!this.#sign&&n.#sign)return false;
        if(this.#sign){
            if(this.length>n.length)return true;
            if(this.length<n.length)return false;
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]>n.#digits[i])return true;
                if(this.#digits[i]<n.#digits[i])return false;
            }
            return false;
        }else{
            if(this.length<n.length)return true;
            if(this.length>n.length)return false;
            for(let i=this.length-1;i>=0;i--){
                if(this.#digits[i]<n.#digits[i])return true;
                if(this.#digits[i]>n.#digits[i])return false;
            }
            return false;
        }
    }
    /**
     * __determines if `this` number is greater than `n`__ \
     * _only compares digit not sign_
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) > abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsGreaterThanAbs(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isAbsGreaterThanAbs] n is not an instance of BigIntType");
        if(this.length>n.length)return true;
        if(this.length<n.length)return false;
        for(let i=this.length-1;i>=0;i--){
            if(this.#digits[i]>n.#digits[i])return true;
            if(this.#digits[i]<n.#digits[i])return false;
        }
        return false;
    }
    /**
     * __determines if `this` number is equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this === n` (+0 and -0 are unequal)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isEqualTo(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isEqualTo] n is not an instance of BigIntType");
        if(this.#sign!==n.#sign)return false;
        if(this.length!==n.length)return false;
        return this.#digits.every((value,index)=>value===n.#digits[index]);
    }
    /**
     * __determines if `this` number is equal to `n` or both are zero__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this == n` (+0 and -0 are equal)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isEqualToOrZero(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isEqualToOrZero] n is not an instance of BigIntType");
        return (this.isZero()&&n.isZero())||this.isEqualTo(n);
    }
    /**
     * __determines if `this` number is equal to `n`__ \
     * _only compares digit not sign_
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) === abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsEqualToAbs(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isAbsEqualToAbs] n is not an instance of BigIntType");
        if(this.length!==n.length)return false;
        return this.#digits.every((value,index)=>value===n.#digits[index]);
    }
    /**
     * __determines if `this` number is greater or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this >= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isGreaterOrEqualTo(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isGreaterOrEqualTo] n is not an instance of BigIntType");
        return !this.isSmallerThan(n);
    }
    /**
     * __determines if `this` number is greater or equal to `n`__ \
     * _only compares digit not sign_
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) >= abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsGreaterOrEqualToAbs(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isAbsGreaterOrEqualToAbs] n is not an instance of BigIntType");
        return !this.isAbsSmallerThanAbs(n);
    }
    /**
     * __determines if `this` number is smaller or equal to `n`__
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `this <= n`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isSmallerOrEqualTo(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isSmallerOrEqualTo] n is not an instance of BigIntType");
        return !this.isGreaterThan(n);
    }
    /**
     * __determines if `this` number is smaller or equal to `n`__ \
     * _only compares digit not sign_
     * @param {BigIntType} n - the second number for comparison
     * @returns {boolean} `abs(this) <= abs(n)`
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     */
    isAbsSmallerOrEqualToAbs(n){
        if(!(n instanceof BigIntType))throw new TypeError("[isAbsSmallerOrEqualToAbs] n is not an instance of BigIntType");
        return !this.isAbsGreaterThanAbs(n);
    }
    /**
     * __determines if `this` number is finite (`Number`)__ \
     * i.e. smaller or equal to `Number.MAX_VALUE` or `1.79769e308` (close to `2**1024-1`) \
     * _less or equal to `0xFFFFFFFFFFFFFBFF <120* FF>`_ \
     * if this is true `this` number can be converted into a normal `Number` (lossy conversion if `isSafeInteger` is false)
     * @returns {boolean} `true` if `this` number is finite (`Number`)
     */
    isFinite(){
        //~ it should be numbers up to `2**1024-1` but since floating point numbers are very imprecise at that scale (about `0XFFFFFFFFFFFFF8FF <120* FF>` step size) the limit is a little below that
        //~ `2**1024-1` === `Infinity` so the actual limit is at `Number.MAX_VALUE` === `0xFFFFFFFFFFFFFBFF <120* FF>` === `0xFFFFFFFFFFFFF400 <120* 00>`
        if(this.length!==0x80)return this.length<0x80;
        return this.#digits[0x79]<=0xFB;
    }
    /**
     * __determines if `this` number is a safe integer (`Number`)__ \
     * i.e. smaller or equal to `9007199254740991` (`2**53−1`) \
     * if this is true `this` number can be converted into a normal `Number` (lossless conversion)
     * @returns {boolean} `true` if `this` number is a safe integer (`Number`)
     */
    isSafeInteger(){
        if(this.length!==7)return this.length<7;
        return this.#digits[6]<=0x1F;
    }
    /**
     * __checks if `this` number is a power of two__ \
     * ie has only one bit on \
     * does include 1 but not 0
     * @returns {boolean} true if `this` number is a power of two and false otherwise
     */
    isPowerOfTwo(){
        if(this.isZero())return false;
        if((this.#digits[this.length-1]&(this.#digits[this.length-1]-1))!==0)return false;
        for(let i=0;i<this.length-1;i++)
            if(this.#digits[i]!==0)return false;
        return true;
    }
    /**
     * __checks if `this` number is a power of 256 (base)__ \
     * does include 1 but not 0
     * @returns {boolean} true if `this` number is a power of 256 (base) and false otherwise
     */
    isPowerOfBase(){
        if(this.isZero())return false;
        if(this.#digits[this.length-1]!==1)return false;
        for(let i=0;i<this.length-1;i++)
            if(this.#digits[i]!==0)return false;
        return true;
    }
    /**
     * __removes leading zeros from `digits`__
     * @param {Uint8Array} digits - digits array
     * @returns {Uint8Array} if `digits` has no leading zeros returns unmodified else creates a new digits array with no leading zeros
     */
    static #removeLeadingZeros(digits){
        if(digits[digits.length-1]!==0)return digits;
        let maxIndex=digits.length-1;
        for(;maxIndex>0&&digits[maxIndex]===0;maxIndex--);
        return digits.slice(0,maxIndex+1);
    }
    /**
     * __increment given `digits` by one__
     * @param {Uint8Array} digits - a digits array
     * @returns {Uint8Array} a new digits array
     */
    static #calcInc(digits){
        let newDigits=new Uint8Array(digits.length+1);
        newDigits.set(digits);
        for(let i=0;newDigits[i]++===0xFF;i++);
        return newDigits[newDigits.length-1]===0?newDigits.slice(0,newDigits.length-1):newDigits;
    }
    /**
     * __decrement given `digits` by one__
     * @param {Uint8Array} digits - a digits array
     * @returns {readonly[Uint8Array,number]} a new digits array and its sign (-1|0|1)
     */
    static #calcDec(digits){
        if(digits.length===1&&digits[0]===0)return Object.freeze([Uint8Array.of(1),-1]);
        if(digits.length===1&&digits[0]===1)return Object.freeze([Uint8Array.of(0),0]);
        let newDigits=digits.slice();
        for(let i=0;newDigits[i]--===0;i++);
        return Object.freeze([
            BigIntType.#removeLeadingZeros(newDigits),
            newDigits.length===1&&newDigits[0]===0?0:1
        ]);
    }
    /**
     * __increments `this` number once__ \
     * _modifies the original_
     * @returns {BigIntType} `this + 1`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    inc(){
        if(this.#sign){//~ (+)++
            let calcDigits=BigIntType.#calcInc(this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[inc] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
        }else{//~ (-)++
            let[calcDigits,calcSign]=BigIntType.#calcDec(this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[inc] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            if(calcSign===-1)this.#sign=true;
        }
        return this;
    }
    /**
     * __decrements `this` number once__ \
     * _modifies the original_
     * @returns {BigIntType} `this - 1`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    dec(){
        if(this.#sign){//~ (+)--
            let[calcDigits,calcSign]=BigIntType.#calcDec(this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[dec] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            if(calcSign===-1)this.#sign=false;
        }else{//~ (-)--
            let calcDigits=BigIntType.#calcInc(this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[inc] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
        }
        return this;
    }
    /**
     * __Checks if `A` is smaller than `B`__ \
     * ignores when `A` and `B` are of different length
     * @param {Uint8Array} A - digits array
     * @param {Uint8Array} B - digits array
     * @returns {boolean} true if `A < B`
     */
    static #calcIsSmallerThan(A,B){
        for(let i=Math.max(A.length,B.length);i>=0;i--)
            if((A[i]??0)!==(B[i]??0))return(A[i]??0)<(B[i]??0);
        return false;
    }
    /**
     * __adds two numbers together__
     * @param {Uint8Array} A - first addend digits array
     * @param {Uint8Array} B - second addend digits array
     * @returns {Uint8Array} `A + B` (new digits array)
     */
    static #calcAdd(A,B){
        let newDigits=new Uint8Array(Math.max(A.length,B.length)+1);
        for(let i=0,overflow=false;i<newDigits.length;i++)overflow=(newDigits[i]=(A[i]??0)+(B[i]??0)+(overflow?1:0))>0xFF;
        return newDigits[newDigits.length-1]===1?newDigits:newDigits.slice(0,newDigits.length-1);
    }
    /**
     * __subtracts two numbers from one another__
     * @param {Uint8Array} A - minuend digits array
     * @param {Uint8Array} B - subtrahend digits array
     * @returns {readonly[Uint8Array,boolean]} `A - B` (new digits array and its sign)
     */
    static #calcSub(A,B){
        if(A.length===B.length&&A.every((v,i)=>B[i]===v))return Object.freeze([Uint8Array.of(0),true]);
        let newSign=true;
        if(BigIntType.#calcIsSmallerThan(A,B)){
            [A,B]=[B,A];
            newSign=false;
        }
        let newDigits=A.slice();
        for(let i=0;i<newDigits.length;i++)
            if((newDigits[i]-=(B[i]??0))<0)
                for(let j=i+1;newDigits[j]--===0;j++);
        return Object.freeze([BigIntType.#removeLeadingZeros(newDigits),newSign]);
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
        if(!(n instanceof BigIntType))throw new TypeError("[add] n is not an instance of BigIntType");
        if(this.#sign===n.#sign){//~ (+)+(+) || (-)+(-)
            let calcDigits=BigIntType.#calcAdd(this.#digits,n.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[add] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
        }else{//~ (+)+(-) : (-)+(+)
            let[calcDigits,calcSign]=this.#sign?BigIntType.#calcSub(this.#digits,n.#digits):BigIntType.#calcSub(n.#digits,this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[add] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            if(!calcSign)this.#sign=!this.#sign;
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
        if(!(n instanceof BigIntType))throw new TypeError("[sub] n is not an instance of BigIntType");
        if(this.#sign!==n.#sign){//~ (+)-(-) || (-)-(+)
            let calcDigits=BigIntType.#calcAdd(this.#digits,n.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[sub] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
        }else{//~ (+)-(+) : (-)-(-)
            let[calcDigits,calcSign]=this.#sign?BigIntType.#calcSub(this.#digits,n.#digits):BigIntType.#calcSub(n.#digits,this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[sub] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            if(!calcSign)this.#sign=!this.#sign;
        }
        return this;
    }
    /**
     * __Rounding types__
     * @readonly
     * @enum {number} rounding types - for more info see https://upload.wikimedia.org/wikipedia/commons/8/8a/Comparison_rounding_graphs_SMIL.svg \
     * ![graph preview](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Comparison_rounding_graphs_SMIL.svg/240px-Comparison_rounding_graphs_SMIL.svg.png "preview of the graph from the link above")
     */
    static get Round(){return{
        /**@readonly @type {number} round towards -infinity @example +1.5 → +1 || -2.5 → -3*/      NEAR_DOWN:0,
        /**@readonly @type {number} round towards +infinity @example +1.5 → +2 || -2.5 → -2*/      NEAR_UP:1,
        /**@readonly @type {number} round towards zero @example +1.5 → +1 || -2.5 → -2*/           NEAR_ZERO:2,
        /**@readonly @type {number} round away from zero @example +1.5 → +2 || -2.5 → -3*/         NEAR_INF:3,
        /**@readonly @type {number} round to nearest even integer @example +1.5 → +2 || -2.5 → -2*/NEAR_EVEN:4,
        /**@readonly @type {number} round to nearest odd integer @example +1.5 → +1 || -2.5 → -3*/ NEAR_ODD:5,
        /**@readonly @type {number} floor (towards -infinity) @example +1.5 → +1 || -2.5 → -3*/    FLOOR:6,
        /**@readonly @type {number} ceil (towards +infinity) @example +1.5 → +2 || -2.5 → -2*/     CEIL:7,
        /**@readonly @type {number} trunc (towards zero) @example +1.5 → +1 || -2.5 → -2*/         TRUNC:8,
        /**@readonly @type {number} raise (away from zero) @example +1.5 → +2 || -2.5 → -3*/       RAISE:9,
    };}
    /**
     * __calculate if rounding up is needed__
     * @param {boolean} even - if the number is even
     * @param {boolean} sign - the sign of the number
     * @param {number} decimal - decimal part for rounding [0-255] (first digit after decimal point)
     * @param {number} rounding - rounding type to use _default `BigIntType.Round.NEAR_INF`_ \
     * for info on different rounding types see {@link BigIntType.Round}
     * @returns {boolean} true when rounding up and false otherwise
     */
    static #roundUp(even,sign,decimal,rounding=BigIntType.Round.NEAR_INF){
        switch(rounding){
            case BigIntType.Round.NEAR_DOWN:return decimal>0x80||(!sign&&decimal===0x80);
            case BigIntType.Round.NEAR_UP:return decimal>0x80||(sign&&decimal===0x80);
            case BigIntType.Round.NEAR_ZERO:return decimal>0x80;
            case BigIntType.Round.NEAR_INF:return decimal>=0x80;
            case BigIntType.Round.NEAR_EVEN:return decimal>0x80||(decimal===0x80&&!even);
            case BigIntType.Round.NEAR_ODD:return decimal>0x80||(decimal===0x80&&even);
            case BigIntType.Round.FLOOR:return !sign&&decimal!==0;
            case BigIntType.Round.CEIL:return sign&&decimal!==0;
            case BigIntType.Round.TRUNC:return false;
            case BigIntType.Round.RAISE:return decimal!==0;
        }
        return false;
    }
    /**
     * __multiplies `this` number with its numeric base (256) to the power of `x`__ \
     * _shifts the digits by `x` amount, positive=left, with `rounding` in respect to base 256_ \
     * _modifies the original_
     * @param {number} x - exponent - save integer
     * @param {number} rounding - rounding type to use _default `BigIntType.Round.NEAR_INF`_ \
     * for info on different rounding types see {@link BigIntType.Round}
     * @returns {BigIntType} `round( this * 256**x )` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `x` is not a save integer
     * @throws {SyntaxError} - if `rounding` is not a valid option (see `rounding`s doc.)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    timesBaseToThePowerOf(x,rounding=BigIntType.Round.NEAR_INF){
        x=Number(x);if(!Number.isSafeInteger(x))throw new TypeError("[times256ToThePowerOf] x is not a save integer");
        if(!Object.values(BigIntType.Round).includes(rounding))throw new SyntaxError("[times256ToThePowerOf] rounding is not a valid option");
        if(this.isZero()||x===0)return this;
        if(x<0){
            x=Math.abs(x);
            if(x>this.length)this.#digits=Uint8Array.of(0);
            else{
                let calcDigits=Uint8Array.of(0);
                if(x<this.length)calcDigits=this.#digits.slice(x);
                if(BigIntType.#roundUp((calcDigits[0]&1)===0,this.#sign,this.#digits[x-1],rounding))calcDigits=BigIntType.#calcInc(calcDigits);
                this.#digits=calcDigits;
            }
            return this;
        }
        if(this.length+x>BigIntType.MAX_SIZE)throw new RangeError("[times256ToThePowerOf] x digit-shifts would result in a number longer than MAX_SIZE");
        let tmp=new Uint8Array(this.length+x);
        tmp.set(this.#digits,x);
        this.#digits=tmp;
        return this;
    }
    /**
     * __shifts the bits of `this` number to the right `x` amount__ \
     * ignores sign \
     * _modifies the original_
     * @param {number} x - number of times to bitshift to the right (save integer) - _default `1`_
     * @returns {BigIntType} `this >>> x` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `x` is not a positive save integer
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitShiftR(x=1){
        // TODO make param type BigIntType but max save_integer*8 in size (0xFF_FF_FF_FF_FF_FF_F8) - convert to number for byteshift method
        x=Number(x);if(x<0||!Number.isSafeInteger(x))throw new TypeError("[bitshiftR] x is not a positive save integer");
        this.timesBaseToThePowerOf(-(Math.floor(x/8)),BigIntType.Round.TRUNC);
        x&=7;
        if(x===0)return this;
        //~ shift right x bits for each digit and add the right x bits from next digit to the left of current digit (digits are 8bit)
        for(let i=0;i<this.length;i++)this.#digits[i]=(this.#digits[i]>>>x)|(((this.#digits[i+1]??0)&((1<<x)-1))<<(8-x));
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        return this;
    }
    /**
     * __shifts the bits of `this` number to the left `x` amount__ \
     * ignores sign \
     * _modifies the original_
     * @param {number} x - number of times to bitshift to the left (save integer) - _default `1`_
     * @returns {BigIntType} `this << x` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `x` is not a positive save integer
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitShiftL(x=1){
        // TODO make param type BigIntType but max save_integer*8 in size (0xFF_FF_FF_FF_FF_FF_F8) - convert to number for byteshift method
        x=Number(x);if(x<0||!Number.isSafeInteger(x))throw new TypeError("[bitshiftL] x is not a positive save integer");
        if(Math.floor(x/8)+this.length>BigIntType.MAX_SIZE)throw new RangeError(`[bitshiftL] would result in a number longer than MAX_SIZE`);
        this.timesBaseToThePowerOf(Math.floor(x/8),BigIntType.Round.TRUNC);
        x&=7;
        if(x===0)return this;
        let calcDigits=new Uint8Array(this.length+1);
        //~ shift left x bits for each digit and add the left x bits from next digit to the right of current digit (digits are 8bit)
        for(let i=calcDigits.length-1;i>=0;i--)calcDigits[i]=((this.#digits[i]??0)<<x)|(((this.#digits[i-1]??0)&(((1<<x)-1)<<(8-x)))>>>(8-x));
        calcDigits=BigIntType.#removeLeadingZeros(calcDigits);
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[bitshiftL] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
        return this;
    }
    /**
     * __computes one bitshift to the left__
     * @param {Uint8Array} digits - digits array
     * @returns {Uint8Array} new digits array double in value
     */
    static #calcOneBitShiftL(digits){
        let newDigits=new Uint8Array(digits.length+1);
        //~ shift left one bit for each digit and add the left most bit from next digit to the right of current digit (digits are 8bit)
        for(let i=newDigits.length-1;i>=0;i--)newDigits[i]=((digits[i]??0)<<1)|(((digits[i-1]??0)&0x80)>>>7);
        return BigIntType.#removeLeadingZeros(newDigits);
    }
    /**
     * __applies bitwise AND with `this` and `n`__ \
     * ignores sign \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this & n` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitAND(n){
        if(!(n instanceof BigIntType))throw new TypeError("[bitAND] n is not an instance of BigIntType");
        let calcDigits=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<calcDigits.length;i++)calcDigits[i]=(this.#digits[i]??0)&(n.#digits[i]??0);
        this.#digits=BigIntType.#removeLeadingZeros(calcDigits);
        return this;
    }
    /**
     * __applies bitwise OR with `this` and `n`__ \
     * ignores sign \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this | n` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitOR(n){
        if(!(n instanceof BigIntType))throw new TypeError("[bitOR] n is not an instance of BigIntType");
        let calcDigits=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<calcDigits.length;i++)calcDigits[i]=(this.#digits[i]??0)|(n.#digits[i]??0);
        this.#digits=BigIntType.#removeLeadingZeros(calcDigits);
        return this;
    }
    /**
     * __applies bitwise XOR with `this` and `n`__ \
     * ignores sign \
     * _modifies the original_
     * @param {BigIntType} n - second number
     * @returns {BigIntType} `this ^ n` (`this` modified - sign is not affected)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitXOR(n){
        if(!(n instanceof BigIntType))throw new TypeError("[bitXOR] n is not an instance of BigIntType");
        let calcDigits=new Uint8Array(Math.max(this.length,n.length));
        for(let i=0;i<calcDigits.length;i++)calcDigits[i]=(this.#digits[i]??0)^(n.#digits[i]??0);
        this.#digits=BigIntType.#removeLeadingZeros(calcDigits);
        return this;
    }
    /**
     * __applies bitwise NOT with `this` number__ \
     * ignores sign \
     * _modifies the original_
     * @returns {BigIntType} `~ this` (`this` modified - sign is not affected)
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    bitNOT(){
        for(let i=0;i<this.length;i++)this.#digits[i]=~this.#digits[i];
        this.#digits=BigIntType.#removeLeadingZeros(this.#digits);
        return this;
    }
    /**
     * __calculates half of `this` number__ \
     * _modifies the original_
     * @param {number} rounding - rounding type to use - _default `BigIntType.Round.NEAR_INF`_ \
     * for info on different rounding types see {@link BigIntType.Round}
     * @returns {BigIntType} `round( this / 2 )` (`this` modified)
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    half(rounding=BigIntType.Round.NEAR_INF){
        if(!Object.values(BigIntType.Round).includes(rounding))throw new SyntaxError("[half] rounding is not a valid option");
        if(this.isZero())return this;
        let calcDigits=new Uint8Array(this.length);
        //~ bitshift right by one - shift right one bit for each digit and add the right most bit from next digit to the left of current digit (digits are 8bit)
        for(let i=0;i<this.length;i++)calcDigits[i]=(this.#digits[i]>>>1)|(((this.#digits[i+1]??0)&1)<<7);
        calcDigits=BigIntType.#removeLeadingZeros(calcDigits);
        this.#digits=BigIntType.#roundUp((calcDigits[0]&1)===0,this.#sign,(this.#digits[0]&1)<<7,rounding)?BigIntType.#calcInc(calcDigits):calcDigits;
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
        if(this.isZero())return this;
        let calcDigits=BigIntType.#calcOneBitShiftL(this.#digits);
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[double] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
        return this;
    }
    /**
     * __divides one number from another one__ \
     * `A` must be larger or equal to `B` and `B` must not be zero
     * @param {Uint8Array} A - dividend - must be larger or equal to `B`
     * @param {Uint8Array} B - divisor - must be non zero
     * @returns {readonly[Uint8Array,Uint8Array]} `A / B = Q + R / B` → `[quotient, remainder]`
     */
    static #calcDivRest(A,B){
        let Q=new Uint8Array(A.length+1),
            R=new Uint8Array(B.length+1);
        /* TODO implement
            when n.isPowerOfTwo() than remainder = this&(n-1) (ignoring sign)
            quotient should be the the number bitshifted right bitlength(n-1) times
            ! byteshift first then bitshift rest
        */
        //~ [i,j] for bit position / [k,m,l] other for-loop indexes / [z] the result of last R-B calculation
        for(let i=A.length-1,j=7,k=0,m=0,l=0,z=0;i>=0;(j===0?(--i,j=7):--j)){
            //~ R<<=1
            for(k=R.length-1;k>=0;k--)R[k]=(R[k]<<1)|(((R[k-1]??0)&0x80)>>>7);
            R[0]|=(A[i]&(1<<j))>>>j;
            //~ R>=B
            if(R[R.length-1]>0||!BigIntType.#calcIsSmallerThan(R,B)){
                //~ R-=B
                for(l=R.length-1;l>=0;l--){
                    z=R[l]-(B[l]??0);
                    if(z<0){
                        R[l]=0x100+z;
                        //~ minus carry
                        for(m=l+1;R[m]===0;R[m++]=0xFF);
                        R[m]--;
                    }else R[l]=z;
                }
                Q[i]|=1<<j;
            }
        }
        return Object.freeze([BigIntType.#removeLeadingZeros(Q),BigIntType.#removeLeadingZeros(R)]);
    }
    /**
     * __calculates a decimal for rounding form the given fraction__ \
     * `remainder` must be smaller than `divisor` and `divisor` must not be zero
     * @param {Uint8Array} remainder - the remainder (must be smaller than `divisor`)
     * @param {Uint8Array} divisor - the divisor (must not be zero)
     * @returns {number} 0 if `remainder` is 0, 1 if the fraction is below 1/2, 128 if it's equal to 1/2, and 255 if it's larger than that
     */
    static #decimalFromFraction(remainder,divisor){
        if(remainder.length===1&&remainder[0]===0)return 0;
        let remainderDoubled=BigIntType.#calcOneBitShiftL(remainder);
        //~ remainder*2 < divisor ? 1 : remainder*2 === divisor ? 128 : 255
        return BigIntType.#calcIsSmallerThan(remainderDoubled,divisor)?1:remainderDoubled.length===divisor.length&&remainderDoubled.every((v,i)=>v===divisor[i])?0x80:0xFF;
    }
    /**
     * __divides another number from `this` one__ \
     * _modifies the original_
     * @param {BigIntType} n - divisor (must not be zero)
     * @param {number} rounding - rounding type to use - _default `BigIntType.Round.NEAR_INF`_ \
     * for info on different rounding types see {@link BigIntType.Round}
     * @returns {BigIntType} `round( this / n )` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - if `n` is `0`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    div(n,rounding=BigIntType.Round.NEAR_INF){
        if(!(n instanceof BigIntType))throw new TypeError("[div] n is not an instance of BigIntType");
        if(!Object.values(BigIntType.Round).includes(rounding))throw new SyntaxError("[div] rounding is not a valid option");
        if(n.isZero())throw new RangeError("[div] n is 0");
        if(this.isZero()||n.isOne()){
            this.#sign=this.#sign===n.#sign;
            return this.#sign?this:this.neg();
        }
        if(n.isPowerOfBase())this.timesBaseToThePowerOf(1-n.length,rounding);
        else if(this.isAbsSmallerThanAbs(n))
            //~ round with fraction: 0 + this / n → 1 or 0
            this.#digits=Uint8Array.of(BigIntType.#roundUp(true,this.#sign===n.#sign,BigIntType.#decimalFromFraction(this.#digits,n.#digits),rounding)?1:0);
        else if(this.isAbsEqualToAbs(n))this.#digits=Uint8Array.of(1);
        else{
            //~ A / B where A > B → Q + R / B where R < B
            let [quotient,remainder]=BigIntType.#calcDivRest(this.#digits,n.#digits);
            //~ round with fraction: quotient + remainder / n → quotient+1 or quotient
            this.#digits=BigIntType.#roundUp((quotient[0]&1)===0,this.#sign===n.#sign,BigIntType.#decimalFromFraction(remainder,n.#digits),rounding)?BigIntType.#calcInc(quotient):quotient;
        }
        this.#sign=this.#sign===n.#sign;
        return this;
    }
    /**
     * __Modulo types__
     * @readonly
     * @enum {number} modulo types - for more info see https://en.wikipedia.org/wiki/Modulo
     */
    static get ModuloType(){return{
        /**@readonly @type {number} division rounded towards -infinity*/      ROUND_NEAR_DOWN:0,
        /**@readonly @type {number} division rounded towards +infinity*/      ROUND_NEAR_UP:1,
        /**@readonly @type {number} division rounded towards zero*/           ROUND_NEAR_ZERO:2,
        /**@readonly @type {number} division rounded away from zero*/         ROUND_NEAR_INF:3,
        /**@readonly @type {number} division rounded to nearest even integer*/ROUND_NEAR_EVEN:4,
        /**@readonly @type {number} division rounded to nearest odd integer*/ ROUND_NEAR_ODD:5,
        /**@readonly @type {number} floored division (towards -infinity)*/    FLOOR:6,
        /**@readonly @type {number} ceiled division (towards +infinity)*/     CEIL:7,
        /**@readonly @type {number} truncated division (towards zero)*/       TRUNC:8,
        /**@readonly @type {number} raised division (away from zero)*/        RAISE:9,
        //~ enum values must match `BigIntType.Round` up to this point
        /**@readonly @type {number} euclidean division (positive remainder)*/ EUCLID:0xA,
        /* ---- examples ----
            ~~~~ 3 % 5 → 3 / 5 = 0 + 3 / 5 → round up
            +3  +5  = trunc{ +3 } floor{ +3 } euclid{ +3 } round{ -2 } ceil{ -2 } raise{ -2 }
            +3  -5  = trunc{ +3 } floor{ -2 } euclid{ +3 } round{ -2 } ceil{ +3 } raise{ -2 }
            -3  +5  = trunc{ -3 } floor{ +2 } euclid{ +2 } round{ +2 } ceil{ -3 } raise{ +2 }
            -3  -5  = trunc{ -3 } floor{ -3 } euclid{ +2 } round{ +2 } ceil{ +2 } raise{ +2 }
            ~~~~ 5 % 3 → 5 / 3 = 1 + 2 / 3 → round up
            +5  +3  = trunc{ +2 } floor{ +2 } euclid{ +2 } round{ -1 } ceil{ -1 } raise{ -1 }
            +5  -3  = trunc{ +2 } floor{ -1 } euclid{ +2 } round{ -1 } ceil{ +2 } raise{ -1 }
            -5  +3  = trunc{ -2 } floor{ +1 } euclid{ +1 } round{ +1 } ceil{ -2 } raise{ +1 }
            -5  -3  = trunc{ -2 } floor{ -2 } euclid{ +1 } round{ +1 } ceil{ +1 } raise{ +1 }
            ~~~~ 4 % 3 → 4 / 3 = 1 + 1 / 3 → round down
            +4  +3  = trunc{ +1 } floor{ +1 } euclid{ +1 } round{ +1 } ceil{ -2 } raise{ -2 }
            +4  -3  = trunc{ +1 } floor{ -2 } euclid{ +1 } round{ +1 } ceil{ +1 } raise{ -2 }
            -4  +3  = trunc{ -1 } floor{ +2 } euclid{ +2 } round{ -1 } ceil{ -1 } raise{ +2 }
            -4  -3  = trunc{ -1 } floor{ -1 } euclid{ +2 } round{ -1 } ceil{ +2 } raise{ +2 }
            ~~~~ 3 % 2 → 3 / 2 = 1 + 1 / 2 → round (depends on type)
            +3  +2  = trunc{ +1 } floor{ +1 } euclid{ +1 } round{ -1↑↓+1 } ceil{ -1 } raise{ -1 }
            +3  -2  = trunc{ +1 } floor{ -1 } euclid{ +1 } round{ -1↑↓+1 } ceil{ +1 } raise{ -1 }
            -3  +2  = trunc{ -1 } floor{ +1 } euclid{ +1 } round{ +1↑↓-1 } ceil{ -1 } raise{ +1 }
            -3  -2  = trunc{ -1 } floor{ -1 } euclid{ +1 } round{ +1↑↓-1 } ceil{ +1 } raise{ +1 }
            ~~~~ 3 % 3 → 3 / 3 = 1 + 0 / 3 → round 0 (default down)
            +3  +3  = trunc{ +0 } floor{ +0 } euclid{ +0 } round{ +0 } ceil{ -0 } raise{ -0 }
            +3  -3  = trunc{ +0 } floor{ -0 } euclid{ +0 } round{ +0 } ceil{ +0 } raise{ -0 }
            -3  +3  = trunc{ -0 } floor{ +0 } euclid{ +0 } round{ -0 } ceil{ -0 } raise{ +0 }
            -3  -3  = trunc{ -0 } floor{ -0 } euclid{ +0 } round{ -0 } ceil{ +0 } raise{ +0 }
            ~~~~ 0 % 3 → 0 / 3 = 0 + 0 / 3 → round 0 (default down)
            +0  +3  = trunc{ +0 } floor{ +0 } euclid{ +0 } round{ +0 } ceil{ -0 } raise{ -0 }
            +0  -3  = trunc{ +0 } floor{ -0 } euclid{ +0 } round{ +0 } ceil{ +0 } raise{ -0 }
            -0  +3  = trunc{ -0 } floor{ +0 } euclid{ +0 } round{ -0 } ceil{ -0 } raise{ +0 }
            -0  -3  = trunc{ -0 } floor{ -0 } euclid{ +0 } round{ -0 } ceil{ +0 } raise{ +0 }
        */
    };}
    /**
     * __calculates modulo `n` of `this` number__ \
     * _modifies the original_
     * @param {BigIntType} n - second number (must not be zero)
     * @param {number} type - modulo type to use - _default `BigIntType.ModuloType.EUCLID`_ \
     * for info on different modulo types see {@link BigIntType.ModuloType}
     * @returns {BigIntType} `this % n` with respect to `type`
     * @throws {TypeError} - if `n` is not a `BigIntType`
     * @throws {RangeError} - if `n` is `0`
     * @throws {SyntaxError} - if `type` is not a valid option
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    modulo(n,type=BigIntType.ModuloType.EUCLID){
        if(!(n instanceof BigIntType))throw new TypeError("[modulo] n is not an instance of BigIntType");
        if(!Object.values(BigIntType.ModuloType).includes(type))throw new SyntaxError("[modulo] type is not a valid option");
        if(n.isZero())throw new RangeError("[modulo] n is 0");
        //~ calc A / B → Q + R/B or 0 + A/B when A < B
        let[quotient,remainder]=BigIntType.#calcIsSmallerThan(this.#digits,n.#digits)?[Uint8Array.of(0),this.#digits.slice()]:BigIntType.#calcDivRest(this.#digits,n.#digits),
            calcSign=true;
        const fractionDecimal=BigIntType.#decimalFromFraction(remainder,n.#digits);
        switch(type){
            case BigIntType.ModuloType.ROUND_NEAR_DOWN:
            case BigIntType.ModuloType.ROUND_NEAR_UP:
            case BigIntType.ModuloType.ROUND_NEAR_ZERO:
            case BigIntType.ModuloType.ROUND_NEAR_INF:
            case BigIntType.ModuloType.ROUND_NEAR_EVEN:
            case BigIntType.ModuloType.ROUND_NEAR_ODD:
                //~ A-B*round(A/B) → when rounding up inverse sign which is otherwise sign from A
                if(BigIntType.#roundUp(this.#sign===n.#sign,(quotient[0]&1)===0,fractionDecimal,type)){
                    if(fractionDecimal===0xFF)remainder=BigIntType.#calcDec(remainder)[0];
                    calcSign=!this.#sign
                }else calcSign=this.#sign;
            break;
            case BigIntType.ModuloType.FLOOR:
                calcSign=n.#sign;
                if(this.#sign!==n.#sign)
                    if(fractionDecimal===1)remainder=BigIntType.#calcInc(remainder);
                    else if(fractionDecimal===0xFF)remainder=BigIntType.#calcDec(remainder)[0];
            break;
            case BigIntType.ModuloType.CEIL:
                calcSign=!n.#sign;
                if(this.#sign===n.#sign)
                    if(fractionDecimal===1)remainder=BigIntType.#calcInc(remainder);
                    else if(fractionDecimal===0xFF)remainder=BigIntType.#calcDec(remainder)[0];
            break;
            case BigIntType.ModuloType.TRUNC:
                calcSign=this.#sign;
            break;
            case BigIntType.ModuloType.RAISE:
                calcSign=!this.#sign;
                if(fractionDecimal===1)remainder=BigIntType.#calcInc(remainder);
                else if(fractionDecimal===0xFF)remainder=BigIntType.#calcDec(remainder)[0];
            break;
            case BigIntType.ModuloType.EUCLID:
                if(!this.#sign)
                    if(fractionDecimal===1)remainder=BigIntType.#calcInc(remainder);
                    else if(fractionDecimal===0xFF)remainder=BigIntType.#calcDec(remainder)[0];
            break;
        }
        this.#sign=calcSign;
        this.#digits=remainder;
        return this;
    }
    /**
     * __calculates the next power of two__
     * @param  {...number} x - one or more numbers setting the minium value for output
     * @returns {number} the next power of two equal or larger than the largest value of `x` (minimum 1)
     */
    static #calcNextPowerOfTwo(...x){
        let powerOfTwo=1;
        for(const max=Math.max(...x);powerOfTwo<max;powerOfTwo*=2);
        return powerOfTwo;
    }
    /**
     * __Padds the given numbers to the next power of two__
     * @param {Uint8Array} A - digits array
     * @param {Uint8Array} B - digits array
     * @returns {[Uint8Array,Uint8Array]} `[A,B]` where each is zero padded to the next power of two (new digit arrays)
     */
    static #padToPowerOfTwo(A,B){
        const powerOfTwo=BigIntType.#calcNextPowerOfTwo(A.length,B.length),
            X=new Uint8Array(powerOfTwo),
            Y=new Uint8Array(powerOfTwo);
        X.set(A);
        Y.set(B);
        return[X,Y];
    }
    /**
     * __Karatsubas Multiplication Algorithm__ \
     * uses recursion !
     * @param {Uint8Array} X - multiplicand digits array
     * @param {Uint8Array} Y - multiplicator digits array
     * @description use `BigIntType.#padToPowerOfTwo` to get `X` and `Y` to the same (power of 2) length (leading zeros)
     * @returns {Uint8Array} `X * Y`
     * @throws {Error} _might throw an error caused by to many recursions_
     */
    static #calcKaratsuba(X,Y){
        if(X.every(v=>v===0)||Y.every(v=>v===0))return Uint8Array.of(0);
        //~ assume here that`X` and `Y` are of same length and the length is a power of 2
        //~ small enough to conpute savely with JS-Number ([!] from 8bit unsigned integer to 52bit signed save integer ~ trunc to 32bit signed integer during bitwise operations ~ need 16bit un-/signed for potential overflow [!])
        if(X.length===1){
            const product=X[0]*Y[0];
            if(product>0xFF)return Uint8Array.of(product&0xFF,product>>>8);
            return Uint8Array.of(product);
        }
        let Xl=X.slice(0,Math.floor(X.length*.5)),Xh=X.slice(Math.floor(X.length*.5)),
            Yl=Y.slice(0,Math.floor(Y.length*.5)),Yh=Y.slice(Math.floor(Y.length*.5));
        let P3Calc1=BigIntType.#calcAdd(Xh,Xl),
            P3Calc2=BigIntType.#calcAdd(Yh,Yl);
        //! on a maximum this function calls itself, I think, `MAX_SIZE*1.5` times. That might be to many ie. Error !
        let [P1,P2,P3]=[
            BigIntType.#calcKaratsuba(Xh,Yh),
            BigIntType.#calcKaratsuba(Xl,Yl),
            BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(P3Calc1,P3Calc2))
        ];
        return BigIntType.#calcAdd(
            BigIntType.#calcAdd(
                Uint8Array.of(...new Uint8Array(X.length),...P1),
                Uint8Array.of(...new Uint8Array(Xh.length),...BigIntType.#calcSub(P3,BigIntType.#calcAdd(P1,P2))[0])
            ),P2
        );
    }
    /**
     * __Squares `this` number__ \
     * _modifies the original_ \
     * _using Karatsubas algorithm_
     * @returns {BigIntType} `this**2` (`this` modified)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    square(){
        if(this.isZero()||this.isOne())return this.abs();
        if(this.isTwo()){
            this.#digits=Uint8Array.of(4);
            return this.abs();
        }
        let calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(this.#digits,this.#digits));
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[square] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
        return this.abs();
    }
    /**
     * __Cubes `this` number__ \
     * _modifies the original_ \
     * _using Karatsubas algorithm_
     * @returns {BigIntType} `this**3` (`this` modified)
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    cube(){
        if(this.isZero()||this.isOne())return this;
        if(this.isTwo()){
            this.#digits=Uint8Array.of(8);
            return this;
        }
        let calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(this.#digits,this.#digits));
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[cube] would result in a number longer than MAX_SIZE");
        calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(calcDigits,this.#digits));
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[cube] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
        return this;
    }
    /**
     * __multiplies `this` number by `n`__ \
     * _modifies the original_ \
     * _using Karatsubas algorithm_
     * @param {BigIntType} n - multiplicator
     * @returns {BigIntType} `this * n` (`this` modified)
     * @throws {TypeError} - if `n` is not an instance of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    mul(n){
        if(!(n instanceof BigIntType))throw new TypeError("[mul] n is not an instance of BigIntType");
        if(this.isZero()||n.isOne()){
            this.#sign=this.#sign===n.#sign;
            return this;
        }
        if(this.isOne()||n.isZero()){
           this.#digits=n.#digits.slice();
           this.#sign=this.#sign===n.#sign;
           return this;
        }
        const checkTwo=this.isTwo();
        if(checkTwo||n.isTwo()){
            let calcDigits=BigIntType.#calcOneBitShiftL(checkTwo?n.#digits:this.#digits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            this.#sign=this.#sign===n.#sign;
            return this;
        }
        if(n.isPowerOfTwo()){
            //~ byteshift left by n.length-1
            if(this.length+n.length-1>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            let calcDigits=new Uint8Array(this.length+n.length);
            calcDigits.set(this.#digits,n.length-1);
            //~ bitshift left by the remaining bit places (1-7 bitshifts)
            const shifts=Math.log2(n.#digits[n.length-1]);
            //~ shift left `shifts` bits for each digit and add the left `shifts` bits from next digit to the right of current digit (digits are 8bit)
            for(let i=calcDigits.length-1;i>=0;i--)calcDigits[i]=((calcDigits[i]??0)<<shifts)|(((calcDigits[i-1]??0)&(((1<<shifts)-1)<<(8-shifts)))>>>(8-shifts));
            calcDigits=BigIntType.#removeLeadingZeros(calcDigits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            this.#sign=this.#sign===n.#sign;
            return this;
        }
        if(this.isPowerOfTwo()){
            //~ byteshift left by n.length-1
            if(n.length+this.length-1>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            let calcDigits=new Uint8Array(n.length+this.length);
            calcDigits.set(n.#digits,this.length-1);
            //~ bitshift left by the remaining bit places (1-7 bitshifts)
            const shifts=Math.log2(this.#digits[this.length-1]);
            //~ shift left `shifts` bits for each digit and add the left `shifts` bits from next digit to the right of current digit (digits are 8bit)
            for(let i=calcDigits.length-1;i>=0;i--)calcDigits[i]=((calcDigits[i]??0)<<shifts)|(((calcDigits[i-1]??0)&(((1<<shifts)-1)<<(8-shifts)))>>>(8-shifts));
            calcDigits=BigIntType.#removeLeadingZeros(calcDigits);
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            this.#sign=this.#sign===n.#sign;
            return this;
        }
        if(this.isAbsEqualToAbs(n)){
            let calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(this.#digits,this.#digits));
            if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[mul] would result in a number longer than MAX_SIZE");
            this.#digits=calcDigits;
            this.#sign=this.#sign===n.#sign;
            return this;
        }
        let calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(this.#digits,n.#digits));
        if(calcDigits.length>BigIntType.MAX_SIZE)new RangeError("[mul] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
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
        if(!(n instanceof BigIntType))throw new TypeError("[pow] n is not an instance of BigIntType");
        if(n.isZero())return this.setEqualTo(BigIntType.One);
        if(this.isZero()){
            if(!n.#sign)throw new RangeError("[pow] can not calculate zero to the power of a negative number");
            if(n.isEven())return this.abs();
            return this;
        }
        if(this.isOne()){
            if(n.isEven())return this.abs();
            return this;
        }
        if(n.isPOne())return this;
        if(!n.#sign)throw new RangeError("[pow] can not calculate the inverse of numbers other than 1");
        let calcDigits=Uint8Array.of(1);
        for(let base=this.#digits,exp=n.#digits.slice();;){
            //~ exp even → result*=base
            if(exp[0]&1)calcDigits=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(calcDigits,base));
            //~ exp>>>=1
            for(let i=0;i<exp.length;i++)exp[i]=(exp[i]>>>1)|(((exp[i+1]??0)&1)<<7);
            //~ end if exp is 0
            if(exp.every(v=>v===0))break;
            //~ base*=base
            base=BigIntType.#calcKaratsuba(...BigIntType.#padToPowerOfTwo(base,base));
        }
        if(calcDigits.length>BigIntType.MAX_SIZE)throw new RangeError("[pow] would result in a number longer than MAX_SIZE");
        this.#digits=calcDigits;
        if(n.isEven())return this.abs();
        return this;
    }
    /**
     * __translate `this` number from one range to another__ \
     * _modifies the original_
     * @param {BigIntType} initialLow - initial lower bound
     * @param {BigIntType} initialHigh - initial higher bound
     * @param {BigIntType} finalLow - final lower bound
     * @param {BigIntType} finalHigh - final higher bound
     * @param {number} rounding - rounding type to use - _default `BigIntType.Round.NEAR_INF`_ \
     * for info on different rounding types see {@link BigIntType.Round}
     * @param {boolean} limit - if `true` caps the result to the final bound
     * @returns {BigIntType} `this` in `finalLow` to `finalHigh` range (rounded/caped as set) (`this` modified)
     * @throws {TypeError} - if `initialLow`,`initialHigh`,`finalLow` or `finalHigh` are not instances of `BigIntType`
     * @throws {RangeError} - if `initialLow` and `initialHigh` are the same value
     * @throws {SyntaxError} - if `rounding` is not a valid option
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    mapRange(initialLow,initialHigh,finalLow,finalHigh,rounding=BigIntType.Round.NEAR_INF,limit=false){
        if(!(initialLow instanceof BigIntType))throw new TypeError("[mapRange] initialLow is not an instance of BigIntType");
        if(!(initialHigh instanceof BigIntType))throw new TypeError("[mapRange] initialHigh is not an instance of BigIntType");
        if(!(finalLow instanceof BigIntType))throw new TypeError("[mapRange] finalLow is not an instance of BigIntType");
        if(!(finalHigh instanceof BigIntType))throw new TypeError("[mapRange] finalHigh is not an instance of BigIntType");
        if(initialLow.isEqualTo(initialHigh))throw new RangeError("[mapRange] initialLow and initialHigh are the same value");
        if(finalLow.isEqualTo(finalHigh))return this.setEqualTo(finalLow);
        if(!Object.values(BigIntType.Round).includes(rounding))throw new SyntaxError("[mapRange] rounding is not a valid option");
        if(limit){
            if(initialLow.isSmallerThan(initialHigh)){
                if(this.isSmallerThan(initialLow))return this.setEqualTo(finalLow);
                if(this.isGreaterThan(initialHigh))return this.setEqualTo(finalHigh);
            }else{
                if(this.isGreaterThan(initialLow))return this.setEqualTo(finalLow);
                if(this.isSmallerThan(initialHigh))return this.setEqualTo(finalHigh);
            }
        }
        try{
            initialHigh=initialHigh.copy().sub(initialLow);
            this.setEqualTo(
                this.copy().sub(initialLow)
                .mul(finalHigh.copy().sub(finalLow))
                .add(initialHigh.copy().mul(finalLow))
                .div(initialHigh,rounding)
            );
        }catch(e){
            if(e instanceof RangeError)throw new RangeError("[mapRange] would result in a number longer than MAX_SIZE");
            throw e;
        }
        return this;
    }
    /**
     * __calculates the greatest common divisor of `a` and `b`__ \
     * does not use the sign and will allways return a positive number greater or equal to 1
     * @param {BigIntType} A - first number
     * @param {BigIntType} B - second number
     * @returns {BigIntType} gcd of `a` and `b` so that `(a/gcd) / (b/gcd)` will be the smallest possible (integer) fraction
     * @throws {TypeError} - if `a` or `b` are not instances of `BigIntType`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static GCD(A,B){
        if(!(A instanceof BigIntType))throw new TypeError("[GCD] a is not an instance of BigIntType");
        if(!(B instanceof BigIntType))throw new TypeError("[GCD] b is not an instance of BigIntType");
        let[first,second]=A.isAbsSmallerThanAbs(B)?[B.#digits,A.#digits]:[A.#digits,B.#digits];
        for(let last=new Uint8Array();last=BigIntType.#calcDivRest(first,second)[1],last.length>1||last[0]!==0;[first,second]=[second,last]);
        return new BigIntType(second.slice(),0x100);
    }
    /**
     * __creates a random number using `Math.random()`'s binary output__ \
     * note: this is not a cryptographically secure random number \
     * original random number generated is 52bit unsigned (`0` to `2**52-1`)
     * @param {BigIntType} min - lower limit (included) - _default `0`_
     * @param {BigIntType} max - upper limit (included) - _default `2**1024` (`BigIntType.Infinity`)_
     * @returns {BigIntType} random number between `min` and `max`
     * @throws {TypeError} - if `min` or `max` are not instances of `BigIntType`
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static randomInt(min=BigIntType.Zero,max=BigIntType.Infinity){
        // TODO use custom PRNG to get random bytes ?!
        //? https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
        try{
            return new BigIntType(Uint8Array.from(Math.random().toString(2).substring(2),Number),2).mapRange(
                BigIntType.Zero,new BigIntType(Uint8Array.of(0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xF),0x100),
                min,max,
                BigIntType.Round.NEAR_INF,
                true
            );
        }catch(error){
            if(error instanceof RangeError)throw new RangeError("[randomInt] would result in a number longer than MAX_SIZE");
            throw error;
        }
    }
    /**
     * __encode `this` number to a URL-save string__
     * @returns {string} - encoded string
     * @throws {Error} _might throw an error caused by a too large string_
     */
    toURL(){
        let output=this.#sign?"+":"-";
        for(let i=this.length-1;i>=0;i--)output+=String.fromCharCode(this.#digits[i]);
        return encodeURIComponent(btoa(output));
    }
    /**
     * __decodes a number from given string__
     * @param {string} uriComponent - encoded string
     * @returns {BigIntType} the new number
     * @throws {EvalError} if `uriComponent` is not a valid number
     * @throws {RangeError} - if new number would be longer than `BigIntType.MAX_SIZE`
     * @throws {RangeError} - _if some Array could not be allocated (system-specific & memory size)_
     */
    static fromURL(uriComponent="%2B%00"){
        const input=atob(decodeURIComponent(uriComponent));
        if(!/^[+-](?:\x00|[\x01-\xff][\x00-\xff]*)$/.test(input))throw new EvalError("[fromURL] uriComponent is not a valid number");
        if(input.length-1>BigIntType.MAX_SIZE)throw new RangeError("[fromURL] would result in a number longer than MAX_SIZE");
        const newDigits=new Uint8Array(input.length-1);
        for(let i=0;i<newDigits.length;i++)newDigits[i]=input.charCodeAt(input.length-(i+1));
        if(input[0]==="+")return new BigIntType(newDigits,0x100);
        return new BigIntType(newDigits,0x100).neg();
    }
}//~ or just u know use the actual BigInt xD - it might not have all the base conversions and a few of the other methods here but it's probably faster since it's build in ^^

module.exports=BigIntType;
//~ import via `const BigIntType=require('/Path/to/BigIntType.js');`

/*
try{//~ Test number to console
    const timing=performance.now();
    //~ increase memory to 1KiB for each number created
    BigIntType.MAX_SIZE=1024;
    //~ print funny text
    BigIntType.HelloThere.logConsole("braille");
    //~ test some methods
    console.log(
        "number byte length: %i",
        BigIntType.randomInt().logConsole("braille")
        .mul(BigIntType.randomInt().logConsole("braille"))
        .cube()
        .div(BigIntType.Infinity)
        .timesBaseToThePowerOf(10)
        .length
    );
    console.log("\ndone in %ims",performance.now()-timing);//=> 130 to 230 milliseconds
}catch(error){
    console.log("{%s} : \"%s\"",error.name,error.message);//~ show only recent message (on screen) and not the whole stack
    console.error(error);//~ but do log the whole error message with stack to console
}
*/
