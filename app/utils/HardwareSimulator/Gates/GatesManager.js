/**
 * Created by daniel on 6/24/17.
 */
const fs = require('fs');
const path = require('path');
/**
 * A singleton - manager for common gates properties.
 */
export default class GatesManager {

  // The single instance.
  static singleton;

  // The working HDL dir
  workingDir;

  // The BuiltIn HDL dir
  builtInDir;

  // The list of built in chips with gui
  chips;

  /**
   * Constructs a new GatesManager.
   */
  constructor() {
    this.chips = [];
  }

  /**
   * Returns the single instance of GatesManager.
   */
  static getInstance() {
    if (!this.singleton) {
      this.singleton = new GatesManager();
    }

    return this.singleton;
  }

  /**
   * Returns the current HDL dir.
   */
  getWorkingDir() {
    return this.workingDir;
  }

  /**
   * Sets the current HDL dir with the given dir.
   */
  setWorkingDir(file) {
    this.workingDir = file;
  }

  /**
   * Returns the BuiltIn HDL dir.
   */
  getBuiltInDir() {
    return this.builtInDir;
  }

  /**
   * Sets the BuiltIn HDL dir with the given dir.
   */
  setBuiltInDir(file) {
    this.builtInDir = file;
  }


  /**
   * Returns the full HDL file name that matches the given gate name.
   * The HDL file is searched first in the current dir, and if not found, in the BuiltIn dir.
   * If not found in any of them, returns null.
   */
  getHDLFileName(gateName) {
    let result = null;
    const name = `${gateName}.hdl`;
    if (fs.existsSync(path.join(this.workingDir, name))) {
      result = `${this.workingDir}/${name}`;
    } else if (fs.existsSync(path.join(this.builtInDir, name))) {
      result = `${this.builtInDir}/${name}`;
    }
    return result;
  }
}
