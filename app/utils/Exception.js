/**
 * Created by daniel on 4/17/17.
 */
export default class Exception {
  constructor(msg) {
    this.message = msg;
  }
  getMessage = () => this.message
}
