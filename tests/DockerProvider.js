let { errors } = require('web3-core-helpers');
const { exec } = require('child_process');
const util = require('util');

const execute = util.promisify(exec);

/**
 * DockerProvider should be used to send rpc calls via a Docker node
 */
class DockerProvider {
  constructor(endpoint, service) {
    this.endpoint = endpoint;
    this.service = service;
  }

  async send(payload, callback) {
    const opts = JSON.stringify({
      method: 'post',
      body: payload,
      json: true,
      url: this.endpoint
    });
    const cmd = `node -e 'require("request")(${opts}, (err, res, body) => { if (err) { throw err; }; console.log(JSON.stringify(body)) } )'`;
    try {
      const data = await execute(`docker exec ${this.service} ${cmd}`);

      try {
        return callback(null, JSON.parse(data.stdout));
      } catch(e) {
        return callback(errors.InvalidResponse(data.stdout));
      }
    } catch (e) {
      callback(e);
    }
  }

  disconnect() {}
};

module.exports = DockerProvider;
