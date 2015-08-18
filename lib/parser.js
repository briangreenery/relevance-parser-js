'use strict';

var token = require('./token');

function Parser(lexer) {
  this.peeked = null;
  this.lexer = lexer;
}

Parser.prototype.peek = function() {
  if (!this.peeked) {
    this.peeked = this.lexer.nextToken();
  }

  return this.peeked;
};

Parser.prototype.parse = function() {
  this.parseExpression();
};

Parser.prototype.parseExpression = function() {
  if (this.peek().token === token.IF)
  {
  }
  else
  {
    this.parseCollection();
  }
};

Parser.prototype.parseCollection = function() {
  this.parseTuple();

  while (this.peekToken() === token.SEMICOLON) {
    this.parseTuple();
  }
};

Parser.prototype.parseTuple = function() {
  this.parseOr();

  if (this.peekToken() === token.COMMA) {
    this.parseOr();
  }
};

Parser.prototype.parseOr = function() {
  this.parseAnd();

  while (this.peekToken() === token.OR) {
    this.parseAnd();
  }
};

Parser.prototype.parseAnd = function() {
  this.parseLogical();

  while (this.peekToken() === token.AND) {
    this.parseLogical();
  }
};

Parser.prototype.parseLogical = function() {
  this.parseSum();

  if (isLogical(this.peekToken())) {
    this.parseSum();
  }
};

Parser.prototype.parseSum = function() {
  this.parseProduct();

  while (isSum(this.peekToken())) {
    this.parseProduct();
  }
};

Parser.prototype.parseProduct = function() {
  this.parseBar();

  while (isProduct(this.peekToken())) {
    this.parseBar();
  }
};

Parser.prototype.parseBar = function() {
  this.parseUnary();

  while (this.peekToken() === token.BAR) {
    this.parseUnary();
  }
};

Parser.prototype.parseUnary = function() {
  if (isUnary(this.peekToken())) {
    this.parseUnary();
  } else {
    this.parseCast();
  }
};

Parser.prototype.parseCast = function() {
  this.parseReference();

  while (this.peekToken() === token.AS) {

  }
};

Parser.prototype.parseReference = function() {
  this.parseProperty();

  if (this.peekToken() === token.OF) {
    this.parseReference();
  } else {

  }
};

Parser.prototype.parseProperty = function() {
  this.parseIndex();

  while (this.peekToken() === token.WHOSE) {
    this.parsePrimary();
  }
};

Parser.prototype.parseIndex = function() {
  if (this.peekToken() === token.IDENTIFIER) {
    this.parsePrimary();
  } else {
    this.parsePrimary();
  }
};

Parser.prototype.parsePrimary = function() {
  if (this.peekToken() === token.OPEN_PAREN) {
    this.parseExpression();
  } else if (isPrimary(this.peekToken())) {

  } else {

  }
};

module.exports = Parser;
