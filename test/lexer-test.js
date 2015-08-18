'use strict';

var tape = require('tape'),
  Lexer = require('../lib/lexer'),
  token = require('../lib/token');

function createTest(name, text, expected) {
  tape(name + ' test', function(t) {
    t.plan(1);

    var lexer = new Lexer(text);
    var actual = [];

    while (true) {
      var next = lexer.nextToken();
      actual.push(next);

      if (next.token === token.EOF) {
        break;
      }
    }

    t.deepEqual(actual, expected);
  });
}

createTest('EOF', '', [
  { token: token.EOF, start: 0, end: 0 }
]);

createTest('whitespace', ' \r\n\t\v', [
  { token: token.EOF, start: 5, end: 5 }
]);

createTest('ignored', 'a An THE', [
  { token: token.EOF, start: 8, end: 8 }
]);

createTest('number', '0123456789', [
  { token: token.NUMBER, start: 0, end: 10 },
  { token: token.EOF, start: 10, end: 10 }
]);

createTest('string', '"Hello, World!"', [
  { token: token.STRING, start: 0, end: 15 },
  { token: token.EOF, start: 15, end: 15 }
]);

createTest('unterminated string', '"Hello, World!', [
  { token: token.UNTERMINATED_STRING, start: 0, end: 14 },
  { token: token.EOF, start: 14, end: 14 }
]);

createTest('comment', '/* this is a comment */', [
  { token: token.EOF, start: 23, end: 23 }
]);

createTest('unterminated comment', '/* this is a comment', [
  { token: token.UNTERMINATED_COMMENT, start: 0, end: 20 },
  { token: token.EOF, start: 20, end: 20 }
]);

createTest('operators', '& ( ) * + , - / ; < <= = > >= | !=', [
  { token: token.AMPERSAND, start: 0, end: 1 },
  { token: token.OPEN_PAREN, start: 2, end: 3 },
  { token: token.CLOSE_PAREN, start: 4, end: 5 },
  { token: token.STAR, start: 6, end: 7 },
  { token: token.PLUS, start: 8, end: 9 },
  { token: token.COMMA, start: 10, end: 11 },
  { token: token.MINUS, start: 12, end: 13 },
  { token: token.DIVIDE, start: 14, end: 15 },
  { token: token.SEMICOLON, start: 16, end: 17 },
  { token: token.LESS, start: 18, end: 19 },
  { token: token.LESS_EQ, start: 20, end: 22 },
  { token: token.EQUAL, start: 23, end: 24 },
  { token: token.GREATER, start: 25, end: 26 },
  { token: token.GREATER_EQ, start: 27, end: 29 },
  { token: token.BAR, start: 30, end: 31 },
  { token: token.NOT_EQUAL, start: 32, end: 34 },
  { token: token.EOF, start: 34, end: 34 }
]);

createTest('invalid characters', '! @', [
   { token: token.INVALID_CHARACTERS, start: 0, end: 1 },
   { token: token.INVALID_CHARACTERS, start: 2, end: 3 },
   { token: token.EOF, start: 3, end: 3 }
]);

createTest('keyword', 'Name OF the Local   Computer contains "cats"', [
  { token: token.IDENTIFIER, value: 'name', start: 0, end: 4 },
  { token: token.OF, start: 5, end: 7 },
  { token: token.IDENTIFIER, value: 'local computer', start: 12, end: 28 },
  { token: token.CONTAINS, start: 29, end: 37 },
  { token: token.STRING, start: 38, end: 44 },
  { token: token.EOF, start: 44, end: 44 }
]);

createTest('longest keyword', '1 is greater than or equal to 0', [
  { token: token.NUMBER, start: 0, end: 1 },
  { token: token.GREATER_EQ, start: 2, end: 29 },
  { token: token.NUMBER, start: 30, end: 31 },
  { token: token.EOF, start: 31, end: 31 }
]);

createTest('keyword flush', 'is greater than or', [
  { token: token.GREATER, start: 0, end: 15 },
  { token: token.OR, start: 16, end: 18 },
  { token: token.EOF, start: 18, end: 18 }
]);

createTest('keyword flush with identifier', 'is greater than or bears', [
  { token: token.GREATER, start: 0, end: 15 },
  { token: token.OR, start: 16, end: 18 },
  { token: token.IDENTIFIER, value: 'bears', start: 19, end: 24 },
  { token: token.EOF, start: 24, end: 24 }
]);
