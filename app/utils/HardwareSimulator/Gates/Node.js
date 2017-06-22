/**
 * Created by daniel on 5/21/17.
 */

/**
 * A node - a wire (or a complete bus) in a circuit.
 */
export default class Node {

  // the value of the node
  value;

  // listeners list
  listeners;

  constructor(initialValue) {
    this.value = initialValue;
  }

/**
 * Adds the given node as a listener.
 */
  addListener(node) {
    if (!this.listeners)    { this.listeners = new Set(); }

    this.listeners.add(node);
  }

/**
 * Removes the given node from being a listener.
 */
  removeListener(node) {
    if (this.listeners)    { this.listeners.delete(node); }
  }

/**
 * Returns the value of this node.
 */
  get() {
    return this.value;
  }

/**
 * Sets the node's value with the given value.
 * Notifies the listeners on the change by calling their set() method.
 */
  set(value) {
    if (this.value !== value) {
      this.value = value;

      if (this.listeners) {
        this.listeners.forEach(node => node.set(this.get()));
      }
    }
  }
}
