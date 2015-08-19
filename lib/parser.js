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

Parser.prototype.peekToken = function() {
  return this.peek().token;
};

Parser.prototype.parse = function() {
  return this.parseExpression();
};

Parser.prototype.parseExpression = function() {
  if (this.peekToken() !== token.IF)
    return this.parseCollection();
  
  this.consumeToken(token.IF);
  var test = this.parseExpression();

  this.consumeToken(token.THEN);
  var consequent = this.parseExpression();

  this.consumeToken(token.ELSE);
  var alternate = this.parseExpression();

  return {
    type: 'if',
    test: test,
    consequent: consequent,
    alternate: alternate
  };
};

Parser.prototype.parseCollection = function() {
  this.addExpect(token.SEMICOLON);

  var exprs = [];
  exprs.push(this.parseTuple());

  while (this.peekToken() === token.SEMICOLON) {
    this.consumeToken(token.SEMICOLON);
    exprs.push(this.parseTuple());
  }

  this.removeExpect(token.SEMICOLON);

  return { type: 'collect', exprs: exprs };
};

Parser.prototype.parseTuple = function() {
  this.addExpect(token.COMMA);

  var exprs = [];
  exprs.push(this.parseOr());

  while (this.peekToken() === token.COMMA) {
    this.consumeToken(token.COMMA);
    exprs.push(this.parseOr());
  }

  this.removeExpect(token.COMMA);

  return { type: 'tuple', exprs: exprs };
};

Parser.prototype.parseOr = function() {
  this.addExpect(token.OR);

  var exprs = [];
  exprs.push(this.parseAnd());

  while (this.peekToken() === token.OR) {
    exprs.push(this.parseAnd());
  }

  this.removeExpect(token.OR);

  return { type: 'or', exprs: exprs };
};

Parser.prototype.parseAnd = function() {
  this.addExpect(token.AND);

  var exprs = [];
  exprs.push(this.parseLogical());

  while (this.peekToken() === token.AND) {
    exprs.push(this.parseLogical());
  }

  this.removeExpect(token.AND);

  return { type: 'and', exprs: exprs };
};

Parser.prototype.parseLogical = function() {
  this.addExpectAll(logical);

  var left = this.parseSum();

  if (isOneOf(logical, this.peekToken())) {
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
