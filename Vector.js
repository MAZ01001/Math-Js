class Vector{
    /**
     * __create a Vector object__
     * @param  {number} X - X-value
     * @param  {number} Y - Y-value - default `NaN` ie none
     * @param  {number} Z - Z-value - default `NaN` ie none
     */
    constructor(X,Y=NaN,Z=NaN){
        /** @type {number} X value of vector */
        this.X=+X;
        /** @type {number} Y value of vector */
        this.Y=+Y;
        /** @type {number} Z value of vector */
        this.Z=+Z;
        /** @type {number} dimension of vector */
        this.dim=(Number.isNaN(Y)?1:(Number.isNaN(Z)?2:3));
    }
    /**
     * __calculates the length of `this` vector__
     * @returns {number} length of `this` vector or `NaN` if vector is faulty
     */
    calc_len(){
        switch(this.dim){
            case 1:return this.X;
            case 2:return Math.sqrt(this.X**2+this.Y**2);
            case 3:return Math.sqrt(this.X**2+this.Y**2+this.Z**2);
            default:return NaN;
        }
    }
    /**
     * __calculation for angle between vectors__
     * @param {number} a - part of the fraction
     * @param {number} b - part of the fraction
     * @returns {number} inverse cosine of the squareroot of the fraction (smaller number auto top)
     */
    static #angcos=(a,b)=>(a===0||b===0)?NaN:Math.acos(Math.sqrt(a>b?b/a:a/b));
    /**
     * __calculates the angle between another vector, plane, axis or plane projection then axis__
     * @param {string|Vector} a - string = angle to plane `XY`/`YZ`/`XZ`, axis `X`/`Y`/`Z` or plane projection then axis `XY>X`/`XY>Y` / `YZ>Y`/`YZ>Z` / `XZ>X`/`XZ>Z`
     * @returns {number} the angle in DEG or `NaN` if the parsed value is faulty or calculating with `Infinity`
     */
    calc_ang(a){
        if(a===null||a===undefined){return NaN;}
        if(a instanceof Vector){return Vector.#angcos(this.calc_len(),a.calc_len());}
        if(typeof a==='string'){
            if(this.calc_len()===0){return NaN;}
            a=a.toUpperCase();
            if(!/^(?:X|Y|Z|XY|YX|YZ|ZY|XZ|ZX|XY>X|XY>Y|YZ>Y|YZ>Z|XZ>X|XZ>Z|YX>X|YX>Y|ZY>Y|ZY>Z|ZX>X|ZX>Z)$/.test(a)){return NaN;}
            const _x_=Number.isNaN(this.X)?0:this.X**2,
                _y_=Number.isNaN(this.Y)?0:this.Y**2,
                _z_=Number.isNaN(this.Z)?0:this.Z**2;
            switch(a){
                case'X':return Vector.#angcos(_x_,_x_+_y_+_z_)||0;
                case'Y':return Vector.#angcos(_y_,_x_+_y_+_z_)||0;
                case'Z':return Vector.#angcos(_z_,_x_+_y_+_z_)||0;
                case'XY':case'YX':return Vector.#angcos(_x_+_y_,_x_+_y_+_z_)||0;
                case'YZ':case'ZY':return Vector.#angcos(_y_+_z_,_x_+_y_+_z_)||0;
                case'XZ':case'ZX':return Vector.#angcos(_x_+_z_,_x_+_y_+_z_)||0;
                case'XY>X':case'YX>X':return Vector.#angcos(_x_,_x_+_y_)||0;
                case'XY>Y':case'YX>Y':return Vector.#angcos(_y_,_x_+_y_)||0;
                case'YZ>Y':case'ZY>Y':return Vector.#angcos(_y_,_y_+_z_)||0;
                case'YZ>Z':case'ZY>Z':return Vector.#angcos(_z_,_y_+_z_)||0;
                case'XZ>X':case'ZX>X':return Vector.#angcos(_x_,_x_+_z_)||0;
                case'XZ>Z':case'ZX>Z':return Vector.#angcos(_z_,_x_+_z_)||0;
            }
        }
        return NaN;
    }
    /**
     * __converts angle from DEG to RAD__
     * @param {number} deg - angle in degrees
     * @returns {number} angle in radians or `NaN` if the parsed value is faulty
     */
    static deg2rad(deg){
        if(deg===null||deg===undefined){return NaN;}
        deg=Number(deg);
        if(Number.isNaN(deg)){return NaN;}
        return deg*(180/Math.PI);
    }
    /**
     * __converts angle from RAD to DEG__
     * @param {number} rad - angle in radians
     * @returns {number} angle in degrees or `NaN` if the parsed value is faulty
     */
    static rad2deg(rad){
        if(rad===null||rad===undefined){return NaN;}
        rad=Number(rad);
        if(Number.isNaN(rad)){return NaN;}
        return rad*(Math.PI/180);
    }
    /**
     * __tests the vector for finite size__
     * @returns {boolean} `true` if length, X, Y and Z values of vector are finite
     */
    isFinite(){
        return Number.isFinite(this.calc_len())
            && Number.isFinite(this.X)
            && Number.isFinite(this.Y)
            && Number.isFinite(this.Z);
    }
    /**
     * __tests if the two vectors are equal in size and dimension__
     * @param {Vector} v - another vector for comparison
     * @returns {boolean} `true` if vectors are of same size and dimension
     */
    isEq(v){
        if(v===null||v===undefined||!(v instanceof Vector)){return false;}
        return this.X===v.X
            && this.Y===v.Y
            && this.Z===v.Z;
    }
    /**
     * __inverts `this` vector and returns it__
     * @returns {Vector} `this` vector after inversion
     */
    invert(){
        this.X=-this.X;
        this.Y=-this.Y;
        this.Z=-this.Z;
        return this;
    }
    /**
     * __convertes `this` vector into a unit-vector__ _(length 1)_
     * @returns {Vector} `this` vector after conversion
     */
    convert_unit_vec(){
        const _x_=this.X**2,
            _y_=this.Y**2,
            _z_=this.Z**2,
            _d_=_x_+_y_+_z_;
        this.X=Math.sqrt(_x_/_d_);
        this.Y=this.dim>1?Math.sqrt(_y_/_d_):NaN;
        this.Z=this.dim>2?Math.sqrt(_z_/_d_):NaN;
        return this;
    }
    /**
     * __adds another vector to `this` one__
     * @param {Vector} v - another vector
     * @returns {Vector} `this` vector after addition
     * @throws {TypeError} if `v` is not a `Vector`-object
     */
    add_vec(v){
        if(v===null||v===undefined||!(v instanceof Vector)){throw TypeError('parsed value is not a vector.');}
        this.X=(this.X||0)+(v.X||0);
        if(this.dim>1||v.dim>1){this.Y=(this.Y||0)+(v.Y||0);}
        if(this.dim>2||v.dim>2){this.Z=(this.Z||0)+(v.Z||0);}
        return this;
    }
    /**
     * __subtracts another vector from `this` one__
     * @param {Vector} v - another vector
     * @returns {Vector} `this` vector after subtraction
     * @throws {TypeError} if `v` is not a `Vector`-object
     */
    sub_vec(v){
        if(v===null||v===undefined||!(v instanceof Vector)){throw TypeError('parsed value is not a vector.');}
        this.X=(this.X||0)-(v.X||0);
        if(this.dim>1||v.dim>1){this.Y=(this.Y||0)-(v.Y||0);}
        if(this.dim>2||v.dim>2){this.Z=(this.Z||0)-(v.Z||0);}
        return this;
    }
    /**
     * __scales `this` vector by a given constant__
     * @param {number} n - multiplier
     * @returns {Vector} `this` vector after scaling
     * @throws {TypeError} if `n` is not a number
     */
    mul_num(n){
        if(n===null||n===undefined||typeof n!=='number'){throw TypeError('parsed value is not a number.');}
        this.X*=n;
        this.Y*=n;
        this.Z*=n;
        return this;
    }
}
// let a=new Vector(1,2,3).add_vec(new Vector(1,2,3)).mul_num(.123).sub_vec(new Vector(3,-1,2)).invert().convert_unit_vec();
// console.log([[a.X],[a.Y],[a.Z]]);
