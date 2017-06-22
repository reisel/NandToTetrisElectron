/**
 * Created by daniel on 4/17/17.
 */
import { Input, Output } from '../../../../app/utils/HardwareSimulator/Gates/index';
import Wire from '../../../../app/utils/HardwareSimulator/Wire';
import Node from '../../../../app/utils/HardwareSimulator/Node';
import GateManager from '../../../../app/utils/HardwareSimulator/GateManager';

export const testTwoInputs = (testNode: Node, test: number) => {
  const input0Wire = new Wire();
  const input1Wire = new Wire();
  const outputWire = new Wire();
  const input0 = new Input();
  const input1 = new Input();
  const output = new Output();
  const twoInputTests = [
    () => {
      input0.setValue(0);
      input1.setValue(0);
      compute2inputs();
    },
    () => {
      input0.setValue(1);
      input1.setValue(0);
      compute2inputs();
    },
    () => {
      input0.setValue(0);
      input1.setValue(1);
      compute2inputs();
    },
    () => {
      input0.setValue(1);
      input1.setValue(1);
      compute2inputs();
    }
  ];
  const compute2inputs = () => {
    testNode.connectInput(0, input0Wire);
    testNode.connectInput(1, input1Wire);
    input0.connectOutput(0, input0Wire);
    input1.connectOutput(0, input1Wire);
    testNode.connectOutput(0, outputWire);
    output.connectInput(0, outputWire);
    const gateManager = new GateManager([input0, input1]);
    gateManager.compute();
  };
  twoInputTests[test]();
  return output.value;
};
export const testSingleInput = (testNode: Node, test: number) => {
  const input0Wire = new Wire();
  const outputWire = new Wire();
  const input0 = new Input();
  const output = new Output();
  const twoInputTests = [
    () => {
      input0.setValue(0);
      compute2inputs();
    },
    () => {
      input0.setValue(1);
      compute2inputs();
    }
  ];
  const compute2inputs = () => {
    testNode.connectInput(0, input0Wire);
    input0.connectOutput(0, input0Wire);
    testNode.connectOutput(0, outputWire);
    output.connectInput(0, outputWire);
    const gateManager = new GateManager([input0]);
    gateManager.compute();
  };
  twoInputTests[test]();
  return output.value;
};
export const testGate = (testNode, config) => {
  const { config: { pins: { inputs, outputs } } } = testNode;
  const inputObjects  = inputs.map(() => new Input());
  const inputWires  = inputs.map(() => new Wire());
  const outputObjects = outputs.map(() => new Output());
  const outputWires = outputs.map(() => new Wire());
  outputWires.forEach((wire, idx) => {
    outputObjects[idx].connectInput(0, wire);
    testNode.connectOutput(idx, wire);
  });
  inputWires.forEach((wire, idx) => {
    inputObjects[idx].connectOutput(0, wire);
    testNode.connectInput(idx, wire);
  });
  inputObjects.forEach((input, idx) => {
    input.setValue(config.inputValues[idx]);
  });
  const gateManager = new GateManager(inputObjects);
  gateManager.compute();
  return outputObjects.map(output => output.value);
};
