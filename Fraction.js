class Fraction{
    /**
     * __creates a (mixed) Fraction__
     * @param {number} a _(Real-Integer)_ "whole number" - _default `0` (can be negative)_
     * @param {number} b _(Real-Integer)_ "numerator" - _default `0` (can be negative)_
     * @param {number} c _(Real-Integer)_ "denominator" - _default `1` (can be negative)_
     * @throws Error if denominator is `0`
     * @description formula: `(a+(b/c))` (mixed-fraction)
     */
    constructor(a=0,b=0,c=1){
        if(c==0){throw new Error("can not divide by zero !");}
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
     * __converts fraction to the smallest possible mixed-fraction-form__
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
     * __converts fraction to the smallest possible improper-fraction-form__
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
     * __converting a decimal number to a Fraction__
     * @param {number} v - _Real_ decimal number _(auto detects repeating digits) - default `0.0` (can be negative)_
     * @param {boolean} nl - if `true` doesn't loop -> literal `0.4` not `0.44444..4`
     * @returns {Fraction} Fraction-Object
     */
    static fromdecimal(v=0.0,nl=false){
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
            if(_a!=_d||_a.length==1){f.c--;}
        }
        return f.toMixed();
    }
    /**
     * __computes the decimal value of the fraction and returns it__
     * @returns {number} decimal value of the fraction
     */
    todecimal(){return (this.neg?-this.a:this.a)+(this.b/this.c);}
    /**
     * __creates a formated string of the fraction with decimal value__
     * @returns {string} - `+-(a+(b/c)) ~ +-1.234`
     */
    tostr(){return `${this.neg?'-':'+'}(${this.a}+(${this.b}/${this.c})) ~ ${this.todecimal()}`;}
    // TODO documentation
    // TODO neg-numbers !
    add_n(n=0){
        if(n==0){return this;}
        this.a+=n;
        return this;
    }
    sub_n(n=0){
        if(n==0){return this;}
        this.a-=n;
        return this;
    }
    mul_n(n=1){
        if(n==1){return this;}
        this.toImproper();
        this.b*=n;
        return this;
    }
    div_n(n=1){
        if(n==0){throw new Error("can not divide by zero !");}
        if(n==1){return this;}
        this.toImproper();
        this.c*=n;
        return this;
    }
    add_f(f=null){
        if(f==null){return this;}
        this.a+=f.a;
        this.b=(this.b*f.c+f.b*this.c);
        this.c*=f.c;
        return this;
    }
    sub_f(f=null){
        if(f==null){return this;}
        this.a-=f.a;
        this.b=(this.b*f.c-f.b*this.c);
        this.c*=f.c;
        return this;
    }
    mul_f(f=null){
        if(f==null){return this;}
        this.toImproper();
        f.toImproper();
        this.b*=f.b;
        this.c*=f.c;
        return this;
    }
    div_f(f=null){
        if(f==null){return this;}
        this.toImproper();
        f.toImproper();
        this.b*=f.c;
        this.c*=f.b;
        return this;
    }
};
console.log(
    // new Fraction(0,1,3).div_f(new Fraction(0,3,4)).tostr()//=> 4/9 ~ 0.444..
    // Fraction.fromdecimal(3.4).tostr()//=> 3 4/9 ~ 3.44444..6
    // Fraction.fromdecimal(3.445).tostr()//=> 3 89/200 ~ 3.445
    // Fraction.fromdecimal(3.44,true).tostr()//=> 3 11/25 ~ 3.44
    Fraction.fromdecimal(3.3).tostr()//=> 3 1/3 ~ 3.33333..5
);
