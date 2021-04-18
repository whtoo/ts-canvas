// index.test.ts

import assert from 'assert'
import { myFirstFunc } from '../src/lib'

describe('validate:', () => {
  /**
   * myFirstFunc
   */
  describe('myFirstFunc', () => {
    test(' return hello rollup ', () => {
      assert.strictEqual(myFirstFunc('rollup'), 'hello rollup')
    })
  })
})
