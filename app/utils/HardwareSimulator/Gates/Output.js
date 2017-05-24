// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class Input extends Node {
  value: boolean;
  compute() {
    this.value = this.inputs(0);
  }
}
