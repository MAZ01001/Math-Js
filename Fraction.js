class Fraction{
    /**
     * __creates a Fraction-Object__
     * @param {number} a _(Real-Integer)_ "whole number" - _default `0` (can be negative)_
     * @param {number} b _(Real-Integer)_ "numerator" - _default `0` (can be negative)_
     * @param {number} c _(Real-Integer)_ "denominator" - _default `1` (can be negative)_
     * @throws {Error} if denominator is `0`
     * @description formula: `(a+(b/c))` (mixed-fraction)
     */
    constructor(a=0,b=0,c=1){
        /** @type {boolean} - `true` if this fraction is of negative value */
        this.neg;
        /** @type {number} - "whole number" _(Real-positive-Integer)_ */
        this.a;
        /** @type {number} - "numerator" _(Real-positive-Integer)_ */
        this.b;
        /** @type {number} - "denominator" _(Real-positive-Integer)_ */
        this.c;
        if(c==0){throw new Error("denominator can not be zero");}
        if(
            a<0&&b<0&&c<0||
            a<0&&b>0&&c>0||
            a>0&&b<0&&c>0||
            a>0&&b>0&&c<0
        ){this.neg=true;}
        else{this.neg=false;}
        this.a=Math.abs(a);
        this.b=Math.abs(b);
        this.c=Math.abs(c);
    }
    /**
     * __computes the greatest-common-dividor of two whole numbers__
     * @param {number} A (Real-Integer) whole number
     * @param {number} B (Real-Integer) whole number
     * @returns {number} greatest-common-dividor (whole number)
     */
    static gcd(A,B){
        if(A<B){[A,B]=[B,A];}
        for(;A%B>0;[A,B]=[B,A%B]);
        return B;
    }
    /**
     * __converts a decimal number to a improper-fraction (rough estimation)__
     * @param {number} dec - (real float) - decimal number
     * @param {number} max_den - (real positive integer) - max number for denominator - _default `0` (no limit)_
     * @param {number} max_iter - (real positive integer) - max iteration count - _default `1e6`_
     * @param {number} prec - (real positive float) - decimal value for precision error - _default `Number.EPSILON`_
     * @returns {{t:number,b:number,c:number,n:number,l:string}}
     * + t : sign (`1|-1`)
     * + b : numerator (real positive integer)
     * + c : denominator (real positive integer)
     * + n : iteration count (real positive integer)
     * + l : reason of exit (`'max_den'|'infinity'|'prec'|'max_iter'`)
     */
    static dectofrac(dec,max_den=0,max_iter=1e6,prec=Number.EPSILON){
        let sign=(dec<0?-1:1),
            nint,ndec=Math.abs(dec),
            num,pnum=1,ppnum=0,
            den,pden=0,ppden=1,
            iter=0;
        do{
            nint=Math.floor(ndec);
            if(max_den>0&&(ppden+(nint*pden))>max_den){return{t:sign,b:num,c:den,n:iter,l:'max_den'};}
            if(!isFinite(ppnum+(nint*pnum))){return{t:sign,b:num,c:den,n:iter,l:'infinity'};}
            num=ppnum+nint*pnum;
            den=ppden+nint*pden;
            // console.log(
            //     ">>%d\n%s\n%s",
            //     iter,
            //     `${num.toString().padEnd(10,' ')} ${ppnum} + ${nint} * ${pnum}`,
            //     `${den.toString().padEnd(10,' ')} ${ppden} + ${nint} * ${pden}`
            // );
            ppnum=pnum;
            ppden=pden;
            pnum=num;
            pden=den;
            ndec=1.0/(ndec-nint);
            if(prec>Math.abs((sign*(num/den))-dec)){return{t:sign,b:num,c:den,n:iter,l:'prec'};}
        }while(iter++<max_iter);
        return {t:sign,b:num,c:den,n:iter,l:'max_iter'};
    };
    /**
     * __converting a decimal number to a Fraction-Object__
     * @param {string|number} v - _Real_ decimal number _(auto detects repeating digits) - (can be a string and of negative value) - default `0.0`_
     * @param {number} md - _(Real Integer)_ maximum value for denominator _(makes it a rough estimation - `0` is no limit) - default `0`_
     * @param {boolean} nl - if `true` doesn't loop -> literal `0.4` not `0.44444..4` - _default `false`_
     * @param {boolean} fl - if `true` allways loop -> `0.123` => `0.123123..123` - _(only active if `nl` is `false`) - default `false`_
     * @returns {Fraction} Fraction-Object
     * @throws {Error} if parsing a string that can't be converted to a decimal number
     */
    static fromdecimal(v=0.0,md=0,nl=false,fl=false){
        if(typeof(v)=='string'){
            v=parseFloat(v);
            if(v==NaN){throw new Error("parsed string is not a number");}
        }
        if(v==0.0){return new Fraction();}
        let _az,f=new Fraction();
        if(v<0){f.neg=true;}
        [,f.a,_az]=[...Math.abs(v).toString().match(/(-?[0-9]+)(?:[,.]([0-9]+))?/)];
        f.a=parseInt(f.a);
        if(!_az){_az='0';}
        if(nl){
            f.b=parseInt(_az);
            f.c=Math.pow(10,_az.length);
        }else{
            const r=/^((?<d>[0-9]+?)\k<d>*)$/;
            const _a=_az.match(r)[1],
                _d=_az.match(r)[2];
            f.b=parseInt(_d);
            f.c=Math.pow(10,_d.length);
            if(_a!=_d||_a.length==1||fl){f.c--;}
        }
        if(md>0){
            if(f.toImproper().c>md){
                let f2=Fraction.dectofrac(v,md);
                {const _tmp=Math.floor(f2.b/f2.c);f2.t*=_tmp;f2.b-=_tmp*f2.c;}
                f.neg=(f2.t<0);
                f.a=Math.abs(f2.t);
                f.b=f2.b;
                f.c=f2.c;
            }
        }
        return f.toMixed();
    }
    /**
     * __converts this fraction to the smallest possible mixed-fraction-form__
     * @returns {Fraction} current object (`this`)
     */
    toMixed(){
        if(this.b%this.c==0){
            this.a+=this.b/this.c;
            this.b=0;
            this.c=1;
            return this;
        }
        if(this.b>this.c){
            this.a+=Math.floor(this.b/this.c);
            this.b=this.b%this.c;
        }
        const _gcd=Fraction.gcd(this.c,this.b);
        if(_gcd>1){
            this.b/=_gcd;
            this.c/=_gcd;
        }
        return this;
    };
    /**
     * __converts this fraction to the smallest possible improper-fraction-form__
     * @returns {Fraction} current object (`this`)
     */
    toImproper(){
        if(this.b%this.c==0){
            this.b=this.computeValue();
            this.a=0;
            this.c=1;
            return this;
        }
        this.b+=this.c*this.a;
        this.a=0;
        const _gcd=Fraction.gcd(this.c,this.b);
        if(_gcd>1){
            this.b/=_gcd;
            this.c/=_gcd;
        }
        return this;
    }
    /**
     * __computes the decimal value of this fraction and returns it__
     * @returns {number} decimal value of the fraction
     */
    todecimal(){
        if(this.neg){return -(this.a+(this.b/this.c));}
        else{return this.a+(this.b/this.c);}
    }
    /**
     * __creates a formated string of this fraction with decimal value__
     * @returns {string} - `+-(a+(b/c)) ~ +-1.234`
     */
    tostr(){return `${this.neg?'-':'+'}(${this.a}+(${this.b}/${this.c})) ~ ${this.todecimal()}`;}
    /**
     * __adds a single integer to this fraction__
     * @param {number} n - Real-Integer _(can be negative)_
     * @returns {Fraction} Fraction-Object
     * @description _for subtraction parse negative Real-Integer_
     */
    add_n(n=0){
        if(n==0){return this.toMixed();}
        this.toMixed();
        if(this.neg){
            this.a=n-this.a;
            if(this.a>=0){
                this.neg=false;
                this.b=this.c-this.b;
            }
        }else{
            this.a+=n;
            if(this.a<0){
                this.neg=true;
                this.b=this.c-this.b;
            }
        }
        this.a=Math.abs(this.a);
        return this.toMixed();
    }
    /**
     * __multiplies a single integer with this fraction__
     * @param {number} n - Real-Integer _(can be negative)_
     * @returns {Fraction} Fraction-Object
     */
    mul_n(n=1){
        if(n==1){return this.toMixed();}
        this.toImproper();
        if(n<0){this.neg=!this.neg;}
        this.b*=Math.abs(n);
        return this.toMixed();
    }
    /**
     * __divides a single integer from this fraction__
     * @param {number} n - Real-Integer _(can be negative)_
     * @returns {Fraction} Fraction-Object
     * @throws {Error} when trying to divide by `0`
     */
    div_n(n=1){
        if(n==0){throw new Error("can not divide by zero");}
        if(n==1){return this.toMixed();}
        if(n<0){this.neg=!this.neg;}
        this.c*=Math.abs(n);
        return this.toMixed();
    }
    /**
     * __adds another fraction to this fraction__
     * @param {Fraction} f - Fraction-Object
     * @returns {Fraction} Fraction-Object
     */
    add_f(f=null){
        if(f==null){return this.toMixed();}
        this.toMixed();
        f.toMixed();
        if(this.neg&&!f.neg){
            this.a=Math.abs(f.a-this.a);
            this.b=Math.abs((f.b*this.c)-(this.b*f.c));
        }else if(!this.neg&&f.neg){
            this.a=Math.abs(this.a-f.a);
            this.b=Math.abs((this.b*f.c)-(f.b*this.c));
        }else{
            this.a+=f.a;
            this.b=((this.b*f.c)+(f.b*this.c));
        }
        this.c*=f.c;
        if(f.neg){this.neg=!this.neg;}
        return this.toMixed();
    }
    /**
     * __subtracts another fraction from this fraction__
     * @param {Fraction} f - Fraction-Object
     * @returns {Fraction} Fraction-Object
     */
    sub_f(f=null){
        if(f==null){return this.toMixed();}
        this.toMixed();
        f.toMixed();
        this.a-=f.a;
        this.b=(this.b*f.c-f.b*this.c);
        this.c*=f.c;
        if(f.neg){
            this.toMixed();
            this.neg=!this.neg;
            this.b=this.c-this.b;
        }
        return this.toMixed();
    }
    /**
     * __multiplies another fraction with this fraction__
     * @param {Fraction} f - Fraction-Object
     * @returns {Fraction} Fraction-Object
     */
    mul_f(f=null){
        if(f==null){return this.toMixed();}
        this.toImproper();
        f.toImproper();
        this.b*=f.b;
        this.c*=f.c;
        if(f.neg){
            this.toMixed();
            this.neg=!this.neg;
            this.b=this.c-this.b;
        }
        return this.toMixed();
    }
    /**
     * __divides another fraction from this fraction__
     * @param {Fraction} f - Fraction-Object
     * @returns {Fraction} Fraction-Object
     * @throws {Error} when trying to divide by `0`
     */
    div_f(f=null){
        if(f==null){return this.toMixed();}
        this.toImproper();
        f.toImproper();
        this.b*=f.c;
        this.c*=f.b;
        if(f.neg){
            this.toMixed();
            this.neg=!this.neg;
            this.b=this.c-this.b;
        }
        return this.toMixed();
    }
};
// console.log(
//     "%s\n%s\n%s",
//     new Fraction(0,1,3).div_f(new Fraction(0,3,4)).tostr(),//=> 4/9 ~ 0.44444..4
//     Fraction.fromdecimal(3.333).tostr(),//=> 3 1/3 ~ 3.33333..5
//     Fraction.fromdecimal(Math.PI,1e9,true).tostr()//=> 3 11080585/78256779 ~ 3.141592653589793
// );
