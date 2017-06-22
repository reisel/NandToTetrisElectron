// @flow
/**
 * Created by daniel on 5/21/17.
 */
import Node from './Node';

export default class Wire {
  input: Node;
  outputs: Array<Node>;
  isValid: boolean;
  value: number;
  getValue(): number {
    return this.value;
  }
  invalidate(): void {
    this.isValid = false;
    this.outputs.forEach(node => node.invalidate());
  }
  setValue(value: number): void {
    if (this.value !== (value & 1)) {
      this.value = value & 1;
      this.invalidate();
    }
  }
  constructor() {
    this.outputs = [];
    this.isValid = false;
  }
}
