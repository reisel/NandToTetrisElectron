// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from '../Gates/Node';

export default class Output extends Node {
  value: boolean;
  compute() {
    this.value = this.inputs(0);
  }
}
