// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class DMux extends Node {
  config = {
    pins: {
      inputs: [1, 1],
      outputs: [1, 1],
    }
  };
  compute() {
    const input = this.inputs(0);
    const sel = this.inputs(1);
    this.setOutput(0, sel === 0 ? input : 0);
    this.setOutput(1, sel === 0 ? 0 : input);
  }
}
