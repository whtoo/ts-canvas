
import { Canvas2DApplication, Application, TimerCallback, CanvasKeyBoardEvent, CanvasMouseEvent } from "./application";
import { Math2D, mat2d, vec3, MatrixStack, Size, vec2, Rectangle, Inset } from "./math2d";
import { EImageFillType, ELayout } from './drawtypes'

/** 7.1 **/
enum ECurveHitType {
    NONE ,
    START_POINT ,
    END_POINT ,
    CONTROL_POINT0 ,
    CONTROL_POINT1
}

class QuadraticBezierCurve {
    protected _startAnchorPoint : vec2 ;
    protected _endAnchorPoint : vec2 ;
    protected _controlPoint0 : vec2 ;
    
    protected _drawLine : boolean ;
    protected _lineColor : string ;
    protected _lineWidth : number ;
    protected _radiusOrLen : number ;

    protected _drawSteps : number ; 
    protected _points !: Array < vec2 > ; 
    protected _showCurvePt : boolean ; 
    protected _dirty : boolean ; 

    protected _hitType : ECurveHitType ;

    //private _iter : BezierEnumerator ;

    //private _iter2 : QuadraticBezierEnumerator ;

    public constructor ( start : vec2 , control : vec2 , end : vec2  , drawSteps  = 30 ) {
         this . _startAnchorPoint = start ;
         this . _endAnchorPoint = end ;
         this . _controlPoint0 = control ;
         this . _drawSteps = drawSteps ;
         this . _drawLine = true ;
         this . _lineColor = 'black';
         this . _lineWidth = 1 ;
         this . _radiusOrLen = 5 ;
         this . _dirty = true ;
         this . _showCurvePt = true ;
    
         this . _hitType = ECurveHitType . NONE ;
         /*
         this . _iter = new BezierEnumerator (
            this . _startAnchorPoint ,
            this . _endAnchorPoint,
            this . _controlPoint0 
        );

        this . _iter2 = new QuadraticBezierEnumerator (
            this . _startAnchorPoint ,
            this . _endAnchorPoint,
            this . _controlPoint0 
        ) ; 
        */
     }

    public set dirty ( t : boolean )  {
        this . _dirty = true ;
    }

    public get dirty ( ) : boolean {
        return this . _dirty = true ;
    }

    public get startPoint ( ) : vec2 {
         return this . _startAnchorPoint ;
     }

    public set startPoint ( pt : vec2 ) {
         this . _startAnchorPoint = pt ;
         this . _dirty = true ;
     }
    
    public get endPoint ( ) : vec2 {
        return this . _endAnchorPoint ;
    }

    public set endPoint ( pt : vec2 ) {
        this . _endAnchorPoint = pt ;
        this . _dirty = true ;
    }

    public get controlPoint0 ( ) : vec2 {
        return this . _controlPoint0 ;
    }

    public set controlPoint0 ( pt : vec2 ) {
        this . _controlPoint0 = pt ;
        this . _dirty = true ;
    }

    /*
    protected _calcDrawPoints ( ) : void {
        if ( this . _dirty ) {
            this . _points = [ ] ; 
            this . _iter2 . reset ( ) ;
            while ( this . _iter2 . moveNext ( ) ) {
                this . _points . push ( this . _iter2 . current ) ;
            }
            this . _dirty = false ;
        }
    }*/

    /*
    private _calcDrawPoints ( ) : void {
        if ( this . _dirty ) {
            this . _points = [ ] ; 
            this . _iter . reset ( ) ;
            while ( this . _iter . moveNext ( ) ) {
                this . _points . push ( this . _iter . current ) ;
            }
            this . _dirty = false ;
        }
    }*/
    
    private _calcDrawPoints ( ) : void {
        if ( this . _dirty ) 
        {
            this . _points = [ ] ;
            this . _points . push ( this . _startAnchorPoint ) ; 
            const s : number = 1.0 / ( this . _drawSteps ) ;
            for ( let i = 1 ; i < this . _drawSteps - 1 ; i ++ ) {
                const pt : vec2 = this . getPosition ( s * i ) ;
                this . _points . push ( pt ) ;
            }
            this . _points . push ( this . _endAnchorPoint ) ;
            this . _dirty = false ;
        }
    }
    
    public update (  ) : void {
        this . _calcDrawPoints ( ) ;
    }

    public onMouseDown ( evt : CanvasMouseEvent ) : void {
        this . _hitType = this . hitTest ( evt . canvasPosition ) ;
    }

    public onMouseUp ( evt : CanvasMouseEvent ) : void {
       this . _hitType = ECurveHitType . NONE ;
    }

    public onMouseMove ( evt : CanvasMouseEvent ) : void {
       if ( this . _hitType !== ECurveHitType . NONE ) {
            switch ( this . _hitType ) {
                case ECurveHitType . CONTROL_POINT0 :
                    this . _controlPoint0 . x = evt . canvasPosition . x ;
                    this . _controlPoint0 . y = evt . canvasPosition . y ;
                    this . _dirty = true ; 
                break ;
           
                case ECurveHitType . START_POINT :
                    this . _startAnchorPoint . x = evt . canvasPosition . x ;
                    this . _startAnchorPoint . y = evt . canvasPosition . y ;
                    this . _dirty = true ;
                break ;

                case ECurveHitType . END_POINT :
                    this . _endAnchorPoint . x = evt . canvasPosition . x ;
                    this . _endAnchorPoint . y = evt . canvasPosition . y ;
                    this . _dirty = true ;
                break ;
            }
       }
    }
    
     protected getPosition ( t : number ) : vec2 {
        if ( t < 0 || t > 1.0 ) {
            throw new Error ( " t的取值范围必须是[ 0 , 1 ]之间 " ) ;
        }
        return Math2D . getQuadraticBezierVector ( this . _startAnchorPoint , this ._controlPoint0 , this . _endAnchorPoint , t ) ;
    }

    public draw2 ( app : TestApplication ) {
        if ( app . context2D !== null ) {
            app . context2D . save ( ) ;
                app . context2D . lineWidth = this . _lineWidth ;
                app . context2D . strokeStyle = this . _lineColor ;
                
                app . context2D . beginPath ( ) ;
                app . context2D . moveTo ( this . _points [ 0 ] . x , this . _points [ 0 ] . y ) ;
                app . context2D . quadraticCurveTo ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _endAnchorPoint . x , this . _endAnchorPoint . y ) ; 
                app . context2D . stroke ( ) ;

                if ( this . _drawLine ) {
                    app . strokeLine ( this . _startAnchorPoint . x , this . _startAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    app . strokeLine ( this . _endAnchorPoint . x , this . _endAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    app . fillRectWithTitle ( this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                              this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                              this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                              undefined , undefined , 'green' , false ) ;
                    app . fillRectWithTitle ( this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                              this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                              this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                              undefined , undefined , 'blue' , false ) ;
                    app . fillCircle ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _radiusOrLen ) ;
                }
                app . drawCoordInfo ( 'p0:' + this . _startAnchorPoint . toString ( ) , this . _startAnchorPoint . x , this . _startAnchorPoint . y - 10 ) ;
                app . drawCoordInfo ( 'p1:' + this . _controlPoint0 . toString ( ) , this . _controlPoint0 . x , this . _controlPoint0 . y - 10 ) ;
                app . drawCoordInfo ( 'p2:' + this . _endAnchorPoint . toString ( ) , this . _endAnchorPoint . x , this . _endAnchorPoint . y - 10 ) ;
            app . context2D . restore ( ) ;
        }
    }

    public draw ( app : TestApplication , useMyCurveDrawFunc  = true ) {
        if ( app . context2D !== null ) {
            app . context2D . save ( ) ;
                app . context2D . lineWidth = this . _lineWidth ;
                app . context2D . strokeStyle = this . _lineColor ;
                app . context2D . beginPath ( ) ;
                app . context2D . moveTo ( this . _points [ 0 ] . x , this . _points [ 0 ] . y ) ;
                if ( useMyCurveDrawFunc === false ) {
                    app . context2D . quadraticCurveTo ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _endAnchorPoint . x , this . _endAnchorPoint . y ) ; 
                } else {
                    for ( let i = 1 ; i < this . _points . length  ; i ++ ) {
                        app . context2D . lineTo ( this . _points [ i ] . x , this . _points [ i ] . y ) ;
                    }
                }    
                app . context2D . stroke ( ) ;

                if ( this . _drawLine ) {
                    app . strokeLine ( this . _startAnchorPoint . x , this . _startAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    app . strokeLine ( this . _endAnchorPoint . x , this . _endAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    
                    app . fillRectWithTitle ( this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                              this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                              this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                              undefined , undefined , 'green' , false ) ;

                    app . fillRectWithTitle ( this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                              this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                              this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                              undefined , undefined , 'blue' , false ) ;

                    app . fillCircle ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _radiusOrLen ) ;
                }

                if ( this . _showCurvePt ) {
                    for ( let i = 0 ; i < this . _points . length ; i ++ ) {
                        app . fillCircle ( this . _points [ i ] . x , this . _points [ i ] . y ,  2 ) ;
                    }
                }

                app . drawCoordInfo ( 'p0:' + this . _startAnchorPoint . toString ( ) , this . _startAnchorPoint . x , this . _startAnchorPoint . y - 10 ) ;
                app . drawCoordInfo ( 'p1:' + this . _controlPoint0 . toString ( ) , this . _controlPoint0 . x , this . _controlPoint0 . y - 10 ) ;
                app . drawCoordInfo ( 'p2:' + this . _endAnchorPoint . toString ( ) , this . _endAnchorPoint . x , this . _endAnchorPoint . y - 10 ) ;
            app . context2D . restore ( ) ;
        }
    }

    protected hitTest ( pt : vec2 ) : ECurveHitType {
        if ( Math2D . isPointInCircle ( pt , this . _controlPoint0  , this . _radiusOrLen ) ) {
            return ECurveHitType . CONTROL_POINT0 ; 
        } else if ( Math2D . isPointInRect ( 
                                pt . x , pt . y ,
                                this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                this . _radiusOrLen + 5 , this . _radiusOrLen + 5) ) {
            return ECurveHitType . START_POINT ;         
        } else if (  Math2D . isPointInRect ( 
            pt . x , pt . y ,
            this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
            this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
            this . _radiusOrLen + 5 , this . _radiusOrLen + 5) ) {
            return ECurveHitType . END_POINT ; 
        } else {
            return ECurveHitType . NONE ; 
        }
    }

    public toString ( ) : string {
        return JSON . stringify ( this , null ,  ' ' )  ;
    }
}

class CubicBezierCurve extends QuadraticBezierCurve {
    protected _controlPoint1 : vec2 ;

    public constructor ( start : vec2 , control0 : vec2 , control1 : vec2 , end : vec2  , drawSteps  = 30 ) {
        super ( start , control0 , end , drawSteps ) ;
        this . _controlPoint1 = control1 ;
    }

    public get controlPoint1 ( ) {
        return this ._controlPoint1 ;
    }

    public set controlPoint1 ( ctrl : vec2 ) {
        this . _controlPoint1 = ctrl ;
     }

    protected getPosition ( t : number ) : vec2 {
        if ( t < 0 || t > 1.0 ) {
            throw new Error ( " t的取值范围必须是[ 0 , 1 ]之间 " ) ;
        }

        const ret : vec2 = vec2 . create ( ) ;
        // ret . x = Math2D . getCubeBezierPosition ( this . _startAnchorPoint . x , this . _controlPoint0 . x , this . _controlPoint1 . x , this . _endAnchorPoint . x , t ) ; 
        // ret . y = Math2D . getCubeBezierPosition ( this . _startAnchorPoint . y , this . _controlPoint0 . y , this . _controlPoint1 . y , this . _endAnchorPoint . y , t ) ; 
        Math2D . getCubicBezierVector ( this . _startAnchorPoint , this . _controlPoint0 , this . controlPoint1 , this . _endAnchorPoint , t , ret ) ;
        return ret ;
    }

    public draw2 ( app : TestApplication , useMyCurveDrawFunc  = true ) {
        if ( app . context2D !== null ) {
            app . context2D . save ( ) ;
                app . context2D . lineWidth = this . _lineWidth ;
                app . context2D . strokeStyle = this . _lineColor ;

                app . context2D . beginPath ( ) ;
                app . context2D . moveTo ( this . _points [ 0 ] . x , this . _points [ 0 ] . y ) ;
                app . context2D . bezierCurveTo ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _controlPoint1 . x , this . _controlPoint1 . y , this . _endAnchorPoint . x , this . _endAnchorPoint . y ) ; 
                app . context2D . stroke ( ) ;

                if ( this . _drawLine ) {
                    app . strokeLine ( this . _startAnchorPoint . x , this . _startAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    app . strokeLine ( this . _endAnchorPoint . x , this . _endAnchorPoint . y , this . _controlPoint1 . x , this . _controlPoint1 . y ) ;
                    // app . strokeLine ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . controlPoint1 . x , this . controlPoint1 . y  ) ; 
                    app . fillRectWithTitle ( this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                          this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                          this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                          undefined , undefined , 'green' , false ) ;
                    

                    app . fillRectWithTitle ( this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                          this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                          this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                          undefined , undefined , 'blue' , false ) ;
                    app . fillCircle ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _radiusOrLen ) ;
                    app . fillCircle ( this . _controlPoint1 . x , this . _controlPoint1 . y , this . _radiusOrLen ) ;

                }
                app . drawCoordInfo ( 'p0:' + this . _startAnchorPoint . toString ( ) , this . _startAnchorPoint . x , this . _startAnchorPoint . y - 10 ) ;
                app . drawCoordInfo ( 'p1:'+ this . _controlPoint0 . toString ( ) , this . _controlPoint0 . x , this . _controlPoint0 . y - 10 ) ;
                app . drawCoordInfo ( 'p2:' + this . _controlPoint1 . toString ( ) , this . _controlPoint1 . x , this . _controlPoint1 . y - 10 ) ;
                app . drawCoordInfo ( 'p3:' + this . _endAnchorPoint . toString ( ) , this . _endAnchorPoint . x , this . _endAnchorPoint . y - 10 ) ;
            app . context2D . restore ( ) ;
        }
    }

    public draw ( app : TestApplication , useMyCurveDrawFunc  = true ) {
        if ( app . context2D !== null ) {
            app . context2D . save ( ) ;
                app . context2D . lineWidth = this . _lineWidth ;
                app . context2D . strokeStyle = this . _lineColor ;
                app . context2D . beginPath ( ) ;
                app . context2D . moveTo ( this . _points [ 0 ] . x , this . _points [ 0 ] . y ) ;
                if ( useMyCurveDrawFunc === false ) {
                    app . context2D . bezierCurveTo ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _controlPoint1 . x , this . _controlPoint1 . y , this . _endAnchorPoint . x , this . _endAnchorPoint . y ) ; 
                } else {
                    for ( let i = 1 ; i < this . _points . length ; i ++ ) {
                        app . context2D . lineTo ( this . _points [ i ] . x , this . _points [ i ] . y ) ;
                    }
                }    
                app . context2D . stroke ( ) ;
                if ( this . _drawLine ) {
                    app . strokeLine ( this . _startAnchorPoint . x , this . _startAnchorPoint . y , this . _controlPoint0 . x , this . _controlPoint0 . y ) ;
                    app . strokeLine ( this . _endAnchorPoint . x , this . _endAnchorPoint . y , this . _controlPoint1 . x , this . _controlPoint1 . y ) ;
                    // app . strokeLine ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . controlPoint1 . x , this . controlPoint1 . y  ) ; 
                
                    // 绘制两个端点
                    app . fillRectWithTitle ( this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                          this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                          this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                          undefined , undefined , 'green' , false ) ;
                    

                    app . fillRectWithTitle ( this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                          this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                          this . _radiusOrLen + 5 , this . _radiusOrLen + 5 ,
                                          undefined , undefined , 'blue' , false ) ;
                    app . fillCircle ( this . _controlPoint0 . x , this . _controlPoint0 . y , this . _radiusOrLen ) ;
                    app . fillCircle ( this . _controlPoint1 . x , this . _controlPoint1 . y , this . _radiusOrLen ) ;

                }

                if ( this . _showCurvePt ) {
                    for ( let i = 0 ; i < this . _points . length ; i ++ ) {
                        app . fillCircle ( this . _points [ i ] . x , this . _points [ i ] . y ,  2 ) ;
                    }
                }

                app . drawCoordInfo ( 'p0:' + this . _startAnchorPoint . toString ( ) , this . _startAnchorPoint . x , this . _startAnchorPoint . y - 10 ) ;
                app . drawCoordInfo ( 'p1:'+ this . _controlPoint0 . toString ( ) , this . _controlPoint0 . x , this . _controlPoint0 . y - 10 ) ;
                app . drawCoordInfo ( 'p2:' + this . _controlPoint1 . toString ( ) , this . _controlPoint1 . x , this . _controlPoint1 . y - 10 ) ;
                app . drawCoordInfo ( 'p3:' + this . _endAnchorPoint . toString ( ) , this . _endAnchorPoint . x , this . _endAnchorPoint . y - 10 ) ;
            app . context2D . restore ( ) ;
        }
    }
    
    protected hitTest ( pt : vec2 ) : ECurveHitType {
        if ( Math2D . isPointInCircle ( pt , this . _controlPoint0  , this . _radiusOrLen ) ) {
            return ECurveHitType . CONTROL_POINT0 ;
        } else if (  Math2D . isPointInCircle ( pt , this . _controlPoint1  , this . _radiusOrLen )  ) {
            return ECurveHitType . CONTROL_POINT1 ;
        } else if ( Math2D . isPointInRect ( 
                                pt . x , pt . y ,
                                this . _startAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
                                this . _startAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
                                this . _radiusOrLen + 5 , this . _radiusOrLen + 5) ) {
            return ECurveHitType . START_POINT ;          
        } else if (  Math2D . isPointInRect ( 
            pt . x , pt . y ,
            this . _endAnchorPoint . x - ( this . _radiusOrLen + 5 ) * 0.5 ,
            this . _endAnchorPoint . y - ( this . _radiusOrLen + 5 ) * 0.5 , 
            this . _radiusOrLen + 5 , this . _radiusOrLen + 5) ) {
            return ECurveHitType . END_POINT ;
        } else {
            return ECurveHitType . NONE ;
        }
    }

    public onMouseMove ( evt : CanvasMouseEvent ) : void {
        if ( this . _hitType !== ECurveHitType . NONE ) {
             switch ( this . _hitType ) {
                 case ECurveHitType . CONTROL_POINT0 :
                 this . _controlPoint0 . x = evt . canvasPosition . x ;
                 this . _controlPoint0 . y = evt . canvasPosition . y ;
                 this . _dirty = true ;
                 break ;

                 case ECurveHitType . CONTROL_POINT1 :
                 this . _controlPoint1 . x = evt . canvasPosition . x ;
                 this . _controlPoint1 . y = evt . canvasPosition . y ;
                 this . _dirty = true ;
                 break ;
 
                 case ECurveHitType . START_POINT :
                 this . _startAnchorPoint . x = evt . canvasPosition . x ;
                 this . _startAnchorPoint . y = evt . canvasPosition . y ;
                 this . _dirty = true ;
                 break ;
 
                 case ECurveHitType . END_POINT :
                 this . _endAnchorPoint . x = evt . canvasPosition . x ;
                 this . _endAnchorPoint . y = evt . canvasPosition . y ;
                 this . _dirty = true ;
                 break ;
             }
        }
     }

     public toString ( ) : string {
        return JSON . stringify ( this , null ,  ' ' )  ;
    }
}
/**
 * Don't export anything on top class
 */
class RenderState {
    public lineWidth = 1;
    public strokeStyle = 'red';
    public fillStyle = 'green';

    public clone(): RenderState {
        const state = new RenderState();
        state.lineWidth = this.lineWidth;
        state.strokeStyle = this.strokeStyle;
        state.fillStyle = this.fillStyle;
        return state;
    }

    public toString(): string {
        return JSON.stringify(this, null, ' ');
    }
}

class RenderStateStack {
    private _stack = [new RenderState()];
    private get _currentState() {
        return this._stack[this._stack.length - 1];
    }

    public save(): void {
        this._stack.push(this._currentState.clone());
    }

    public restore(): void {
        this._stack.pop();
    }

    public get lineWidth(): number {
        return this._currentState.lineWidth;
    }

    public set lineWidth(value: number) {
        this._currentState.lineWidth = value;
    }

    public get strokeStyle(): string {
        return this._currentState.strokeStyle;
    }

    public set strokeStyle(value: string) {
        this._currentState.strokeStyle = value;
    }

    public get fillStyle(): string {
        return this._currentState.strokeStyle;
    }

    public set fillStyle(value: string) {
        this._currentState.strokeStyle = value;
    }

    public printCurrentStateInfo(): void {
        console.log(this._currentState.toString());
    }
}

type TextAlign = 'start' | 'left' | 'center' | 'right' | 'end';

type TextBaseline = 'alphabetic' | 'hanging' | 'top' | 'middle' | 'bottom';

type FontType = "10px sans-serif" | "15px sans-serif" | "20px sans-serif" | "25px sans-serif";

type PatternRepeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

type FontStyle = "normal" | "italic" | "oblique";

type FontVariant = "normal" | "small-caps";

type FontWeight = "normal" | "bold" | "bolder" | "lighter" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

type FontSize = "10px" | "12px" | "16px" | "18px" | "24px" | "50%" | "75%" | "100%" | "125%" | "150%" | "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";

type FontFamily = "sans-serif" | "serif" | "courier" | "fantasy" | "monospace";


class TestApplication extends Canvas2DApplication {
    private _lineDashOffset = 0;
    private _linearGradient !: CanvasGradient;
    private _radialGradient !: CanvasGradient;
    private _pattern: CanvasPattern | null = null;
  
    private _mouseX = 0;
    private _mouseY = 0;

    public matrixStack: MatrixStack = new MatrixStack();
    private _quadCurve : QuadraticBezierCurve  = new QuadraticBezierCurve(vec2.create(400,100),
                                                                            vec2.create(550,200),
                                                                            vec2.create(400,300));

    private _cubeCurve : CubicBezierCurve = new CubicBezierCurve (  vec2 . create ( 60 , 100 ) ,
    vec2 . create ( 240 , 100  ) ,
    vec2 . create ( 60 , 300  ) ,
    vec2 . create ( 240 , 300 ) ) ;

    public constructor(canvas: HTMLCanvasElement) {
        // 构造函数中调用super方法
        super(canvas);

        this.isSupportMouseMove = true;
     
    }
    protected dispatchMouseDown(evt: CanvasMouseEvent): void {
        this._quadCurve.onMouseDown(evt);
        this._cubeCurve.onMouseDown(evt);
    }
    protected dispatchMouseMove(evt: CanvasMouseEvent): void {
        this._mouseX = evt.canvasPosition.x;
        this._mouseY = evt.canvasPosition.y;
        
        this._quadCurve.onMouseMove(evt);
        this._cubeCurve.onMouseMove(evt);
    }

    protected dispatchMouseUp(evt: CanvasMouseEvent): void {
        this._quadCurve.onMouseUp(evt);
        this._cubeCurve.onMouseUp(evt);
    }

    protected dispatchKeyPress(evt: CanvasKeyBoardEvent): void {
        return
    }

    public update(elapsedMsec: number, intervalSec: number): void {
        this._quadCurve.update();
        this._cubeCurve.update();
    }

    public render(): void {
        if (this.context2D !== null) {
            let centX: number
            this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.strokeGrid();
            
            this._quadCurve.draw(this);
            this._cubeCurve.draw(this);

            const msg = `[ ${this._mouseX} , ${this._mouseY} ]`;
            this.drawCoordInfo(msg, this._mouseX, this._mouseY);

        }
    }

    public clear(): void {
        this.context2D?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    /******************************** 6.2 */
    /**
     * 
     * @param len 要绘制的向量长度，这是一个浮点数etc: 100.50
     * @param arrowLen 要绘制向量的箭头长度,整数 etc: 10
     * @param beginText 向量头部标注
     * @param endText 向量尾部标注
     * @param isLineDash 是否虚线
     * @param showInfo 是否显示向量长度
     * @param alpha 是否以半透明方式显示向量
     */
    public  drawVec(len:number,arrowLen=10,beginText="",endText="",lineWidth=1,isLineDash=false,showInfo=false,alpha=false): void {
        if(this.context2D === null) return
        // 负数处理
        if (len < 0) arrowLen = -arrowLen
        this.context2D.save();
            this.context2D.lineWidth = lineWidth;
            if(isLineDash){
                this.context2D.setLineDash([2,2]);
            }
            if(lineWidth > 1) {
                this.fillCircle(0,0,5);
            } else {
                this.fillCircle(0,0,3);
            }
            this.context2D.save();
                if(alpha === true) {
                    this.context2D.strokeStyle = 'rgba(0,0,0,0.3)';
                }
                this.strokeLine(0,0,len,0);
                this.context2D.save();
                    this.strokeLine(len,0,len-arrowLen,arrowLen);
                this.context2D.restore();
                //DONE: 绘制箭头的下半部分
                this.context2D.save();
                    this.strokeLine(len,0,len-arrowLen,-arrowLen);
                this.context2D.restore();

            this.context2D.restore();

            const font: FontType = "15px sans-serif";
            if(beginText != undefined && beginText.length != 0){
                if (len > 0) {
                    this.fillText(beginText,0,0,'black','right','bottom',font);
                } else{
                    this.fillText(beginText,0,0,'black','left','bottom',font);
                }
            }
            len = parseFloat(len.toFixed(2));
            if (endText != undefined && endText.length != 0 ){
                if (len > 0){
                    this.fillText(endText,len,0,'black','left','bottom',font);
                } else{
                    this.fillText(endText,len,0,'black','right','bottom',font);
                }
            }
            if(showInfo === true) {
                this.fillText(Math.abs(len).toString(),len *  0.5,0,'black','center','bottom',font);
            }

        this.context2D.restore();
    }
    public drawVecFromLine(start: vec2, end: vec2, arrowLen = 10,beginText="",endText="",lineWidth=1,isLineDash=false,showInfo=false,alpha=false) : number {
        const angle = vec2.getOrientation(start,end,true);
        if (this.context2D !== null){
            const diff = vec2.difference(end,start);
            const len = diff.length;
            this.context2D.save();
                this.context2D.translate(start.x,start.y);
                this.context2D.rotate(angle);
                this.drawVec(len,arrowLen,beginText,endText,lineWidth,isLineDash,showInfo,alpha);
            this.context2D.restore();
        }
        return angle;
    }
    /*******************************************6.2代码************************************************ */    
    public lineStart : vec2 = vec2 . create ( 150 , 150 ) ;
    public lineEnd : vec2 = vec2 . create ( 400 , 300 ) ; 
    public closePt : vec2 = vec2 . create ( ) ; 
    private _hitted = false ;

    public drawMouseLineProjection ( ) : void {
        if (this.context2D != null) {
            if (this._hitted === false){
                this.drawVecFromLine(this.lineStart,this.lineEnd,10,this.lineStart.toString(),this.lineEnd.toString(),1,false,true);
            } else {
                let angle = 0;
                const mousePt = vec2.create(this._mouseX,this._mouseY);

                this.context2D.save();
                    angle = this.drawVecFromLine(this.lineStart,this.lineEnd,10,this.lineStart.toString(),this.lineEnd.toString(),3,false,true);
                    this.fillCircle(this.closePt.x,this.closePt.y,5);
                    this.drawVecFromLine(this.lineStart,mousePt,10,'','',1,true,true,false);
                    this.drawVecFromLine(mousePt,this.closePt,10,'','',1,true,true,false);
                this.context2D.restore();

                this.context2D.save();
                    this.context2D.translate(this.closePt.x,this.closePt.y);
                    this.context2D.rotate(angle);
                    this.drawCoordInfo(`[${(this.closePt.x).toFixed(2)},${(this.closePt.y).toFixed(2)}]`,0,0);
                this.context2D.restore();

                angle = vec2.getAngle(vec2.difference(this.lineEnd,this.lineStart),vec2.difference(mousePt,this.lineStart),false);
                this.drawCoordInfo(
                    angle.toFixed(2),
                    this.lineStart.x + 10,
                    this.lineStart.y + 10
                );

            }
        }
    }
    /*******************************************5.1节代码************************************************ */
    public drawRect(x: number, y: number, w: number, h: number): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.lineWidth = 20;
            //this . context2D . lineCap = 'round';
            // this . context2D . lineJoin = 'miter' ;
            //this . context2D . miterLimit = 1.3 ;

            this.context2D.strokeStyle = 'blue';
            this.context2D.fillStyle = "grey";
            this.context2D.beginPath();
            this.context2D.moveTo(x, y);
            this.context2D.lineTo(x + w, y);
            this.context2D.lineTo(x + w, y + h);
            this.context2D.lineTo(x, y + h);
            this.context2D.closePath();
            this.context2D.fill();
            this.context2D.stroke();
            this.context2D.restore();
        }
    }



    public static Colors: string[] = [
        'aqua',    //浅绿色
        'black',   //黑色
        'blue',    //蓝色 
        'fuchsia', //紫红色
        'gray',     //灰色
        'green',   //绿色
        'lime',    //绿黄色
        'maroon',  //褐红色
        'navy',    //海军蓝
        'olive',   //橄榄色
        'orange',  //橙色
        'purple',  //紫色
        'red',      //红色
        'silver',  //银灰色
        'teal',    //蓝绿色
        'yellow',   //黄色
        'white'   //白色
    ];

    public fillLinearRect(x: number, y: number, w: number, h: number): void {
        if (this.context2D !== null) {
            this.context2D.save();
            if (this._linearGradient === undefined) {
                this._linearGradient = this.context2D.createLinearGradient(x, y, x + w, y);
                // this . _linearGradient = this . context2D . createLinearGradient ( x , y , x , y + h ) ;
                // this . _linearGradient = this . context2D . createLinearGradient ( x , y , x + w , y + h ) ;
                // this . _linearGradient = this . context2D . createLinearGradient ( x + w , y + h , x , y) ;
                this._linearGradient.addColorStop(0.0, 'grey');
                this._linearGradient.addColorStop(0.25, 'rgba( 255 , 0 , 0 , 1 ) ');
                this._linearGradient.addColorStop(0.5, 'green');
                this._linearGradient.addColorStop(0.75, '#0000FF');
                this._linearGradient.addColorStop(1.0, 'black');
            }
            this.context2D.fillStyle = this._linearGradient;
            this.context2D.beginPath();
            this.context2D.rect(x, y, w, h);
            this.context2D.fill();
            this.context2D.restore();
        }
    }

    public fillRadialRect(x: number, y: number, w: number, h: number): void {
        if (this.context2D !== null) {
            this.context2D.save();
            if (this._radialGradient === undefined) {
                const centX: number = x + w * 0.5;
                const centY: number = y + h * 0.5;
                let radius: number = Math.min(w, h);
                radius *= 0.5;
                this._radialGradient = this.context2D.createRadialGradient(centX, centY, radius * 0.1, centX, centY, radius);
                this._radialGradient.addColorStop(0.0, 'black');
                this._radialGradient.addColorStop(0.25, 'rgba( 255 , 0 , 0 , 1 ) ');
                this._radialGradient.addColorStop(0.5, 'green');
                this._radialGradient.addColorStop(0.75, '#0000FF');
                this._radialGradient.addColorStop(1.0, 'white');
            }
            this.context2D.fillStyle = this._radialGradient;
            this.context2D.fillRect(x, y, w, h);
            this.context2D.restore();
        }
    }

    public fillPatternRect(x: number, y: number, w: number, h: number, repeat: PatternRepeat = "repeat"): void {
        if (this.context2D !== null) {
            if (this._pattern === null) {
                const img: HTMLImageElement = document.createElement('img') as HTMLImageElement;
                img.src = './data/test.jpg';
                img.onload = (ev: Event): void => {
                    if (this.context2D !== null) {
                        this._pattern = this.context2D.createPattern(img, repeat);
                        this.context2D.save();
                        if (this._pattern) {
                            this.context2D.fillStyle = this._pattern;
                        }
                        this.context2D.beginPath();
                        this.context2D.rect(x, y, w, h);
                        this.context2D.fill();
                        this.context2D.restore();
                    }
                }
            } else {
                this.context2D.save();
                if (this._pattern) {
                    this.context2D.fillStyle = this._pattern;
                }
                this.context2D.beginPath();
                this.context2D.rect(x, y, w, h);
                this.context2D.fill();
                this.context2D.restore();
            }
        }
    }
    public fillCircle(x: number, y: number, radius: number, fillStyle: string | CanvasGradient | CanvasPattern = 'red'): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.fillStyle = fillStyle;
            this.context2D.beginPath();
            this.context2D.arc(x, y, radius, 0, Math.PI * 2);
            this.context2D.fill();
            this.context2D.restore();
        }
    }

    public fillRectangleWithColor(rect: Rectangle, color: string): void {
        if (rect.isEmpty()) {
            return;
        }
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.fillStyle = color;
            this.context2D.fillRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            this.context2D.restore();
        }
    }

    public strokeLine(x0: number, y0: number, x1: number, y1: number): void {
        if (this.context2D !== null) {
            this.context2D.beginPath();
            this.context2D.moveTo(x0, y0);
            this.context2D.lineTo(x1, y1);
            this.context2D.stroke();
        }
    }

    public strokeCoord(orginX: number, orginY: number, width: number, height: number, lineWidth = 3): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.lineWidth = lineWidth;
            this.context2D.strokeStyle = 'red';
            this.strokeLine(orginX, orginY, orginX + width, orginY);
            this.context2D.strokeStyle = 'blue';
            this.strokeLine(orginX, orginY, orginX, orginY + height);
            this.context2D.restore();
        }
    }

    public strokeLocalCoord(width: number, height: number, lineWidth = 1): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.lineWidth = lineWidth;
            this.context2D.strokeStyle = 'red';
            this.strokeLine(0, 0, width, 0);
            this.context2D.strokeStyle = 'blue';
            this.strokeLine(0, 0, 0, height);
            this.context2D.restore();
        }
    }

    public strokeCircle(x: number, y: number, radius: number, color = 'red', lineWidth = 1): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.strokeStyle = color;
            this.context2D.lineWidth = lineWidth;
            this.context2D.beginPath();
            this.context2D.arc(x, y, radius, 0, Math.PI * 2);
            this.context2D.stroke();
            this.context2D.restore();
        }
    }

    public strokeRect(x: number, y: number, w: number, h: number, color = 'black'): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.strokeStyle = color;
            this.context2D.beginPath();
            this.context2D.moveTo(x, y);
            this.context2D.lineTo(x + w, y);
            this.context2D.lineTo(x + w, y + h);
            this.context2D.lineTo(x, y + h);
            this.context2D.closePath();
            this.context2D.stroke();
            this.context2D.restore();
        }
    }



    public fillText(text: string, x: number, y: number, color = 'white', align: TextAlign = 'left', baseline: TextBaseline = 'top', font: FontType = '10px sans-serif'): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.textAlign = align;
            this.context2D.textBaseline = baseline;
            this.context2D.font = font;
            this.context2D.fillStyle = color;
            this.context2D.fillText(text, x, y);
            this.context2D.restore();
        }
    }



    public calcTextSize(text: string, char = 'W', scale = 0.5): Size {
        if (this.context2D !== null) {
            const size: Size = new Size();
            size.width = this.context2D.measureText(text).width;
            const w: number = this.context2D.measureText(char).width;
            size.height = w + w * scale;
            return size;
        }

        alert(" context2D 渲染上下文为null ");
        throw new Error(" context2D 渲染上下文为null ");
    }

    public calcLocalTextRectangle(layout: ELayout, text: string, parentWidth: number, parentHeight: number): Rectangle {
        const s: Size = this.calcTextSize(text);
        const o: vec2 = vec2.create();
        const left = 0;
        const top = 0;
        const right: number = parentWidth - s.width;
        const bottom: number = parentHeight - s.height;
        const center: number = right * 0.5;
        const middle: number = bottom * 0.5;
        switch (layout) {
            case ELayout.LEFT_TOP:
                o.x = left;
                o.y = top;
                break;
            case ELayout.RIGHT_TOP:
                o.x = right;
                o.y = top;
                break;
            case ELayout.RIGHT_BOTTOM:
                o.x = right;
                o.y = bottom;
                break;
            case ELayout.LEFT_BOTTOM:
                o.x = left;
                o.y = bottom;
                break;
            case ELayout.CENTER_MIDDLE:
                o.x = center;
                o.y = middle;
                break;
            case ELayout.CENTER_TOP:
                o.x = center;
                o.y = 0;
                break;
            case ELayout.RIGHT_MIDDLE:
                o.x = right;
                o.y = middle;
                break;
            case ELayout.CENTER_BOTTOM:
                o.x = center;
                o.y = bottom;
                break;
            case ELayout.LEFT_MIDDLE:
                o.x = left;
                o.y = middle;
                break;
        }
        return new Rectangle(o, s);
    }

    public fillRectWithTitle(x: number, y: number, width: number, height: number, title = '', layout: ELayout = ELayout.CENTER_MIDDLE, color = 'grey', showCoord = true): void {
        if (this.context2D !== null) {

            this.context2D.save();
            this.context2D.fillStyle = color;
            this.context2D.beginPath();
            this.context2D.rect(x, y, width, height);
            this.context2D.fill();
            if (title.length !== 0) {
                const rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height);
                this.fillText(title, x + rect.origin.x, y + rect.origin.y, 'white', 'left', 'top' /*, '10px sans-serif'*/);
                this.strokeRect(x + rect.origin.x, y + rect.origin.y, rect.size.width, rect.size.height, 'rgba( 0 , 0 , 0 , 0.5 ) ');
                this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2);
            }
            if (showCoord) {
                this.strokeCoord(x, y, width + 20, height + 20);
                this.fillCircle(x, y, 3);
            }

            this.context2D.restore();
        }
    }

    public /* static */ makeFontString(size: FontSize = '10px',
        weight: FontWeight = 'normal',
        style: FontStyle = 'normal',
        variant: FontVariant = 'normal',
        family: FontFamily = 'sans-serif',
    ): string {
        const strs: string[] = [];
        strs.push(style);
        strs.push(variant);
        strs.push(weight);
        strs.push(size);
        strs.push(family);
        const ret: string = strs.join(" ");
        console.log(ret);
        return ret;
    }

    public drawImage(img: HTMLImageElement | HTMLCanvasElement, destRect: Rectangle, srcRect: Rectangle = Rectangle.create(0, 0, img.width, img.height), fillType: EImageFillType = EImageFillType.STRETCH): boolean {
        if (this.context2D === null) {
            return false;
        }

        if (srcRect.isEmpty()) {
            return false;
        }

        if (destRect.isEmpty()) {
            return false;
        }

        if (fillType === EImageFillType.STRETCH) {
            this.context2D.drawImage(img,
                srcRect.origin.x,
                srcRect.origin.y,
                srcRect.size.width,
                srcRect.size.height,
                destRect.origin.x,
                destRect.origin.y,
                destRect.size.width,
                destRect.size.height
            );
        } else {
            this.fillRectangleWithColor(destRect, 'grey');
            let rows: number = Math.ceil(destRect.size.width / srcRect.size.width);
            let colums: number = Math.ceil(destRect.size.height / srcRect.size.height);
            let left = 0;
            let top = 0;
            let right = 0;
            let bottom = 0;
            let width = 0;
            let height = 0;
            const destRight: number = destRect.origin.x + destRect.size.width;
            const destBottom: number = destRect.origin.y + destRect.size.height;
            if (fillType === EImageFillType.REPEAT_X) {
                colums = 1;
            } else if (fillType === EImageFillType.REPEAT_Y) {
                rows = 1;
            }

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < colums; j++) {
                    left = destRect.origin.x + i * srcRect.size.width;
                    top = destRect.origin.y + j * srcRect.size.height;

                    width = srcRect.size.width;
                    height = srcRect.size.height;
                    right = left + width;
                    bottom = top + height;
                    if (right > destRight) {
                        width = srcRect.size.width - (right - destRight);
                    }
                    if (bottom > destBottom) {
                        height = srcRect.size.height - (bottom - destBottom);
                    }
                    this.context2D.drawImage(img,
                        srcRect.origin.x,
                        srcRect.origin.y,
                        width,
                        height,
                        left, top, width, height
                    );
                }
            }
        }
        return true;
    }

    public getColorCanvas(amount = 32): HTMLCanvasElement {

        const step = 4;
        const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = amount * step;
        canvas.height = amount * step;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if (context === null) {
            alert("离屏Canvas获取渲染上下文失败！");
            throw new Error("离屏Canvas获取渲染上下文失败！");
        }

        for (let i = 0; i < step; i++) {
            for (let j = 0; j < step; j++) {
                const idx: number = step * i + j;
                context.save();
                context.fillStyle = TestApplication.Colors[idx];
                context.fillRect(i * amount, j * amount, amount, amount);
                context.restore();
            }
        }

        return canvas;
    }

    public drawColorCanvas(): void {
        const colorCanvas: HTMLCanvasElement = this.getColorCanvas();
        this.drawImage(colorCanvas,
            Rectangle.create(100, 100, colorCanvas.width, colorCanvas.height));
    }

    public printPixelsColor(x: number, y: number, w: number, h: number): void {
        if (this.context2D !== null) {
            const imgData: ImageData = this.context2D.getImageData(x, y, w, h);
            console.log(imgData.data);
        }
    }

    /*******************************************5.1************************************************ */
    public drawCoordInfo(info: string, x: number, y: number): void {
        this.fillText(info, x, y, 'black', 'center', 'bottom');
    }

    public strokeGrid(color = 'grey', interval = 10,showCoord = false): void {
        if (this.context2D !== null) {
            this.context2D.save();
            this.context2D.strokeStyle = color;
            this.context2D.lineWidth = 0.5;
            for (let i: number = interval + 0.5; i < this.canvas.width; i += interval) {
                this.strokeLine(i, 0, i, this.canvas.height);
            }
            for (let i: number = interval + 0.5; i < this.canvas.height; i += interval) {
                this.strokeLine(0, i, this.canvas.width, i);
            }
            this.context2D.restore();
            if(showCoord){
                this.fillCircle(0, 0, 5, 'red');
                this.strokeCoord(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    public drawXYAxis(): void {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w * 0.5;
        const centerY = h * 0.5;
        const magicN = Math.sqrt(2) * 0.5;
        const scale = 20
        if (this.context2D !== null) {
            this.context2D.save();
            this.strokeLine(0, centerY, w, centerY);
            this.context2D.lineWidth = 5;

            this.context2D.save();
            this.context2D.translate(0, centerY*2);
            this.context2D.scale(1,-1);
            this.strokeLine(centerX - magicN * scale, scale, centerX, 0);
            this.strokeLine(centerX + magicN * scale, scale, centerX, 0);
            this.context2D.restore();

            this.strokeLine(w - scale, centerY - magicN * scale, w, centerY);
            this.strokeLine(w - scale, centerY + magicN * scale, w, centerY);

            this.context2D.lineWidth = 1;
            this.strokeLine(centerX, 0, centerX, h);
            this.strokeCircle(centerX, centerY, 3, "red");
            this.context2D.restore();
        }
    }
    
    protected distance(x1: number, y1: number, x2: number, y2: number): number {
        const diffX = x1 - x2;
        const diffY = y1 - y2;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    /** 5.2 */
    public draw4Quadrant() {
        if(this.context2D !== null) {
            this.context2D.save();
            this.fillText("第一象限",this.canvas.width,this.canvas.height,'rgba(0,0,255,0.5)','right','bottom','20px sans-serif');
            this.fillText("第二象限",0,this.canvas.height,'rgba(0,0,255,0.5)','left','bottom','20px sans-serif');
            this.fillText("第三象限",0,0,'rgba(0,0,255,0.5)','left','top','20px sans-serif');
            this.fillText("第四象限",this.canvas.width,0,'rgba(0,0,255,0.5)','right','top','20px sans-serif');

            this.context2D.restore();
        }
    }

}

//获取canvas元素
const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const app: TestApplication = new TestApplication(canvas);
app.start();
