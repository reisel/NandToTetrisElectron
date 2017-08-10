/**
 * Created by daniel on 6/22/17.
 */

import CompositeGate from './CompositeGate';
import DirtyGateAdapter from './DirtyGateAdapter';
import SubNode from './SubNode';
import SubBusListeningAdapter from './SubBusListeningAdapter';
import PinInfo from './PinInfo';
import GateClass from './GateCalss';
import HDLException from './HDLException';
import HDLTokenizer from './HDLTokenizer';
import Connection from './Connection';
import Graph from '../../Graph';
import Gate from './Gate';
/**
 * A GateClass for composite gates.
 */
export default class CompositeGateClass extends GateClass {

  /**
   * The internal pin type
   */
  static INTERNAL_PIN_TYPE = 3;

  /**
   * The info of the "true" special node
   */
  static TRUE_NODE_INFO = new PinInfo('true', 16);

  /**
   * The info of the "false" special node
   */
  static FALSE_NODE_INFO = new PinInfo('false', 16);

  /**
   * The info of the "clock" special node
   */
  static CLOCK_NODE_INFO = new PinInfo('clk', 1);


  // internal pins info
  internalPinsInfo;

  // The list of contained GateClasses (parts)
  partsList;

  // Array of indice of parts (taken from the parts vector), in a topological order.
  partsOrder;

  // The set of connections between the gate and its parts
  connections;

  /**
   * Constructs a new CompositeGateClass with the given gate name and the HDLTokenizer input
   * which is positioned just after the PARTS: declaration.
   * The HDL's input and output pin names are also given.
   */
  constructor(gateName, input, inputPinsInfo, outputPinsInfo) {
    super(gateName, inputPinsInfo, outputPinsInfo);

    this.partsList = [];
    this.internalPinsInfo = [];
    this.connections = new Set();
    this.isInputClocked = (new Array(inputPinsInfo.length)).fill(false);
    this.isOutputClocked = (new Array(outputPinsInfo.length)).fill(false);
    this.readParts(input);
    const graph = this.createConnectionsGraph();

  // runs the topological sort, starting from the "master parts" node,
  // which connects to all the parts. This will also check for circles.
    const topologicalOrder = graph.topologicalSort(this.partsList);

    if (graph.hasCircle()) {
      throw new HDLException('This chip has a circle in its parts connections');
    }

  // create the partsOrder array, by taking from the topologicalOrder
  // only the Integer objects, which represent the parts.
    this.partsOrder = (new Array(this.partsList.size)).fill(0);
    let counter = 0;
    for (let i = 0; i < topologicalOrder.length; i++) {
      if (typeof topologicalOrder[i] === 'number') {
        this.partsOrder[counter++] = topologicalOrder[i];
      }
    }

// for each input pin, check if there is a path in the graph to an output pin
// (actually to the "master output", which all outputs connect to).
// If there is, the input is not clocked. Otherwise, it is.
    for (let i = 0; i < inputPinsInfo.length; i++) {
      this.isInputClocked[i] = !graph.pathExists(inputPinsInfo[i], outputPinsInfo);
    }

// for each output pin, check if there is a path in the graph from any input pin
// (actually from the "master input", which connects to all inputs) to this output pin.
// If there is, the output is not clocked. Otherwise, it is.
    for (let i = 0; i < outputPinsInfo.length; i++) {
      this.isOutputClocked[i] = !graph.pathExists(inputPinsInfo, outputPinsInfo[i]);
    }
  }

// Reads the parts list from the given HDL input
  readParts(input) {
    let endOfParts = false;

    while (input.hasMoreTokens() && !endOfParts) {
      input.advance();

    // check if end of hdl
      if (input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === '}') {
        endOfParts = true;
      } else {
      // check if part name
        if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER)) {
          input.HDLError('A GateClass name is expected');
        }

        const partName = input.getIdentifier();
        const gateClass = GateClass.getGateClass(partName, false);
        this.partsList.push(gateClass);
        this.isClocked = this.isClocked || gateClass.isClocked;
        const partNumber = this.partsList.length - 1;

      // check '('
        input.advance();
        if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === '(')) {
          input.HDLError("Missing '('");
        }

        this.readPinNames(input, partNumber, partName);

      // check ';'
        input.advance();
        if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ';')) {
          input.HDLError("Missing ';'");
        }
      }
    }
    if (!endOfParts) {
      input.HDLError("Missing '}'");
    }
    if (input.hasMoreTokens()) {
      input.HDLError("Expected end-of-file after '}'");
    }

  // check if internal pins have no source
    const hasSource = (new Array(this.internalPinsInfo.length)).fill(false);
    const connectionIter = this.connections.values();
    let connection = connectionIter.next().value;
    while (connection) {
      if (connection.getType() === Connection.TO_INTERNAL) {
        hasSource[connection.getGatePinNumber()] = true;
      }
      connection = connectionIter.next().value;
    }
    for (let i = 0; i < hasSource.length; i++)    {
      if (!hasSource[i])    { input.HDLError(`${this.internalPinsInfo[i].name} has no source pin`); }
    }
  }

// Reads the pin names list from the HDL input. Returns the input after the ')' .
  readPinNames(input,  partNumber,  partName) {
    let endOfPins = false;

  // read pin names
    while (!endOfPins) {
    // read left pin name
      input.advance();
      if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER))      { input.HDLError('A pin name is expected'); }

      const leftName = input.getIdentifier();

    // check '='
      input.advance();
      if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === '=')) {
        input.HDLError("Missing '='");
      }

    // read right pin name
      input.advance();
      if (!(input.getTokenType() === HDLTokenizer.TYPE_IDENTIFIER)) {
        input.HDLError('A pin name is expected');
      }

      const rightName = input.getIdentifier();
      this.addConnection(input, partNumber, partName, leftName, rightName);

    // check ',' or ')'
      input.advance();
      if (input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ')') {
        endOfPins = true;
      }    else if (!(input.getTokenType() === HDLTokenizer.TYPE_SYMBOL && input.getSymbol() === ',')) {
        input.HDLError("',' or ')' are expected");
      }
    }
  }

// Returns an array of two integers: the low and high bits of the given pin name.
// If no sub bus specified, returns null.
// This ensures that if result != null, than result[0] <= result[1] and result[0] > 0
  getSubBusAndCheck(input, pinName, busWidth) {
    let result = null;

    try {
      result = CompositeGateClass.getSubBus(pinName);
    } catch (e) {
      input.HDLError(`${pinName} has an invalid sub bus specification`);
    }

    if (result) {
      if (result[0] < 0 || result[1] < 0) {
        input.HDLError(`${pinName}: negative bit numbers are illegal`);
      }    else if (result[0] > result[1]) {
        input.HDLError(`${pinName}: left bit number should be lower than the right one`);
      }    else if (result[1] >= busWidth) {
        input.HDLError(`${pinName}: the specified sub bus is not in the bus range`);
      }
    }

    return result;
  }

/**
 * Returns an array of two integers: the low and high bits of the given pin name.
 * If no sub bus specified, returns null.
 * If illegal name, throws a HDLException.
 */
  static getSubBus(pinName) {
    let result = null;

    const bracketsPos = pinName.indexOf('[');
    if (bracketsPos >= 0) {
      result = [0, 0];
      let num = null;
      const dotsPos = pinName.indexOf('..');
      if (dotsPos >= 0) {
        num = pinName.substring(bracketsPos + 1, dotsPos);
        result[0] = parseInt(num, 10) & 0xff;
        num = pinName.substring(dotsPos + 2, pinName.indexOf(']'));
        result[1] = parseInt(num, 10) & 0xff;
      }    else {
        num = pinName.substring(bracketsPos + 1, pinName.indexOf(']'));
        result[0] = parseInt(num, 10) & 0xff;
        result[1] = result[0];
      }
    }

    return result;
  }

// Adds a connection between the two given pin names, where fullLeftName is a pin
// of the part, and fullRightName is a pin of this CompositeGateClass.
// Both pin names may include sub bus specification.
  addConnection(input,  partNumber,  partName, fullLeftName,  fullRightName) {
    const partGateClass = this.partsList[partNumber];
    let connectionType = 0;

  // find left pin name (without sub bus specification)
    let bracketsPos = fullLeftName.indexOf('[');
    const leftName = (bracketsPos >= 0 ? fullLeftName.substring(0, bracketsPos) : fullLeftName);

  // find left pin info. If doesn't exist - error.
    const leftType = partGateClass.getPinType(leftName);
    if (leftType === CompositeGateClass.UNKNOWN_PIN_TYPE) {
      input.HDLError(`${leftName} is not a pin in ${partName}`);
    }
    const leftNumber = partGateClass.getPinNumber(leftName);
    const leftPinInfo = partGateClass.getPinInfo(leftType, leftNumber);
    const leftSubBus = this.getSubBusAndCheck(input, fullLeftName, leftPinInfo.width);
    const leftWidth = leftSubBus ? ((leftSubBus[1] - leftSubBus[0]) + 1) : leftPinInfo.width;

  // find right pin name (without sub bus specification)
    bracketsPos = fullRightName.indexOf('[');
    const rightName = (bracketsPos >= 0 ? fullRightName.substring(0, bracketsPos) : fullRightName);
    let rightPinInfo;
    let rightNumber = 0;
    let rightType = GateClass.UNKNOWN_PIN_TYPE;
    let selfFittingWidth = false;

  // check if special nodes
    if (rightName === CompositeGateClass.TRUE_NODE_INFO.name) {
      rightPinInfo = CompositeGateClass.TRUE_NODE_INFO;
      connectionType = Connection.FROM_TRUE;
      selfFittingWidth = true;
    } else if (rightName === CompositeGateClass.FALSE_NODE_INFO.name) {
      rightPinInfo = CompositeGateClass.FALSE_NODE_INFO;
      connectionType = Connection.FROM_FALSE;
      selfFittingWidth = true;
    } else if (rightName === CompositeGateClass.CLOCK_NODE_INFO.name) {
      rightPinInfo = CompositeGateClass.CLOCK_NODE_INFO;
      connectionType = Connection.FROM_CLOCK;
    } else {
      rightType = this.getPinType(rightName);

    // check that not sub bus of intenral
      if ((rightType === CompositeGateClass.UNKNOWN_PIN_TYPE || rightType === CompositeGateClass.INTERNAL_PIN_TYPE) &&
      !fullRightName === rightName) {
        input.HDLError(`${fullRightName}: sub bus of an internal node may not be used`);
      }

    // find right pin's info. If doesn't exist, create it as an internal pin.
      if (rightType === CompositeGateClass.UNKNOWN_PIN_TYPE) {
        rightType = CompositeGateClass.INTERNAL_PIN_TYPE;
        rightPinInfo = new PinInfo();
        rightPinInfo.name = rightName;
        rightPinInfo.width = leftWidth;
        this.internalPinsInfo.push(rightPinInfo);
        rightNumber = this.internalPinsInfo.length - 1;
        this.registerPin(rightPinInfo, CompositeGateClass.INTERNAL_PIN_TYPE, rightNumber);
      }    else {
        rightNumber = this.getPinNumber(rightName);
        rightPinInfo = this.getPinInfo(rightType, rightNumber);
      }
    }

    let rightSubBus;
    let rightWidth;

    if (selfFittingWidth) {
      if (rightName !== fullRightName) {
        input.HDLError(`${rightName} may not be subscripted`);
      }
      rightWidth = leftWidth;
      rightSubBus = [0, rightWidth - 1];
    }  else {
      rightSubBus = this.getSubBusAndCheck(input, fullRightName, rightPinInfo.width);
      rightWidth = rightSubBus ? ((rightSubBus[1] - rightSubBus[0]) + 1) : rightPinInfo.width;
    }

  // check that right & left has the same width
    if (leftWidth !== rightWidth) {
      input.HDLError(`${leftName}(${leftWidth}) and ${rightName}(${rightWidth
      }) have different bus widths`);
    }


  // make sure that an internal pin is only fed once by a part's output pin
    if ((rightType === CompositeGateClass.INTERNAL_PIN_TYPE) && (leftType === CompositeGateClass.OUTPUT_PIN_TYPE)) {
      if (rightPinInfo.isInitialized(rightSubBus)) {
        input.HDLError("An internal pin may only be fed once by a part's output pin");
      } else {
        rightPinInfo.initialize(rightSubBus);
      }
    }

  // make sure that an output pin is only fed once by a part's output pin
    if ((rightType === CompositeGateClass.OUTPUT_PIN_TYPE) && (leftType === CompositeGateClass.OUTPUT_PIN_TYPE)) {
      if (rightPinInfo.isInitialized(rightSubBus)) {
        input.HDLError("An output pin may only be fed once by a part's output pin");
      } else {
        rightPinInfo.initialize(rightSubBus);
      }
    }

  // find connection type
    switch (leftType) {

      case CompositeGateClass.INPUT_PIN_TYPE:
        switch (rightType) {
          case CompositeGateClass.INPUT_PIN_TYPE:
            connectionType = Connection.FROM_INPUT;
            break;
          case CompositeGateClass.INTERNAL_PIN_TYPE:
            connectionType = Connection.FROM_INTERNAL;
            break;
          case CompositeGateClass.OUTPUT_PIN_TYPE:
            input.HDLError("Can't connect gate's output pin to part");
            break;
        }
        break;

      case CompositeGateClass.OUTPUT_PIN_TYPE:
        switch (rightType) {
          case CompositeGateClass.INPUT_PIN_TYPE:
            input.HDLError("Can't connect part's output pin to gate's input pin");
            break;
          case CompositeGateClass.INTERNAL_PIN_TYPE:
            connectionType = Connection.TO_INTERNAL;
            break;
          case CompositeGateClass.OUTPUT_PIN_TYPE:
            connectionType = Connection.TO_OUTPUT;
            break;
        }
        break;
    }

    const connection = new Connection(connectionType, rightNumber, partNumber, leftName, rightSubBus, leftSubBus);
    this.connections.add(connection);
  }

/*
 Creates and returns the graph of the connections in the chip.
 The nodes in the graph are:
 1. Internal parts, represented with Integer objects containing the part's numbers.
 2. Input, Output, Internal and special nodes, represented with their PinInfo objects.
 3. One "master part" node that connects to all the inernal parts, represented with the
 partsList vector.
 4. One "master output" node that all output nodes connect to, represented with the
 outputPinsInfo array.
 5. One "master input" node that connects to all input nodes, represented with the
 inputPinsInfo array.
 Edges are not created between inetrnal nodes and clocked part inputs.
 */
  createConnectionsGraph() {
    const graph = new Graph();
    const connectionIter = this.connections.values();
    let connection = connectionIter.next().value;
    while (connection) {
      const part = connection.getPartNumber();
      const gatePinNumber = connection.getGatePinNumber();

      switch (connection.getType()) {
        case Connection.TO_INTERNAL:
          if (this.isLegalFromPartEdge(connection, part)) {
            graph.addEdge(part, this.getPinInfo(CompositeGateClass.INTERNAL_PIN_TYPE, gatePinNumber));
          }
          break;

        case Connection.FROM_INTERNAL:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(this.getPinInfo(CompositeGateClass.INTERNAL_PIN_TYPE, gatePinNumber), part);
          }
          break;

        case Connection.TO_OUTPUT:
          if (this.isLegalFromPartEdge(connection, part)) {
            graph.addEdge(part, this.getPinInfo(CompositeGateClass.OUTPUT_PIN_TYPE, gatePinNumber));
          }
          break;

        case Connection.FROM_INPUT:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(this.getPinInfo(CompositeGateClass.INPUT_PIN_TYPE, gatePinNumber), part);
          }
          break;

        case Connection.FROM_TRUE:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.TRUE_NODE_INFO, part);
          }
          break;

        case Connection.FROM_FALSE:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.FALSE_NODE_INFO, part);
          }
          break;

        case Connection.FROM_CLOCK:
          if (this.isLegalToPartEdge(connection, part)) {
            graph.addEdge(CompositeGateClass.CLOCK_NODE_INFO, part);
          }
          break;
      }
      connection = connectionIter.next().value;
    }

  // connect the "master part" node to all the parts.
    for (let i = 0; i < this.partsList.length; i++) {
      graph.addEdge(this.partsList, i);
    }

  // connect all output pins to the "master output" node
    for (let i = 0; i < this.outputPinsInfo.length; i++) {
      graph.addEdge(this.outputPinsInfo[i], this.outputPinsInfo);
    }

  // connect the "master input" node to all input pins
    for (let i = 0; i < this.inputPinsInfo.length; i++) {
      graph.addEdge(this.inputPinsInfo, this.inputPinsInfo[i]);
    }

    return graph;
  }

// Returns true if an edge should be connected to the given part.
// a connection to a clocked input is not considered as a connection
// in the graph.
  isLegalToPartEdge(connection,  part) {
    const partGateClass = this.partsList[part];
    const partPinNumber = partGateClass.getPinNumber(connection.getPartPinName());
    return !partGateClass.isInputClocked[partPinNumber];
  }

// Returns true if an edge should be connected from the given part.
// a connection from a clocked output is not considered as a connection
// in the graph.
  isLegalFromPartEdge(connection,  part) {
    const partGateClass = this.partsList[part];
    const partPinNumber = partGateClass.getPinNumber(connection.getPartPinName());
    return !partGateClass.isOutputClocked[partPinNumber];
  }

/**
 * Returns the PinInfo according to the given pin type and number.
 * If doesn't exist, return null.
 */
  getPinInfo(type,  number) {
    let result = null;

    if (type === CompositeGateClass.INTERNAL_PIN_TYPE) {
      if (number < this.internalPinsInfo.length) {
        return this.internalPinsInfo[number];
      }
    } else {
      result = super.getPinInfo(type, number);
    }
    return result;
  }

/**
 * Creates and returns a new instance of CompositeGate.
 */
  newInstance() {
    const inputNodes = new Array(this.inputPinsInfo.length);
    const outputNodes = new Array(this.outputPinsInfo.length);
    const internalNodes = new Array(this.internalPinsInfo.length);

    const result = new CompositeGate();

  // Create instances (Gates) from all parts in the parts list (which are GateClasses).
  // The created array is sorted in the original parts order
    const parts = this.partsList.map(part => part.newInstance());

  // Creates another parts array in which the parts are sorted in topological order.
    const sortedParts = new Array(parts.length);
    for (let i = 0; i < parts.length; i++) {
      sortedParts[i] = parts[this.partsOrder[i]];
    }
    for (let i = 0; i < inputNodes.length; i++) {
      inputNodes[i] = new Node();
    }
    for (let i = 0; i < outputNodes.length; i++) {
      outputNodes[i] = new Node();
    }

  // Add a DirtyGateAdapter as a listener to all the non-clocked inputs,
  // so the gate will become dirty when one of its non-clocked input changes.
    const adapter = new DirtyGateAdapter(result);
    for (let i = 0; i < this.isInputClocked.length; i++)    {
      if (!this.isInputClocked[i]) {
        inputNodes[i].addListener(adapter);
      }
    }

  // First scan: creates internal Nodes (or SubNodes) and their connections to
  // their source part nodes. Also creates the connections between gate's
  // input or putput nodes and part's input nodes and between part's output nodes and gate's
  // output nodes.
    this.internalConnections = new Set();
    let partNode;
    let source;
    let target;
    let gateSubBus;
    let partSubBus;

    let connectionIter = this.connections.values();
    let connection = connectionIter.next().value;
    while (connection) {
      gateSubBus = connection.getGateSubBus();
      partSubBus = connection.getPartSubBus();
      partNode = parts[connection.getPartNumber()].getNode(connection.getPartPinName());

      switch (connection.getType()) {
        case Connection.FROM_INPUT:
          this.connectGateToPart(inputNodes[connection.getGatePinNumber()], gateSubBus, partNode, partSubBus);
          break;

        case Connection.TO_OUTPUT:
          this.connectGateToPart(partNode, partSubBus, outputNodes[connection.getGatePinNumber()], gateSubBus);
          break;

        case Connection.TO_INTERNAL:
          target = null;
          if (!partSubBus)          { target = new Node(); }        else          { target = new SubNode(partSubBus[0], partSubBus[1]); }
          partNode.addListener(target);
          internalNodes[connection.getGatePinNumber()] = target;
          break;

        case Connection.FROM_INTERNAL:
        case Connection.FROM_TRUE:
        case Connection.FROM_FALSE:
        case Connection.FROM_CLOCK:
          this.internalConnections.add(connection);
          break;
      }
      connection = connectionIter.next().value;
    }

  // Second scan: Creates the connections between internal nodes or true node
  // or false node to a part's input nodes.
    connectionIter = this.internalConnections.values();
    connection = connectionIter.next().value;
    let isClockParticipating = false;
    while (connection) {
      partNode = parts[connection.getPartNumber()].getNode(connection.getPartPinName());
      partSubBus = connection.getPartSubBus();
      gateSubBus = connection.getGateSubBus();
      let subNode;
      source = null;

    // find source node
      switch (connection.getType()) {
        case Connection.FROM_INTERNAL:
          source = internalNodes[connection.getGatePinNumber()];
          if (partSubBus === null)          { source.addListener(partNode); }        else {
            const node = new SubBusListeningAdapter(partNode, partSubBus[0], partSubBus[1]);
            source.addListener(node);
          }
          break;
        case Connection.FROM_TRUE:
          subNode = new SubNode(gateSubBus[0], gateSubBus[1]);
          subNode.set(Gate.TRUE_NODE.get());

          if (!partSubBus) {
            partNode.set(subNode.get());
          } else {
            const node = new SubBusListeningAdapter(partNode, partSubBus[0], partSubBus[1]);
            node.set(subNode.get());
          }
          break;
        case Connection.FROM_FALSE:
          subNode = new SubNode(gateSubBus[0], gateSubBus[1]);
          subNode.set(Gate.FALSE_NODE.get());

          if (!partSubBus) {
            partNode.set(subNode.get());
          } else {
            const node = new SubBusListeningAdapter(partNode, partSubBus[0], partSubBus[1]);
            node.set(subNode.get());
          }
          break;
        case Connection.FROM_CLOCK:
          partNode.set(Gate.CLOCK_NODE.get());
          Gate.CLOCK_NODE.addListener(partNode);
          isClockParticipating = true;
          break;
      }
      connection = connectionIter.next().value;
    }

  // If the clock special node appears in this gate, Add a dirty gate adapter
  // such that changes in clock state will cause this gate to recompute.
    if (isClockParticipating)    { Gate.CLOCK_NODE.addListener(new DirtyGateAdapter(result)); }

    result.init(inputNodes, outputNodes, internalNodes, sortedParts, this);

    return result;
  }

// Connects the given source node to the given target node.
  connectGateToPart(sourceNode, sourceSubBus, targetNode, targetSubBus) {
    const source = sourceNode;
    let target = targetNode;
    if (targetSubBus) {
      target = new SubBusListeningAdapter(target, targetSubBus[0], targetSubBus[1]);
    }

    if (!sourceSubBus) {
      source.addListener(target);
    } else {
      const subNode = new SubNode(sourceSubBus[0], sourceSubBus[1]);
      source.addListener(subNode);
      subNode.addListener(target);
    }
  }
}
