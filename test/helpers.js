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
function mineOneBlock(dummyAccount) {
  return new Promise(function(fulfill, reject){
          web3.eth.sendTransaction({to: dummyAccount, from: dummyAccount,}, function(error, result){
          if( error ) {
              return reject(error);
          }
          else {
              return fulfill(true);
          }
      });
  });
}


////////////////////////////////////////////////////////////////////////////////

module.exports.mineBlocksWithPromise =  function( numBlocks, dummyAccount ) {
  return new Promise(function (fulfill, reject){

      var inputs = [];

      for (var i = 0 ; i < numBlocks ; i++ ) {
          inputs.push(i);
      }

     return inputs.reduce(function (promise, item) {
      return promise.then(function () {
          return mineOneBlock(dummyAccount);
      });

      }, Promise.resolve()).then(function(){
          fulfill(true);
      }).catch(function(err){
          reject(err);
      });
  });
};


////////////////////////////////////////////////////////////////////////////////

module.exports.sendEtherWithPromise = function( sender, recv, valueInEther ) {
    var amount = web3.toWei(valueInEther);
    return new Promise(function(fulfill, reject){
            web3.eth.sendTransaction({to: recv, from: sender, value: amount}, function(error, result){
            if( error ) {
                return reject(error);
            }
            else {
                return fulfill(true);
            }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////

module.exports.GetBalanceWithPromise =  function( address, callback ) {
  return new Promise(function(fulfill, reject){
          web3.eth.getBalance(address, function(error, result){
          if( error ) {
              return reject(error);
          }
          else {
              return fulfill(result);
          }
      });
  });
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
    return new BigNumber(web3.toWei(new BigNumber(etherPayment.toString()), "ether"));
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
