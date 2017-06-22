/**
 * Created by daniel on 6/22/17.
 */

/**
 * Represents an internal gate connection between two pins.
 */
export default class Connection {

  /**
   * A connection from one of the gate's inputs to a part's input.
   */
  static FROM_INPUT = 1;

  /**
   * A connection from a part's output to one of the gate's internal nodes.
   */
  static TO_INTERNAL = 2;

  /**
   * A connection from one of the gate's internal node to a part's input.
   */
  static FROM_INTERNAL = 3;

  /**
   * A connection from a part's output to one of the gate's outputs.
   */
  static TO_OUTPUT = 5;

  /**
   * A connection from the "true" special node to a part's input.
   */
  static FROM_TRUE = 6;

  /**
   * A connection from the "false" special node to a part's input.
   */
  static FROM_FALSE = 7;

  /**
   * A connection from the "clock" special node to a part's input.
   */
  static FROM_CLOCK = 8;


  // The type of connection (out of the above constants)
  type;

  // The number of the gate's pin (input, internal or output, according to the type)
  gatePinNumber;

  // The number of the gate's part
  partNumber;

  // The name of the part's pin
  partPinName;

  // The bit index of the parts's sub node (index 0 is low bit and index 1 is high bit)
  partSubBus;

  // The bit index of the gate's sub node (index 0 is low bit and index 1 is high bit)
  gateSubBus;

  /**
   * Constructs a connection according to the given type and pin information.
   * The sub-busses of the gate & part are optional.
   */
  constructor(type,  gatePinNumber,  partNumber,  partPinName,  gateSubBus,  partSubBus) {
    this.type = type;
    this.gatePinNumber = gatePinNumber;
    this.partNumber = partNumber;
    this.partPinName = partPinName;
    this.gateSubBus = gateSubBus;
    this.partSubBus = partSubBus;
  }

/**
 * Returns the type of this connection
 */
  getType() {
    return this.type;
  }

/**
 * Returns the gate's pin number.
 */
  getGatePinNumber() {
    return this.gatePinNumber;
  }

/**
 * Returns the part's number.
 */
  getPartNumber() {
    return this.partNumber;
  }

/**
 * Returns the part's pin name.
 */
  getPartPinName() {
    return this.partPinName;
  }

/**
 * Returns the gate's sub-bus index (may be null).
 */
  getGateSubBus() {
    return this.gateSubBus;
  }

/**
 * Returns the part's sub-bus index (may be null).
 */
  getPartSubBus() {
    return this.partSubBus;
  }

}
