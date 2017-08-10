/**
 * Created by daniel on 5/21/17.
 */

export default class PinInfo {
  /**
   * The name of the gate's pin.
   */
  name;

  /**
   * The width of the pin's bus.
   */
  width;

  /**
   * The value at the pin.
   */
  value;

  // Initialization marking.
  initialized;

  /**
   * Constructs a new empty PinInfo.
   */
  constructor(name, width) {
    this.name = name;
    this.width = width;
    this.initialized = (new Array(16)).fill(false);
  }

  /**
   * Marks the given sub bus as initialized.
   * If subBus is null, all the pin is initialized.
   */
  initialize(subBus) {
    let from;
    let  to;

    if (subBus && subBus !== null) {
      from = subBus[0];
      to = subBus[1];
    } else {
      from = 0;
      to = (this.width - 1);
    }

    for (let i = from; i <= to; i++)      { this.initialized[i] = true; }
  }

  /**
   * Checks whether the given sub bus is marked as initialized.
   * If subBus is null, all the pin is checked.
   */
  isInitialized = subBus => {
    if (!subBus || subBus === null) subBus = [0, this.width - 1];
    return !!this.initialized.slice(subBus[0], subBus[0] + 1).find(a => a);
  };

  hashCode() {
    return this.name.hashCode();
  }

  equals(other) {
    return (other instanceof PinInfo) && this.name === other.name;
  }
}
