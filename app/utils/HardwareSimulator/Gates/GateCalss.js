/**
 * Created by daniel on 6/22/17.
 */
import HDLException from './HDLException';
import PinInfo from './PinInfo';
import HDLTokenizer from './HDLTokenizer';
import GatesManager from './GatesManager';

const fs = require('fs');
const path = require('path');

export default class GateClass {

  /**
   * The input pin type
   */
  static UNKNOWN_PIN_TYPE = 0;

  /**
   * The input pin type
   */
  static INPUT_PIN_TYPE = 1;

  /**
   * The output pin type
   */
  static OUTPUT_PIN_TYPE = 2;

  // input and output pin names
  inputPinsInfo;
  outputPinsInfo;

  // The name of the gate
  name;

  // true if this gate is clocked
  isClocked;

  // true if the corresponding input is clocked
  isInputClocked;

  // true if the corresponding output is clocked
  isOutputClocked;

  // Mapping from pin names to their types (INPUT_PIN_TYPE, OUTPUT_PIN_TYPE)
  namesToTypes;

  // Mapping from pin names to their numbers (Integer objects)
  namesToNumbers;

  // a table that maps a gate name with its GateClass
  static GateClasses = {};


  // Constructs a new GateCLass (public access through the getGateClass method)
  constructor(gateName, inputPinsInfo, outputPinsInfo) {
    this.namesToTypes = {};
    this.namesToNumbers = {};
    this.name = gateName;
    this.inputPinsInfo = inputPinsInfo;
    this.registerPins(inputPinsInfo, GateClass.INPUT_PIN_TYPE);
    this.outputPinsInfo = outputPinsInfo;
    this.registerPins(outputPinsInfo, GateClass.OUTPUT_PIN_TYPE);
  }

/**
 * Returns the GateClass associated with the given gate name.
 * If containsPath is true, the gate name is assumed to contain the full
 * path of the hdl file. If doesn't contain path, looks for the hdl file
 * according to the directory hierarchy.
 * If the GateClass doesn't exist yet, creates the GateClass by parsing the hdl file.
 */
  static getGateClass(gateName, containsPath) {
    let fileName = null;

  // find hdl file name according to the gate name.
    if (!containsPath) {
      fileName = GatesManager.getInstance().getHDLFileName(gateName);
      if (!fileName)      {
        throw new HDLException(`Chip ${gateName
        } is not found in the working and built in folders`);
      }
    } else {
      if (!fs.existsSync(fileName))      { throw new HDLException(`Chip ${fileName} doesn't exist`); }
      const shortFileName = path.basename(fileName);
      gateName = shortFileName.substring(0, shortFileName.lastIndexOf('.'));
    }

  // Try to find the gate in the "cache"
    let result = this.GateClasses[fileName];

  // gate wasn't found in cache
    if (!result) {
      const input = new HDLTokenizer(fileName);
      result = GateClass.readHDL(input, gateName);
      this.GateClasses[fileName] = result;
    }

    return result;
  }

/**
 * Clears the gate Cache
 */
  static clearGateCache() {
    this.GateClasses = {};
  }

/**
 * Returns true if a GateClass exists for the given gate name.
 */
  static gateClassExists(gateName) {
    const fileName = GatesManager.getInstance().getHDLFileName(gateName);
    return !!this.GateClasses[fileName];
  }

// Loads the HDL from the given input, creates the appropriate GateClass and returns it.
  static readHDL(input, gateName) {
  // read CHIP keyword
    input.advance();
    if (!(input.getTokenType() === HDLTokenizer.TYPE_KEYWORD && input.getKeywordType() === HDLTokenizer.KW_CHIP)) {
      input.HDLError("Missing 'CHIP' keyword");
    }

  // read gate name
    input.advance();
    if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER) {
      input.HDLError('Missing chip name');
    }
    const foundGateName = input.getIdentifier();
    if (!gateName === foundGateName) {
      input.HDLError("Chip name doesn't match the HDL name");
    }

  // read '{' symbol
    input.advance();
    if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === '{')) {
      input.HDLError("Missing '{'");
    }

  // read IN keyword
    let inputPinsInfo;
    let  outputPinsInfo;
    input.advance();
    if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD && input.getKeywordType() === HDLTokenizer.KW_IN) {
    // read input pins list
      inputPinsInfo = this.getPinsInfo(input, this.readPinNames(input));
      input.advance();
    } else {
    // no input pins
      inputPinsInfo = [];
    }


  // read OUT keyword
    if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD && input.getKeywordType() === HDLTokenizer.KW_OUT) {
    // read output pins list
      outputPinsInfo = this.getPinsInfo(input, this.readPinNames(input));
      input.advance();
    }  else {
    // no output pins
      outputPinsInfo = [];
    }
    let result = null;

  // read BuiltIn/Parts keyword
    if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD && input.getKeywordType() === HDLTokenizer.KW_BUILTIN) {
      result = new (require('./BuiltInGateClass'))(gateName, input, inputPinsInfo, outputPinsInfo);
    } else if (input.getTokenType() === HDLTokenizer.TYPE_KEYWORD && input.getKeywordType() === HDLTokenizer.KW_PARTS) {
      result = new (require('./CompositeGateClass'))(gateName, input, inputPinsInfo, outputPinsInfo);
    }  else {
      input.HDLError('Keyword expected');
    }
    return result;
  }

// Returns an array of pin names read from the input (names may contain width specification).
  static readPinNames(input) {
    const result = [];
    let exit = false;
    input.advance();

    while (!exit) {
    // check ';' symbol
      if (input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ';') {
        exit = true;
      } else {
      // read pin name
        if (input.getTokenType() !== HDLTokenizer.TYPE_IDENTIFIER)        { input.HDLError('Pin name expected'); }

        const pinName = input.getIdentifier();
        result.push(pinName);

      // check seperator
        input.advance();
        if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL
        && (input.getSymbol() === ',' || input.getSymbol() === ';')))        { input.HDLError("',' or ';' expected"); }
        if (input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ',')        { input.advance(); }
      }
    }
    return result;
  }

// Returns a PinInfo array according to the given pin names
// (which may contain width specification).
  static getPinsInfo(input, names) {
    const result = new Array(names.length);

    for (let i = 0; i < names.length; i++) {
      result[i] = new PinInfo();
      const bracketsPos = names[i].indexOf('[');
      if (bracketsPos >= 0) {
        try {
          const width = names[i].substring(bracketsPos + 1, names[i].indexOf(']'));
          result[i].width = parseInt(width, 10);
          result[i].name = names[i].substring(0, bracketsPos);
        } catch (e) {
          input.HDLError(`${names[i]} has an invalid bus width`);
        }
      }    else {
        result[i].width = 1;
        result[i].name = names[i];
      }
    }
    return result;
  }

/**
 * Returns the PinInfo according to the given pin type and number.
 * If doesn't exist, return null.
 */
  getPinInfo(type, number) {
    if (arguments.length === 1) {
      return this.getPinInfoByName(arguments[1]);
    }
    let result = null;
    switch (type) {
      case GateClass.INPUT_PIN_TYPE:
        if (number < this.inputPinsInfo.length) {
          result = this.inputPinsInfo[number];
        }
        break;
      case GateClass.OUTPUT_PIN_TYPE:
        if (number < this.outputPinsInfo.length) {
          result = this.outputPinsInfo[number];
        }
        break;
      default:
        break;
    }
    return result;
  }

/**
 * Returns the PinInfo according to the given pin name.
 * If doesn't exist, return null.
 */
  getPinInfoByName(name) {
    const type = this.getPinType(name);
    const index = this.getPinNumber(name);
    return this.getPinInfo(type, index);
  }

/**
 * Registers the given pins with their given type and numbers.
 */
  registerPins(pins, type) {
    for (let i = 0; i < pins.length; i++) {
      this.namesToTypes[pins[i].name] = type;
      this.namesToNumbers[pins[i].name] = i;
    }
  }

/**
 * Registers the given pin with its given type and number.
 */
  registerPin(pin, type, number) {
    this.namesToTypes[pin.name] = type;
    this.namesToNumbers[pin.name] =  number;
  }

/**
 * Returns the type of the given pinName.
 * If not found, returns UNKNOWN_PIN_TYPE.
 */
  getPinType(pinName) {
    const result = this.namesToTypes[pinName];
    return (result || GateClass.UNKNOWN_PIN_TYPE);
  }

/**
 * Returns the number of the given pinName.
 * If not found, returns -1.
 */
  getPinNumber(pinName) {
    const result = this.namesToNumbers[pinName];
    return result !== undefined ? result : -1;
  }

/**
 * Returns the name of the gate.
 */
  getName() {
    return this.name;
  }

/**
 * Returns true if this gate is clocked.
 */
  isClocked() {
    return this.isClocked;
  }

/**
 * Creates and returns a new Gate instance of this GateClass type.
 */
  newInstance() {}
}
