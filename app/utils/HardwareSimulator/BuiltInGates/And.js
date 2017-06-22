// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class And extends Node {
  config = {
    pins: {
      inputs: [1, 1],
      outputs: [1]
    }
  };
  compute() {
    this.setOutput(0, this.inputs(0) & this.inputs(1));
  }
}
