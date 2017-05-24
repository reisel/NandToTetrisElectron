// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Input from './Gates/Input';

export default class GateManager {
  inputs: Array<Input>;
  constructor(inputs: Array<Input>) {
    this.inputs = inputs;
  }
  compute() {
    const wires = [];
    const nodes = [...this.inputs];
    while (nodes.length) {
      while (nodes.length) {
        const node = nodes.pop();
        wires.push(...node.update());
      }
      while (wires.length) {
        const wire = wires.pop();
        nodes.push(...wire.outputs);
      }
    }
  }

}
