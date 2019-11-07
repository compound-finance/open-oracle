advanceTimeAndBlock = async (time) => {
    await advanceTime(time);
    await advanceBlock();
    console.log('Time Travelling...');
    return Promise.resolve(web3.eth.getBlock('latest'));
}

advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            return resolve(result);
        });
    });
}

advanceBlock = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            const newBlockHash = web3.eth.getBlock('latest').hash;

            return resolve(newBlockHash)
        });
    });
}

/*function promisifyLogWatch(_contract,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _contract.options.address,
      topics:  ['0xc12a8e1d75371aee68708dbc301ab95ef7a6022cd0eda54f8669aafcb77d21bd']
    }, (error, result) => {
        console.log('Result',result);
        console.log('Error',error);
        if (error)
          reject(error);
        web3.eth.clearSubscriptions();
        resolve(result);
    })
  });
}*/

async function expectThrow(promise){
  try {
    await promise;
  } catch (error) {
    const invalidOpcode = error.message.search('invalid opcode') >= 0;
    const outOfGas = error.message.search('out of gas') >= 0;
    const revert = error.message.search('revert') >= 0;
    assert(
      invalidOpcode || outOfGas || revert,
      'Expected throw, got \'' + error + '\' instead',
    );
    return;
  }
  assert.fail('Expected throw not received');
};

module.exports = {
    advanceTime,
    advanceBlock,
    advanceTimeAndBlock,

    expectThrow
}





