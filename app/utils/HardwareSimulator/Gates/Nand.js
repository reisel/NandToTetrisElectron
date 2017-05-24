// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';


export default class Nand extends Node {
  compute() {
    this.outputs[0] = ~(this.inputs(0) & this.inputs(1)) & 1;
  }
}
