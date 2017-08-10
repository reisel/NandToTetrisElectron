// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Gates/Node';


export default class Nand extends Node {
  reCompute() {
    const a = this.inputPins[0].get();
    const b = this.inputPins[1].get();
    this.outputPins[0].set((0x1 - (a & b)) & 0xffff);
  }
}
