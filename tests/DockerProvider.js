let { errors } = require('web3-core-helpers');

/**
 * DockerProvider should be used to send rpc calls via a Docker node
 */
class DockerProvider {
  constructor(endpoint, docker, service) {
    this.endpoint = endpoint;
    this.docker = docker;
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
      const data = await this.docker.command(`exec ${this.service} ${cmd}`);

      try {
        return callback(null, JSON.parse(data.raw));
      } catch(e) {
        return callback(errors.InvalidResponse(data.raw));
      }
    } catch (e) {
      callback(e);
    }
  }

  disconnect() {}
};

module.exports = DockerProvider;
