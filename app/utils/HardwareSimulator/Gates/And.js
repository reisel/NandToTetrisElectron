// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class And extends Node {
  config = {
    inputs: 2,
    outputs: 1
  };
  compute() {
    this.outputs[0] = (this.inputs(0) & this.inputs(1)) & 1;
  }
}
