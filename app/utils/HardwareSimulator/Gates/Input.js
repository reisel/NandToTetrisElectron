// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class Input extends Node {
  value: number;

  compute() {
    this.outputs[0] = this.value;
  }
  setValue(value: number): void {
    this.value = value;
    this.update();
  }
}
