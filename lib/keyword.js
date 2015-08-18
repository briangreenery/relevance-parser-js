'use strict';

var token = require('./token');

/**
 * Ignored words. These are treated like whitespace.
 */ 
var ignored = [
  'a',
  'an',
  'the'
];

/**
 * The keywords of the relevance language. This array must be sorted by
 * 'phrase'.
 */
var keywords = [
  {
    token: token.AS,
    phrase: ['as']
  },
  {
    token: token.CONTAINS,
    phrase: ['contains']
  },
  {
    token: token.NOT_CONTAINS,
    phrase: ['does', 'not', 'contain']
  },
  {
    token: token.NOT_ENDS_WITH,
    phrase: ['does', 'not', 'end', 'with']
  },
  {
    token: token.NOT_EQUAL,
    phrase: ['does', 'not', 'equal']
  },
  {
    token: token.NOT_STARTS_WITH,
    phrase: ['does', 'not', 'start', 'with']
  },
  {
    token: token.ELSE,
    phrase: ['else']
  },
  {
    token: token.ENDS_WITH,
    phrase: ['ends', 'with']
  },
  {
    token: token.EQUAL,
    phrase: ['equals']
  },
  {
    token: token.EXIST,
    phrase: ['exist']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['exist', 'no']
  },
  {
    token: token.EXIST,
    phrase: ['exists']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['exists', 'no']
  },
  {
    token: token.IF,
    phrase: ['if']
  },
  {
    token: token.IS,
    phrase: ['is']
  },
  {
    token: token.IS_CONTAINED_BY,
    phrase: ['is', 'contained', 'by']
  },
  {
    token: token.EQUAL,
    phrase: ['is', 'equal', 'to']
  },
  {
    token: token.GREATER,
    phrase: ['is', 'greater', 'than']
  },
  {
    token: token.GREATER_EQ,
    phrase: ['is', 'greater', 'than', 'or', 'equal', 'to']
  },
  {
    token: token.LESS,
    phrase: ['is', 'less', 'than']
  },
  {
    token: token.LESS_EQ,
    phrase: ['is', 'less', 'than', 'or', 'equal', 'to']
  },
  {
    token: token.NOT_EQUAL,
    phrase: ['is', 'not']
  },
  {
    token: token.NOT_CONTAINED_BY,
    phrase: ['is', 'not', 'contained', 'by']
  },
  {
    token: token.NOT_EQUAL,
    phrase: ['is', 'not', 'equal', 'to']
  },
  {
    token: token.LESS_EQ,
    phrase: ['is', 'not', 'greater', 'than']
  },
  {
    token: token.LESS,
    phrase: ['is', 'not', 'greater', 'than', 'or', 'equal', 'to']
  },
  {
    token: token.GREATER_EQ,
    phrase: ['is', 'not', 'less', 'than']
  },
  {
    token: token.GREATER,
    phrase: ['is', 'not', 'less', 'than', 'or', 'equal', 'to']
  },
  {
    token: token.IT,
    phrase: ['it']
  },
  {
    token: token.MOD,
    phrase: ['mod']
  },
  {
    token: token.NOT,
    phrase: ['not']
  },
  {
    token: token.OF,
    phrase: ['of']
  },
  {
    token: token.OR,
    phrase: ['or']
  },
  {
    token: token.STARTS_WITH,
    phrase: ['starts', 'with']
  },
  {
    token: token.THEN,
    phrase: ['then']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['there', 'do', 'not', 'exist']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['there', 'does', 'not', 'exist']
  },
  {
    token: token.EXIST,
    phrase: ['there', 'exist']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['there', 'exist', 'no']
  },
  {
    token: token.EXIST,
    phrase: ['there', 'exists']
  },
  {
    token: token.NOT_EXIST,
    phrase: ['there', 'exists', 'no']
  },
  {
    token: token.WHOSE,
    phrase: ['whose']
  }
];

/**
 * Create a new keyword matcher.
 */
function Keyword(text, output) {
  // The complete text of the relevance expression.
  this.text = text;

  // The array that we'll put lexed tokens in.
  this.output = output;

  // The phrase that we're currently trying to match.
  this.phrase = [];

  // The part of the phrase that doesn't match any keyword.
  this.unmatchedLength = 0;

  // The part of the phrase that matches a keyword.
  this.matchedLength = 0;
  this.matchedToken = 'TOKEN_IDENTIFIER';

  // The part of the phrase that we're currently tring to match to a keyword.
  this.matchingLength = 0;

  // The range of the 'keywords' array that this 
  this.matchingStart = 0;
  this.matchingEnd = keywords.length;
}

/**
 * Output the unmatched phrase. We assume that unmatchedLength > 0.
 */
Keyword.prototype.outputUnmatched = function() {
  var words = this.phrase.splice(0, this.unmatchedLength);
  this.unmatchedLength = 0;

  var value = '';
  words.forEach(function(word, i) {
    if (i !== 0) {
      value += ' ';
    }

    value += word.value;
  });

  this.output.push({
    token: token.IDENTIFIER,
    value: value,
    start: words[0].start,
    end: words[words.length - 1].end
  });
};

/**
 * Output the matched keyword. We assume that matchedLength > 0.
 */
Keyword.prototype.outputMatched = function() {
  var words = this.phrase.splice(0, this.matchedLength);
  this.matchedLength = 0;

  this.output.push({
    token: this.matchedToken,
    start: words[0].start,
    end: words[words.length - 1].end
  });
};

/**
 * Given a phrase, find the first possible keyword that could match it.
 */
Keyword.prototype.findMatchingStart = function(word) {
  for (var i = this.matchingStart; i < this.matchingEnd; ++i) {
    if (keywords[i].phrase[this.matchingLength] === word) {
      return i;
    }
  }

  return this.matchingEnd;
};

/**
 * Given a phrase, find the last possible keyword that could match it.
 */
Keyword.prototype.findMatchingEnd = function(word) {
  for (var i = this.matchingStart; i < this.matchingEnd; ++i) {
    if (keywords[i].phrase[this.matchingLength] !== word) {
      return i;
    }
  }

  return this.matchingEnd;
};

/**
 * Fail the current keyword we're trying to match. This is used when we know
 * that we can't create a longer keyword.
 */
Keyword.prototype.failMatch = function() {
  if (this.matchedLength !== 0) {
    this.outputMatched();
  } else {
    this.unmatchedLength++;
  }

  this.matchingStart = 0;
  this.matchingEnd = keywords.length;
  this.matchingLength = 0;
};

/**
 * Append the word to the phrase that we're trying to match.
 */
Keyword.prototype.append = function(start, end) {
  var value = this.text.slice(start, end).toLowerCase();

  if (ignored.indexOf(value) !== -1) {
    return;
  }

  this.phrase.push({ start: start, end: end, value: value });
  this.match();
};

/**
 * Try to match the current phrase.
 */
Keyword.prototype.match = function() {

  // While we haven't processed the whole phrase yet.
  while (this.unmatchedLength + this.matchingLength !== this.phrase.length) {

    // Get the first word that we need to process.
    var word = this.phrase[this.unmatchedLength + this.matchingLength].value;

    // Find the range of keywords that might match this phrase.
    this.matchingStart = this.findMatchingStart(word);
    this.matchingEnd = this.findMatchingEnd(word);
    this.matchingLength++;

    // At least one keyword might match.
    if (this.matchingStart < this.matchingEnd) {
      var keyword = keywords[this.matchingStart];

      // There is a keyword that exactly matches the phrase so far.
      if (keyword.phrase.length === this.matchingLength) {

        // Since we've found a matching keyword, any unmatched identifier can be
        // output now since we know we can't make a longer identifier.
        if (this.unmatchedLength !== 0) {
          this.outputUnmatched();
        }

        // Remember the longest matching keyword found so far.
        this.matchedLength = this.matchingLength;
        this.matchedToken = keyword.token;

        // Advance past the match.
        this.matchingStart++;
      }
    }

    // There aren't any longer keywords that we can match.
    if (this.matchingStart >= this.matchingEnd) {
      this.failMatch();
    }
  }
};

/**
 * Flush the phrase. This is used when the phrase has ended.
 */
Keyword.prototype.flush = function() {
  while (this.matchingLength !== 0) {
    this.failMatch();
    this.match();
  }

  if (this.unmatchedLength !== 0) {
    this.outputUnmatched();
  }
};

module.exports = Keyword;
