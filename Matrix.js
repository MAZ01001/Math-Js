class Matrix{
    /**
     * @param {number[][]} list - matrix - _default `[[]]`_
     * @param {boolean} cp - if `true` makes a copy of the array without altering the original array - _default `true`_
     * @throws {TypeError} - if invalid values are found
     * @description
     * > valid matrices can be:
     * >
     * >     [ // 3 x 3
     * >       [1.1 , 1.2 , 1.3],
     * >       [2.1 , 2.2 , 2.3],
     * >       [3.1 , 3.2 , 3.3]
     * >     ];
     * >     [ // 3 x 1
     * >         [1.1],
     * >         [2.1],
     * >         [3.1]
     * >     ];
     * >     [ // 1 x 3
     * >         [1.1, 1.2, 1.3]
     * >     ];
     * >     [ [1.1] ]; // 1 x 1
     * >     [ [] ]; // 0 x 0
     * >
     */
    constructor(list=[[]],cp=true){
        if(!Array.isArray(list)){throw TypeError("list is not an array. expected [[<Number>,..],..].");}
        list.forEach((v,i,a)=>{
            if(!Array.isArray(v)){throw TypeError("not every entry, in list, is an array. expected [[<Number>,..],..].");}
            if(v.length!=a[0].length){throw TypeError("not every array, in list, has the same length. expected [[<Number>,..],..].");}
            if(v.some(v_=>Number.isNaN(Number(v_)))){throw TypeError("not every value, in every array, in list, is a valid number. expected [[<Number>,..],..].");}
        });
        if(cp){this.list=list.map(v=>v.map(v_=>Number(v_)));}
        else{
            list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a[i][i_]=Number(v_);})});
            this.list=list;
        }
        if(this.list[0].length==0&&this.list.length==1){this.rows=0}
        else{this.rows=this.list.length;}
        /** @type {number[][]} __the matrix as array__ */
        this.list;
        /** @type {number} __number of rows in the matrix__ */
        this.rows;
        /** @type {number} __number of columns in the matrix__ */
        this.cols=this.list[0].length;
        /** @type {boolean} __true if the matrix is square__ _(cols==rows)_ */
        this.square=this.cols==this.rows;
        /** @type {boolean} __true if the matrix is symmetrical__ _(m[i,j]==m[j,i])_ */
        this.symmetric=(this.square&&!this.list.some((v,i,a)=>{
            let t=true;
            for(let j=0;j<i;j++){t=(a[i][j]==a[j][i]?t:false);}
            return !t;
        }));
    }
    /**
     * __copies current matrix__
     * @returns {Matrix} the copy of the matrix
     */
    mkCopy(){return new Matrix(this.list,true);}
    /**
     * __format the matrix to a human readable string__
     * @param {boolean} a_t_ - if `true` format as ascii-table, if `false` as space-separated list - _default `false`_
     * @param {number} n_p_ - max numbers after decimal point for printing - `0-20` - _default `4`_
     * @returns {string} the formated string
     */
    tostr(a_t_=false,n_p_=4){
        if(this.list.length==0){return "++\n||\n++";}
        n_p_=Math.abs(n_p_);
        if(n_p_>20){n_p_=20;}
        const print=this.list.map((v,i,a)=>{return v.map((v_,i_,a_)=>{
            if(RegExp(`\\.[0-9]{${n_p_+1}}`).test(v_.toString())){
                if(v_>1e9){return Number(v_.toFixed(n_p_)).toExponential(n_p_);}
                else{return v_.toFixed(n_p_);}
            }else if(v_>1e9){return v_.toExponential(n_p_);}
            else{return v_.toString();}
        });});
        const colwidth=Math.max(...print.map(v=>Math.max(...v.map(v_=>v_.length))));
        if(a_t_){
            const rowseparator=((l_,w_) => {
                const r_='+--'.padEnd(w_+3,'-');
                let s_='';
                for(let i=0;i<l_;i++){s_+=r_;}
                return `${s_}+\n`;
            })(print[0].length,colwidth);
            return (
                print.map(v=>(
                    rowseparator
                    +v.map(v_=>`| ${v_.padStart(colwidth,' ')} `).join('')
                    +'|\n'
                )).join('')
                +rowseparator
            );
        }else{return (print.map(v=>(v.map(v_=>v_.padStart(colwidth,' ')).join(' '))).join('\n'));}
    }
    /**
     * __makes an identity matrix and returns it _as Matrix object___
     * @param {number} size - size of the identity matrix
     * @returns {Matrix} the identity matrix as Matrix object
     * @example
     * Matrix.mkIdentityMatrix(3).list;
     * [
     *     [1, 0, 0],
     *     [0, 1, 0],
     *     [0, 0, 1]
     * ];
     */
    static mkIdentityMatrix(size=0){
        if(size==0){return new Matrix();}
        if(size==1){return new Matrix([[1]],false);}
        let nm=[];
        for(let i=0;i<size;i++){
            nm[i]=[];
            for(let j=0;j<size;j++){
                nm[i][j]=(i==j?1:0);
            }
        }
        try{return new Matrix(nm,false);}
        catch(err){throw Error("failed to make identity matrix: "+err);}
    }
    /**
     * __create matrix from formatted string__
     * @param {string} str - formatted string
     * @returns {Matrix} the new matrix that was created
     * @throws {SyntaxError|Error} if string is not in correct format or invalid values show up
     * @example
     * Matrix.mkFromStr("1 -2 3\n4 5 +6\n7 82e-1 9").list;
     * [
     *     [1,  -2, 3],
     *     [4,   5, 6],
     *     [7, 8.2, 9]
     * ];
     */
    static mkFromStr(str=''){
        if(/^[\x0a\x20]*$/.test(str)){return new Matrix();}
        const fnum="(?:[+-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?|[+-]?Infinity)";
        const rma=RegExp(`^(?:${fnum}\\x20)*${fnum}(?:\\x0a(?:${fnum}\\x20)*${fnum})*$`);
        str=str.replace(/\x20\x20+/g,' ').replace(/\x0a(\x20*\x0a)*/g,'\n');
        if(!rma.test(str)){throw SyntaxError("string is not properly formatted.")}
        try{return new Matrix(str.split('\n').map(v=>v.split(' ').map(v_=>Number(v_))),false);}
        catch(err){throw Error("failed to make matrix from string: "+err);}
    }
    /**
     * __create a matrix from length and fill it with same number__
     * @param {number} rows - number of rows to create
     * @param {number} cols - number of columns to create
     * @param {number} n - number to fill in every cell
     * @returns {Matrix} the new matrix that was created
     * @throws {RangeError|TypeError|Error} if size is not finite, `n` is `NaN` or matrix could not be created
     * @example
     * Matrix.mkFromLength(2,3,4).list;
     * [
     *     [4, 4, 4],
     *     [4, 4, 4]
     * ];
     */
    static mkFromLength(rows=0,cols=0,n=1){
        if(
            !Number.isFinite(rows)
            ||!Number.isFinite(cols)
        ){throw RangeError("can not make matrix with infinite size.");}
        if(Number.isNaN(Number(n))){throw TypeError("n is not a valid number.");}
        if(rows==0||cols==0){return new Matrix();}
        rows=Math.abs(rows);
        cols=Math.abs(cols);
        let mn=[];
        for(let i=0;i<rows;i++){
            mn[i]=[];
            for(let j=0;j<cols;j++){mn[i][j]=n;}
        }
        try{return new Matrix(mn,false);}
        catch(err){throw Error("failed to create matrix from length: "+err);}
    }
    /**
     * __returns value at row/col-coordinates *(one-based)*__
     * @param {number} i_row - one-based index for cell-row
     * @param {number} j_col - one-based index for cell-column
     * @returns {Matrix} `this` matrix after successful division
     * @throws {RangeError} if numbers are below `1`, over row/col-count
     */
    getCell(i_row=1,j_col=1){
        i_row=Number(i_row);
        j_col=Number(j_col);
        if(Number.isNaN(i_row)||i_row<1||i_row>this.rows){throw RangeError("row-value out of bounds.");}
        if(Number.isNaN(j_col)||j_col<1||j_col>this.cols){throw RangeError("col-value out of bounds.");}
        return this.list[i_row-1][j_col-1];
    }
    /**
     * __checks if the current matrix only consists of finite numbers__
     * @returns {boolean} `true` if every number is finite
     */
    isFinite(){return !this.list.some(v=>v.some(v_=>!Number.isFinite(v_)));}
    /**
     * __checks if the current matrix only consists of `0`__
     * @returns {boolean} `true` if every number is `0`
     */
    isZero(){return !this.list.some(v=>v.some(v_=>v_!=0));}
    /**
     * __checks if the current matrix only consists of `1`__
     * @returns {boolean} `true` if every number is `1`
     */
    isOne(){return !this.list.some(v=>v.some(v_=>v_!=1));}
    /**
     * __checks if the current matrix only consists of `1` and `0`__
     * @returns {boolean} `true` if every number is either `1` or `0`
     */
    isBin(){return !this.list.some(v=>v.some(v_=>v_!=1&&v_!=0));}
    /**
     * __compares two matrices if their equal in size/value__
     * @param {Matrix} m2 - other matrix for comparison
     * @returns {boolean} `true` if matrices have the same numbers/dimensions
     * @throws {TypeError} if `m2` is not a matrix
     */
    isEq_m(m2=null){
        if(m2==null||!(m2 instanceof Matrix)){throw TypeError("parsed value is not of type Matrix.");}
        return (this.rows==m2.rows&&this.cols==m2.cols&&!this.list.some((v,i,a)=>v.some((v_,i_,a_)=>v_!=m2.list[i][i_])));
    }
    /**
     * __checks if the current matrix has given value in every cell__
     * @param {number} n - number for checking
     * @returns {boolean} `true` if the matrix has this number in every cell
     * @throws {RangeError} if `n` is `NaN`
     */
    isEq_n(n=1){
        n=Number(n);
        if(Number.isNaN(n)){throw RangeError("parsed value is not a number.");}
        return !this.list.some(v=>v.some(v_=>v_!=n));
    }
    /**
     * __transposes the current matrix__
     * @returns {Matrix} `this` matrix after transposition
     * @example
     * [
     *     [1, 2],
     *     [3, 4],
     *     [5, 6]
     * ];
     * [
     *     [1, 3, 5],
     *     [2, 4, 6]
     * ];
     */
    transpose(){
        if(this.symmetric){return this;}
        if(this.square){for(let i=this.rows-1;i>0;i--){for(let j=i-1;j>=0;j--){[this.list[i][j],this.list[j][i]]=[this.list[j][i],this.list[i][j]];}}}
        else{
            for(let i=this.rows-1;i>0;i--){
                for(let j=i-1;j>=0;j--){
                    [this.list[i][j],this.list[j][i]]=[this.list[j][i],this.list[i][j]];
                    if(this.list[j][i]==undefined){this.list[j].splice(i,1);}
                    if(this.list[i][j]==undefined){this.list[i].splice(j,1);}
                }
                if(this.list[i].length==0){this.list.splice(i,1);}
            }
        }
        return this;
    }
    /**
     * __add a number to the current matrix__
     * @param {number} n - number for addition
     * @returns `this` matrix after successful addition
     * @throws {RangeError|Error} if `n` is `NaN`, matrix is not square or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    add_n(n=0){
        if(n==0){return this;}
        n=Number(n);
        if(Number.isNaN(n)){throw RangeError("parsed value is not a number.");}
        if(!this.square){throw Error("matrix is not square.");}
        try{return this.add_m(Matrix.mkIdentityMatrix(this.rows).mul_n(n));}
        catch(err){throw Error("failed to add number to matrix: "+err);}
    }
    /**
     * __subtract a number from the current matrix__
     * @param {number} n - number for subtraction
     * @returns `this` matrix after successful subtraction
     * @throws {Error} if `n` is `NaN`, matrix is not square or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    sub_n(n=0){
        try{return this.add_n(-n)}
        catch(err){throw Error("failed to subtract number from matrix: "+err);}
    }
    /**
     * __multiplies a number to the current matrix__
     * @param {number} n - number for multiplication
     * @returns {Matrix} `this` matrix after successful multiplication
     * @throws {RangeError} if `n` is `NaN` or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    mul_n(n=1){
        n=Number(n);
        if(Number.isNaN(n)){throw RangeError("parsed value is not a number.");}
        let t=this.list.map(v=>v.map(v_=>v_*n));
        if(t.some(v=>v.some(v_=>Number.isNaN(v_)))){throw RangeError("matrix numbers are not valid anymore.");}
        this.list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a_[i_]=t[i][i_];});});
        return this;
    }
    /**
     * __divides a number from the current matrix__
     * @param {number} n - number for division
     * @returns {Matrix} `this` matrix after successful division
     * @throws {RangeError|Error} if `n` is `NaN` or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    div_n(n=1){
        n=Number(n);
        if(Number.isNaN(n)){throw RangeError("parsed value is not a number.");}
        let t=this.list.map(v=>v.map(v_=>v_/n));
        if(t.some(v=>v.some(v_=>Number.isNaN(v_)))){throw RangeError("matrix numbers are not valid anymore.");}
        this.list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a_[i_]=t[i][i_];});});
        return this;
    }
    /**
     * __adds anoter matrix to the current__
     * @param {Matrix} m2 - second matrix for addition
     * @returns {Matrix} `this` matrix after successful addition
     * @throws {TypeError|RangeError} if `m2` is not a matrix, matrices are not the same size or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    add_m(m2=null){
        if(m2==null||!(m2 instanceof Matrix)){throw TypeError("parsed value is not of type Matrix.");}
        if(!(this.rows==m2.rows&&this.cols==m2.cols)){throw RangeError("Matrices are not the same size.");}
        let t=this.list.map((v,i,a)=>v.map((v_,i_,a_)=>v_+m2[i][i_]));
        if(t.some(v=>v.some(v_=>Number.isNaN(v_)))){throw RangeError("matrix values not valid anymore.");}
        this.list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a_[i_]=t[i][i_];});});
        return this;
    }
    /**
     * __subtracts anoter matrix from the current__
     * @param {Matrix} m2 - second matrix for subtraction
     * @returns {Matrix} `this` matrix after successful subtraction
     * @throws {RangeError|Error} if `m2` is not a matrix, matrices are not the same size or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    sub_m(m2=null){
        if(m2==null||!(m2 instanceof Matrix)){throw TypeError("parsed value is not of type Matrix.");}
        if(!(this.rows==m2.rows&&this.cols==m2.cols)){throw RangeError("Matrices are not the same size.");}
        try{return this.add_m(m2.mkCopy().mul_n(-1));}
        catch(err){throw Error("failed to subtract matrix from matrix: "+err);}
    }
    /**
     * __multiplies the current matrix with another matrix__
     * @param {Matrix} m2 - second matrix for multiplication
     * @param {boolean} flip - if `true` flips the sites of the multiplication from `A*B` to `B*A` because order matters
     * @returns {Matrix} `this` matrix
     * @throws {TypeError|RangeError} if `m2` is not a matrix, rows do not match cols or invalid numbers show up
     * @description
     * __number of rows of the first matrix in the multiplication must equal the number of columns of the second__
     * 
     * _matrix will only change if successful_
     */
    mul_m(m2=null,flip=false){
        if(m2==null||!(m2 instanceof Matrix)){throw TypeError("parsed value is not of type Matrix.");}
        if(flip){if(m2.cols!=this.rows){throw RangeError("number of columns of the parsed matrix does not match the number of rows of the current.");}}
        else{if(this.cols!=m2.rows){throw RangeError("number of rows of the parsed matrix does not match the number of columns of the current.");}}
        let mn=[];
        if(flip){
            for(let i=0;i<m2.rows;i++){
                mn[i]=[];
                for(let j=0;j<this.cols;j++){
                    mn[i][j]=0;
                    for(let n=0;n<m2.cols;n++){
                        mn[i][j]+=(m2.list[i][n]*this.list[n][j]);
                        if(Number.isNaN(mn[i][j])){throw RangeError("matrix values not valid anymore.");}
                    }
                }
            }
        }else{
            for(let i=0;i<this.rows;i++){
                mn[i]=[];
                for(let j=0;j<m2.cols;j++){
                    mn[i][j]=0;
                    for(let n=0;n<this.cols;n++){
                        mn[i][j]+=(this.list[i][n]*m2.list[n][j]);
                        if(Number.isNaN(mn[i][j])){throw RangeError("matrix values not valid anymore.");}
                    }
                }
            }
        }
        this.list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a_[i_]=mn[i][i_];})});
        return this;
    }
    /**
     * __inverts the current matrix with Bareiss algorithm__
     * @returns {Matrix} `this` matix after successful inversion
     * @throws {Error} if matrix is not square, invertible or invalid values show up
     * @description _matrix will only change if successful_
     */
    inv_m_GB(){
        if(!this.square){throw Error("matrix is not square.");}
        let mc=this.list.map(v=>v.map(v_=>v_));
        mc.forEach((v,i,a)=>{for(let j=this.cols;j<this.cols*2;j++){a[i][j]=(j==this.cols+i)?1:0;}});
        for(let n=0,p=1;n<this.rows;n++){
            for(let i=this.rows-1;i>=0;i--){
                if(i==n){continue;}
                for(let j=(this.cols*2)-1;j>=0;j--){
                    mc[i][j]=((
                        (mc[n][n]*mc[i][j])
                        -(mc[i][n]*mc[n][j])
                    )/p);
                }
            }
            p=mc[n][n];
            if(mc.some((v,i,a)=>(v.filter((v_,i_,a_)=>(i_<this.cols&&v_==0),this).length==this.cols),this)){throw Error("matrix is not invertible.");}
        }
        const n=mc[0][0];
        mc.forEach((v,i,a)=>{v.splice(0,this.cols);},this);
        mc.forEach((v,i,a)=>{
            a[i].forEach((v_,i_,a_)=>{
                a_[i_]/=n;
                if(Number.isNaN(a_[i_])){throw RangeError("matrix values not valid anymore.");}
            });
        });
        this.list.forEach((v,i,a)=>{a[i].forEach((v_,i_,a_)=>{a_[i_]=mc[i][i_];});});
        return this;
    }
    /**
     * __divide the current matrix by another matrix__
     * @param {Matrix} m2 - denominator matrix - `(B^-1)`
     * @param {boolean} flip - if `true` flips the multiplication in `A*(B^-1)` to `(B^-1)*A` - _(`A/B` to `B\A`)_
     * @returns {Matrix} `this` matrix after successful division
     * @throws {TypeError|Error} if `m2` is not a matrix, not invertible, wrong number of cols/rows or invalid numbers show up
     * @description _matrix will only change if successful_
     */
    div_m(m2=null,flip=false){
        if(m2==null||!(m2 instanceof Matrix)){throw TypeError("parsed value is not of type Matrix.");}
        try{return this.mul_m(m2.mkCopy().inv_m_GB(),flip);}
        catch(err){throw Error("matrix-matrix division failed: "+err);}
    }
    // TODO ###################################################
    // row_add_row(){}
    // row_sub_row(){}
    // row_mul_n(){}
    // row_switch(){}
    // row_del(){}
    // col_del(){}
    // TODO ###################################################
    //~ https://en.wikipedia.org/wiki/Division_(mathematics)#Of_matrices
    //~ https://en.wikipedia.org/wiki/Gaussian_elimination
    //~ https://en.wikipedia.org/wiki/Matrix_(mathematics)
    //~ https://matrixcalc.org/en/ "Gauß-Jordan"
};
// const {performance} = require('perf_hooks');
// const t1=performance.now();
// const t2=performance.now()-t1;
let m1=new Matrix([[2,2,3],[4,5,6],[7,8,9]],false);
// let m2=new Matrix([[10],[11],[12]],false);
// let m3=new Matrix([[10,11,12]],false);
try{
    console.log(
        "%s",
        m1  .inv_m_GB()
            .tostr(true,5)
    );
}catch(err){console.error(err);}
