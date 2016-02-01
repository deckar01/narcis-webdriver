var webdriver = require('selenium-webdriver');

describe("NarcisWebdriver", function() {
  var NarcisWebdriver = require('../src/narcis-webdriver');

  var config;
  var targetPlatform;
  var version;

  beforeEach(function() {
    config = {
      project: 'https://narcis.server.example/project-name',
      authentication: {
        username: 'username.example',
        password: 'password.example',
      },
      enabled: true,
    };
    targetPlatform = 'target-platform-example';
    version = '1.0.0';
  });

  it("should initialize from the constructor", function() {
    var narcis = new NarcisWebdriver(config, targetPlatform, version);

    expect(narcis.config.project).toEqual(
      'https://narcis.server.example/project-name'
    );
    expect(narcis.config.authentication).toEqual({
      username: 'username.example',
      password: 'password.example',
    });
    expect(narcis.enabled).toEqual(true);
    expect(narcis.targetPlatform).toEqual('target-platform-example');
    expect(narcis.version).toEqual('1.0.0');

    expect(narcis.driver).toBeNull();
    expect(narcis.screenshots).toEqual({});
  });

  it("should default enabled to true", function() {
    delete config.enabled;
    expect(config.enabled).toBeUndefined();

    var narcis = new NarcisWebdriver(config, targetPlatform, version);

    expect(narcis.enabled).toEqual(true);
  });

  it("should set a webdriver", function() {
    var narcis = new NarcisWebdriver(config, targetPlatform, version);
    var driver = new webdriver.Builder().forBrowser('firefox').build();

    narcis.setDriver(driver);

    expect(narcis.driver).toBe(driver);

    driver.quit();
  });

  it("should save screenshots", function() {
    var narcis = new NarcisWebdriver(config, targetPlatform, version);
    var driver = new webdriver.Builder().forBrowser('firefox').build();

    var screenshotCount = 0;
    spyOn(driver, 'takeScreenshot').and.returnValue({
      then: function(callback){
        screenshotCount++;
        callback('data:image/png;base64,screenshot+example+' + screenshotCount);
      },
    });

    narcis.setDriver(driver);
    narcis.saveScreenshot('page-example-1');

    expect(narcis.screenshots).toEqual({
      'page-example-1': 'data:image/png;base64,screenshot+example+1',
    });

    narcis.saveScreenshot('page-example-2');
    narcis.saveScreenshot('page-example-3');

    expect(narcis.screenshots).toEqual({
      'page-example-1': 'data:image/png;base64,screenshot+example+1',
      'page-example-2': 'data:image/png;base64,screenshot+example+2',
      'page-example-3': 'data:image/png;base64,screenshot+example+3',
    });

    driver.quit();
  });

  it("should register protocol handlers", function() {
    var handlerSpy = jasmine.createSpy('handler');

    NarcisWebdriver.registerProtocol('protocol:', handlerSpy);

    expect(NarcisWebdriver.protocolHandlers['protocol:']).toBe(handlerSpy);
    expect(handlerSpy.calls.count()).toEqual(0);

    delete NarcisWebdriver['protocol:'];
  });

  it("should not upload to unregistered protocols", function() {
    var narcis = new NarcisWebdriver(config, targetPlatform, version);

    expect(function() { narcis.upload(); }).toThrow(
      '"https:" is not currently supported!'
    );
  });

  it("should upload screenshots using the protocol handler", function() {
    var promiseSpy = jasmine.createSpy('promise');
    var handlerSpy = jasmine.createSpy('handler').and.returnValue(promiseSpy);
    NarcisWebdriver.registerProtocol('https:', handlerSpy);

    var narcis = new NarcisWebdriver(config, targetPlatform, version);
    narcis.screenshots = {
      'page-example-1': 'data:image/png;base64,screenshot+example+1',
      'page-example-2': 'data:image/png;base64,screenshot+example+2',
      'page-example-3': 'data:image/png;base64,screenshot+example+3',
    };

    var result = narcis.upload();

    expect(handlerSpy.calls.count()).toEqual(1);
    expect(result).toBe(promiseSpy);
    expect(handlerSpy).toHaveBeenCalledWith(
      config,
      {
        targetPlatform: targetPlatform,
        version:        version,
        screenshots:    narcis.screenshots,
      }
    );
  });
});
