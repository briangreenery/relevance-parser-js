'use strict';

var token = require('./token'),
  Keyword = require('./keyword');

/**
 * Return whether the character can start a word.
 */
function isWordStart(c) {
  return (0x61 <= c && c <= 0x7a) || // a..z
    (0x41 <= c && c <= 0x5a) || // A..Z
    (c === 0x5f); // _ (underscore)
}

/**
 * Return whether the character can be part of a word body.
 */
function isWordBody(c) {
  return (0x61 <= c && c <= 0x7a) || // a..z
    (0x41 <= c && c <= 0x5a) || // A..Z
    (c === 0x5f) || // _ (underscore) 
    (c === 0x27); // ' (single quote);
}

/**
 * Return whether the character is whitespace.
 */
function isWhiteSpace(c) {
  return (c === 0x20) || // space
    (c === 0x09) || // horizontal tab
    (c === 0x0a) || // line feed
    (c === 0x0d) || // carriage return
    (c === 0x0b); // vertical tab
}

/**
 * Return whether the character is numeric.
 */
function isNumeric(c) {
  return 0x30 <= c && c <= 0x39; // 0..9;
}

/**
 * Create a new lexer for the relevance text 'text'.
 */
function Lexer(text) {
  this.text = text;
  this.index = 0;
  this.length = text.length;

  this.output = [];
  this.keyword = new Keyword(this.text, this.output);
}

/**
 * Scan for the next token. Return token.EOF if we're at the end of the input.
 */
Lexer.prototype.scan = function() {
  if (this.index >= this.length) {
    return token.EOF;
  }

  var c = this.text.charCodeAt(this.index);
  this.index++;

  if (isWordStart(c)) {
    while (this.index < this.length &&
           isWordBody(this.text.charCodeAt(this.index))) {
      this.index++;
    }

    return token.WORD;
  }

  if (isWhiteSpace(c)) {
    while (this.index < this.length &&
           isWhiteSpace(this.text.charCodeAt(this.index))) {
      this.index++;
    }

    return token.WHITESPACE;
  }

  switch (c) {
    case 0x22: // 0x22 is '"'
      while (this.index < this.length &&
             this.text.charCodeAt(this.index) !== 0x22) {
        this.index++;
      }

      if (this.index >= this.length) {
        return token.UNTERMINATED_STRING;
      }

      this.index++;
      return token.STRING;

    case 0x26: // 0x26 is '&'
      return token.AMPERSAND;

    case 0x28: // 0x28 is '('
      return token.OPEN_PAREN;

    case 0x29: // 0x29 is ')'
      return token.CLOSE_PAREN;

    case 0x2a: // 0x2a is '*'
      return token.STAR;

    case 0x2b: // 0x2b is '+'
      return token.PLUS;

    case 0x2c: // 0x2c is ','
      return token.COMMA;

    case 0x2d: // 0x2d is '-'
      return token.MINUS;

    case 0x2f: // 0x2f is '/'
      if (this.text.charCodeAt(this.index) === 0x2a) { // 0x2a is '*'
        this.index++;

        while (this.index + 1 < this.length) {
          if (this.text.charCodeAt(this.index) === 0x2a && // 0x2a is '*'
              this.text.charCodeAt(this.index + 1) === 0x2f) { // 0x2f is '/'
            this.index += 2;
            return token.COMMENT;
          }

          this.index++;
        }

        this.index = this.length;
        return token.UNTERMINATED_COMMENT;
      }

      return token.DIVIDE;

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

      return token.NUMBER;

    case 0x3b: // 0x3b is ';'
      return token.SEMICOLON;

    case 0x3c: // 0x3c is '<'
      if (this.index < this.length &&
          this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return token.LESS_EQ;
      }

      return token.LESS;

    case 0x3d: // 0x3d is '='
      return token.EQUAL;

    case 0x3e: // 0x3e is '>'
      if (this.index < this.length &&
          this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return token.GREATER_EQ;
      }

      return token.GREATER;

    case 0x7c: // 0x7c is '|'
      return token.BAR;

    case 0x21: // 0x21 is '!'
      if (this.index < this.length &&
          this.text.charCodeAt(this.index) === 0x3d) { // 0x3d is '='
        this.index++;
        return token.NOT_EQUAL;
      }

      return token.INVALID_CHARACTERS;
  }

  return token.INVALID_CHARACTERS;
};

Lexer.prototype.nextToken = function() {
  var start, end, type;

  while (this.output.length === 0) {
    start = this.index;
    type = this.scan();
    end = this.index;

    switch (type) {
      case token.WHITESPACE:
      case token.COMMENT:
        continue;

      case token.WORD:
        this.keyword.append(start, end);
        continue;

      default:
        this.keyword.flush();
        this.output.push({ token: type, start: start, end: end });
        continue;
    }
  }

  return this.output.shift();
};

module.exports = Lexer;
