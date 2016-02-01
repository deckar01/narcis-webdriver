var https = require('https');
var url = require('url');
var Promise = require('promise');

/**
 * This handles connecting to a narcis server and uploading
 *   screenshots over https.
 *
 * @type {NarcisWebdriver~ProtocolHandler}
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
 * @param {string} config.authentication.username - The
 *   identifier for a user that has permission to edit the
 *   project.
 *
 * @param {string} config.authentication.password - The 
 *   password required to authenticate the user with the
 *   server.
 *
 * @param {Object} data - The screenshot data.
 *
 * @param {string} data.targetPlatform - The identifier for
 *   the current platform the tests are running on.
 *
 * @param {string} data.version - The identifier for the current
 *   version of the project. (version number or commit hash)
 *
 * @param {Array<string>} data.screenshots - The array of
 *   base64 encoded data URL screenshots.
 */
function NarcisHttpsProtocol(config, data) {

  data.username = config.authentication.username;
  data.password = config.authentication.password;

  var postData = JSON.stringify(data);
  
  var project = url.parse(config.project);

  var options = {
    hostname: project.hostname,
    port: project.port || 443,
    path: project.path || '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    }
  };

  return new Promise(function(resolve, reject) {

    var req = https.request(options, function(res) {

      var resData = '';
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        resData += chunk;
      });

      res.on('end', function() {
        try {
          resolve(JSON.parse(resData));
        } catch(e) {
          resolve(resData);
        }
      });

    });

    req.on('error', reject);

    req.write(postData);
    req.end();

  });

}

module.exports = NarcisHttpsProtocol;
