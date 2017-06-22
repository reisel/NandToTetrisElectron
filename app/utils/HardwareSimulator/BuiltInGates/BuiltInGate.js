/**
 * Created by daniel on 6/22/17.
 */
import Gate from '../Gate';
/**
 * A BuiltIn Gate. The base class for all gates which are implemented in java.
 */

export default class BuiltInGate extends Gate {

  /**
   * Initializes the gate
   */
  init(inputPins, outputPins, gateClass) {
    this.inputPins = inputPins;
    this.outputPins = outputPins;
    this.gateClass = gateClass;
    this.setDirty();
  }
}
