'use strict';

var Token = require('./token');

function isWordStart(c) {
  return (0x61 <= c && c <= 0x7a) || // a..z
    (0x41 <= c && c <= 0x5a) || // A..Z
    (c === 0x5f); // _ (underscore)
}

function isWordBody(c) {
  return (0x61 <= c && c <= 0x7a) || // a..z
    (0x41 <= c && c <= 0x5a) || // A..Z
    (c === 0x5f) || // _ (underscore) 
    (c === 0x27); // ' (single quote);
}

function isWhiteSpace(c) {
  return (c === 0x20) || // space
    (c === 0x09) || // horizontal tab
    (c === 0x0a) || // line feed
    (c === 0x0d) || // carriage return
    (c === 0x0b); // vertical tab
}

function isNumeric(c) {
  return 0x30 <= c && c <= 0x39; // 0..9;
}

function isHexDigit(c) {
  return '0123456789abcdefABCDEF'.indexOf(c) >= 0;
}

function Lexer(source) {
  this.source = source;
  this.index = 0;
  this.length = source.length;
}

Lexer.prototype.nextToken = function() {
  if (this.index >= this.length) {
    return {
      type: Token.eof,
      start: this.index,
      end: this.index
    };
  }

  var c = this.source.charCodeAt(this.index);

  if (isWordStart(c)) {
    return this.scanWord();
  }

  if (isWhiteSpace(c)) {
    return this.scanWhiteSpace();
  }

  if (c === 0x22) { // 0x22 is '"'
    return this.scanQuote();
  }

  if (isNumeric(c)) {
    return this.scanNumber();
  }

  if (c === 0x2f) { // 0x2f is '/'
    return this.scanCommentOrOperator();
  }

  return this.scanOperator(c);
};

Lexer.prototype.scanWord = function() {
  var c, start = this.index++;

  while (this.index < this.length) {
    c = this.source.charCodeAt(this.index);

    if (isWordBody(c)) {
      this.index++;
    } else {
      break;
    }
  }

  return {
    type: Token.word,
    value: this.source.slice(start, this.index).toLowerCase(),
    start: start,
    end: this.index
  };
};

Lexer.prototype.scanWhiteSpace = function() {
  var c, start = this.index++;

  while (this.index < this.length) {
    c = this.source.charCodeAt(this.index);

    if (isWhiteSpace(c)) {
      this.index++;
    } else {
      break;
    }
  }

  return {
    type: Token.whiteSpace,
    start: start,
    end: this.index
  };
};

Lexer.prototype.scanQuote = function() {
  var c, hex, value = '', start = this.index++;

  while (this.index < this.length) {
    c = this.source[this.index++];

    if (c === '"') {
      return {
        type: Token.string,
        value: value,
        start: start,
        end: this.index
      };
    } else if (c === '%') {
      hex = this.scanHex();

      if (hex !== undefined) {
        value += hex;
      } else {
        break;
      }
    } else {
      value += c;
    }
  }

  return {
    type: Token.invalid,
    start: start,
    end: this.index
  };
};

Lexer.prototype.scanHex = function() {
  if (this.index >= this.length) {
    return undefined;
  }

  var lo = this.source.charCodeAt(this.index++);
  if (!isHexDigit(lo)) {
    
  }

  if (this.index)
  lo = this.source.charCodeAt(this.index);
  hi = this.source.charCodeAt(this.index + 1);

  if (isHexDigit(lo) && isHexDigit(hi)) {
    value += hexDigitValue(lo);
    value += hexDigitValue(hi);
    this.index += 2;
  }
}
};

Lexer.prototype.scanOperator = function(c) {
  var start = this.index++;

  switch (c) {
    case 0x26: // 0x26 is '&'
      return { token: Token.ampersand, start: start, end: this.index };

    case 0x28: // 0x28 is '('
      return { token: Token.openParen, start: start, end: this.index };

    case 0x29: // 0x29 is ')'
      return { token: Token.closeParen, start: start, end: this.index };

    case 0x2a: // 0x2a is '*'
      return { token: Token.star, start: start, end: this.index };

    case 0x2b: // 0x2b is '+'
      return { token: Token.plus, start: start, end: this.index };

    case 0x2c: // 0x2c is ','
      return { token: Token.comma, start: start, end: this.index };

    case 0x2d: // 0x2d is '-'
      return { token: Token.minus, start: start, end: this.index };

    case 0x2f: // 0x2f is '/'
      if (this.source.charCodeAt(this.index) === 0x2a) { // 0x2a is '*'
        this.index++;
        return this.scanComment(start);
      }

      return { token: Token.divide, start: start, end: this.index };

    case 0x3b: // 0x3b is ';'
      return { token: Token.semiColon, start: start, end: this.index };

    case 0x3c: // 0x3c is '<'
      if (this.source.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return { token: Token.lessEq, start: start, end: this.index };
      }

      return { token: Token.less, start: start, end: this.index };

    case 0x3d: // 0x3d is '='
      return { token: Token.equal, start: start, end: this.index };

    case 0x3e: // 0x3e is '>'
      if (this.source.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return { token: Token.greater, start: start, end: this.index };
      }

      return { token: Token.greaterEq, start: start, end: this.index };

    case 0x7c: // 0x7c is '|'
      return { token: Token.bar, start: start, end: this.index };

    case 0x21: // 0x21 is '!'
      if (this.source.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return { token: Token.notEq, start: start, end: this.index };
      }

      return { token: Token.invalid, start: start, end: this.index };
  }

  return { token: Token.invalid, start: start, end: this.index };
};

module.exports = Lexer;
