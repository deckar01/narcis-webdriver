var url = require('url');
var https = require('https');

/**
 * This class collect screenshots from selenium-webdriver
 *   and uploads them to a narcis server.
 *
 * @class NarcisWebdriver
 *
 * @param {Object} config - The information required to
 *   connect to a narcis server.
 *
 * @param {string} config.project - The URL to a project
 *   on a narcis server.
 *
 * @param {Object} config.authentication - Authentication
 *   credentials required to connect to the narcis server.
 *
 * @param {boolean} [config.enabled=true] - The password for
 *   the given username on the narcis server.
 *
 * @param {Object} platform - The platform the tests are
 *   running on.
 *
 * @param {string} platform.device - The name of the device
 *   the tests are running on.
 *
 * @param {string} platform.os - The name of the operating
 *   system the tests are running on.
 *
 * @param {string} platform.browser - The name of the browser
 *   the tests are running on.
 *
 * @param {string} branch - The name of the current branch.
 *
 * @param {string} build - The hash of the current build.
 */
function NarcisWebdriver(config, platform, branch, build) {
  this.config =      config;
  this.enabled =     config['enabled'] !== false;
  this.platform =    platform;
  this.branch =      branch;
  this.build =       build;
  this.driver =      null;
  this.screenshots = {};
}


/**
 * This sets the webdriver instance used to take screenshots
 *   of the browser.
 *
 * @function setDriver
 * @memberof NarcisWebdriver
 * @instance
 * @public
 *
 * @param {webdriver.WebDriver} driver - The webdriver object.
 * @see {@link http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_class_WebDriver.html|webdriver.WebDriver}
 */
NarcisWebdriver.prototype.setDriver = function(driver) {
  this.driver = driver;
}


/**
 * This takes screenshots of the browser using the webdriver.
 *
 * @function saveScreenshot
 * @memberof NarcisWebdriver
 * @instance
 * @public
 *
 * @param {string} page - The identifier for the current page.
 *
 * @return {Promise<string>} A promise to the screenshot data.
 */
NarcisWebdriver.prototype.saveScreenshot = function(page) {
  var screenshots = this.screenshots;

  return this.driver.takeScreenshot()
  .then(function(dataURL) {
    screenshots[page] = dataURL;
    return dataURL;
  });
}


/**
 * This uploads the screenshots to the narcis server if enabled.
 *
 * @function upload
 * @memberof NarcisWebdriver
 * @instance
 * @public
 *
 * @return {Promise} A promise that the screenshots are uploaded.
 */
NarcisWebdriver.prototype.upload = function() {
  if(!this.enabled) return;

  var projectLocation = url.parse(this.config.project);
  var protocol = projectLocation.protocol.replace(':', '');
  var handler = NarcisWebdriver.protocolHandlers[protocol];

  if(!handler) {
    throw '"' + protocol + '" is not currently supported!';
  }

  var data = {
    platform:    this.platform,
    branch:      this.branch,
    build:       this.build,
    screenshots: this.screenshots,
  };

  return handler(this.config, data);
}


/**
 * The dictionary of narcis server protocols that have been
 *   registered.
 *
 * @member {Object}
 * @memberof NarcisWebdriver
 * @static
 * @private
 */
NarcisWebdriver.protocolHandlers = {};


/**
 * This registers a protocol that is used to send data to a
 *   narcis server.
 *
 * @function registerProtocol
 * @memberof NarcisWebdriver
 * @static
 * @public
 *
 * @param {string} protocol - The request protocol name.
 *
 * @param {NarcisWebdriver~ProtocolHandler} handler - The
 *   protocol upload implementation.
 */
NarcisWebdriver.registerProtocol = function(protocol, handler) {
  NarcisWebdriver.protocolHandlers[protocol] = handler;
}

/**
 * This handles connecting to a narcis server and uploading
 *   screenshots over a specific protocol.
 *
 * @callback NarcisWebdriver~ProtocolHandler
 *
 * @param {Object} config - The information required to
 *   connect to a narcis server.
 *
 * @param {string} config.project - The URL to a project
 *   on a narcis server.
 *
 * @param {Object} config.authentication - Authentication
 *   credentials required to connect to the narcis server.
 *
 * @param {Object} data - The screenshot data.
 *
 * @param {Object} data.platform - The platform the tests
 *   are running on.
 *
 * @param {string} data.platform.device - The name of the
 *   device the tests are running on.
 *
 * @param {string} data.platform.os - The name of the
 *   operating system the tests are running on.
 *
 * @param {string} data.platform.browser - The name of the
 *   browser the tests are running on.
 *
 * @param {string} data.branch - The name of the current branch.
 *
 * @param {string} data.build - The hash of the current build.
 *
 * @param {Array<string>} data.screenshots - The array of
 *   base64 encoded data URL screenshots.
 */

module.exports = NarcisWebdriver;
