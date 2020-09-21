// index.test.ts
import assert from 'assert'
import { IDoom3Tokenizer, Doom3Factory, ETokenType } from '../src/doom3Tokenizer'

describe('parse doom3:', () => {
  
  /**
   * 
   */
  let str = ` //这是开单引号，不是单引号 
numMeshes  5
/*
* joints关键词定义了骨骼动画的bindPose
*/
joints {
	"origin"	-1  ( 0 0 0 )  ( -0.5  -0.5  -0.5 )		
	"Body"	0  ( -12.1038131714  0  79.004776001 )  ( -0.5 -0.5 -0.5 )	// origin
}
`;
  describe('parse int', () => {
    let i = 0;
    test(' return hello rollup ', () => {
      let tokenizer = Doom3Factory.createDoom3Tokenizer();
      tokenizer.setSource(str)
      while(tokenizer.moveNext()){
          if ( tokenizer . current === undefined ) {
                continue ;
          }
          
          if ( tokenizer . current . type === ETokenType . NUMBER ) {
            if(i === 1){
              assert.strictEqual( tokenizer . current . getInt ( ),5)
              i++
            }
          }
          else {
            if(i === 0){
              assert.strictEqual( tokenizer . current . getString ( ),"numMeshes")
              i++
            }
          }
      }
    })
  })
})
