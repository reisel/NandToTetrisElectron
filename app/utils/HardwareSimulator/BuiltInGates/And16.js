// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Gates/Node';

export default class And16 extends Node {
  config = {
    pins: {
      inputs: [16, 16],
      outputs: [16]
    }
  };
  compute() {
    this.setOutput(0, this.inputs(0) & this.inputs(1));
  }
}
