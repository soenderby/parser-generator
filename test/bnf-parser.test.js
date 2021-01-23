import { assert } from 'chai';
import { list, concat, tuple, head, string } from '../src/utils';
import { env, assoc, mapenv, bnf, Term, Nont } from '../src/bnf-parser';
import { apply, some, sp } from '../src/parser-tranformers';
import { greedy1 } from '../src/parser-combinators';
import { satisfy } from '../src/elementary-parsers';

describe('bnf parser', () => {
  describe('env', () => {
    it('should produce a list with a single tuple', () => {
      const expected = list(tuple(string('value1'), 2));
      const actual = env(string('value1'), 2);

      assert.deepEqual(actual, expected);
    });
  });

  describe('assoc', () => {
    it('should return the image associated with a value in an environment with a single element', () => {
      const environment = env(string('value'), string('image'));
      const expected = string('image');
      const actual = assoc(environment, string('value'));

      assert.deepEqual(actual, expected);
    });

    it('should return the image associated with a value in an environment with multiple elements', () => {
      const environment = concat(env(string('value1'), string('image1')), env(string('value2'), string('image2')));
      const expected = string('image2');
      const actual = assoc(environment, string('value2'));
      
      assert.deepEqual(actual, expected);
    });

    it('should work when image consists of nested lists', () => {
      const environment = list(
        tuple(Nont('BLOCK'), list( 
          list(
            Term('begin'),
            Nont('BLOCK'),
            Term('end'),
            Nont('BLOCK')
          )
        ))
      );

      const expected = list( 
        list(
          Term('begin'),
          Nont('BLOCK'),
          Term('end'),
          Nont('BLOCK')
        )
      );

      const sym = Nont('BLOCK');
      const actual = assoc(environment, sym);

      assert.deepEqual(actual, expected);
    });
  });

  describe('mapenv', () => {
    it('should apply a function to all images in an environment', () => {
      const environment = list(
        tuple(1, 1),
        tuple(2, 2),
        tuple(3, 3)
      );
      const expected = list(
        tuple(1, 2),
        tuple(2, 4),
        tuple(3, 6)
      );
      const actual = mapenv(x => x*2, environment);

      assert.deepEqual(actual, expected);
    });
  });
  
  describe('bnf', function() {
    this.timeout(100000);

    it('should parse a string containing a bnf grammar', () => {
      const blockgram = 'BLOCK ::= begin BLOCK end BLOCK  |  .';

      const nont = str => greedy1(satisfy(x => /[A-Z]+/.test(x)), str);
      const term = str => greedy1(satisfy(x => /[a-z]+/.test(x)), str);
      const test = str => some(bnf(nont, term), str);

      const expected = list(
        tuple(Nont('BLOCK'), list( 
          list(
            Term('begin'),
            Nont('BLOCK'),
            Term('end'),
            Nont('BLOCK')
          ),
          list()
        ))
      );

      const actual = test(blockgram);

      assert.deepEqual(actual, expected);
    });
  });
});