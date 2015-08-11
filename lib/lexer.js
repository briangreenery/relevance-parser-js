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
    (c === 0x27); // ' (apostrophe);
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

  return this.scanOperator();
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

module.exports = Lexer;
