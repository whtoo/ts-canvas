import { mat2d, vec2, Inset } from "../math2d"
import { CanvasMouseEvent, CanvasKeyBoardEvent } from "../application"
import { Sprite2D } from "./Sprite2D";
import { BezierPath, Circle, ConvexPolygon, Ellipse, Grid, Line, Rect, Scale9Grid } from "./shape";
// import { Rect, Circle, Grid, Ellipse , Line  , ConvexPolygon , Scale9Grid  , BezierPath  } from "./shapes";
// import { Sprite2D } from "./sprite2d";

export enum ERenderType {
    CUSTOM,
    STROKE,
    FILL,
    STROKE_FILL,
    CLIP
}

export interface ITransformable {
    x : number;
    y : number;
    // 角度表示方位
    rotation : number;
    
    scaleX : number;
    scaleY : number;
    // 获取全局坐标系矩阵
    getWorldMatrix () : mat2d;
    // 获取局部坐标系矩阵
    getLocalMatrix () : mat2d;
}

export interface IRenderState {
    // 是否可见
    isVisible : boolean;
    // 是否显示坐标系统
    showCoordSystem : boolean;
    // 线宽
    lineWidth : number;
    // 填充类型
    fillStyle : string | CanvasGradient | CanvasPattern;
    // 描边类型
    strokeStyle : string | CanvasGradient | CanvasPattern;
    // 渲染的枚举类型
    renderType : ERenderType;
}

export interface IHittable {
    hitTest (localPt : vec2, transform : ITransformable) : boolean;
}

export interface IDrawable {
    beginDraw(transformable : ITransformable, state: IRenderState, context: CanvasRenderingContext2D) : void;
    draw (transformable : ITransformable, state: IRenderState, context: CanvasRenderingContext2D) : void;
    endDraw(transformable : ITransformable, state: IRenderState, context: CanvasRenderingContext2D) : void;
}

export interface IShape extends IHittable, IDrawable {
    readonly type : string;
    data : any;
}

export interface ISpriteContainer {
    name : string ;
    // 添加一个精灵到容器
    addSprite ( sprite : ISprite ) : ISpriteContainer ;
    // 从容器删除一个精灵
    removeSprite ( sprite : ISprite ) : boolean ;
    // 清空整个容器
    removeAll ( includeThis : boolean  ) : void ;
    // 根据精灵获取索引号，如果没找到精灵，返回-1
    getSpriteIndex ( sprite : ISprite ) : number ;
    // 根据索引号，从容器中找到精灵
    getSprite ( idx : number ) : ISprite ;
    // 获取精灵的数量
    getSpriteCount ( ) : number ;
    getParentSprite ( ) : ISprite | undefined ;
    readonly sprite : ISprite | undefined ;
}

export enum EOrder {
    PREORDER,
    POSTORDER
}

export type UpdateEventHandler = ( ( spr : ISprite , mesc : number, diffSec : number , travelOrder : EOrder ) => void ) ;
export type MouseEventHandler = ( ( spr : ISprite , evt : CanvasMouseEvent  ) => void ) ;
export type KeyboardEventHandler = ( ( spr : ISprite , evt : CanvasKeyBoardEvent  ) => void ) ;
export type RenderEventHandler = ( spr : ISprite , context : CanvasRenderingContext2D , renderOreder : EOrder ) => void ;

export interface ISprite extends ITransformable , IRenderState {
    name : string ;  // 当前精灵的名称
    shape : IShape ;  
    owner : ISpriteContainer ; //双向关联
    data : any ; // 附加数据
    // 点选测试
    hitTest ( localPt : vec2 ) : boolean ; 
    update ( mesc : number ,  diff : number , order : EOrder ) : void ; 
    draw ( context : CanvasRenderingContext2D ) : void ; 

    mouseEvent : MouseEventHandler | null ;
    keyEvent : KeyboardEventHandler | null ;
    updateEvent : UpdateEventHandler | null ;
    renderEvent : RenderEventHandler | null ;
}

// 进行事件、更新、绘制命令分发的接口
// 接收到分发命令的精灵都存储在ISpriteContainer容器中
export interface IDispatcher {

    // 只读的类型为ISpriteContainer
    // 接口中所有的`dispacth_`开头的方法都是针对ISpriteContainer接口进行分发的
    readonly container : ISpriteContainer ;
    // 遍历ISpriteContainer容器，进行update分发
    dispatchUpdate ( msec : number , diffSec : number ) : void ;
    // 遍历ISpriteContainer容器，进行draw分发
    dispatchDraw ( context : CanvasRenderingContext2D ) : void ;
    // 遍历ISpriteContainer容器，进行鼠标事件的分发
    dispatchMouseEvent ( evt : CanvasMouseEvent ) : void ;
    // 遍历ISpriteContainer容器，进行键盘事件的分发
    dispatchKeyEvent ( evt: CanvasKeyBoardEvent ) : void ;
}
export enum EImageFillType {
    NONE ,      
    STRETCH ,   
    REPEAT ,    
    REPEAT_X ,  
    REPEAT_Y 
}

export class Scale9Data {
    public image : HTMLImageElement ;
    private _inset : Inset ;

    public set inset ( value : Inset )  {
        this . _inset = value ;
    }

    public get leftMargin ( ) : number {
        return this . _inset . leftMargin ;
    }

    public get rightMargin ( ) : number {
        return this . _inset . rightMargin ;
    }

    public get topMargin ( ) : number {
        return this . _inset . topMargin ;
    }

    public get bottomMargin ( ) : number {
        return this . _inset . bottomMargin ;
    }

    public constructor ( image : HTMLImageElement , inset : Inset ) {
        this . image = image ;
        this . _inset = inset ;
    }
}

// DONE: Building Factory clz
export class SpriteFactory {

    public static createGrid ( w : number , h : number , xStep  = 10, yStep  = 10 ) : IShape {
        return new Grid ( w , h , xStep , yStep ) ;
    }

    public static createCircle ( radius : number ) : IShape {
        return new Circle ( radius ) ;
    }

    public static createRect ( w : number , h : number , u  = 0 , v  = 0) : IShape {
        return new Rect ( w , h , u , v ) ;
    }

    public static createEllipse ( radiusX : number , radiusY : number ) : IShape {
        return new Ellipse ( radiusX , radiusY ) ;
    }

    public static createPolygon ( points : vec2 [ ] ) : IShape {
        if ( points . length < 3 ) {
            throw new Error ( "多边形顶点数量必须大于或等于3!!!") ;
        } 
        return new ConvexPolygon ( points ) ;
    }

    public static createScale9Grid ( data : Scale9Data , width : number ,  height : number , u  = 0 , v  = 0 ) : IShape {
        return new Scale9Grid ( data , width , height ,u , v  ) ;
    }

    public static createLine ( start : vec2 , end : vec2 ) : IShape {
        const line : Line = new Line ( ) ;
        line . start = start ;
        line . end = end ;
        return line ;
    }

    public static createXLine ( len  = 10 , t  = 0 ) : IShape {
        return new Line ( len , t ) ;
    }

    public static createBezierPath ( points : vec2 [ ] , isCubic  = false ) : IShape {
        return new BezierPath ( points , isCubic ) ;
    }

    public static createSprite ( shape: IShape , name  = '' ) : ISprite {
        const spr : ISprite = new Sprite2D ( shape , name ) ;
        return spr ;
    }

    public static createISprite ( shape: IShape  , x = 0, y = 0, rotation = 0, scaleX = 1.0, scaleY = 1.0 , name  = ' '  ): ISprite {
        const spr : ISprite = new Sprite2D ( shape , name ) ;
        spr . x = x ;
        spr . y = y ;
        spr . rotation = rotation ;
        spr. scaleX = scaleX ;
        spr. scaleY = scaleY ;
        return spr ;
    }
}
