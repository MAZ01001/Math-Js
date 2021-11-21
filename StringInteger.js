class StringInteger{
    static MAX_SIZE=500;
    /**
     * __constructs a StringNumber__
     * @param {string} n - a _(signed)_ integer as string - _default=`"0"`_ \
     * minimum one digit and if more, than the first must be non-zero\
     * _(auto converts to string if not already of type string)_
     * @throws {RangeError} if `n` is an empty string
     * @throws {SyntaxError} if `n` is not a whole number string (in format)
     */
    constructor(n="0"){
        n=String(n);
        if(n.length==0){throw new RangeError("[n] is an empty string");}
        if(!/^[+-]?[1-9]*[0-9]$/.test(n)){throw new SyntaxError("[n] is not a whole number string (in format)");}
        if(n.length>StringInteger.MAX_SIZE){throw new RangeError(`[n] is bigger than ${StringInteger.MAX_SIZE} [MAX_SIZE]`);}
        // let uint8=((a,b)=>{let c=new Uint8Array(a.length+b.length);c.set(a,0);c.set(b,a.length);return c;})(Uint8Array.from("123"),Uint8Array.from("456"));
        this.n=n;
    }
    #add(n=StringInteger()){}
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