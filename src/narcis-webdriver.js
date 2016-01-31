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
 * @param {string} config.username - The name of a user on
 *   the narcis server with permission to edit the project.
 *
 * @param {string} config.password - The password for the
 *   given username on the narcis server.
 *
 * @param {boolean} [config.enabled=true] - The password for
 *   the given username on the narcis server.
 *
 * @param {string} targetPlatform - The identifier for the
 *   current platform the tests are running on.
 *
 * @param {string} version - The identifier for the current
 *   version of the project. (version number or commit hash)
 */
function NarcisWebdriver(config, targetPlatform, version) {
  this.project =        config['project'];
  this.username =       config['username'];
  this.password =       config['password'];
  this.enabled =        config['enabled'] !== false;
  this.targetPlatform = targetPlatform;
  this.version =        version;
  this.driver =         null;
  this.screenshots =    {};
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
 */
NarcisWebdriver.prototype.upload = function() {
  if(!this.enabled) return;

  throw 'NarcisWebdriver.prototype.upload not yet implemented!'
}

module.exports = NarcisWebdriver;
