class Fraction{
    /**
     * __creates a (mixed) Fraction__
     * @param {number} a _(Integer)_ "whole number" - _default `1`_
     * @param {number} b _(Integer)_ "numerator" - _default `0`_
     * @param {number} c _(Integer)_ "denominator" - _default `1`_
     * @description formula: `a+(b/c)`
     */
    constructor(a=0,b=0,c=1){
        this.a=a;
        this.b=b;
        this.c=c;
    }
    /**
     * __checks Fraction for an improper fraction and converts it to a mixed fraction__
     * @param {Fraction} el this Fraction
     * @example Fraction.#check(this); //(private method)
     */
    static #check=(el)=>{
        if(el.b>el.c){
            el.a+=Math.floor(el.b/el.c);
            el.b=el.b%el.c;
            // TODO floor(c/b) c%b==0 ? ~~ GreatestCommonDividor !
            // function gcd(A,B){
            //     if(A<B){[A,B]=[B,A];}
            //     for(;A%B>0;[A,B]=[B,A%B]){}
            //     return B;
            // }
        }else if(el.b==el.c){
            el.a++;
            el.b=0;
            el.c=1;
        }
    };
    value(){return this.a+(this.b/this.c);}
    tostr(){return `${this.a}+(${this.b}/${this.c}) ~ ${this.value()}`;}
    add_n(n=0){
        if(n==0){return this;}
        this.b+=this.c*n;
        Fraction.#check(this);
        return this;
    }
    sub_n(n=0){
        if(n==0){return this;}
        this.b-=this.c*n;
        Fraction.#check(this);
        return this;
    }
    mul_n(n=1){
        if(n==1){return this;}
        this.b*=n;
        Fraction.#check(this);
        return this;
    }
    div_n(n=1){
        if(n==1){return this;}
        if(n==0){return null;}
        this.c*=n;
        Fraction.#check(this);
        return this;
    }
    // add_f(){}
    // sub_f(){}
    // mul_f(){}
    // div_f(){}
};
// TODO
console.log(
    new Fraction(0,1,3).sub_n(4).tostr()
);