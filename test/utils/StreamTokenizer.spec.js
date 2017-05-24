/**
 * Created by daniel on 4/17/17.
 */
import StreamTokenizer from '../../app/utils/StreamTokenizer';

const sampleHdl = `// This file is part of the materials accompanying the book 
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

describe('(StreamTokenizer)', () => {
  let parser;

  beforeEach(() => {
    parser = new StreamTokenizer(Array.from(sampleHdl));
    parser.parseNumbers();
    parser.slashSlashComments(true);
    parser.slashStarComments(true);
    parser.wordChars(':', ':');
    parser.wordChars('[', '[');
    parser.wordChars(']', ']');
  });

  it('should skip all comments and empy lines', () => {
    parser.nextToken();
    expect(parser.sval).toEqual('CHIP');
  });
  it('check token types', () => {
    parser.nextToken();
    expect(parser.sval).toEqual('CHIP');
    expect(parser.ttype).toEqual(StreamTokenizer.TT_WORD);
    parser.nextToken();
    expect(parser.sval).toEqual('Mux8Way16');
    expect(parser.ttype).toEqual(StreamTokenizer.TT_WORD);
    parser.nextToken();
    expect(parser.ttype).toEqual('{');
  });
  it('check number of tokens', () => {
    let i = 0;
    while (parser.nextToken() !== -1) ++i;
    expect(i).toEqual(29);
  });
});
