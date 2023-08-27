//@ts-check
"use strict";
/**
 * BigInt > Fraction > ComplexNumber
 * @class
 * @author MAZ <https://MAZ01001.GitHub.io/>
 */
class BigIntFractionComplex{
    // TODO
    /**
     * @typedef {[Boolean,BigInt,BigInt,BigInt]} BigIntFraction Integer fraction `[sign] A + ( B / C )`
     */
    /**@returns {BigIntFraction} real part */
    get real(){return this._real_;}
    /**@returns {BigIntFraction} imaginary part */
    get imaginary(){return this._imaginary_;}
    /**
     * @param {BigIntFraction} real - real part
     * @param {BigIntFraction} imaginary - imaginary part
     */
    constructor(real,imaginary){
        if(
            !Array.isArray(real)
            ||real.length!==4
            ||real.some((v,i)=>i===0?typeof v!=="boolean":typeof v!=="bigint")
        )throw new TypeError("[BigIntFractionComplex:constructor] real is not a BigIntFraction type");
        if(
            !Array.isArray(imaginary)
            ||imaginary.length!==4
            ||imaginary.some((v,i)=>i===0?typeof v!=="boolean":typeof v!=="bigint")
        )throw new TypeError("[BigIntFractionComplex:constructor] real is not a BigIntFraction type");
        this._real_=real;
        this._imaginary_=imaginary;
    }
    /**
     * __get the object (string) descriptor__
     * @readonly
     */
    get[Symbol.toStringTag](){return "BigIntFractionComplex"}
    // TODO
};

module.exports=BigIntFractionComplex;
//~ import like this
// const BigIntFractionComplex = require("./BigIntFractionComplex.js");
// Object.freeze(BigIntFractionComplex.prototype);
// Object.freeze(BigIntFractionComplex);
