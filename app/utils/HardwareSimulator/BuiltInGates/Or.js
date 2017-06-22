// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Node';

export default class Or extends Node {
  compute() {
    this.setOutput(0, this.inputs(0) | this.inputs(1));
  }
}
