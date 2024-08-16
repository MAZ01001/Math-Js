//@ts-check
"use strict";//~ anything inside a class uses strict-mode by default

/**
 * # Random number generator
 * like `Math.random` but seed-able and no global state\
 * uses `MurmurHash3` for initial seed and `sfc32` for generating values
 * @example new RNG("seed").val; //=> 0.5728619083698983
 * @author MAZ <https://MAZ01001.GitHub.io/>
 */
const RNG=class RNG{
    /**@type {number} - [Internal] bits  0-31  of 128bit RNG state*/_a_=0;
    /**@type {number} - [Internal] bits 32-63  of 128bit RNG state*/_b_=0;
    /**@type {number} - [Internal] bits 64-95  of 128bit RNG state*/_c_=0;
    /**@type {number} - [Internal] bits 96-127 of 128bit RNG state*/_d_=0;
    /**
     * ## [Get] current internal RNG state
     * for storing and later {@linkcode RNG.from}
     * @returns {[number,number,number,number]} current internal 128bit RNG state in four 32bit chunks (ordered `[0-31, 32-63, 64-95, 96-127]`)
     */
    get state(){return[this._a_,this._b_,this._c_,this._d_];}
    /**
     * ## [internal] Creates a 128bit hash from the given string
     * `MurmurHash3`
     * @param {string} str - any string (speed is linear related to length)
     * @returns {[number,number,number,number]} 128bit value in 32bit chunks (ordered `[0-31, 32-63, 64-95, 96-127]`)
     */
    static _hash_(str){
        const N=str.length;
        let h=0xAE69DB53|0;//~ 32bit seed (prime)
        for(let i=0;i<N;++i){
            const char=(k=>(k<<15)|(k>>17))(Math.imul(str.charCodeAt(i),0xCC9E2D51));
            h^=Math.imul(char,0x1B873593);
            h=(h<<13)|(h>>19);
            h=(Math.imul(h,5)+0xE6546B64)|0;
        }
        h^=N;
        const S=()=>{
            h^=h>>16;
            h=Math.imul(h,0x85EBCA6B);
            h^=h>>13;
            h=Math.imul(h,0xC2B2AE35);
            h^=h>>16;
            return h>>>0;
        };
        return[S(),S(),S(),S()];
    }
    /**
     * ## Create a new {@linkcode RNG} object
     * `sfc32`
     * @param {string} [seed] - [optional] a string used as the seed (via `MurmurHash3`) - defaults to current UTC milliseconds (in hex)
     * @example new RNG("seed").value; //=> 0.8370377509475307
     * @throws {TypeError} - if {@linkcode seed} is not a string (not when it is null/undefined)
     */
    constructor(seed){
        if(typeof (seed??=Date.now().toString(16))!=="string")throw new TypeError("[RNG:constructor] seed is not a string.");
        [this._a_,this._b_,this._c_,this._d_]=RNG._hash_(seed);
    }
    /**
     * ## Creates a new {@linkcode RNG} object from stored {@linkcode RNG.prototype.state}
     * @param {[number,number,number,number]} state - a 128bit RNG state (in 32bit chunks ordered `[0-31, 32-63, 64-95, 96-127]`)
     * @returns {RNG} new {@linkcode RNG} object with given state
     * @throws {TypeError} if {@linkcode state} is not an array with four positive 32bit integers
     */
    static from(state){
        if(!Array.isArray(state))throw new TypeError("[RNG:from] state is not an array.");
        if(state.length!==4)throw new TypeError("[RNG:from] state is not an array with four values.");
        for(let i=0;i<5;++i){
            if(typeof state[i]!=="number")throw new TypeError("[RNG:from] state is not an array with four numbers.");
            if(state[i]<0||state[i]>0xFFFFFFFF||!Number.isInteger(state[i]))throw new TypeError("[RNG:from] state is not an array with four positive 32bit integers.");
        }
        const rng=new RNG("");
        [rng._a_,rng._b_,rng._c_,rng._d_]=state;
        return rng;
    }
    /**
     * ## Get the next random value
     * `sfc32`
     * @returns {number} 32bit unsigned integer
     */
    get val32(){
        const v=(((this._a_+this._b_)|0)+this._d_)|0;
        this._d_=(++this._d_)|0;
        this._a_=this._b_^(this._b_>>9);
        this._b_=(this._c_+(this._c_<<3))|0;
        this._c_=(this._c_<<21)|(this._c_>>11);
        this._c_=(this._c_+v)|0;
        return v>>>0;
    }
    /**
     * ## Get the next random value as percent
     * `sfc32`
     * @returns {number} between 0 and 1 (both inclusive)
     */
    get val(){return this.val32/0xFFFFFFFF;}
    /**
     * ## Get the next random value as decimal
     * `sfc32`
     * @returns {number} between 0 and 1 (0 inclusive and 1 exclusive)
     */
    get dec(){return this.val32/0x100000000;}
    /**
     * ## Get the next random value as boolean
     * `sfc32`
     * @returns {boolean} `true` or `false`
     */
    get bool(){return this.val32<0x10000;}
    /**
     * ## Get the next random value and translate it to given range (float)
     * `sfc32`
     * @param {number} min - lower bound (inclusive)
     * @param {number} max - upper bound (inclusive)
     * @returns {number} random value within set range (if {@linkcode min} is not finite, returns {@linkcode min} and, if {@linkcode max} is not finite, returns {@linkcode max})
     * @throws {TypeError} - if {@linkcode min} or {@linkcode max} are not numbers
     */
    range(min,max){
        if(typeof min!=="number")throw new TypeError("[RNG::range] min is not a number.");
        if(typeof max!=="number")throw new TypeError("[RNG::range] max is not a number.");
        if(!Number.isFinite(min))return min;
        if(!Number.isFinite(max))return max;
        if(min===max)return min;
        return(this.val32*(max-min)+0xFFFFFFFF*min)/0xFFFFFFFF;
    }
    /**
     * ## Hashes given position and seed
     * 32bit non-cryptographic hash \
     * for 2D `noise(x + y * 0xF47A23, seed)` \
     * and 3D `noise(x + y * 0xF47A23 + z * 0xABC5, seed)` \
     * and 4D `noise(x + y * 0xF47A23 + z * 0xABC5 + w * 0xAD, seed)` \
     * maybe also `Math.trunc(x + ...) % Number.MAX_SAFE_INTEGER` for {@linkcode x}, to be sure it's a safe integer
     * @param {number} x - X-position (safe integer)
     * @param {number} [seed] - [optional] seed (positive 32bit integer) - default is `0`
     * @returns {number} 32bit (positive integer) hash based on {@linkcode x} and {@linkcode seed}
     * @throws {TypeError} if {@linkcode x} is not a safe integer
     * @throws {TypeError} if {@linkcode seed} is given but not a positive 32bit integer
     */
    static noise(x,seed){
        if(!Number.isSafeInteger(x))throw new TypeError("[RNG:noise] x is not a safe integer.");
        if((seed??=0)<0||seed>0xFFFFFFFF||!Number.isInteger(seed))throw new TypeError("[RNG:noise] seed is not a positive 32bit integer.");
        x=Math.imul(x,0x49D02FE7)+(x/0x100000000)+seed;
        x^=x>>>8;
        x+=0xE1283A7D;
        x^=x<<8;
        x=Math.imul(x,0xAE69DB53);
        x^=x>>>8;
        return x>>>0;
    }
    /**
     * ## [internal] Quintic interpolation between two numbers
     * for {@linkcode RNG.valueNoise2D}
     * @param {number} a - start point
     * @param {number} b - end point
     * @param {number} t - percentage [0 to 1]
     * @returns {number} number between {@linkcode a} and {@linkcode b}
     */
    static _qLerp_(a,b,t){return(b-a)*t*t*t*(t*(t*6-15)+10)+a;}
    /**
     * ## Calculates value noise for given coordinates
     * organic noise; uses quintic interpolation for mixing numbers and a quick (non-cryptographic) hash function to get random noise from coordinates \
     * _the output is allways the same for the same input_
     * @param {number} x - X position (safe number)
     * @param {number} y - Y position (safe number)
     * @param {number} [seed] - noise seed (positive 32bit integer) - default is `0`
     * @returns {number} the noise value for this pixel, 0 (inclusive) to 1 (exclusive)
     * @throws {TypeError} if {@linkcode x} or {@linkcode y} are not safe numbers (not exceed {@linkcode Number.MAX_SAFE_INTEGER} but not strictly integers)
     * @throws {TypeError} if {@linkcode seed} is given but not a positive 32bit integer
     * @example
     * //? script within HTML after body (with 1 canvas element) loads ~ call gen(seed) with differend seed from dev-console (F12)
     * const size = Object.freeze([1920, 1080]),
     *     canvas = Object.assign(document.getElementsByTagName("canvas")[0], { width: size[0], height: size[1] }),
     *     context = canvas.getContext("2d"),
     *     exampleNoise = context.createImageData(...size, {colorSpace: "srgb"});
     * async function gen(seed){
     *     "use strict";
     *     let drawn = 0;
     *     for(let x = 0, y = 0; y < size[1] && x < size[0]; ++x >= size[0] && (x = 0, ++y)){
     *         const pixel
     *             //// = RNG.noise(x + y * 0xF47A23, seed) * 256 / 0x100000000;
     *             //// = RNG.noise(Math.floor(x / 10) + Math.floor(y / 10) * 0xF47A23, seed) * 256 / 0x100000000;
     *             = RNG.valueNoise2D(x / 128, y / 128, seed) * 128
     *             + RNG.valueNoise2D(x /  64, y /  64, seed) *  64
     *             + RNG.valueNoise2D(x /  32, y /  32, seed) *  32
     *             + RNG.valueNoise2D(x /  16, y /  16, seed) *  16
     *             + RNG.valueNoise2D(x /   8, y /   8, seed) *   8;
     *             // ...
     *         exampleNoise.data.set([pixel, pixel, pixel, 0xFF], (y * size[0] + x) * 4);
     *         if(++drawn > 10000){
     *             drawn = 0;
     *             context.putImageData(exampleNoise, 0, 0);
     *             await new Promise(E => window.requestAnimationFrame(E));
     *         }
     *     }
     *     context.putImageData(exampleNoise, 0, 0);
     * }
     * gen(0);
     */
    static valueNoise2D(x,y,seed){
        if(typeof x!=="number"||Math.abs(x)>Number.MAX_SAFE_INTEGER)throw new TypeError("[RNG:valueNoise2D] x is not a safe number.");
        if(typeof y!=="number"||Math.abs(y)>Number.MAX_SAFE_INTEGER)throw new TypeError("[RNG:valueNoise2D] y is not a safe number.");
        if((seed??=0)<0||seed>0xFFFFFFFF||!Number.isInteger(seed))throw new TypeError("[RNG:valueNoise2D] seed is not a positive 32bit integer.");
        const
            xi=Math.trunc(x),
            yi=Math.trunc(y),
            xf=x-xi,
            f=(xi+yi*0xF47A23)%Number.MAX_SAFE_INTEGER,
            bl=RNG.noise(f,seed),
            br=RNG.noise(f+1,seed),
            tl=RNG.noise(f+0xF47A23,seed),
            tr=RNG.noise(f+0xF47A24,seed);
        return RNG._qLerp_(RNG._qLerp_(bl,br,xf),RNG._qLerp_(tl,tr,xf),y-yi)/0x100000000;
    }
    static{//~ make class and prototype immutable
        Object.freeze(RNG.prototype);
        Object.freeze(RNG);
    }
};

if(typeof exports!=="undefined")exports.RNG=RNG;
//~ dynamic:     const{RNG}=await import("./RNG.js");
//~ node:        const{RNG}=require("./RNG.js");
//~ node module: import{RNG}from"./RNG.js";
//~ html:        <script src="./RNG.js"></script>
