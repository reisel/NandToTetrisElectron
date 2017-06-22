const fs = require('fs');

const NEED_CHAR = Number.MAX_VALUE;
const SKIP_LF = Number.MAX_VALUE - 1;
const CT_WHITESPACE = 1;
const CT_DIGIT = 2;
const CT_ALPHA = 4;
const CT_QUOTE = 8;
const CT_COMMENT = 16;

export default class Tokenizer {
  constructor(fileName) {
    this.input = fs.readFileSync(fileName);
    this.currentPos = 0;
    this.buf = new Array(256);
    this.buf.fill(0);
    this.peekc = NEED_CHAR;
    /** The line number of the last token read */
    this.LINENO = 1;
    this.eolIsSignificantP = false;
    this.slashSlashCommentsP = false;
    this.slashStarCommentsP = false;
    this.ctype = new Array(256);
    this.ctype.fill(0);
    this.ttype = Tokenizer.TT_NOTHING;
    this.streamTokenizer();
  }
  // input array

  static TT_EOF = -1;
  static TT_EOL = '\n';
  static TT_NUMBER = -2;
  static TT_WORD = -3;
  static TT_NOTHING = -4;

  /** Private constructor that initializes everything except the streams. */
  streamTokenizer() {
    this.wordChars('a', 'z');
    this.wordChars('A', 'Z');
    this.wordChars(128 + 32, 255);
    this.whitespaceChars(0, ' ');
    this.commentChar('/');
    this.quoteChar('"');
    this.quoteChar('\'');
    this.parseNumbers();
  }
  resetSyntax() {
    for (let i = this.ctype.length; --i >= 0;) { this.ctype[i] = 0; }
  }
  wordChars(low, hi) {
    if (typeof low === 'string') low = low.charCodeAt(0);
    if (typeof hi === 'string') hi = hi.charCodeAt(0);
    if (low < 0) {
      low = 0;
    }
    if (hi >= this.ctype.length) {
      hi = this.ctype.length - 1;
    }
    while (low <= hi) { this.ctype[low++] |= CT_ALPHA; }
  }

  whitespaceChars(low, hi) {
    if (typeof low === 'string') low = low.charCodeAt(0);
    if (typeof hi === 'string') hi = hi.charCodeAt(0);
    if (low < 0) { low = 0; }
    if (hi >= this.ctype.length) { hi = this.ctype.length - 1; }
    while (low <= hi) {
      this.ctype[low++] = CT_WHITESPACE;
    }
  }
  ordinaryChars(low, hi) {
    if (typeof low === 'string') low = low.charCodeAt(0);
    if (typeof hi === 'string') hi = hi.charCodeAt(0);
    if (low < 0) {
      low = 0;
    }
    if (hi >= this.ctype.length) {
      hi = this.ctype.length - 1;
    }
    while (low <= hi) { this.ctype[low++] = 0; }
  }
  ordinaryChar(ch) {
    if (typeof ch === 'string') ch = ch.charCodeAt(0);
    if (ch >= 0 && ch < this.ctype.length) {
      this.ctype[ch] = 0;
    }
  }
  commentChar(ch) {
    if (typeof ch === 'string') ch = ch.charCodeAt(0);
    if (ch >= 0 && ch < this.ctype.length) { this.ctype[ch] = CT_COMMENT; }
  }
  quoteChar(ch) {
    if (typeof ch === 'string') ch = ch.charCodeAt(0);
    if (ch >= 0 && ch < this.ctype.length) {
      this.ctype[ch] = CT_QUOTE;
    }
  }
  parseNumbers() {
    for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
      this.ctype[i] |= CT_DIGIT;
    }
    this.ctype['.'.charCodeAt(0)] |= CT_DIGIT;
    this.ctype['-'.charCodeAt(0)] |= CT_DIGIT;
  }
  eolIsSignificant(flag) {
    this.eolIsSignificantP = flag;
  }
  slashStarComments(flag) {
    this.slashStarCommentsP = flag;
  }
  slashSlashComments(flag) {
    this.slashSlashCommentsP = flag;
  }
  lowerCaseMode(fl) {
    this.forceLower = fl;
  }
  read() {
    if (this.currentPos >= this.input.length) return -1;
    const val = this.input[this.currentPos];
    this.currentPos += 1;
    return (typeof val === 'number') ? val : val.charCodeAt(0);
  }
  nextToken() {
    if (this.pushedBack) {
      this.pushedBack = false;
      return this.ttype;
    }
    const ct = this.ctype;
    this.sval = null;
    let c = this.peekc;
    if (c < 0) {
      c = NEED_CHAR;
    }
    if (c === SKIP_LF) {
      c = this.read();
      if (c < 0) {
        return this.ttype = Tokenizer.TT_EOF;
      }
      if (c === '\n'.charCodeAt(0)) {
        c = NEED_CHAR;
      }
    }
    if (c === NEED_CHAR) {
      c = this.read();
      if (c < 0) {
        return this.ttype = Tokenizer.TT_EOF;
      }
    }
    this.ttype = String.fromCharCode(c);             /* Just to be safe */
    /* Set peekc so that the next invocation of nextToken will read
     * another character unless peekc is reset in this invocation
     */
    this.peekc = NEED_CHAR;
    let ctype = c < 256 ? ct[c] : CT_ALPHA;
    while ((ctype & CT_WHITESPACE) !== 0) {
      if (c === '\r'.charCodeAt(0)) {
        this.LINENO++;
        if (this.eolIsSignificantP) {
          this.peekc = SKIP_LF;
          return this.ttype = Tokenizer.TT_EOL;
        }
        c = this.read();
        if (c === '\n'.charCodeAt(0)) {
          c = this.read();
        }
      } else {
        if (c === '\n'.charCodeAt(0)) {
          this.LINENO++;
          if (this.eolIsSignificantP) {
            return this.ttype = Tokenizer.TT_EOLZ;
          }
        }
        c = this.read();
      }
      if (c < 0) { return this.ttype = Tokenizer.TT_EOF; }
      ctype = c < 256 ? ct[c] : CT_ALPHA;
    }
    if ((ctype & CT_DIGIT) !== 0) {
      let neg = false;
      if (c === '-'.charCodeAt(0)) {
        c = this.read();
        if (c !== '.'.charCodeAt(0) && (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0))) {
          this.peekc = c;
          return this.ttype = '-';
        }
        neg = true;
      }
      let v = 0;
      let decexp = 0;
      let seendot = 0;
      while (true) {
        if (c === '.'.charCodeAt(0) && seendot === 0) {
          seendot = 1;
        } else if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
          v = (v * 10) + (c - '0'.charCodeAt(0));
          decexp += seendot;
        } else {
          break;
        }
        c = this.read();
      }
      this.peekc = c;
      if (decexp !== 0) {
        let denom = 10;
        decexp--;
        while (decexp > 0) {
          denom *= 10;
          decexp--;
        }
        /* Do one division of a likely-to-be-more-accurate number */
        v /= denom;
      }
      this.nval = neg ? -v : v;
      return this.ttype = Tokenizer.TT_NUMBER;
    }
    if ((ctype & CT_ALPHA) !== 0) {
      let i = 0;
      do {
        if (i >= this.buf.length) {
          this.buf.push(new Array(this.buf.length));
        }
        this.buf[i++] = c;
        c = this.read();
        ctype = c < 0 ? CT_WHITESPACE : c < 256 ? ct[c] : CT_ALPHA;
      } while ((ctype & (CT_ALPHA | CT_DIGIT)) !== 0);
      this.peekc = c;
      this.sval = String.fromCharCode(...this.buf.slice(0, i));
      if (this.forceLower) {
        this.sval = this.sval.toLowerCase();
      }
      return this.ttype = Tokenizer.TT_WORD;
    }
    if ((ctype & CT_QUOTE) !== 0) {
      this.ttype = String.fromCharCode(c);
      let i = 0;
      /* Invariants (because \Octal needs a lookahead):
       *   (i)  c contains char value
       *   (ii) d contains the lookahead
       */
      let d = this.read();
      while (d >= 0 && d !== this.ttype && d !== '\n'.charCodeAt(0) && d !== '\r'.charCodeAt(0)) {
        if (d === '\\'.charCodeAt(0)) {
          c = this.read();
          const first = c;   /* To allow \377, but not \477 */
          if (c >= '0'.charCodeAt(0) && c <= '7'.charCodeAt(0)) {
            c -= '0'.charCodeAt(0);
            let c2 = this.read();
            if (c2 >= '0'.charCodeAt(0) && c2 <= '7'.charCodeAt(0)) {
              c = (c << 3) + (c2 - '0'.charCodeAt(0));
              c2 = this.read();
              if (c2 >= '0'.charCodeAt(0) && c2 <= '7'.charCodeAt(0) && first <= '3'.charCodeAt(0)) {
                c = (c << 3) + (c2 - '0'.charCodeAt(0));
                d = this.read();
              } else {
                d = c2;
              }
            } else {
              d = c2;
            }
          } else {
            switch (c) {
              case 'a'.charCodeAt(0):
                c = 0x7;
                break;
              case 'b'.charCodeAt(0):
                c = '\b';
                break;
              case 'f'.charCodeAt(0):
                c = 0xC;
                break;
              case 'n'.charCodeAt(0):
                c = '\n'.charCodeAt(0);
                break;
              case 'r'.charCodeAt(0):
                c = '\r'.charCodeAt(0);
                break;
              case 't'.charCodeAt(0):
                c = '\t'.charCodeAt(0);
                break;
              case 'v'.charCodeAt(0):
                c = 0xB;
                break;
            }
            d = this.read();
          }
        } else {
          c = d;
          d = this.read();
        }
        if (i >= this.buf.length) {
          this.buf.push(new Array(this.buf.length));
        }
        this.buf[i++] = c;
      }
      /* If we broke out of the loop because we found a matching quote
       * character then arrange to read a new character next time
       * around; otherwise, save the character.
       */
      this.peekc = (d === this.ttype) ? NEED_CHAR : d;
      this.sval = String.fromCharCode(...this.buf.slice(0, i));
      return this.ttype;
    }
    if (c === '/'.charCodeAt(0) && (this.slashSlashCommentsP || this.slashStarCommentsP)) {
      c = this.read();
      if (c === '*'.charCodeAt(0) && this.slashStarCommentsP) {
        let prevc = 0;
        while ((c = this.read()) !== '/'.charCodeAt(0) || prevc !== '*'.charCodeAt(0)) {
          if (c === '\r'.charCodeAt(0)) {
            this.LINENO++;
            c = this.read();
            if (c === '\n'.charCodeAt(0)) {
              c = this.read();
            }
          } else if (c === '\n'.charCodeAt(0)) {
            this.LINENO++;
            c = this.read();
          }
          if (c < 0) {
            return this.ttype = Tokenizer.TT_EOF;
          }
          prevc = c;
        }
        return this.nextToken();
      } else if (c === '/'.charCodeAt(0) && this.slashSlashCommentsP) {
        while ((c = this.read()) !== '\n'.charCodeAt(0) && c !== '\r'.charCodeAt(0) && c >= 0);
        this.peekc = c;
        return this.nextToken();
      }
        /* Now see if it is still a single line comment */
      if ((ct['/'.charCodeAt(0)] & CT_COMMENT) !== 0) {
        while ((c = this.read()) !== '\n' && c !== '\r'.charCodeAt(0) && c >= 0);
        this.peekc = c;
        return this.nextToken();
      }
      this.peekc = c;
      return this.ttype = '/';
    }
    if ((ctype & CT_COMMENT) !== 0) {
      while ((c = this.read()) !== '\n'.charCodeAt(0) && c !== '\r'.charCodeAt(0) && c >= 0);
      this.peekc = c;
      return this.nextToken();
    }
    return this.ttype = String.fromCharCode(c);
  }
  pushBack = () => {
    if (this.ttype !== Tokenizer.TT_NOTHING) {
      this.pushedBack = true;
    }
  }
  lineno = () => this.LINENO
  toString = () => {
    let ret;
    switch (this.ttype) {
      case Tokenizer.TT_EOF:
        ret = 'EOF';
        break;
      case Tokenizer.TT_EOL:
        ret = 'EOL';
        break;
      case Tokenizer.TT_WORD:
        ret = this.sval;
        break;
      case Tokenizer.TT_NUMBER:
        ret = `n=${this.nval}`;
        break;
      case Tokenizer.TT_NOTHING:
        ret = 'NOTHING';
        break;
      default: {
        /*
         * ttype is the first character of either a quoted string or
         * is an ordinary character. this.ttype can definitely not be less
         * than 0, since those are reserved values used in the previous
         * case statements
         */
        if (this.ttype < 256 &&
          ((this.ctype[this.ttype] & CT_QUOTE) !== 0)) {
          ret = this.sval;
          break;
        }
        ret = `''${this.ttype}`;
        break;
      }
    }
    return `Token[${ret}], line ${this.LINENO}`;
  }
}
