import { assert } from 'chai';
import { env, Nont, Term } from '../src/bnf-parser';
import { symbol } from '../src/elementary-parsers';
import { constant } from '../src/expression-parsers';
import { concatSequence, listSequence, node, parsAlt, parsGram, parsRhs, parsSym } from '../src/gram-parser';
import { list, tuple, string } from '@soenderby/functional-utils';

describe('Gram parser', () => {
  describe('concatSequence', () => {
    it('should sequence parsers and return result as a list', () => {
      const expected = list(tuple(string(''), string('ab')));

      const actual = concatSequence(symbol('a'), symbol('b'), string('ab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('listSequence', () => {
    it('should transform list of parsers into parser yielding list of items', () => {
      const parsers = list(
        symbol('a'),
        symbol('b'),
        symbol('c')
      );
      const expected = list(
        tuple(string(''), string('abc')))
      ;
      const actual = listSequence(parsers)(string('abc'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('parsSym', () => {
    it('should generate a parser for a terminal symbol', () => {
      const gram = list();
      const expected = list(
        tuple(
          string(''),
          node(Term(string('s')), list())
        )
      );

      const sym = Term(string('s'));
      const actual = parsSym(gram, sym, string('s'));

      assert.deepEqual(actual, expected);
    });

    it('should generate a parser for a non-terminal symbol', () => {
      const gram = list(
        tuple(Nont(string('s')),
         list(
           list(
             Term(string('s'))
            )
          )
        ));
      const expected = list(
        tuple(string(''),
          node(Nont(string('s')),
            list(
              node(Term(string('s')), list())
            )
          )
        )
      );

      const sym = Nont(string('s'));
      const actual = parsSym(gram, sym, string('s'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('parsAlt', () => {
    it('should generate a parser for an alternative', () => {
      const gram = list();
      const expected = list(
        tuple(string(''),
          list(
            node(Term(string('a')), list()),
            node(Term(string('b')), list())
          )
        )
      );

      const alt = list(Term(string('a')), Term(string('b')));
      const actual = parsAlt(gram, alt)(string('ab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('parsRhs', () => {
    it('should generate parsers for each alternative and make a choice from them', () => {
      const gram = list();
      const expected = list(
        tuple(string(''), list(node(Term(string('s')), list())))
      );

      const sym = list(list(Term(string('s'))));
      const actual = parsRhs(gram, sym)(string('s'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('parsGram', () => {
    it('should generate parser for the language described by given grammar', () => {
      const gram = list(
        tuple(Nont(string('BLOCK')), list( 
          list(
            Term(string('begin')),
            Nont(string('BLOCK')),
            Term(string('end')),
            Nont(string('BLOCK'))
          ),
          list()
        ))
      );
      const expected = list(
        tuple(
          string(''),
          node(Nont(string('BLOCK')),
            list(
              node(Term(string('begin')), list()),
              node(Nont(string('BLOCK')), list()),
              node(Term(string('end')), list()),
              node(Nont(string('BLOCK')),
                list(
                  node(Term(string('begin')), list()),
                  node(Nont(string('BLOCK')),
                    list(
                      node(Term(string('begin')), list()),
                      node(Nont(string('BLOCK')), list()),
                      node(Term(string('end')), list()),
                      node(Nont(string('BLOCK')), list())
                    )
                  ),
                  node(Term(string('end')), list()),
                  node(Nont(string('BLOCK')), list())
                )
              )
            )
          )
        ),
        tuple(
          string(' begin begin end end'),
          node(Nont(string('BLOCK')),
            list(
              node(Term(string('begin')), list()),
              node(Nont(string('BLOCK')), list()),
              node(Term(string('end')), list()),
              node(Nont(string('BLOCK')), list())
            )
          )
        ),
        tuple(
          string('begin end begin begin end end'),
          node(Nont(string('BLOCK')), list())
        )
      );

      const sym = Nont(string('BLOCK'));
      const tokens = list(
        Term(string('begin')),
        Term(string('end')),
        Term(string('begin')),
        Term(string('begin')),
        Term(string('end')),
        Term(string('end'))
      );
      const actual = parsGram(gram, sym, string('begin end begin begin end end'));

      assert.deepEqual(actual, expected);
    });

    it('should generate parser for the language described by given grammar', () => {
      const gram = env('s', 's');
      const expected = list(
        tuple(
          string(''),
          node(Term(string('s')), list())
        )
      );

      const sym = Term(string('s'));
      const actual = parsGram(gram, sym, string('s'));

      assert.deepEqual(actual, expected);
    });
  });
});