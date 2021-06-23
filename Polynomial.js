/**
 * __class for a Polynomial__
 * @theory [Wikipedia (Polynomial)](https://en.wikipedia.org/wiki/Polynomial)
 * @example
 * let  f = Polynomial.mkfromstr("x^3 -3*x + 5");
 * console.log(f.fac);//=> [ 5, -3, 0, 1 ]
 * console.log(f.tostr());//=> x^3-3x+5
 * console.log(f.tostr(true));//=> +1x^3 +0x^2 -3x^1 +5x^0
 * console.log(f.calc(0));//=> 5
 * f = Polynomial.mkfromstr("x^3-x");
 * console.log(f.findRoots());//=>[ -1, 0, 1 ] (because of float precision, it's weak and often doesn't find roots)
 * @author MAZ [GitHub](https://github.com/MAZ01001)
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
     * @param {?number} dx - resolution _default `Number.EPSILON`_
     * @param {?boolean} abs - area absolute _default `true`_
     * @returns {number} the value of the area/integral
     */
    integral(a,b,dx=Number.EPSILON,abs=true){
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
     * @param {boolean} roots - if string is in root-format - _default `false`_
     * @returns {Polynomial} Polynomial Object
     * @description __Format__:
     * + __normal__
     * ++ `+a*x^n` / `-ax^n` / `a * x` / `- a` + `; c=0`
     * ++ a,c = `Float`
     * ++ n = Positive `Integer`
     * + __root__
     * ++ `n(x + a) *(a-b)( x )` + `; c=0`
     * ++ a,n,c = `Float`
     */
    static mkfromstr(str,roots=false){
        if(!str){return new Polynomial();}
        str=str.toString();
        str=str.replace(/\s+/g,'');
        let test=str.split(';');
        const fnum="(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?";
        const rc=RegExp(`^[cC]=(${fnum})$`);
        if(roots){
            const rra=RegExp(`^([+-]?${fnum})?((?:\\*?\\([xX](?:[+-]${fnum})?\\))+)$`),
                rrb=RegExp(`(?:\\*?\\(([xX])([+-]${fnum})?\\))`,'g');
            let _c=0;
            if(test[1]){if(rc.test(test[1])){_c=parseFloat(rc.exec(test[1])[1])||0;}}
            let _t=parseFloat(rra.exec(test[0])[1])||1;
            let ms=rra.exec(test[0])[2].matchAll(rrb),_a=[];
            for(const m of ms){_a.push(parseFloat(m[2])||0);}
            return Polynomial.mkfromroots(_a,_t,_c);
        }
        const rg=RegExp(`(?:[+-]?(?:(?:${fnum})?\\*?x(?:\\^[0-9]+)?|${fnum}))+`);
        const r=RegExp(`([+-])?(?:(${fnum})?\\*?(x)(?:\\^([0-9]+))?|(${fnum}))`,'g');
        let f=[],c=0;
        if(test[1]){if(rc.test(test[1])){c=rc.exec(test[1])[1];}}
        if(!rg.test(test[0])){return new Polynomial(f,c);}
        let ms=test[0].matchAll(r);
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
        if(roots.length>26){roots=roots.slice(0,25);}/* max 26 since pallet uses alphabet but in theory could use all ascii*/
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
    /**
     * __attemps to find all possible roots of this polynomial__
     * @param {number} trysarrabs - integer for -n to n array for integer guesses for newton
     * @throws Error if polynomial devision fails on a given root (float precision errors)
     * @returns `this.roots` or `null` if not "all"(degree) are found (dificult because float precision)
     */
    findRoots(trysarrabs=50){
        if(this.fac.length-1==this.roots.length){this.roots.sort((a,b)=>a-b);return this.roots;}
        const calcy=function(fac,x){
            if(fac.length<=0){return x;}
            if(x==0){return fac[0];}
            let erg=0;
            for(let i=0;i<fac.length;i++){erg+=fac[i]*Math.pow(x,i);}
            return erg;
        },check=function(leftfac,root,symetry){
            if(root!=null&&calcy(leftfac,root)==0){
                this.roots.push(root);
                if(!polydev(leftfac,root)){throw new Error(`couldn't divide (X-(${root})) from ${JSON.stringify(leftfac)} - allready found ${this.roots}`);}
            }
            if(leftfac.length<4){/* TODO */
                if(leftfac.length==5){d4(leftfac).forEach((v,i,a)=>{this.roots.push(v);},this);}
                else if(leftfac.length==4){d3(leftfac).forEach((v,i,a)=>{this.roots.push(v);},this);}
                else if(leftfac.length==3){d2(leftfac).forEach((v,i,a)=>{this.roots.push(v);},this);}
                else if(leftfac.length==2){this.roots.push(d1(leftfac));}
                return true;
            }
            if(root!=null&&symetry==2){if(calcy(leftfac,-root)==0){
                this.roots.push(-root);
                if(!polydev(leftfac,-root)){throw new Error(`couldn't divide (X-(${root})) from ${JSON.stringify(leftfac)} - allready found ${this.roots}`);}
            }}
            if(leftfac.length<4){
                if(leftfac.length==3){d2(leftfac).forEach((v,i,a)=>{this.roots.push(v);},this);}
                else if(leftfac.length==2){this.roots.push(d1(leftfac));}
                return true;
            }
            return false;
        },rootNewton=function(firstguess=1,_max=100,nodge=1.2){
            let fc=Polynomial.mkderivative(this);
            let xn=firstguess,last1,last2;
            for(let i=0;i<_max;i++){
                if(fc.calc(xn)!=0){xn=xn-(this.calc(xn)/fc.calc(xn));}
                else{xn*=nodge;}
                if(this.calc(xn)==0){break;}
                if(last2!=undefined&&xn==last2){break;}
                last2=last1;
                last1=xn;
            }
            return xn;
        },polydev=function(fac=[],root=0){
            if(root==0){fac.shift();return true;}
            let newfac=[];
            newfac[fac.length-2]=fac[fac.length-1];
            for(let i=fac.length-2;i>0;i--){newfac[i-1]=fac[i]-(newfac[i]*-root);}
            if(fac[0]==newfac[0]*-root){
                fac.forEach((v,i,a)=>{
                    if(newfac[i]!=undefined){a[i]=newfac[i];}
                    else{a.splice(i,1);}
                });
                return true;
            }
            return false;
        },issymetry=function(fac){
            let a=true,b=true;
            fac.forEach((v,i,a)=>{
                if(v!=0){
                    if(i%2==0){b=false;}
                    else{a=false;}
                }
            });
            if(a){return 2;}/* only even -> mirror on Yaxis */
            else if(b){return 1;}/* only uneven -> same if +180degrees turned */
            else{return 0;}/* no symetry (that i know of) */
        },d4=function(fac){
            // TODO https://en.wikipedia.org/wiki/Quartic_function#General_formula_for_roots
        },d3=function(fac){
            // TODO https://math.vanderbilt.edu/schectex/courses/cubic/
        },d2=function(fac){
            let _sqr=Math.sqrt((fac[1]*fac[1])-(4*fac[2]*fac[0])),
                _2=(2*fac[2]);
            return [
                (-fac[1]+_sqr)/_2,
                (-fac[1]-_sqr)/_2
            ];
        },d1=function(fac){return -fac[0]/fac[1];};
        let leftfac=this.fac.slice(0),
            symetry=issymetry(this.fac),
            trys=[],trysn=0;
        for(let i=-trysarrabs;i<=trysarrabs;i++){trys.push(i);}
        if(symetry==1&&this.yIntercept==0){symetry=2;}// symetry==2 -> if n is a root than -n is also a root
        if(leftfac.length-1>this.fac.length-1-this.roots){this.roots.forEach((v,i,a)=>{if(check.call(this,leftfac,v,symetry)){return;}});}
        if(this.yIntercept==0){if(check.call(this,leftfac,0,symetry)){this.roots.sort((a,b)=>a-b);return this.roots;}}
        if(check.call(this,leftfac,null,symetry)){this.roots.sort((a,b)=>a-b);return this.roots;}
        let newtonlast=rootNewton.call(this,trys[trysn++]);
        while(trysn<=trys.length){
            if(calcy(leftfac,newtonlast)==0){
                if(check.call(this,leftfac,newtonlast,symetry,true)){this.roots.sort((a,b)=>a-b);return this.roots;}
                trysn=0;
                newtonlast=rootNewton.call(this,trys[trysn]);
            }else{if(trysn<trys.length){newtonlast=rootNewton.call(this,trys[trysn]);}}
            trysn++;
        }
        if(check.call(this,leftfac,null,symetry)){this.roots.sort((a,b)=>a-b);return this.roots;}
        return null;
    }
    // TODO add more methods ~ update older ones
}
// console.log(Polynomial.mkfromstr("x^3-x^2-x+1").tostr());//=> x^3-x^2-x+1
// console.log(Polynomial.mkfromstr("(x-1)(x+1)(x)",true).tostr());//=> x^3-x
// let f=new Polynomial(Polynomial.mkfromroots([1,2,3,4],5).fac);
// console.log('\n3)\t%O\t%s%O',f.tostr(),f.findRoots()==null?"only found "+f.roots.length+" out of possible "+f.degree+" : ":"found all "+f.degree+" possible roots: ",f.roots);
/*
! js-float precision error !
7.000000000000121 [-210.00000000000068,107.00000000000014,-18.00000000000001,1]
7 [-210,107,-18,1]
// let f=new Polynomial(Polynomial.mkfromroots([Math.PI,5,6,7]).fac);
// console.log('\n2)\t%O\t%s%O',f.tostr(),f.findRoots()==null?"only found "+f.roots.length+" out of possible "+f.degree+" : ":"found all "+f.degree+" possible roots: ",f.roots);
*/
