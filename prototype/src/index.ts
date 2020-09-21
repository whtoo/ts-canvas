import $ from 'jquery'
/**
 * 
 * @param {HTMLCanvasElement | null} ctx
 * @param x 
 * @param y 
 * @param r 
 * @param s 
 * @param e 
 * @param clockwise 
 */
function drawCircle(ctx,x,y,r,s,e,clockwise){
    ctx?.beginPath();
    ctx?.arc(x,y,r,s,e,clockwise)
    ctx?.stroke();
}
$.when($.ready).then(()=> {
    const canvas : HTMLCanvasElement = $('#canvas').get()[0] as HTMLCanvasElement
    const ctx = canvas.getContext('2d');
    const PI = Math.PI * 2;
    drawCircle(ctx,70,70,40,0,PI,false)
    drawCircle(ctx,160,70,40,0,PI,false)
    drawCircle(ctx,250,70,40,0,PI,false)
    drawCircle(ctx,110,110,40,0,PI,false)
    drawCircle(ctx,200,110,40,0,PI,false)
    ctx?.beginPath()
    ctx?.moveTo(60,10)
    ctx?.lineTo(200,10)
    ctx?.lineTo(200,100)
    ctx?.lineTo(60,100)
    ctx?.lineTo(60,10)
    ctx?.stroke()
})