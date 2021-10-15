class ComplexNumber{
    /*
    positive angle = counterclockwise on the circle:
           .5πr/90°
               |
    πr/180° --( )-- 0/2πr/360°
               |
          1.5πr/270°
    */
    static twoPI=Math.PI*2;
    static halfPI=Math.PI*.5;
    static quarterPI=Math.PI*.25;
    /**
     * __constructs a complex number with a real and an imaginary part__
     * @param {number} real - real part of complex number - _default `0`_
     * @param {Number} imaginary - imaginary part of complex number - _default `1`_
     * @throws {TypeError} - if `real` or `imaginary` are not numbers
     */
    constructor(real=0,imaginary=0){
        real=Number(real);
        if(Number.isNaN(real)){throw new TypeError('[real] is not a number.');}
        imaginary=Number(imaginary);
        if(Number.isNaN(imaginary)){throw new TypeError('[imaginary] is not a number.');}
        /** @type {number} - __real part__ of `this` complex number _(real float number)_ */
        this.real=real;
        /** @type {number} - __imaginary part__ of `this` complex number _(real float number)_ */
        this.imaginary=imaginary;
    }
    /**
     * __constructs a complex number with length and angle(φ Phi) in radians__ \
     * _!probably not a good idea to use this, considering js float precision!_
     * @param {number} length - length of the vector in the complex plane - _default `1`_
     * @param {number} angle - angle in radians [0-2π] (positive=counterclockwise) - _default `0`_
     * @throws {TypeError} - if `length` or `angle` are not numbers
     * @returns {ComplexNumber} - complex number with above attributes
     */
    static mkWithLengthAngleRadian(length=1,angle=0){
        length=Number(length);
        if(Number.isNaN(length)){throw new TypeError('[length] is not a number.');}
        angle=Number(angle);
        if(Number.isNaN(angle)){throw new TypeError('[angle] is not a number.');}
        if(length===0){return new ComplexNumber(0,0);}
        if((angle%Math.PI)===0){return new ComplexNumber((angle%ComplexNumber.twoPI===0)?length:-length,0);}
        if(length<0){
            angle+=Math.PI;
            length=Math.abs(length);
        }
        angle=angle<0?ComplexNumber.twoPI+(angle%ComplexNumber.twoPI):angle%ComplexNumber.twoPI;
        const _n=n=>Math.abs(n)<Number.EPSILON?0:n;//probably best to use this on every number everywhere xD
        return new ComplexNumber(
            _n(Math.cos(angle))*length*((angle+ComplexNumber.halfPI)>Math.PI?-1:1),
            _n(Math.sin(angle))*length*(angle>Math.PI?-1:1)
        );
    }
    /**
     * __constructs a complex number with length and angle(φ Phi) in degrees__
     * @param {number} length - length of the vector in the complex plane - _default `1`_
     * @param {number} angle - angle in degree [0-360] (positive=counterclockwise) - _default `0`_
     * @throws {TypeError} - if `length` or `angle` are not numbers
     * @returns {ComplexNumber} - complex number with above attributes
     */
    static mkWithLengthAngleDegree(length=1,angle=0){
        length=Number(length);
        if(Number.isNaN(length)){throw new TypeError('[length] is not a number.');}
        angle=Number(angle);
        if(Number.isNaN(angle)){throw new TypeError('[angle] is not a number.');}
        if(length===0){return new ComplexNumber(0,0);}
        if((angle%180)===0){return new ComplexNumber((angle%360===0)?length:-length,0);}
        if(length<0){
            angle+=180;
            length=Math.abs(length);
        }
        angle=angle<0?360+(angle%360):angle%360;
        const _n=n=>Math.abs(n)<Number.EPSILON?0:n;//probably best to use this on every number everywhere xD
        return new ComplexNumber(
            (angle+90)>180?-_n(Math.cos(angle*Math.PI/180))*length:_n(Math.cos(angle*Math.PI/180))*length,
            angle>180?-_n(Math.sin(angle*Math.PI/180))*length:_n(Math.sin(angle*Math.PI/180))*length
        );
    }
    /**
     * __calculates the root of `n`__
     * @param {number} n - number
     * @throws {TypeError} - if `n` is not a number
     * @returns {ComplexNumber} - complex number
     */
    static sqrtN2complex(n){
        n=Number(n);
        if(Number.isNaN(n)){throw new TypeError('[n] is not a number.');}
        if(n>=0){return new ComplexNumber(Math.sqrt(n),0);}
        return new ComplexNumber(0,Math.sqrt(Math.abs(n)));
    }
    /**
     * __gets the real part of `this` complex number__
     * @returns {Number} real part of `this` complex number
     */
    getReal(){return this.real;}
    /**
     * __gets the imaginary part of `this` complex number__
     * @returns {Number} imaginary part of `this` complex number
     */
    getImaginary(){return this.imaginary;}
    /**
     * __gets the angle of `this` complex number__ \
     * _(counterclockwise)_
     * @param {boolean} degrees - if `true` converts the angle from radians to degrees - _default `false`_
     * @returns {number|undefined} the angle (Phi φ) of `this` complex number _(`undefined` on `(0+0i)`)_
     */
    getAngle(degrees=false){
        const at2 = Math.atan2(this.imaginary,this.real);
        if(at2<0){return !!degrees?360+(at2*(180/Math.PI)):ComplexNumber.twoPI+at2;}
        else{return !!degrees?at2*(180/Math.PI):at2;}
    }
    /**
     * __gets the length of `this` complex number__ \
     * _(alias of `this.getAbsoluteValue();`)_
     * @returns {number} the length of `this` complex number
     */
    getLength=this.getAbsoluteValue;
    /**
     * __gets the absolute value of `this` complex number__
     * @returns {number} the absolute value of `this` complex number
     */
    getAbsoluteValue(){return Math.sqrt((this.real**2)+(this.imaginary**2));}
    /**
     * __gets the length of the arc from 0r/0° to where `this` complex number is__
     * @returns {number} length of the arc
     */
    getArcLength(){return this.getLength()*this.getAngle();}
    /**
     * __logs the current value of `this` complex number to the console__
     * @returns {ComplexNumber} `this` complex number after logging to console
     */
    logValue(){console.log('((%f) + i(%f)) = %f',this.real,this.imaginary,this.getAbsoluteValue());return this;}
    /**
     * __adds another complex number to `this` one__
     * @param {ComplexNumber} complex - other complex number for addition
     * @returns {ComplexNumber} `this` complex number after successful addition
     */
    add(complex=ComplexNumber(0,0)){
        if(!(complex instanceof ComplexNumber)){throw new TypeError('[complex] is not an instance of ComplexNumber.');}
        this.real+=complex.real;this.imaginary+=complex.imaginary;
        return this;
    }
    /**
     * __subtracts another complex number from `this` one__
     * @param {ComplexNumber} complex - other complex number for subtraction
     * @returns {ComplexNumber} `this` complex number after successful subtraction
     */
    sub(complex=ComplexNumber(0,0)){
        if(!(complex instanceof ComplexNumber)){throw new TypeError('[complex] is not an instance of ComplexNumber.');}
        this.real-=complex.real;this.imaginary-=complex.imaginary;
        return this;
    }
    /**
     * __mulitlies another complex number with `this` one__
     * @param {ComplexNumber} complex - other complex number for multiplication
     * @returns {ComplexNumber} `this` complex number after successful multiplication
     */
    mul(complex=ComplexNumber(1,0)){
        if(!(complex instanceof ComplexNumber)){throw new TypeError('[complex] is not an instance of ComplexNumber.');}
        [this.real,this.imaginary]=[
            (this.real*complex.real)-(this.imaginary*cmplex.imaginary),
            (this.real*complex.imaginary)+(this.imaginary*complex.real)
        ];
        return this;
    }
    /**
     * __divides `this` complex number by another__
     * @param {ComplexNumber} complex - other complex number for division (denominator)
     * @returns {ComplexNumber} `this` complex number after successful division
     */
    div(complex=ComplexNumber(1,0)){
        if(!(complex instanceof ComplexNumber)){throw new TypeError('[complex] is not an instance of ComplexNumber.');}
        [this.real,this.imaginary]=[
            ((this.real*complex.real)+(this.imaginary*complex.imaginary))/((complex.real**2)+(complex.imaginary**2)),
            ((this.imaginary*complex.real)-(this.real*complex.imaginary))/((complex.real**2)+(complex.imaginary**2))
        ];
        return this;
    }
    /**
     * __raise `this` complex number to the power of `n`__
     * @param {number} n - integer exponent _(can be negative)_ - _default `1`_
     * @throws {TypeError} - if `n` is not a save integer
     * @returns {ComplexNumber} `this` complex number after successful calculation _(the imaginary part might be 0)_
     */
    pow(n=1){
        n=Number(n);
        if(Number.isSafeInteger(n)){throw new TypeError('[n] is not a save integer.');}
        if(n<-1){
            try{this.ToPowerOf(Math.abs(n)).ToPowerOf(-1);}
            catch(err){throw new Error(err);}
        }else switch(n){
            case -1:[this.real,this.imaginary]=[this.real/((this.real**2)+(this.imaginary**2)),-(this.imaginary/((this.real**2)+(this.imaginary**2)))];break;
            case 0:[this.real,this.imaginary]=[1,0];break;
            case 1:break;
            case 2:[this.real,this.imaginary]=[(this.real**2)-(this.imaginary**2),2*this.real*this.imaginary];break;
            case 3:[this.real,this.imaginary]=[(this.real**3)-(3*this.real*(this.imaginary**2)),(3*(this.real**2)*this.imaginary)-(this.imaginary**3)];break;
            case 4:[this.real,this.imaginary]=[(this.real**4)+(6*(this.real**2)*-(this.imaginary**2))+(this.imaginary**4),(4*(this.real**3)*this.imaginary)+(4*this.real*-(this.imaginary**3))];break;
            case 5:[this.real,this.imaginary]=[(this.real**5)-(10*(this.real**3)*(this.imaginary**2))+(5*this.real*(this.imaginary**4)),(5*(this.real**4)*this.imaginary)-(10*(this.real**2)*(this.imaginary**3))+(this.imaginary**5)];break;
            case 6:[this.real,this.imaginary]=[(this.real**6)-(15*(this.real**4)*(this.imaginary**2))+(15*(this.real**2)*(this.imaginary**4))-(this.imaginary**6),(6*(this.real**5)*this.imaginary)-(20*(this.real**3)*this.imaginary**3)+(6*this.real*(this.imaginary**5))];break;
            case 7:[this.real,this.imaginary]=[(this.real**7)-(21*(this.real**5)*(this.imaginary**2))+(35*(this.real**3)*(this.imaginary**4))-(7*this.real*(this.imaginary**6)),(7*(this.real**6)*this.imaginary)-(35*(this.real**4)*(this.imaginary**3))+(21*(this.real**2)*(this.imaginary**5))-(this.imaginary**7)];break;
            case 8:[this.real,this.imaginary]=[(this.real**8)-(28*(this.real**6)*(this.imaginary**2))+(70*(this.real**4)*(this.imaginary**4))-(28*(this.real**2)*(this.imaginary**6))+(this.imaginary**8),(8*(this.real**7)*this.imaginary)-(56*(this.real**5)*(this.imaginary**3))+(56*(this.real**3)*(this.imaginary**5))-(8*this.real*(this.imaginary**7))];break;
            default:
                let tmpRe=0,tmpIm=0,last=1;
                for(let k=0;k<=n;k++){
                    switch(k%4){
                        case 0:tmpRe+=last*(re**(n-k))*(im**k);break;
                        case 1:tmpIm+=last*(re**(n-k))*(im**k);break;
                        case 2:tmpRe-=last*(re**(n-k))*(im**k);break;
                        case 3:tmpIm-=last*(re**(n-k))*(im**k);break;
                    }
                    last=Math.floor(last*((n+1-k)/k));
                }
                [re,im]=[tmpRe,tmpIm];
                break;
        }
        return this;
    }
}
