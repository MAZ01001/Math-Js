/**
 * __class for a Polynomial__
 * @theory [Wikipedia (Polynomial)](https://en.wikipedia.org/wiki/Polynomial)
 * @example
 * let  f = Polynomial.mkfromstr("x^3 -3*x + 5");
 * console.log(f.fac);//=> [ 5, -3, 0, 1 ]
 * console.log(f.tostr());//=> x^3-3x+5
 * console.log(f.tostr(true));//=> +1x^3 +0x^2 -3x^1 +5x^0
 * console.log(f.calc(0));//=> 5
 */
class Polynomial{
    /**
     * __create a Polynomial Object__
     * @param {?number[]} fac - number array - (index 2 = `<a₂>*x²`) - _default `[]`_
     * @param {?number} c - const that is the new `<a₀>*x^0` value for antiderivatives - _default `0`_
     * @return {Polynomial} Polynomial Object
     */
    constructor(fac=[],c=0){
        if(fac===String(fac)){fac=Polynomial.mkfromstr(fac).fac;}
        for(let i=0;i<fac.length;i++){if(!parseFloat(fac[i])){fac[i]=0;}}
        for(let i=fac.length-1;i>0;i--){if(fac[i]==0){fac.pop();}else{break;}}
        /** @type {number[]} - number array - (index 2 = `<a₂>*x²`) */
        this.fac=fac;
        /** @type {number} - const that is the new `<a₀>*x⁰` value for antiderivatives */
        this.c=c;
        /** @type {number} - Y-Axis-Interception */
        this.yIntercept=fac[0]||0;
        /** @type {number} - Degree of the Polynomial */
        this.degree=fac.length-1;
        /** @type {number} - Leading Coefficient of the Polynomial */
        this.leadingCoefficient=fac[fac.length-1];
        /**
         * @type {{left:number,right:number}} - End Behavior of the Polynomial
         * + rising `1`
         * + parallel `0`
         * + falling `-1`
         */
        this.endBehavior={
            left:0,
            right:0
        };
        (()=>{/* set endBehavior */
            if(this.leadingCoefficient>0){
                this.endBehavior.right=1;
                if(this.degree%2==1){this.endBehavior.left=-1;}
                else if(this.degree%2==0){this.endBehavior.left=1;}
            }else if(this.leadingCoefficient<0){
                this.endBehavior.right=-1;
                if(this.degree%2==1){this.endBehavior.left=1;}
                else if(this.degree%2==0){this.endBehavior.left=-1;}
            }
        }).call(this);
        /** @type {number[]} - all roots of the Polynomial _(that where found)_ */
        this.roots=[];
        /** @type {number[]} - the ups and downs of the Polynomial _(that where found)_ */
        this.localextremes=[];
        /** @type {number[]} - the slope-turning-points of the Polynomial _(that where found)_ */
        this.turnpoints=[];
    }
    /** 
     * _RegExp for testing a decimal-(float)-number-in-scientific-notation-string_
     * @example console.log(Polynomial.regexpFloatStr.test("-50.123E-3"));//=> true
     */
    static regexpFloatStr=/^(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
    /** 
     * _RegExp for testing a polynomial-in-general-form-string_
     * @example console.log(Polynomial.regexpPolynomialStr.test("x^3-x^2-x+1"));//=> true
     */
    static regexpPolynomialStr=/^(?:[+-]?(?:(?:(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)?\*?x(?:\^[0-9]+)?|(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?))+$/;
    /**
     * __calc Y-val__
     * @param {number} x - X-Value
     * @returns {number} Y-Value
     */
    calc(x){
        if(this.fac.length<=0){return x;}
        let erg=0;
        for(let i=0;i<this.fac.length;i++){erg+=this.fac[i]*Math.pow(x,i);}
        return erg;
    }
    /**
     * __calc integral__
     * @param {number} a - start of integral
     * @param {number} b - end of integral
     * @param {?number} dx - resolution _default `1e-10`_
     * @param {?boolean} abs - area absolute _default `true`_
     * @returns {number} the value of the area/integral
     */
    integral(a,b,dx=1e-10,abs=true){
        if(a>b){[a,b]=[b,a];}
        let val=0;
        if(abs){for(let i=a;i<=b;i+=dx){val+=Math.abs(this.calc(i)*dx);}}
        else{for(let i=a;i<=b;i+=dx){val+=this.calc(i)*dx;}}
        return val;
    }
    /**
     * __calc integral with antiderivative__
     * @param {number} a - start of integral
     * @param {number} b - end of integral
     * @param {?number} c - const that is the new `<a₀>*x⁰` value for the antiderivative - _default `0`_
     * @returns {number} the value of the area/integral
     */
    integralad(a,b,c=0){
        if(a>b){[a,b]=[b,a];}
        let F=Polynomial.mkantiderivative(this,c);
        return F.calc(b)-F.calc(a);
    }
    /**
     * __create antiderivative__
     * @param {Polynomial} f - Polynomial Object
     * @returns {Polynomial} Polynomial Object
     */
    static mkantiderivative(f){
        let newarr=[f.c];
        for(let i=0;i<f.fac.length;i++){newarr[i+1]=f.fac[i]/(i+1);}
        return new Polynomial(newarr);
    }
    /**
     * __create derivative of function and returns it__
     * @param {Polynomial} f - Polynomial Object
     * @returns {Polynomial} Polynomial Object
     */
    static mkderivative(f){
        let newarr=[];
        for(let i=1;i<f.fac.length;i++){newarr[i-1]=f.fac[i]*i;}
        return new Polynomial(newarr);
    }
    /**
     * __make function from string__
     * @param {string} str - graph-function-string in format
     * @returns {Polynomial} Polynomial Object
     * @description Format:
     * + `+a*x^n` / `-ax^n` / `a * x` / `- a` + `; c=0`
     * + a = `Float`
     * + n = Positive `Integer`
     */
    static mkfromstr(str){
        if(!str){return new Polynomial();}
        str=str.toString();
        str=str.replace(/\s+/g,'');
        let test=str.split(';');
        const fnum="(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?";
        const rg=RegExp(`(?:[+-]?(?:(?:${fnum})?\\*?x(?:\\^[0-9]+)?|${fnum}))+`);
        const r=RegExp(`([+-])?(?:(${fnum})?\\*?(x)(?:\\^([0-9]+))?|(${fnum}))`,'g');
        const rc=RegExp(`^[cC]=(${fnum})$`);
        let f=[];
        let c=0;
        if(test[1]){if(rc.test(test[1])){c=rc.exec(test[1])[1];}}
        if(!rg.test(test[0])){return new Polynomial(f,c);}
        let ms = test[0].matchAll(r);
        for(const m of ms){
            if(m[0].length>0){
                f[(m[3]?(m[4]?parseInt(m[4]):1):0)]=parseFloat(
                    (m[1]?m[1]:'+')+
                    (m[5]?m[5]:(m[2]?m[2]:(m[3]?'1':'0')))
                );
            }
        }
        return new Polynomial(f,c);
    }
    /**
     * __outputs formated string from current Polynomial Object__
     * @param {?boolean} full - prints all details _default `false`_
     * @returns {string} formated string
     */
    tostr(full=false){
        let str='';
        if(full){
            for(let i=this.fac.length-1;i>=0;i--){
                if(i<this.fac.length-1){str+=' ';}
                if(this.fac[i]>=0){str+='+';}
                str+=`${this.fac[i]}x^${i}`;
            }
        }else{
            for(let i=this.fac.length-1;i>=0;i--){
                if(!!this.fac[i]){
                    if(this.fac[i]>=0&&i<this.fac.length-1){str+='+';}
                    else if(this.fac[i]==-1){str+='-';}
                    if(this.fac[i]==1||this.fac[i]==-1){str+=(i==0?'1':'x');}
                    else{str+=this.fac[i]+(i==0?'':'x');}
                    if(i>1){str+='^'+i;}
                }
            }
        }
        if(str.length==0){return null;}
        if(full&&this.c!=undefined){str+=` ; c = ${this.c}`;}
        else if(this.c){str+=`;c=${this.c}`;}
        return str;
    }
    /**
     * __make function from roots__
     * @param {number[]} roots - (x-n1)(x-n2) -> `[n1,n2]`
     * @param {number} intensity - a*(x-n1) -> `a` - _default `1`_
     * @param {number} c - const that is the new `<a₀>*x⁰` value for the antiderivative - _default `0`_
     * @returns {Polynomial} Polynomial Object
     */
    static mkfromroots(roots,intensity=1,c=0){
        if(intensity==0){return new Polynomial([0],c);}
        if(!roots||roots.length==0){return new Polynomial([],c);}
        if(roots.length>10){roots=roots.slice(0,9);}/* max 26 */
        /**
         * __makes unique multiplikation pairs and return them as string array__
         * @param {number[]|string[]} set - the numbers
         * @param {number} n - pair-length
         * @returns {string[]} unique-multiplication-pairs
         * @example console.log(uniMulPairs("abcd".split(''),2));//=>[ 'ab', 'ac', 'ad', 'bc', 'bd', 'cd' ]
         */
        const uniMulPairs=function(set,n){
            const mkMPArrRec=function(set,prefix,len,n,arr){
                if(n==0){
                    if(!(
                        arr.some((_v,_i,_a)=>{return RegExp(`^[${_v}]{${_v.length}}$`).test(prefix);})||/* no 'ab' when already 'ba' */
                        prefix.split('').some((_v,_i,_a)=>{return _a.lastIndexOf(_v)!=_i;})/* no 'aaa','aab',~ */
                    )){arr.push(prefix);}
                    return;
                }
                for(let i=0;i<len;i++){
                    let newPrefix=prefix+set[i];
                    mkMPArrRec(set,newPrefix,len,n-1,arr);
                }
            };
            let _a=[];
            mkMPArrRec(set,'',set.length,n,_a);
            return (_a);
        };
        let f=[];
        const degree=roots.length;
        let str='',pallet='',_tmp=1,_tmp2=0;
        for(let i=0;i<degree&&i<26;i++){str+=String.fromCharCode(i+96+1);}
        for(let i=degree;i>=0;i--){
            // x^i [degree->0]
            _tmp=1;
            _tmp2=0;
            if(i==degree){f[degree]=intensity;}
            else if(i==0){
                roots.forEach((v,i,a)=>{_tmp*=-v;});
                f[0]=_tmp*intensity;
            }else{
                pallet=uniMulPairs(str,degree-i);
                for(let _i=0;_i<pallet.length;_i++){
                    _tmp=1;
                    for(let _j=0;_j<pallet[_i].length;_j++){_tmp*=-roots[pallet[_i].charCodeAt(_j)-96-1];}
                    _tmp2+=_tmp;
                }
                f[i]=_tmp2*intensity;
            }
        }
        let __t=new Polynomial(f,c);
        __t.roots=roots.sort((a,b)=>{return a-b;});
        return __t;
    }
    // TODO add more methods
    rootNewton(firstguess=1,_max=100){
        let fc=Polynomial.mkderivative(this);
        let xn=firstguess;
        for(let i=0;i<_max;i++){
            if(fc.calc(xn!=0)){xn=xn-(this.calc(xn)/fc.calc(xn));}
            else{xn*=1.1;}
            // TODO
        }
        return fc.tostr();
    }
}
// console.log(Polynomial.mkfromstr("x^3-x^2-x+1").tostr());//=> x^3-x^2-x+1

// let f=new Polynomial([1,2,3]);
// let erg=f.rootNewton();
// console.log(f.tostr(),erg);

console.log([-1,0,1,0],Polynomial.mkfromroots([-1,0,1,0],1).tostr());