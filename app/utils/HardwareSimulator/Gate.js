/**
 * Created by daniel on 6/20/17.
 */
import Node from './Node';
import GateClass from './GateCalss';

export default class Gate {

  static TRUE_NODE = new Node(-1);
  static FALSE_NODE = new Node(0);
  static CLOCK_NODE = new Node();

  inputPins;
  outputPins;
  gateClass;
  isDirty;
  reCompute = () => {};
  clockUp = () => {};
  clockDown = () => {};
  setDirty()  {
    this.isDirty = true;
  }
  getGateClass() {
    return this.gateClass;
  }
  getNode(name) {
    let result;

    const type = this.gateClass.getPinType(name);
    const index = this.gateClass.getPinNumber(name);
    switch (type) {
      case GateClass.INPUT_PIN_TYPE:
        result = this.inputPins[index];
        break;
      case GateClass.OUTPUT_PIN_TYPE:
        result = this.outputPins[index];
        break;
    }

    return result;
  }

/**
 * Returns the input pins.
 */
  getInputNodes() {
    return this.inputPins;
  }

/**
 * Returns the output pins.
 */
  getOutputNodes() {
    return this.outputPins;
  }

/**
 * Recomputes the gate's outputs if inputs changed since the last computation.
 */
  eval() {
    if (this.isDirty) {
      this.doEval();
    }
  }

/**
 * Recomputes the gate's outputs.
 */
  doEval() {
    this.isDirty = false;
    this.reCompute();
  }

/**
 * First computes the gate's output (from non-clocked information) and then updates
 * the internal state of the gate (which doesn't affect the outputs)
 */
  tick() {
    this.doEval();
    this.clockUp();
  }

/**
 * First updates the gate's outputs according to the internal state of the gate, and
 * then computes the outputs from non-clocked information.
 */
  tock() {
    this.clockDown();
    this.doEval();
  }

}
