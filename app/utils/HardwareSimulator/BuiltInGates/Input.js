/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Gates/Node';

export default class Input extends Node {
  value: number;
  config = {
    pins: {
      inputs: [256],
      outputs: [256]
    }
  };
  compute() {
    this.setOutput(0, this.value);
  }
  setValue(value: number): void {
    this.value = value;
    this.isValid = false;
  }
}
