/**
 * Created by daniel on 6/22/17.
 */

import Node from "./Node";

export default class SubNode extends Node {

  // The mask which filters out the non-relevant part of the sub-node
  mask;

  // The amount of bits to shift right the masked value
  shiftRight;

  /**
   * Constructs a new SubNode with the given low & high sub-bus indice.
   */
  constructor( low,  high) {
    super();
    this.mask = this.getMask(low, high);
    this.shiftRight = low;
}

/**
 * Returns the value of this sub-node.
 */
get() {
  return Shifter.unsignedShiftRight((short)(value & mask), shiftRight);
}

/**
 * Returns a mask according to the given low & high bit indice.
 */
public static short getMask(byte low, byte high) {
  short mask = 0;

  short bitHolder = Shifter.powersOf2[low];
  for (byte i = low; i <= high; i++) {
    mask |= bitHolder;
    bitHolder = (short)(bitHolder << 1);
  }

  return mask;
}
}
