"use strict";
const execa = require("execa");
const rcfile = require("rcfile");
const _ = require("lodash");
const chalk = require("chalk");

// Use colors for quick visual processing
const ERROR_TAG = chalk.red('[ERROR] ');
const SUCCESS_TAG = chalk.green('[SUCCESS] ');

const NO_ERROR = SUCCESS_TAG + "All files are formatted correctly.";
const GENERAL_ERROR = ERROR_TAG + "Error while formatting files:";
const STYLE_ERROR = ERROR_TAG + "The following files are incorrectly formatted:";
const UNEXPECTED_ERROR = ERROR_TAG + "Unexpected error:";

// Parse the configuration file
const config = rcfile('prettier', {configFileName: '.prettyrc'});
const configArgs = _(config)
  .keys()
  .map(function(k) {
     let arg = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
     if (typeof config[k] === 'boolean')  {
       arg = config[k] ? `--${arg}` : `--no-${arg}`;
     } else {
       arg = [`--${arg}`, `${config[k]}`]
     }
     return arg;
  })
  .flatten()
  .value()

module.exports = args => {
  args.push("--list-different");

  return execa("prettier", [...configArgs, ...args])
    .then(() => {
      console.log(NO_ERROR);
      return 0;
    })
    .catch(error => {
      console.log('\n')
      if (error.stderr) {
        console.log(GENERAL_ERROR);
        console.error(error.stderr.replace(/^/gm, '   '));
        return 4;
      } else if (error.stdout) {
        console.log(STYLE_ERROR);
        console.log(error.stdout.replace(/^/gm, '   '))
        return 3;
      } else {
        console.log(UNEXPECTED_ERROR);
				console.error(error.replace(/^/gm, '   '));
        return 1;
      }
    });
};
