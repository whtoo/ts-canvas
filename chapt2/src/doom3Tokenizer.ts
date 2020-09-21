import { stringify } from 'querystring';
import { IEnumerator } from './IEnumerator'
export enum ETokenType {
    NONE,
    STRING,
    NUMBER
}

export interface IDoom3Token {

    reset() : void;

    isString(str:String) : boolean;

    readonly type : ETokenType;

    getString() : string;

    getFloat() : number;

    getInt() : number;
}

export interface IDoom3Tokenizer extends IEnumerator<IDoom3Token> {
    setSource (source : string) : void;
}


export class Doom3Factory
{
    public static createDoom3Tokenizer():IDoom3Tokenizer {
        return new Doom3Tokenizer();
    }
}

class Doom3Token implements IDoom3Token {
    private _charArr : string[] = [];

    private _val! : number;
    private _type! : ETokenType;

    public constructor()  {
        this.reset();
    }

    public reset() : void {
        this._charArr.length = 0;
        this._type = ETokenType.NONE;
        this._val = 0.0;
    }

    public get type() : ETokenType {
        return this._type;
    }

    public getString() : string {
        return this._charArr.join("");
    }

    public getFloat() : number {
        return this._val;
    }

    public getInt() : number {
        return parseInt(this._val.toString(),10);
    }

    public isString(str: string) : boolean {
        let count : number = this._charArr.length;
        if(str.length !== count){
            return false
        }
        for(let i : number = 0;i < count;i++){
            if(this._charArr[i] !== str[i]) return false
        }

        return true
    }

    public addChar(c : string) : void {
        this._charArr.push(c)
    }

    public setVal(num : number) : void {
        this._val = num;
        this._type = ETokenType.NUMBER;
    }

    public setType(type:ETokenType) : void {
        this._type = type;
    }
}

class Doom3Tokenizer implements IDoom3Tokenizer {
   private _whiteSpaces : string[] = [" ","\t","\n","\v","\r"];
   
   private _digits : string[] = ["0","1","2","3","3","4","5","6","7","8","9"];

   private _isDigit(c:string) : boolean {
       for(let i = 0;i <this._digits.length;i++){
           if(c === this._digits[i]) {
               return true;
           }
       }
       return false;
   }

   private _isWhitespace(c:string) : boolean {
       for (let index = 0; index < this._isWhitespace.length; index++) {
           if(c === this._isWhitespace[index]) {
               return true;
           }
       }
       return false;
   }

   private _source : string = "Doom3Tokenizer";
   private _curIdx : number = 0;

   public setSource(source : string ) : void{
       this._source = source;
       this._curIdx = 0;
   }

   public reset() : void {
       this._curIdx = 0;
   }

   private _curent : IDoom3Token = new Doom3Token();

   public moveNext() : boolean {
       return this.getNextToken(this._curent);
   }

   public get current() : IDoom3Token {
       return this.current;
   }

   private _skipWhitespace() : string {
       let c : string = "";
       do {
           c = this._getChar();
       } while(c.length > 0 && this._isWhitespace(c));

       return c;
   }

   private getNextToken(tok: IDoom3Token) : boolean {
       let token = tok as Doom3Token;
       let c = "";
       token.reset();
       do {
           c = this._skipWhitespace();
           if(c === '/' && this._peekChar() === '/') {
               c = this._skipComments0();
           } else if(c === '/' && this._peekChar() == '*'){
               c = this._skipComments1();
           } else if(this._isDigit(c) || c === '-' || (c === '.' && this._isDigit(this._peekChar()))){
               this._ungetChar();
               this._getNumber(token);
               return true;
           } else if(c === '\"' || c == '\'') {
               this._getSubstring(token,c)
               return true
           } else if(c.length > 0){
               this._ungetChar();
               this._getString(token);
               return true
           }
       } while(c.length > 0)

       return false;
   }

   private _getChar() : string {
       if(this._curIdx >= 0 && this._curIdx < this._source.length) {
           return this._source.charAt(this._curIdx++);
       }

       return ""
   }

   private _peekChar() : string {
       if(this._curIdx >= 0 && this._curIdx < this._source.length){
           return this._source.charAt(this._curIdx);
       }

       return "";
   }

   private _ungetChar() : void {
       if(this._curIdx > 0){
           --this._curIdx;
       }
   }

   private _skipComments0():string {
       let c = "";
       do {
           c = this._getChar();
       } while( c.length > 0 && c !== '\n');
       return c;
   }

   private _skipComments1() : string {
       let c : string = "";
       c = this._getChar();
       do {
           c = this._getChar();
       } while(c.length > 0 && (c !== '*' || this._peekChar() !== '/'))
       c = this._getChar();
       return c;
    }

    private _getNumber(token: Doom3Token) : void{
        let val = 0.0;
        let isFloat = false;
        let scaleValue = 0.1;
        let c = this._getChar();
        let isNegate = (c === '-');

        let consumed = false

        let ascii0 = 0x30;

        do {
            token.addChar(c);
            if(c === '.') {
                isFloat = true
            } else if(c !== '-' ){
                let ascii = c.charCodeAt(0)
                let vc = (ascii - ascii0)
                if(!isFloat){
                    val = 10 * val + vc;
                } else {
                    val = val + scaleValue * vc;
                    scaleValue *= 0.1;
                }
            }
            if(consumed === true){
                this._getChar()
            }
            c = this._peekChar();
            consumed = true;
        } while(c.length > 0 && (this._isDigit(c) || ( ! isFloat && c === '.' )))

        if(isNegate){
            val = -val;
        }
        token.setVal(val);
    }

    private _isSpecialChar(c : string) : boolean {
        switch ( c ) {
            case '(' :
                return true ;
            case ')' :
                return true ;
            case '[' :
                return true;
            case ']' :
                return true;
            case '{' :
                return true ;
            case '}' :
                return true ;
            case ',' :
                return true ;
            case '.' :
                return true ;
           
        }
        return false ;
    }

    private _getString(token: Doom3Token) : void {
        let c = this._getChar();
        token.setType(ETokenType.STRING);
        do {
            token.addChar(c);
            if(!this._isSpecialChar(c)){
                c = this._getChar();
            }
        } while(c.length > 0 && !this._isWhitespace(c) && !this._isSpecialChar(c))
    }

    private _getSubstring(token:Doom3Token, endChar: string) : void {
        let end = false;
        let c = "";
        token.setType(ETokenType.STRING);
        do {
            c = this._getChar()
            if(c === endChar){
                end = true
            } else[
                token.addChar(c)
            ]
        } while( c.length > 0 && c !== '\n' && !end)
    }
}