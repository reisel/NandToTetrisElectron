/**
 * Created by daniel on 6/22/17.
 */
import Node from './Node';
/**
 * A node which has a gate, and calls the gate's setDirty() method whenever its (the node's)
 * value changes.
 */
export default class DirtyGateAdapter extends Node {

  // the gate which is affected by this node.
  affectedGate;

  /**
   * Constructs a new DirtyGateAdapter with the given affected gate.
   */
  constructor(gate) {
    super();
    this.affectedGate = gate;
  }

/**
 * Sets the node's value with the given value.
 * Notifies the listeners on the change by calling their set() method.
 */
  set(value) {
    super.set(value);
    this.affectedGate.setDirty();
  }
}
