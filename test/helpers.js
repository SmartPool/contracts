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

module.exports.CheckNoEvents = function ( result ) {
    assert.equal(result.logs.length, 0, "no events are expected");
}

////////////////////////////////////////////////////////////////////////////////

module.exports.CheckThatThereWasAnEvents = function ( result ) {
    assert.equal(result.logs.length, 1, "one event is expected");
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


////////////////////////////////////////////////////////////////////////////////

module.exports.mineBlocks =  function( numBlocks, dummyAccount ) {
    for( var i = 0 ; i < numBlocks ; i++ ) {
        mineOneBlock(dummyAccount);
    }
};


////////////////////////////////////////////////////////////////////////////////

module.exports.SendEther =  function( fromAddress, toAddress, valueInEther ) {
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    var valueToSend = web3.toWei(valueInEther, "ether");
    web3.eth.sendTransaction({from:fromAddress.toString(),to:toAddress.toString(),value:valueToSend}, function(err, address) {
    if (err)
       console.log(err); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
    });
};

////////////////////////////////////////////////////////////////////////////////

module.exports.GetBalance =  function( address, callback ) {
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3.eth.getBalance(address, callback);    
};

////////////////////////////////////////////////////////////////////////////////

function SubmitClaimInput( numShares, difficulty, min, max, augMerkle ) {
    this.numShares = new BigNumber(numShares);
    this.difficulty = new BigNumber(difficulty);
    this.min = new BigNumber(min);
    this.max = new BigNumber(max);
    this.augMerkle = new BigNumber(augMerkle);
}

module.exports.SubmitClaimInput = function( numShares, difficulty, min, max, augMerkle ) {
    return new SubmitClaimInput( numShares, difficulty, min, max, augMerkle );
}

////////////////////////////////////////////////////////////////////////////////

function VerifyClaimInput( rlpHeader,
                           nonce,
                           shareIndex,
                           dataSetLookupArray,
                           witnessForLookupArray,
                           augCountersBranchArray,
                           augHashesBranchArray ) {

    this.rlpHeader = rlpHeader;
    this.nonce = new BigNumber(nonce);
    this.shareIndex = new BigNumber(shareIndex);
    this.dataSetLookup = [];
    this.witnessForLookup = [];
    this.augHashesBranch = [];
    this.augCountersBranchArray = [];

    var i;
    
    for( i = 0 ; i < dataSetLookupArray.length ; i++ ) {
        this.dataSetLookup.push(new BigNumber(dataSetLookupArray[i]));
    }
    for( i = 0 ; i < witnessForLookupArray.length ; i++ ) {
        this.witnessForLookup.push(new BigNumber(witnessForLookupArray[i]));
    }
    for( i = 0 ; i < augHashesBranchArray.length ; i++ ) {
        this.augHashesBranch.push(new BigNumber(augHashesBranchArray[i]));
    }
    for( i = 0 ; i < augCountersBranchArray.length ; i++ ) {
        this.augCountersBranchArray.push(new BigNumber(augCountersBranchArray[i]));
    }                                   
}

module.exports.VerifyClaimInput = function( rlpHeader,
                                            nonce,
                                            shareIndex,
                                            dataSetLookupArray,
                                            witnessForLookupArray,
                                            augCountersBranchArray,
                                            augHashesBranchArray ) {
    return new VerifyClaimInput( rlpHeader,
                                 nonce,
                                 shareIndex,
                                 dataSetLookupArray,
                                 witnessForLookupArray,
                                 augCountersBranchArray,
                                 augHashesBranchArray );
}


////////////////////////////////////////////////////////////////////////////////

function SetEpochDataInput( epoch, fullSizeIn128Resultion, branchDepth, start, numElems, merkleNodes ) {
    this.epoch = new BigNumber(epoch);
    this.fullSizeIn128Resultion = new BigNumber(fullSizeIn128Resultion);
    this.branchDepth = new BigNumber(branchDepth);
    this.start = new BigNumber(start);
    this.numElems = new BigNumber(numElems);        
    this.merkleNodes = [];
    for( var i = 0 ; i < merkleNodes.length ; i++ ) {
        this.merkleNodes.push(new BigNumber(merkleNodes[i]));
    }
}

module.exports.SetEpochDataInput = function( epoch, fullSizeIn128Resultion, branchDepth, start, numElems, merkleNodes ) {
    return new SetEpochDataInput( epoch, fullSizeIn128Resultion, branchDepth, start, numElems, merkleNodes );
};

////////////////////////////////////////////////////////////////////////////////

function VerifyAgtInput( rootHash,
                         rootMin,
                         rootMax,
                         leafHash,
                         leafCounter,
                         branchIndex,
                         countersBranch,
                         hashesBranch ) { 
    this.rootHash = rootHash;
    this.rootMin = rootMin;
    this.rootMax = rootMax;
    this.leafHash = leafHash;
    this.leafCounter = leafCounter;
    this.branchIndex = branchIndex;    
    this.countersBranch = countersBranch;    
    this.hashesBranch = hashesBranch;    
}

module.exports.VerifyAgtInput = function( rootHash,
                                          rootMin,
                                          rootMax,
                                          leafHash,
                                          leafCounter,
                                          branchIndex,
                                          countersBranch,
                                          hashesBranch ) {
    return new VerifyAgtInput( rootHash,
                               rootMin,
                               rootMax,
                               leafHash,
                               leafCounter,
                               branchIndex,
                               countersBranch,
                               hashesBranch );
};

////////////////////////////////////////////////////////////////////////////////

module.exports.ExpectedPayment = function( numShares, shareDifficulty, networkDifficulty, uncleRate, poolFee ) {
    var etherPayment = (5.0 * numShares * shareDifficulty) / networkDifficulty;
    etherPayment = etherPayment * (1-0.25*uncleRate);
    etherPayment = etherPayment * (1-poolFee);
    
    return web3.toWei(new BigNumber(etherPayment.toString()), "ether");
};

////////////////////////////////////////////////////////////////////////////////

module.exports.ExpectedPaymentForMultiSubmissions = function( numSharesArray,
                                                              shareDifficulty,
                                                              networkDifficultyArray,
                                                              uncleRate,
                                                              poolFee ) {
    numSubmissions = numSharesArray.length;
    sumNetworkDiff = 0;
    sumNumShares = 0;
    
    for( var i = 0 ; i < numSubmissions ; i++ ) {
        sumNumShares += numSharesArray[i];
        sumNetworkDiff += networkDifficultyArray[i] * numSharesArray[i];
    }
    
    var averageNetworkDiff = parseInt( (sumNetworkDiff / sumNumShares).toString() );
    
    return module.exports.ExpectedPayment( sumNumShares, averageNetworkDiff, uncleRate, poolFee );
};


////////////////////////////////////////////////////////////////////////////////


