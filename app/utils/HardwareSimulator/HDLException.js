/**
 * Created by daniel on 4/17/17.
 */
import Exception from '../Exception';
/** ******************************************************************************
 * The contents of this file are subject to the GNU General Public License      *
 * (GPL) Version 2 or later (the "License"); you may not use this file except   *
 * in compliance with the License. You may obtain a copy of the License at      *
 * http://www.gnu.org/copyleft/gpl.html                                         *
 *                                                                              *
 * Software distributed under the License is distributed on an "AS IS" basis,   *
 * without warranty of any kind, either expressed or implied. See the License   *
 * for the specific language governing rights and limitations under the         *
 * License.                                                                     *
 *                                                                              *
 * This file was originally developed as part of the software suite that        *
 * supports the book "The Elements of Computing Systems" by Nisan and Schocken, *
 * MIT Press 2005. If you modify the contents of this file, please document and *
 * mark your changes clearly, for the benefit of others.                        *
 ********************************************************************************/

/**
 * An exception for errors in the HDL file.
 */
export default class HDLException extends Exception {

  /**
   * Constructs a new HDLException with the given message, HDL file name and Line number.
   */
  constructor(message, HDLName, lineNumber) {
    let res = '';
    if (HDLName) res += `In HDL file ${HDLName}, `;
    if (lineNumber) res += `Line ${lineNumber}, `;
    res += message;
    super(res);
  }
}
