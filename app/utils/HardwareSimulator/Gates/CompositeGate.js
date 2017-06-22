/**
 * Created by daniel on 6/22/17.
 */

import Gate from './Gate';
import CompositeGateClass from './CompositeGateClass';

export default class CompositeGate extends Gate {

  // the internal pins
  internalPins;

  // The contained parts (Gates), sorted in topological order.
  parts;

  clockUp() {
    if (this.gateClass.isClocked) {
      this.parts.forEach(part => part.tick());
    }
  }

  clockDown() {
    if (this.gateClass.isClocked) {
      this.parts.forEach(part => part.tock());
    }
  }

  reCompute() {
    this.parts.forEach(part => part.eval());
  }

  /**
   * Returns the node according to the given node name (may be input, output or internal).
   * If doesn't exist, returns null.
   */
  getNode(name) {
    let result = super.getNode(name);

    if (!result) {
      const type = this.gateClass.getPinType(name);
      const index = this.gateClass.getPinNumber(name);
      if (type === CompositeGateClass.INTERNAL_PIN_TYPE) {
        result = this.internalPins[index];
      }
    }
    return result;
  }

/**
 * Returns the internal pins.
 */
  getInternalNodes() {
    return this.internalPins;
  }

/**
 * Returns the parts (internal gates) of this gate, sorted in topological order.
 */
  getParts() {
    return this.parts;
  }

/**
 * Initializes the gate
 */
  init(inputPins, outputPins, internalPins, parts, gateClass) {
    this.inputPins = inputPins;
    this.outputPins = outputPins;
    this.internalPins = internalPins;
    this.parts = parts;
    this.gateClass = gateClass;
    this.setDirty();
  }

}
