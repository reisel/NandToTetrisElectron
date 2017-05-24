/**
 * Created by daniel on 5/21/17.
 */
import Wire from './Wire';

export default class Node {
  inputWires;
  outputWires;
  isValid;
  outputs;
  masks = {
    outputs: [],
    inputs: [],
  };
  config = {
    pins: {
      inputs: [1],
      outputs: [1],
    }
  };
  calcMasks() {
    Object.keys(this.config.pins)
      .forEach(type => {
        this.masks[type] = this.config.pins[type].map(buffer => (2 ** buffer) - 1);
      });
  }
  setOutput(idx, value) {
    this.outputs[idx] = value & this.masks.outputs[idx];
  }
  connectInput(idx: number, wire: Wire): void {
    this.inputWires[idx] = wire;
    wire.outputs.push(this);
  }
  connectOutput(idx: number, wire: Wire): void {
    if (!this.outputWires[idx]) this.outputWires[idx] = [];
    this.outputWires[idx].push(wire);
    wire.input = this;
  }
  compute(): void {
    // abstract method
    this.outputs = [0];
  }
  update(): Array<Wire> {
    this.compute();
    this.isValid = true;
    const invalidWires = [];
    this.outputWires.forEach((wires, idx) => wires
      .forEach(wire => {
        wire.setValue(this.outputs[idx]);
        invalidWires.push(wire);
      }));
    return invalidWires;
  }
  inputs(idx: number): number {
    return this.inputWires[idx].getValue();
  }
  invalidate(): void {
    this.isValid = false;
  }
  constructor() {
    this.inputWires = [];
    this.outputWires = [];
    this.outputs = [];
    this.calcMasks();
  }
}
