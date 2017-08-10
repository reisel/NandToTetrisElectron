/**
 * Created by daniel on 4/17/17.
 */
import GatesManager from '../../../../app/utils/HardwareSimulator/Gates/GatesManager';
import HDLTokenizer from '../../../../app/utils/HardwareSimulator/Gates/HDLTokenizer';
import GateClass from '../../../../app/utils/HardwareSimulator/Gates/GateCalss';

describe('And', () => {
  let instance;
  beforeAll(() => {
    const gm = GatesManager.getInstance();
    gm.setBuiltInDir('/Users/daniel/Projects/Nand2TetrisElectron/resources/builtInChips');
    gm.setWorkingDir('/Users/daniel/Projects/Nand2TetrisElectron/resources');
    const input = new HDLTokenizer(`${__dirname}/../assets/And.hdl`);
    const result = GateClass.readHDL(input, 'And');
    instance = result;
  })
  it('input Pins Name', () => {
    expect(instance.inputPinsInfo.map(o => o.name)).toEqual(['a', 'b']);
  });
  it('input Pins widths', () => {
    expect(instance.inputPinsInfo.map(o => o.width)).toEqual([1, 1]);
  });
  it('names to numbers', () => {
    expect(instance.namesToNumbers).toEqual({ a: 0, b: 1, nandout: 0, out: 0 });
  });
  it('names to types', () => {
    expect(instance.namesToTypes).toEqual({ a: 1, b: 1, nandout: 3, out: 2 });
  });
});

