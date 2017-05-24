// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class Dmux extends Node {
  config = {
    inputs: 2,
    outputs: 2
  };
  compute() {
    const input = this.inputs(0) & 1;
    const sel = this.inputs(1) & 1;
    this.outputs[0] = (sel === 0 ? input : 0);
    this.outputs[1] = (sel === 0 ? 0 : input);
  }
}
