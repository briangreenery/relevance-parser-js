'use strict';

var TOKEN_EOF = 0,
  TOKEN_WHITESPACE = 1,
  TOKEN_WORD = 2,
  TOKEN_STRING = 3,
  TOKEN_AMPERSAND = 4,
  TOKEN_OPEN_PAREN = 5,
  TOKEN_CLOSE_PAREN = 6,
  TOKEN_STAR = 7,
  TOKEN_PLUS = 8,
  TOKEN_COMMA = 9,
  TOKEN_MINUS = 10,
  TOKEN_DIVIDE = 11,
  TOKEN_NUMBER = 12,
  TOKEN_SEMICOLON = 13,
  TOKEN_LESS_EQ = 14,
  TOKEN_LESS = 15,
  TOKEN_EQUAL = 16,
  TOKEN_GREATER_EQ = 17,
  TOKEN_GREATER = 18,
  TOKEN_BAR = 19,
  TOKEN_NOTEQ = 20,
  TOKEN_COMMENT = 21,
  TOKEN_INVALID_CHARACTERS = 22,
  TOKEN_UNTERMINATED_STRING = 23,
  TOKEN_UNTERMINATED_COMMENT = 24;

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

function Lexer(text) {
  this.text = text;
  this.index = 0;
  this.length = text.length;
}

Lexer.prototype.scan = function() {
  if (this.index >= this.length) {
    return TOKEN_EOF;
  }

  var c = this.text.charCodeAt(this.index);
  this.index++;

  if (isWordStart(c)) {
    while (this.index < this.length &&
           isWordBody(this.text.charCodeAt(this.index))) {
      this.index++;
    }

    return TOKEN_WORD;
  }

  if (isWhiteSpace(c)) {
    while (this.index < this.length &&
           isWhiteSpace(this.text.charCodeAt(this.index))) {
      this.index++;
    }

    return TOKEN_WHITESPACE;
  }

  switch (c) {
    case 0x22: // 0x22 is '"'
      while (this.index < this.length &&
             this.text.charCodeAt(this.index) !== 0x22) {
        this.index++;
      }

      if (this.index >= this.length) {
        return TOKEN_UNTERMINATED_STRING;
      }

      this.index++;
      return TOKEN_STRING;

    case 0x26: // 0x26 is '&'
      return TOKEN_AMPERSAND;

    case 0x28: // 0x28 is '('
      return TOKEN_OPEN_PAREN;

    case 0x29: // 0x29 is ')'
      return TOKEN_CLOSE_PAREN;

    case 0x2a: // 0x2a is '*'
      return TOKEN_STAR;

    case 0x2b: // 0x2b is '+'
      return TOKEN_PLUS;

    case 0x2c: // 0x2c is ','
      return TOKEN_COMMA;

    case 0x2d: // 0x2d is '-'
      return TOKEN_MINUS;

    case 0x2f: // 0x2f is '/'
      if (this.text.charCodeAt(this.index) === 0x2a) { // 0x2a is '*'
        this.index++;

        while (this.index + 1 < this.length) {
          if (this.text.charCodeAt(this.index) === 0x2a && // 0x2a is '*'
              this.text.charCodeAt(this.index + 1) === 0x2f) { // 0x2f is '/'
            this.index += 2;
            return TOKEN_COMMENT;
          }
        }

        this.index = this.length;
        return TOKEN_UNTERMINATED_COMMENT;
      }

      return TOKEN_DIVIDE;

    case 0x30: // 0x30 is '0'
    case 0x31: // 0x31 is '1'
    case 0x32: // 0x32 is '2'
    case 0x33: // 0x33 is '3'
    case 0x34: // 0x34 is '4'
    case 0x35: // 0x35 is '5'
    case 0x36: // 0x36 is '6'
    case 0x37: // 0x37 is '7'
    case 0x38: // 0x38 is '8'
    case 0x39: // 0x39 is '9'
      while (this.index < this.length &&
             isNumeric(this.text.charCodeAt(this.index))) {
        this.index++;
      }

      return TOKEN_NUMBER;

    case 0x3b: // 0x3b is ';'
      return TOKEN_SEMICOLON;

    case 0x3c: // 0x3c is '<'
      if (this.index < this.length &&
          this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return TOKEN_LESS_EQ;
      }

      return TOKEN_LESS;

    case 0x3d: // 0x3d is '='
      return TOKEN_EQUAL;

    case 0x3e: // 0x3e is '>'
      if (this.index < this.length &&
          this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return TOKEN_GREATER_EQ;
      }

      return TOKEN_GREATER;

    case 0x7c: // 0x7c is '|'
      return TOKEN_BAR;

    case 0x21: // 0x21 is '!'
      if (this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return TOKEN_NOTEQ;
      }

      return TOKEN_INVALID_CHARACTERS;
  }

  return TOKEN_INVALID_CHARACTERS;
};

Lexer.prototype.nextToken = function() {
  var start = this.index;
  var token = this.scan();
  var end = this.index;

  return { token: token, start: start, end: end };
};

module.exports = Lexer;
