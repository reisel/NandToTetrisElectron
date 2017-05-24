// @flow
/**
 * Created by daniel on 4/17/17.
 */
import { Not } from '../../../../app/utils/HardwareSimulator/Gates/index';
import { testSingleInput } from './Gates';

describe('Not', () => {
  let testNode;
  beforeEach(() => testNode = new Not());
  it('0', () => {
    const value = testSingleInput(testNode, 0);
    expect(value).toEqual(1);
  });
  it('1', () => {
    const value = testSingleInput(testNode, 1);
    expect(value).toEqual(0);
  });
});

