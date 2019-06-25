const {Docker} = require('node-docker-api');
const tar = require('tar-fs');
const path = require('path');

const promisifyStream = stream => new Promise((resolve, reject) => {
  stream.on('data', data => console.log(data.toString()))
  stream.on('end', resolve)
  stream.on('error', reject)
});

async function pull(docker, image) {
   let dockerImage = await docker.image.create({}, { fromImage: image , tag: 'latest'});
    // .then((stream) => promisifyStream(stream))
    // .then(() => docker.image.status(image))
    // .then((image) => image.history())
    // .then((events) => console.log(events))
 }

describe('integration tests', () => {
  test.only('runs oracle, posts prices, reads prices', async () => {
    let ganache;

    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    let tarStream = tar.pack(path.join(__dirname, '..'));
    console.log(tarStream);

    try {
      // Pull ganache image
      await pull(docker, 'trufflesuite/ganache-cli');

      // Run ganache container
      ganache = await docker.container.create({
        Image: 'trufflesuite/ganache-cli',
        HostConfig: {
          PortBindings: {
            "8545/tcp": [ // port inside of docker container 
              {HostPort: "9999"} // port on host machine
            ]
          }
        },
        ExposedPorts: {
          "8545/tcp": {} // port inside of docker container 
        }
      });

      // let buildStream = await docker.image.build(tarStream, { t: 'test-oracle' })
      // await promisifyStream(buildStream);

      // // Deploy oracle
      // oracle = await docker.container.create({
      //   Image: 'test-oracle'
      // });

      console.log(ganache);
      // console.log(oracle);
    } finally {
      // ganache && ganache.stop();
      // oracle && oracle.stop();
    }
  }, 60000);
});
