import { vec2 } from './math2d'
export enum EInputEventType {
    MOUSEEVENT,
    MOUSEDOWN,
    MOUSEUP,
    MOUSEMOVE,
    MOUSEDRAG,
    KEYUP,
    KEYDOWN,
    KEYPRESS
}

export class CanvasInputEvent {
    public altKey;
    public ctrl;
    public shiftKey;
    public type;
    public constructor(type: EInputEventType,altKey = false,ctrlKey = false,shifKey = false){
        this.type = type;
        this.altKey = altKey;
        this.ctrl = ctrlKey;
        this.shiftKey = shifKey;
    }
}

export type TimerCallback = ( id:number,data:any) => void;


class Timer {
    public id = -1;
    public enabled = false;
    public callback : TimerCallback;
    public callbackData : any = undefined;

    public countdown = 0;
    public timeout = 0;
    public onlyOnce = false;

    constructor(callback : TimerCallback) {
        this.callback = callback;
    }
}

export class CanvasMouseEvent extends CanvasInputEvent {
    public button;
    public canvasPosition;
    public localPosition;
    public hasLocalPosition;

    public constructor(type: EInputEventType,canvasPos:vec2,button: number,altKey = false,ctrlKey = false,shiftKey = false) {
        super(type,altKey,ctrlKey,shiftKey)
        this.canvasPosition = canvasPos;
        this.button = button;
        this.hasLocalPosition = false;
        this.localPosition = vec2.create();
    }
}

export class CanvasKeyBoardEvent extends CanvasInputEvent {
    public key;
    public keyCode;
    public repeat;

    public constructor(type:EInputEventType,key:string,keyCode:number,repeat=false,altKey  = false , ctrlKey  = false , shiftKey  = false ) {
        super(type,altKey,ctrlKey,shiftKey)
        this.key = key;
        this.keyCode = keyCode;
        this.repeat = repeat;
    }
}

export class Application implements EventListenerObject {
    public timers = new Array<Timer>();
    private _timeId = -1;
    private _fps = 0;

    public canvas : HTMLCanvasElement;
    public isSupportMouseMove : boolean;
    protected _isMouseDown : boolean;

    protected _start = false;
    protected _requestId = -1;

    protected _lastTime! : number;
    protected _startTime! : number;

  public constructor ( canvas : HTMLCanvasElement  ) {
        this . canvas = canvas ;
        this . canvas . addEventListener ( "mousedown" , this , false ) ;
        this . canvas . addEventListener ( "mouseup" , this , false ) ;
        this . canvas . addEventListener ( "mousemove" , this , false ) ;
        window . addEventListener ( "keydown" , this , false ) ;
        window . addEventListener ( "keyup" , this , false ) ;
        window . addEventListener ( "keypress" , this , false ) ;
        this . _isMouseDown = false ;
        this . isSupportMouseMove = false ;
    }

    public isRunning ( ) : boolean {
        return this . _start ;
    }

    public get fps ( ) {
        return this . _fps ;
    }

    public start  ( ) : void {
        if ( ! this . _start ) {
            this . _start = true ;
            this . _lastTime = -1 ;
            this . _startTime = -1 ;
            this . _requestId = requestAnimationFrame ( ( msec : number ) : void => {
                this . step ( msec ) 
            } ) ;
        }
    }

    protected step ( timeStamp : number ) : void {
       if ( this . _startTime === -1 ) this . _startTime = timeStamp ;
       if(  this . _lastTime === -1 ) this . _lastTime = timeStamp ;
       const elapsedMsec = timeStamp - this . _startTime ;
       let intervalSec = ( timeStamp - this . _lastTime ) ;
       if ( intervalSec !== 0 ) {
           this . _fps = 1000.0 / intervalSec ;
       }
       intervalSec /= 1000.0 ;
       this ._lastTime = timeStamp ;
       this . _handleTimers ( intervalSec ) ;
       this . update ( elapsedMsec , intervalSec ) ;
       this . render ( ) ;
       
       requestAnimationFrame ( this . step . bind ( this ) ) ;
    }

    public stop  ( ) : void {
        if ( this . _start ) 
        {
            window . cancelAnimationFrame ( this . _requestId ) ;
            this . _requestId = -1 ;
            this . _lastTime = -1 ; 
            this . _startTime = -1 ;
            this . _start = false ;   
        }
    }

    public update ( elapsedMsec : number , intervalSec : number ) : void { 
        console.log("update calling!")
    }
    public render  ( ) : void {
        console.log("render calling!")
     }
    public handleEvent ( evt  : Event )  : void {
        switch ( evt . type ) {
            case "mousedown" :
                this . _isMouseDown = true ;
                this . dispatchMouseDown ( this . _toCanvasMouseEvent ( evt , EInputEventType . MOUSEDOWN ) ) ;
                break ;
            case "mouseup" :
                this . _isMouseDown = false ;
                this . dispatchMouseUp ( this . _toCanvasMouseEvent ( evt , EInputEventType . MOUSEUP ) ) ;
                break ;
            case "mousemove" :
                if ( this . isSupportMouseMove ) {
                    this . dispatchMouseMove ( this . _toCanvasMouseEvent ( evt , EInputEventType . MOUSEMOVE ) ) ;
                }
                if ( this . _isMouseDown ) {
                    this . dispatchMouseDrag ( this . _toCanvasMouseEvent ( evt , EInputEventType . MOUSEDRAG ) ) ;
                }
                break ;
            case "keypress" :
                this . dispatchKeyPress ( this . _toCanvasKeyBoardEvent ( evt , EInputEventType . KEYPRESS ) ) ;
                break ;
            case "keydown" :
                this . dispatchKeyDown ( this . _toCanvasKeyBoardEvent ( evt , EInputEventType . KEYDOWN ) ) ;
                break ;
            case "keyup" :
                this . dispatchKeyUp ( this . _toCanvasKeyBoardEvent ( evt , EInputEventType . KEYUP ) ) ;
                break ;
        }
    }

    protected dispatchMouseDown ( evt : CanvasMouseEvent ) : void {
        return ;
    }

    protected dispatchMouseUp ( evt : CanvasMouseEvent ) : void {
        return ;
    }

    protected dispatchMouseMove ( evt : CanvasMouseEvent ) : void {
        return ;
    }

    protected dispatchMouseDrag ( evt : CanvasMouseEvent ) : void {
        return ;
    }

    protected dispatchKeyDown ( evt : CanvasKeyBoardEvent ) : void {
        return ;
    }

    protected dispatchKeyUp ( evt : CanvasKeyBoardEvent ) : void {
        return ;
    }

    protected dispatchKeyPress ( evt : CanvasKeyBoardEvent ) : void {
        return ;
    }

    private _viewportToCanvasCoordinate ( evt : MouseEvent ) : vec2 {
        if ( this . canvas ) {
            const rect : ClientRect = this . canvas . getBoundingClientRect ( ) ;
            if ( evt . type === "mousedown" ) {
                console . log (" boundingClientRect : " + JSON . stringify ( rect ) ) ;
                console . log ( " clientX : " + evt . clientX + " clientY : " + evt.clientY ) ;
            }
            if ( evt . target ) 
            { 
                let borderLeftWidth  = 0 ;  
                let borderTopWidth  = 0 ;   
                let paddingLeft  = 0 ;      
                let paddingTop  = 0 ;       
                const decl : CSSStyleDeclaration  = window . getComputedStyle ( evt . target as HTMLElement ) ;
                let strNumber : string | null =  decl . borderLeftWidth ;

                if ( strNumber !== null ) {
                    borderLeftWidth  = parseInt ( strNumber , 10 ) ;
                }

                if ( strNumber !== null ) {
                    borderTopWidth = parseInt ( strNumber , 10 ) ;
                }

                strNumber = decl . paddingLeft ;
                if ( strNumber !== null ) {
                    paddingLeft = parseInt(strNumber,10);
                }

                strNumber = decl . paddingTop ;
                if ( strNumber !== null ) {
                    paddingTop = parseInt ( strNumber , 10) ;
                }
            
                const x : number  = evt . clientX - rect . left - borderLeftWidth - paddingLeft ;
                const y : number  = evt . clientY - rect . top - borderTopWidth - paddingTop ;

                const pos : vec2 = vec2 . create ( x , y ) ;    
            
                if ( evt . type === "mousedown" ) {
                    console . log ( " borderLeftWidth : " + borderLeftWidth + " borderTopWidth : " + borderTopWidth ) ;
                    console . log ( " paddingLeft : " + paddingLeft + " paddingTop : " + paddingTop ) ;
                    console . log ( " 变换后的canvasPosition : " + pos . toString( ) ) ;
                }

                return pos ;
             }

             alert("canvas为null");
             throw new Error("canvas为null");
        }
        
        alert("evt . target为null");
        throw new Error("evt . target为null");
    }
    
    private _toCanvasMouseEvent ( evt : Event , type : EInputEventType ) : CanvasMouseEvent {
        const event : MouseEvent = evt as MouseEvent ;
        const mousePosition : vec2 = this . _viewportToCanvasCoordinate ( event ) ;
        const canvasMouseEvent : CanvasMouseEvent = new CanvasMouseEvent ( type , mousePosition , event . button , event . altKey , event . ctrlKey , event . shiftKey ) ;
        return canvasMouseEvent ;
    }

    private _toCanvasKeyBoardEvent ( evt : Event , type : EInputEventType  ) : CanvasKeyBoardEvent {
        const event : KeyboardEvent = evt as KeyboardEvent ;
        const canvasKeyboardEvent : CanvasKeyBoardEvent = new CanvasKeyBoardEvent ( type , event . key , event . keyCode , event . repeat , event . altKey , event . ctrlKey , event . shiftKey ) ;
        return canvasKeyboardEvent ;
    }

    public addTimer ( callback : TimerCallback , timeout  = 1.0 , onlyOnce  = false ,data : any = undefined ) : number {
        const found  = false ;
        for ( let i = 0 ; i < this . timers . length ; i ++ ) {
            const timer : Timer = this . timers [ i ] ;
            if ( timer . enabled === false ) {
                timer . callback = callback ;
                timer . callbackData = data ;
                timer . timeout = timeout ;
                timer . countdown = timeout ;
                timer . enabled = true ;
                timer . onlyOnce = onlyOnce ;
                return timer . id ;
            }
        }

        const timer = new Timer ( callback ) ;
        timer . callbackData = data ;
        timer . timeout = timeout ;
        timer . countdown = timeout ;
        timer . enabled = true ;
        timer . id = ++ this . _timeId ; 
        timer . onlyOnce = onlyOnce ; 
      
        this . timers . push ( timer ) ;
        return timer . id ;
    }

    public removeTimer ( id : number ) : boolean {
        let found  = false ;
        for ( let i = 0 ; i < this . timers . length ; i ++ ) {
            if ( this . timers [ i ] . id === id ) {
                const timer : Timer = this . timers [ i ] ;
                timer . enabled = false ; 
                found = true ;
                break ;
            }
        }
        return found ;
    }

    private _handleTimers ( intervalSec : number ) :  void {
        for ( let i = 0 ; i < this . timers . length ; i ++ ) {
            const timer : Timer = this . timers [ i ] ;
            if( timer . enabled === false ) {
                continue ;
            }
            timer . countdown -= intervalSec ;
            if ( timer . countdown < 0.0 ) {
                timer . callback ( timer . id , timer . callbackData ) ;
                if ( timer . onlyOnce === false ) {
                    timer . countdown = timer . timeout ; 
                } else {  
                    this . removeTimer ( timer . id ) ;
                }
            }
        }
    }
}

export class Canvas2DApplication extends Application {
    public context2D : CanvasRenderingContext2D | null ;
    public constructor ( canvas : HTMLCanvasElement  ) {
        super( canvas ) ;
        this . context2D = this . canvas . getContext( "2d" ) ;
    }
}

export class WebGLApplication extends Application {
    public context3D : WebGLRenderingContext | null ;
    public constructor ( canvas : HTMLCanvasElement , contextAttributes ? : WebGLContextAttributes ) {
        super( canvas ) ;
        this . context3D = this . canvas . getContext( "webgl" , contextAttributes ) ;
        if ( this . context3D === null ) {
            this . context3D = this.canvas.getContext( "experimental-webgl" , contextAttributes ) as WebGLRenderingContext;
            if ( this . context3D === null ) {
                alert ( " 无法创建WebGLRenderingContext上下文对象 " ) ;
                throw new Error ( " 无法创建WebGLRenderingContext上下文对象 " ) ;
            }
        }
    }
}