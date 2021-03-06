'use strict';

var isWindows = require('is-windows');
var spawn = require('cross-spawn');
var utils = require('./utils');

/**
 * Expose `bash` util
 */

module.exports = function(pattern) {
  if (isWindows()) {
    throw new Error('windows not supported');
  }

  var cmd = pattern;
  if (!/echo/.test(cmd)) {
    cmd = 'echo ' + escape(pattern);
  }

  var res = spawn.sync(utils.getBashPath(), ['-c', cmd]);
  var err = res.stderr && res.stderr.toString().trim();
  if (err) {
    console.error(cmd);
    throw new Error(err);
  }

  if (!res.stdout) {
    return [];
  }
  return unescape(res.stdout).sort();
};

/**
 * Escape characters that behave differently in bash than node (like spaces, which are
 * valid path characters in node.js but indicate a delimiter in Bash)
 */

function escape(buf) {
  return buf.split(/\\? /).join('_SPACE_')
    .replace(/([*`\[\]])/g, '\\$1')
    .replace(/(\$\{)([^{}]+)(\})/g, function(m, $1, $2, $3) {
      return utils.nc[0] + $2 + utils.nc[2];
    });
}

/**
 * Unescape previously-escaped characters
 */

function unescape(buf) {
  return buf.toString().split(/[ \n]/)
    .filter(Boolean)
    .map(function(str) {
      return utils.unescape(str, {escape: true})
        .split('_SPACE_').join(' ')
        .split(/\\(?!`)/).join('');
    });
}
