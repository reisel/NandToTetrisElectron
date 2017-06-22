/**
 * Created by daniel on 6/22/17.
 */

import Node from './Node';

export default class SubNode extends Node {

  low;
  high;

  /**
   * Constructs a new SubNode with the given low & high sub-bus indice.
   */
  constructor(low,  high) {
    super();
    this.low = low;
    this.high = high;
  }

/**
 * Returns the value of this sub-node.
 */
  get() {
    return parseInt(this.value.toString(2).substring(this.low, this.high + 1), 2);
  }

}
