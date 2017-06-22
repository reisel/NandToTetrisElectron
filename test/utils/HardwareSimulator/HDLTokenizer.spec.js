/**
 * Created by daniel on 4/17/17.
 */
import HDLTokenizer from '../../../app/utils/HardwareSimulator/Gates/HDLTokenizer';

const sampleHdl = `
// This file is part of the materials accompanying the book 
// "The Elements of Computing Systems" by Nisan and Schocken, 
// MIT Press. Book site: www.idc.ac.il/tecs
// File name: tools/builtIn/Mux8Way16.hdl

/**
 * 8-way 16-bit multiplexor.  
 * out = a -- if sel=000
 *       b -- if sel=001
 *       ...
 *       h -- if sel=111
 */
 
CHIP Mux8Way16 {

    IN  a[16], b[16], c[16], d[16],
        e[16], f[16], g[16], h[16],
        sel[3];

    OUT out[16];

    BUILTIN Mux8Way16;
}`;

describe('(HDLTokenizer)', () => {
  let parser;

  beforeAll((done) => {
    const file = new File([new Blob([sampleHdl], { type: 'text/plain' })], 'Mux8Way16.hdl');
    return HDLTokenizer.fromFile(file)
      .then(tokenizer => {
        parser = tokenizer;
        return done();
      });
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
    expect(parser.getFileName()).toEqual('Mux8Way16.hdl');
  });
  it('check has more tokens', () => {
    while (parser.hasMoreTokens()) {
      parser.advance();
    }
    expect(parser.hasMoreTokens()).toEqual(false);
  });
});
