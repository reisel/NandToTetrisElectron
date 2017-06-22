/**
 * Created by daniel on 6/22/17.
 */

import Node from './Node';
import { pad } from '../../Utils';

/**
 * A Node that receives a target node and low & high bit indice of a sub bus. When the
 * value of this node changes, it only changes the appropriate sub bus of the target node.
 */
export default class SubBusListeningAdapter extends Node {

  low;
  high;

  /**
   * Constructs a new SubBusListeningAdapter with the given target node and the
   * low & high bit indice of the sub bus.
   */
  constructor(targetNode,  low,  high) {
    super();
    this.low = low;
    this.high = high;
    this.targetNode = targetNode;
  }

/**
 * Sets the node's value with the given value.
 * Notifies the listeners on the change by calling their set() method.
 */
  set(value) {
    const x = pad(this.targetNode.get().toString(2), 16);
    const y = pad(value.toString(2), 16);
    const res = x.substring(0, this.low) + y.substring(this.low, this.high + 1) + x.substring(this.high + 1);
    this.targetNode.set(parseInt(res, 2));
  }
}
