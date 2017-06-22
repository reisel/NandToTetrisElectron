/**
 * Created by daniel on 6/22/17.
 */

import DirtyGateAdapter from './DirtyGateAdapter';
import GateClass from './GateCalss';
import HDLTokenizer from './HDLTokenizer';

const req = require.context('./BuiltInGates');

const jsClasses = req.keys().reduce((acc, key) => {
  const fileName = key.replace('.js', '');
  acc[fileName] = req(key);
  return acc;
}, {});

export default class BuiltInGateClass extends GateClass {

  // the java class that holds the basic gate functionality
  jsGateClass;

  /**
   * Constructs a new BuiltInGateClass with the given gate name and the HDLTokenizer
   * input which is positioned just after the BUILTIN declaration.
   * The HDL's input and output pin names are also given.
   */
  constructor(gateName, input,  inputPinsInfo,  outputPinsInfo) {
    super(gateName, inputPinsInfo, outputPinsInfo);

    // read js class name
    input.advance();
    if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER) {
      input.HDLError('Missing java class name');
    }

    const classFileName = input.getIdentifier();

    this.jsGateClass = jsClasses[classFileName];

    if (!this.jsGateClass) {
      input.HDLError(`Can't find ${classFileName} class`);
    }


    // read ';' symbol
    input.advance();
    if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ';')) {
      input.HDLError("Missing ';'");
    }

    this.isInputClocked = (new Array(inputPinsInfo.length)).fill(false);
    this.isOutputClocked = (new Array(outputPinsInfo.length)).fill(false);

    input.advance();

    // check if clocked keyword exists
    if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD) {
      if (input.getKeywordType() !== HDLTokenizer.KW_CLOCKED) {
        input.HDLError('Unexpected keyword');
      }

      this.isClocked = true;

      // read clocked input pins list
      const clockedNames = GateClass.readPinNames(input);

      for (let i = 0; i < clockedNames.length; i++) {
        let inputFound = false;
        let outputFound = false;
        // check if clocked name is an input pin
        for (let j = 0; j < this.isInputClocked.length && !inputFound; j++) {
          if (!this.isInputClocked[j]) {
            inputFound = inputPinsInfo[j].name === clockedNames[i];
            this.isInputClocked[j] = inputFound;
          }
        }
        if (!inputFound) {
          // check if clocked name is an output pin
          for (let j = 0; j < this.isOutputClocked.length && !outputFound; j++) {
            if (!this.isOutputClocked[j]) {
              outputFound = outputPinsInfo[j].name.equals(clockedNames[i]);
              this.isOutputClocked[j] = outputFound;
            }
          }
        }
      }

      input.advance();
    }

    if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === '}')) {
      input.HDLError("Missing '}'");
    }
  }

/**
 * Creates and returns a new instance of BuiltInGate.
 */
  newInstance() {
    const inputNodes = (new Array(this.inputPinsInfo.length)).fill(null);
    const outputNodes = (new Array(this.outputPinsInfo.length)).fill(null);

    for (let i = 0; i < inputNodes.length; i++) {
      inputNodes[i] = new Node();
    }
    for (let i = 0; i < outputNodes.length; i++) {
      outputNodes[i] = new Node();
    }
  //eslint-disable-next-line
  const result = new this.jsGateClass();

    result.init(inputNodes, outputNodes, this);


  // Add a DirtyGateAdapter as a listener to all the non-clocked inputs,
  // so the gate will become dirty when one of its non-clocked input changes.
    const adapter = new DirtyGateAdapter(result);
    for (let i = 0; i < this.isInputClocked.length; i++)    {
      if (!this.isInputClocked[i]) {
        inputNodes[i].addListener(adapter);
      }
    }

    return result;
  }
}
