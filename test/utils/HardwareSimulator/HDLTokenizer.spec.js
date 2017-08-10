/**
 * Created by daniel on 4/17/17.
 */
import HDLTokenizer from '../../../app/utils/HardwareSimulator/Gates/HDLTokenizer';


describe('(HDLTokenizer)', () => {
  let parser;

  beforeAll(() => {
    parser =  new HDLTokenizer(`${__dirname}/assets/Mux8Way16.hdl`);
  });
  beforeEach(() => {
    parser.advance();
  });
  it('check TYPE_KEYWORD', () => {
    expect(parser.getTokenType()).toEqual(HDLTokenizer.TYPE_KEYWORD);
    expect(parser.getToken()).toEqual('CHIP');
    expect(parser.getKeywordType()).toEqual(HDLTokenizer.KW_CHIP);
  });
  it('check TYPE_IDENTIFIER', () => {
    expect(parser.tokenType).toEqual(HDLTokenizer.TYPE_IDENTIFIER);
    expect(parser.currentToken).toEqual('Mux8Way16');
    expect(parser.getIdentifier()).toEqual('Mux8Way16');
  });
  it('check TYPE_SYMBOL', () => {
    expect(parser.tokenType).toEqual(HDLTokenizer.TYPE_SYMBOL);
    expect(parser.currentToken).toEqual('{');
    expect(parser.getSymbol()).toEqual('{');
  });
  it('check keyword', () => {
    expect(parser.tokenType).toEqual(HDLTokenizer.TYPE_KEYWORD);
    expect(parser.currentToken).toEqual('IN');
    expect(parser.getKeywordType()).toEqual(HDLTokenizer.KW_IN);
  });
  it('check File Name', () => {
    expect(parser.getFileName()).toEqual(`${__dirname}/assets/Mux8Way16.hdl`);
  });
  it('check has more tokens', () => {
    while (parser.hasMoreTokens()) {
      parser.advance();
    }
    expect(parser.hasMoreTokens()).toEqual(false);
  });
});
