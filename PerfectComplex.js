// StringInteger > Fraction > ComplexNumber
class PerfectComplex{
    /**
     * __constructs a PerfectComplex__
     * @param {string|string[3]} real - real part as number string or a 3d string-array representing a mixed fraction `(a+(b/c))` \
     * _default=`"0"`_ \
     * format for each string is array or the single string:\
     * minimum one digit and if more, than the first must be non-zero\
     * _(auto converts to string if not already of type string)_
     * @param {string|string[3]} imaginary - imaginary part as number string or a 3d string-array representing a mixed fraction `(a+(b/c))` \
     * _default=`"0"`_ \
     * format for each string is array or the single string:\
     * minimum one digit and if more, than the first must be non-zero\
     * _(auto converts to string if not already of type string)_
     * @throws {RangeError} if `real` or `imaginary` (as arrays) do not have exactly 3 entries
     * @throws {RangeError} if `real` or `imaginary` (as strings or as part of `real` or `imaginary` as string-arrays) are empty strings
     * @throws {SyntaxError} if `real` or `imaginary` (as strings or as part of `real` or `imaginary` as string-arrays) are not whole number strings (in format)
     * @throws {RangeError} if `real` or `imaginary` (as arrays) have a zero (as string) in the third entry (the denominator) 
     */
    constructor(real="0",imaginary="0"){
        // if "0" / "10000" -> str_int => [str_int,"0","1"]
        // TODO update after StringInteger is "finished"
        // TODO reject string go Uint8ClampedArray and normal Array for calculations
        const srt_int_format=/^[+-]?(?:0|[1-9][0-9]*)$/;
        this.sign=true;// true=positive
        if(Array.isArray(real)){
            if(real.length!=3){throw new RangeError("[real] is not an array of exactly 3 entries");}
            real.forEach((v,i,a)=>{
                a[i]=String(v);
                if(a[i].length==0){throw new RangeError(`[real][${i}] is an empty string`);}
                if(!srt_int_format.test(a[i])){throw new SyntaxError(`[real][${i}] is not a whole number string (in format)`);}
            });
            if(real[2]==="0"){throw new RangeError("[real][2] denominator can not be zero");}
        }else{
            real=String(real);
            if(real.length==0){throw new RangeError("[real] is an empty string");}
            if(!srt_int_format.test(real)){throw new SyntaxError("[real] is not a whole number string (in format)");}
            real=[real,"0","1"];
        }
        if(Array.isArray(imaginary)){
            if(imaginary.length!=3){throw new RangeError("[imaginary] is not an array of exactly 3 entries");}
            imaginary.forEach((v,i,a)=>{
                a[i]=String(v);
                if(a[i].length==0){throw new RangeError(`[imaginary][${i}] is an empty string`);}
                if(!srt_int_format.test(a[i])){throw new SyntaxError(`[imaginary][${i}] is not a whole number string (in format)`);}
            });
            if(imaginary[2]==="0"){throw new RangeError("[imaginary][2] denominator can not be zero");}
        }else{
            imaginary=String(imaginary);
            if(imaginary.length==0){throw new RangeError("[imaginary] is an empty string");}
            if(!srt_int_format.test(imaginary)){throw new SyntaxError("[imaginary] is not a whole number string (in format)");}
            imaginary=[imaginary,"0","1"];
        }
        this.real=Object.freeze({
            whole=real[0],
            numerator=real[1],
            denominator=real[2]
        });
        this.imaginary=Object.freeze({
            whole=imaginary[0],
            numerator=imaginary[1],
            denominator=imaginary[2]
        });
    }
    // TODO
}
