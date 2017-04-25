module.exports.CheckEvent = function ( result, eventString, expectedError ) {
    assert.equal(result.logs.length, 1, "expected a single event");
    for (var i = 0; i < result.logs.length; i++) {
        // If this callback is called, the transaction was successfully processed.
        var log = result.logs[i];
        
        assert.equal(log.event, eventString, "unexpected event");
        assert.equal(log.args.error.valueOf(), expectedError, "unexpected error");
    }    
}

////////////////////////////////////////////////////////////////////////////////

module.exports.CheckEvents = function ( result, eventStrings, expectedErrors ) {
    assert.equal(result.logs.length, eventStrings.length, "unexpected number of events");
    for (var i = 0; i < result.logs.length; i++) {
        // If this callback is called, the transaction was successfully processed.
        var log = result.logs[i];
        
        assert.equal(log.event, eventStrings[i], "unexpected event");
        assert.equal(log.args.error.valueOf(), expectedErrors[i], "unexpected error");
    }    
}


////////////////////////////////////////////////////////////////////////////////

var BigNumber = require('bignumber.js');
var Web3 = require('web3');
function mineOneBlock(dummyAccount) {
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3.eth.sendTransaction({from:dummyAccount,to:dummyAccount}, function(err, address) {
    if (err)
       console.log(err); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
    });
    

/*
request.post(
    'http://localhost:8545/jsonrpc',
    { json: { "method": 'evm_mine' } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
        else console.log(error);
    }
);*/

/*
    var rpc = require('node-json-rpc');
     
    var options = {
      // int port of rpc server, default 5080 for http or 5433 for https 
      port: 8545,
      // string domain name or ip of rpc server, default '127.0.0.1' 
      host: '127.0.0.1',
      // string with default path, default '/' 
      path: '/rpc',
      // boolean false to turn rpc checks off, default true 
      strict: false
    };
     
    // Create a client object with options 
    var client = new rpc.Client(options);
    return client.call(
          [{"jsonrpc": "2.0","method": "eth_blockNumber", "params": [],"id":0},{"method": "evm_mine", "params": null, "id": 1}],
          function (err, res) {
            if (err) { console.log(err); }
            else { console.log("good"); }
          }
        );*/
}



module.exports.mineBlocks =  function( numBlocks, dummyAccount ) {
    for( var i = 0 ; i < numBlocks ; i++ ) {
        mineOneBlock(dummyAccount);
    }
}


module.exports.SendEther =  function( fromAddress, toAddress, valueInEther ) {
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    var valueToSend = web3.toWei(valueInEther, "ether");
    web3.eth.sendTransaction({from:fromAddress.toString(),to:toAddress.toString(),value:valueToSend}, function(err, address) {
    if (err)
       console.log(err); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
    });
}
