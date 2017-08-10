const helpers = require('./helpers');
const epochinputs  = require('./inputsepoch32');
const claim1inputs  = require('./verifyclaiminputepoch32claim1');
const claim2inputs  = require('./verifyclaiminputepoch32claim2');
const claim3inputs  = require('./verifyclaiminputepoch32claim3');

var BigNumber = require('bignumber.js');
var TestPool = artifacts.require("./SmartPool.sol");
var Ethash = artifacts.require("./Ethash.sol");


////////////////////////////////////////////////////////////////////////////////
var pool;
var ethash;
var poolAddressString = "0x07a457d878bf363e0bb5aa0b096092f941e19962";
var shareIndex;
var submissionIndex;

var uncleRate;
var poolFee;
var precision = 10000;

contract('TestPool_verify3claimsuccesful', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("Create ethash", function() {
    return Ethash.new([accounts[0],accounts[1],accounts[2]],{from:accounts[8]}).then(function(instance){
        ethash = instance;
    });    
  });


  it("Create new pool", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address, accounts[7],false,false,{from:accounts[9]}).then(function(instance){
        pool = instance;
        assert.equal(pool.address, parseInt(poolAddressString), "unexpected pool contract address");
    });    
  });


  
////////////////////////////////////////////////////////////////////////////////

  it("check uncle rate and fee default params", function() {
    return pool.poolFees().then(function(result){
        assert.equal(result, 0 * precision, "default fees should be 0");
        return pool.uncleRate();
    }).then(function(result){
        assert.equal(result, parseInt(0.05 * precision), "default uncle rate should be 5%");
    });

  });

////////////////////////////////////////////////////////////////////////////////

  it("set uncle rate and fees", function() {
    uncleRate = 0.035; // 3.5%
    poolFee = 0.005; // 0.5%
  
    // first set by non-owner
    return pool.setUnlceRateAndFees( parseInt((uncleRate + 0.01) * precision),
                                     parseInt((poolFee + 0.01) * precision ),
                                     {from:accounts[8]} ).then(function(result){
        helpers.CheckEvent( result, "SetUnlceRateAndFees", 0x80000000 );                                     
        // do by owner
        return pool.setUnlceRateAndFees( parseInt(uncleRate * precision),
                                     parseInt(poolFee * precision ),
                                     {from:accounts[0]} );
    }).then(function(result){
        helpers.CheckEvent( result, "SetUnlceRateAndFees", 0 );        
    });  
  });

////////////////////////////////////////////////////////////////////////////////  
  
  it("Register", function() {
    return pool.register(accounts[1],{from:accounts[0]}).then(function(result){
        helpers.CheckEvent( result, "Register", 0 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////
  
  it("Set epoch", function() {
    var numSetEpochInputs = epochinputs.getNumSetEpochInputs();
    for( var i = 0 ; i < numSetEpochInputs ; i++ ) {
        var setEpochDataInput = epochinputs.getSetEpochInputs(i);
        ethash.setEpochData( setEpochDataInput.epoch,
                             setEpochDataInput.fullSizeIn128Resultion,
                             setEpochDataInput.branchDepth,
                             setEpochDataInput.merkleNodes,
                             setEpochDataInput.start,
                             setEpochDataInput.numElems ).then(function(result){
                                 helpers.CheckEvent( result, "SetEpochData", 0 );
                             });
    }
    
    return null;
  });

  
////////////////////////////////////////////////////////////////////////////////

  it("Submit claim 1", function() {
    var sumbitClaimInput = claim1inputs.getSubmitClaimInput();
    return pool.submitClaim(sumbitClaimInput.numShares,
                            sumbitClaimInput.difficulty,
                            sumbitClaimInput.min,
                            sumbitClaimInput.max,
                            sumbitClaimInput.augMerkle,
                            false ).then(function(result){
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("Submit claim 2", function() {
    var sumbitClaimInput = claim2inputs.getSubmitClaimInput();
    return pool.submitClaim(sumbitClaimInput.numShares,
                            sumbitClaimInput.difficulty,
                            sumbitClaimInput.min,
                            sumbitClaimInput.max,
                            sumbitClaimInput.augMerkle,
                            false ).then(function(result){
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("Submit claim 3", function() {
    var sumbitClaimInput = claim3inputs.getSubmitClaimInput();
    return pool.submitClaim(sumbitClaimInput.numShares,
                            sumbitClaimInput.difficulty,
                            sumbitClaimInput.min,
                            sumbitClaimInput.max,
                            sumbitClaimInput.augMerkle,
                            true ).then(function(result){
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("Get share index", function() {
    helpers.mineBlocks(26,accounts[7]);
    return pool.getShareIndexDebugForTestRPC(accounts[0]).then(function(result){
            assert.equal(result.logs.length, 2, "expected two events");
            assert.equal(result.logs[0].event, "GetShareIndexDebugForTestRPCSubmissionIndex", "expected getShareIndexDebugForTestRPC");
            assert.equal(result.logs[1].event, "GetShareIndexDebugForTestRPCShareIndex", "expected getShareIndexDebugForTestRPC");

            submissionIndex = new BigNumber(result.logs[0].args.index);        
            shareIndex = new BigNumber(result.logs[1].args.index);            
    });
  });

////////////////////////////////////////////////////////////////////////////////
/*
  var counters = [0,0,0];
  var totalCount = 0; 
  var getIndices = function( seed ) {
    var Web3 = require('web3');
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    seed = web3.sha3(seed.toString());  
    pool.calculateSubmissionIndex(accounts[0],seed).then(function(result){
        counters[parseInt(result[0].toString(10))]++;
        totalCount++;
        if( totalCount === 1000 ) {
            console.log(counters);
            console.log(claim1inputs.getSubmitClaimInput().numShares);
            console.log(claim2inputs.getSubmitClaimInput().numShares);
            console.log(claim3inputs.getSubmitClaimInput().numShares);
            
        }
        
    });
  };

      it("Get share index from seed", function() {
      for( var i = 0 ; i < 1000 ; i++ ) {  
         getIndices(i);
       }
      });      
  
*/

////////////////////////////////////////////////////////////////////////////////

  it("Verify claim wrong submission index", function() {  
    // Sending and receiving data in JSON format using POST mothod
    var claiminputs = null;
    var subIndex = parseInt(submissionIndex.toString(10));
    
    if( subIndex === 0 ) subIndex = 1;
    else subIndex--;
    
    if( subIndex === 0 ) claiminputs = claim1inputs;
    else if( subIndex === 1 ) claiminputs = claim2inputs;
    else if( subIndex === 2 ) claiminputs = claim3inputs;
    else assert.isOk(false, 'unexpected submission index ' + subIndex.toString());
    
    var actualShareIndex = shareIndex % claiminputs.getSubmitClaimInput().numShares; 
    
    var verifyClaimInput = claiminputs.getValidClaimVerificationInput(actualShareIndex);

    var sumbitClaimInput = claiminputs.getSubmitClaimInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            subIndex,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
         helpers.CheckEvent( result, "VerifyClaim", 0x84000002 );
       });    
    });

////////////////////////////////////////////////////////////////////////////////

  it("Verify claim", function() {  
    // Sending and receiving data in JSON format using POST mothod
    helpers.SendEther(accounts[2],poolAddressString,1);
    
    var claiminputs = null;
    var subIndex = parseInt(submissionIndex.toString(10));
    if( subIndex === 0 ) claiminputs = claim1inputs;
    else if( subIndex === 1 ) claiminputs = claim2inputs;
    else if( subIndex === 2 ) claiminputs = claim3inputs;
    else assert.isOk(false, 'unexpected submission index ' + subIndex.toString());
    
    var verifyClaimInput = claiminputs.getValidClaimVerificationInput(shareIndex);
    var poolBalanceBefore;
    var poolBalanceAfter;

    var sumbitClaimInput = claiminputs.getSubmitClaimInput();
    var numShares = sumbitClaimInput.numShares;
    var shareDiff = sumbitClaimInput.difficulty;
    var networkDiff = 900000000; // hardcoded for testrpc
    
    var numSharesArray = [ claim1inputs.getSubmitClaimInput().numShares,
                           claim2inputs.getSubmitClaimInput().numShares,
                           claim3inputs.getSubmitClaimInput().numShares ];
    var networkDiffArray = [ networkDiff * 1,
                             networkDiff * 2,
                             networkDiff * 3 ]; 
    
    var expectedPayment = helpers.ExpectedPaymentForMultiSubmissions( numSharesArray,
                                                   shareDiff,
                                                   networkDiffArray,
                                                   uncleRate,
                                                   poolFee );    
    
    return pool.getPoolBalance().then(function(result){
        poolBalanceBefore = result;
        return pool.verifyClaim(verifyClaimInput.rlpHeader,
                                verifyClaimInput.nonce,
                                submissionIndex,
                                verifyClaimInput.shareIndex,
                                verifyClaimInput.dataSetLookup,
                                verifyClaimInput.witnessForLookup,
                                verifyClaimInput.augCountersBranchArray,
                                verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
            assert.equal(result.logs.length, 2, "unexpected number of events");
            assert.equal(result.logs[0].event, "DoPayment", "unexpected event" );
            assert.equal(result.logs[1].event, "VerifyClaim", "unexpected event" );
            assert.equal(result.logs[1].args.error, 0, "unexpected error" );
          
            return pool.getPoolBalance();
        }).then(function(result){
            poolBalanceAfter = result;
            
            var balanceDiff = poolBalanceBefore.minus(poolBalanceAfter);
            var paymentAsExpected = true;
            if( expectedPayment.plus(2).lessThan(balanceDiff) ) paymentAsExpected = false;
            if( expectedPayment.minus(2).greaterThan(balanceDiff) ) paymentAsExpected = false;
            
            assert.isOk(paymentAsExpected, 'expected payment ' + expectedPayment.toString(10) + ' is not the same as balance diff ' + balanceDiff.toString(10));            
        });
      });
    });


////////////////////////////////////////////////////////////////////////////////  
});

// gas before change: 2511472
// gas after  change: 2568381