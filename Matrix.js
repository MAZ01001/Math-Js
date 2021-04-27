class Matrix{
    /**
     * @param {number[][]} list - matrix
     * @description
     * > _if input is invalid a 0x0 matrix will be created_
     * > 
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
     */
    constructor(list=[[]]){
        if(
            list.length==0
            ||list.some((v,i,a)=>{
                if(!Array.isArray(v)){return true;}
                if(v.length!=a[0].length){return true;}
                if(v.some((v_,i_,a_)=>{if(!Number.isFinite(v_)){return true;}})){return true;}
            })
        ){this.list=[[]];}
        else{this.list=list;}
        if(
            this.list[0].length==0 &&
            this.list.length==1
        ){this.rows=0}
        else{this.rows=this.list.length;}
        /** @type {number[][]} __the matrix as array__ */
        this.list;
        /** @type {number} __number of rows in the matrix__ */
        this.rows;
        /** @type {number} __number of columns in the matrix__ */
        this.cols=this.list[0].length;
        /** @type {boolean} __true if the matrix is square__ _(cols==rows)_ */
        this.square=this.cols==this.rows;
    }
    /**
     * __format the matrix to a human readable string__
     * @param {boolean} a_t_ - if `true` format as ascii-table, if `false` as space-separated list - _default `false`_
     * @returns {string} the formated string
     */
    tostr(a_t_=false){
        if(this.list.length==0){return "++\n||\n++";}
        const colwidth=Math.max(...this.list.map((v,i,a)=>{return Math.max(...v);})).toString().length;
        if(a_t_){
            const rowseparator=((l_,w_) => {
                const r_='+--'.padEnd(w_+3,'-');
                let s_='';
                for(let i=0;i<l_;i++){s_+=r_;}
                return `${s_}+\n`;
            })(this.list[0].length,colwidth);
            return (
                this.list.map((v,i,a)=>{return (
                    rowseparator
                    +v.map((v_,i_,a_)=>{return `| ${v_.toString().padStart(colwidth,' ')} `;}).join('')
                    +'|\n'
                );}).join('')
                +rowseparator
            );
        }else{
            return (
                this.list.map((v,i,a)=>{return (
                    v.map((v_,i_,a_)=>{return v_.toString().padStart(colwidth,' ');}).join(' ')
                );}).join('\n')
            );
        }
    }
    /**
     * __makes an identity matrix and returns it _as Matrix object___
     * @param {number} size - size of the identity matrix
     * @returns {Matrix} the identity matrix as Matrix object
     * @example 
     *  Matrix.mkIdentityMatrix(3).tostr();
     *  // 1 0 0
     *  // 0 1 0
     *  // 0 0 1
     */
    static mkIdentityMatrix(size=0){
        if(size==0){return new Matrix([[]]);}
        if(size==1){return new Matrix([[1]]);}
        let nm=[];
        for(let i=0;i<size;i++){
            nm[i]=[];
            for(let j=0;j<size;j++){
                nm[i][j]=(i==j?1:0);
            }
        }
        return new Matrix(nm);
    }
    // TODO
    static mkFromStr(str=''){
        if(/^\s*$/.test(str)){return new Matrix();}
        const rma=/^(?:[+-]?[0-9]+\s)+[+-]?[0-9]+(?:\n(?:[+-]?[0-9]+\s)+[+-]?[0-9]+)?$/,
            rmr=/\s?([+-]?[0-9]+)/g;
        str=str.replace(/\s\s+/g,' ').replace(/\n(\s*\n)*/g,'\n');
        if(!rma.test(str)){return new Matrix();}
        const rows=str.split('\n');
        rows.forEach((v,i,a)=>{
            a[i]=[...v.matchAll(rmr)];
            a[i].forEach((v_,i_,a_)=>{
                a_[i_]=parseFloat(v_[1]);
            });
        });
        return new Matrix(rows);
    }
    add_m(m2=null){
        if(
            m2==null
            ||!(m2 instanceof Matrix)
            ||!(this.rows==m2.rows&&this.cols==m2.cols)
        ){return null;}
        return new Matrix(this.list.map((v,i,a)=>{
            return v.map((v_,i_,a_)=>{
                return v_+m2[i][i_];
            });
        }));
    }
    sub_m(m2=null){
        if(
            m2==null
            ||!(m2 instanceof Matrix)
            ||!(this.rows==m2.rows&&this.cols==m2.cols)
        ){return null;}
        return new Matrix(this.list.map((v,i,a)=>{
            return v.map((v_,i_,a_)=>{
                return v_-m2[i][i_];
            });
        }));
    }
    get_cell(i=0,j=0){return this.list[i][j];}
    mul_n(n=1){return this.list.map((v,i,a)=>{v*=n;});}
    dev_n(n=1){return this.list.map((v,i,a)=>{v/=n;});}
    // mul_m(m2=new Matrix()){}
    // dev_m(m2=new Matrix()){}
    // https://matrixcalc.org/en/ Gauß-Bareiss Gauß-Jordan
    // inverseGB(){if(!this.square){return null;}}
    // inverseGJ(){if(!this.square){return null;}}
};
// const {performance} = require('perf_hooks');
// const t1=performance.now();
// const t2=performance.now()-t1;
let m1=new Matrix([[1,2,3],[4,5,6],[7,8,9]]);
let m2=new Matrix([[10],[11],[12]]);
let m3=new Matrix([[10,11,12]]);
let ms1=Matrix.mkFromStr(m1.tostr());
console.log(
    "%s",
    ms1.tostr()
);