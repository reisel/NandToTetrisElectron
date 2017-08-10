/**
 * Created by daniel on 4/10/17.
 */
import StreamTokenizer from '../../StreamTokenizer';
import HDLException from './HDLException';
/**
 * HDLTokenizer object: Reads input from an HDL reader and produces a stream of
 * tokens.
 */
export default class HDLTokenizer {

  // Token types
  static TYPE_KEYWORD = 1;
  static TYPE_SYMBOL = 2;
  static TYPE_IDENTIFIER = 3;
  static TYPE_INT_CONST = 4;

  // Keywords of the scripting language
  static KW_CHIP = 1;
  static KW_IN = 2;
  static KW_OUT = 3;
  static KW_BUILTIN = 4;
  static KW_CLOCKED = 5;
  static KW_PARTS = 6;

  // The parser
  parser;

  // Hashtable containing the keywords of the language
  keywords = {
    CHIP: HDLTokenizer.KW_CHIP,
    IN: HDLTokenizer.KW_IN,
    OUT: HDLTokenizer.KW_OUT,
    BUILTIN: HDLTokenizer.KW_BUILTIN,
    CLOCKED: HDLTokenizer.KW_CLOCKED,
    'PARTS:': HDLTokenizer.KW_PARTS
  };

  // Hashtable containing the symbols of the language
  symbols = {
    '{': '{',
    '}': '}',
    ',': ',',
    ';': ';',
    ':': ':',
    '(': '(',
    ')': ')'
  };

  // The type of the current token
  tokenType;

  // The type of the current keyword
  keyWordType;

  // The current symbol
  symbol;

  // The current int value
  intValue;

  // The current string value
  stringValue;

  // The current identifier
  identifier;

  // The current token
  currentToken;

  // The source file name
  fileName;

  /**
   * Constructs a new HDLTokenizer with the given file name.
   */
  constructor(fileName) {
    this.initizalizeInput(fileName);
    this.fileName = fileName;
  }
/**
 * Initializes the tokenizer input
 */
  initizalizeInput(fileName) {
    this.parser = new StreamTokenizer(fileName);
    this.parser.parseNumbers();
    this.parser.slashSlashComments(true);
    this.parser.slashStarComments(true);
    this.parser.wordChars(':', ':');
    this.parser.wordChars('[', '[');
    this.parser.wordChars(']', ']');
    this.parser.nextToken();
  }

/**
 * Returns the source file name.
 */
  getFileName() {
    return this.fileName;
  }

/**
 * Advances the parser to the next token
 * if has no more toekns, throws an exception.
 */
  advance() {
    if (!this.hasMoreTokens()) {
      this.HDLError('Unexpected end of file');
    }

    try {
      switch (this.parser.ttype) {
        case StreamTokenizer.TT_NUMBER:
          this.tokenType = HDLTokenizer.TYPE_INT_CONST;
          this.intValue = this.parser.nval;
          this.currentToken = `${this.intValue}`;
          break;
        case StreamTokenizer.TT_WORD:
          this.currentToken = this.parser.sval;
          const keywordCode = this.keywords[this.currentToken];
          if (keywordCode) {
            this.tokenType = HDLTokenizer.TYPE_KEYWORD;
            this.keyWordType = keywordCode;
          } else {
            this.tokenType = HDLTokenizer.TYPE_IDENTIFIER;
            this.identifier = this.currentToken;
          }
          break;
        default:
          this.tokenType = HDLTokenizer.TYPE_SYMBOL;
          this.symbol = this.parser.ttype;
          this.currentToken = `${this.symbol}`;
          break;
      }
      this.parser.nextToken();
    } catch (ioe) {
      throw new HDLException('Error while reading HDL file');
    }
  }

/**
 * Returns the current token as a String.
 */
  getToken() {
    return this.currentToken;
  }

/**
 * Returns the current token type
 */
  getTokenType() {
    return this.tokenType;
  }

/**
 * Returns the keyword type of the current token
 * May only be called when getTokenType() == KEYWORD
 */
  getKeywordType() {
    return this.keyWordType;
  }

/**
 * Returns the symbol of the current token
 * May only be called when getTokenType() == SYMBOL
 */
  getSymbol() {
    return this.symbol;
  }

/**
 * Returns the int value of the current token
 * May only be called when getTokenType() == INT_CONST
 */
  getIntValue() {
    return this.intValue;
  }

/**
 * Returns the string value of the current token
 * May only be called when getTokenType() == STRING_CONST
 */

/**
 * Returns the identifier value of the current token
 * May only be called when getTokenType() == IDENTIFIER
 */
  getIdentifier() {
    return this.identifier;
  }

/**
 * Returns if there are more tokens in the stream
 */
  hasMoreTokens() {
    return (this.parser.ttype !== StreamTokenizer.TT_EOF);
  }

/**
 * Generates an HDLException with the given message.
 */
  HDLError(message) {
    throw new HDLException(message, this.fileName, this.parser.lineno());
  }
}
