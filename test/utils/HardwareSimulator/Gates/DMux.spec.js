/**
 * Created by daniel on 4/17/17.
 */
import { testGate } from './Gates';
import DMux from "../../../../app/utils/HardwareSimulator/Gates/DMux";

describe('DMux', () => {
  let testNode;
  beforeEach(() => testNode = new DMux());
  it('0', () => {
    const value = testGate(testNode, { inputValues: [0, 0] });
    expect(value).toEqual([0, 0]);
  });
  it('1', () => {
    const value = testGate(testNode, { inputValues: [1, 0] });
    expect(value).toEqual([1, 0]);
  });
  it('2', () => {
    const value = testGate(testNode, { inputValues: [0, 1] });
    expect(value).toEqual([0, 0]);
  });
  it('3', () => {
    const value = testGate(testNode, { inputValues: [1, 1] });
    expect(value).toEqual([0, 1]);
  });
});

