// @flow
/**
 * Created by daniel on 4/17/17.
 */
import { Nand } from '../../../../app/utils/HardwareSimulator/Gates/index';
import { testTwoInputs } from './Gates';

describe('Nand', () => {
  let testNode;
  beforeEach(() => testNode = new Nand());
  it('0', () => {
    const value = testTwoInputs(testNode, 0);
    expect(value).toEqual(1);
  });
  it('1', () => {
    const value = testTwoInputs(testNode, 1);
    expect(value).toEqual(1);
  });
  it('2', () => {
    const value = testTwoInputs(testNode, 2);
    expect(value).toEqual(1);
  });
  it('3', () => {
    const value = testTwoInputs(testNode, 3);
    expect(value).toEqual(0);
  });
});

