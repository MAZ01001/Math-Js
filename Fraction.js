class Fraction{
    constructor(a=1,b=1){
        this.a=a;
        this.b=b;
    }
    value(){return this.a/this.b;}
};
// TODO
console.log(
    "%s\t%d",
    '7/8',
    new Fraction(7,8).value()
);