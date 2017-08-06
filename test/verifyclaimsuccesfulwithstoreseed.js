const helpers = require('./helpers');
const inputs  = require('./verifyclaiminputsepoch26');

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

contract('TestPool_verifyclaimsuccesfulwithstoreseed', function(accounts) {

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
    var numSetEpochInputs = inputs.getNumSetEpochInputs();
    for( var i = 0 ; i < numSetEpochInputs ; i++ ) {
        var setEpochDataInput = inputs.getSetEpochInputs(i);
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

  it("Submit claim", function() {
    var sumbitClaimInput = inputs.getSubmitClaimInput();
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

  it("store seed on time", function() {
    helpers.mineBlocks(26,accounts[7]);  
    return pool.storeClaimSeed(accounts[0]).then(function(result){
        helpers.CheckEvent( result, "StoreClaimSeed", 0 );
    });
  });


  it("Get share index after 260 blocks", function() {
    helpers.mineBlocks(260,accounts[7]);  
    return pool.getShareIndexDebugForTestRPC(accounts[0]).then(function(result){
            assert.equal(result.logs.length, 2, "expected two events");
            assert.equal(result.logs[0].event, "GetShareIndexDebugForTestRPCSubmissionIndex", "expected getShareIndexDebugForTestRPC");
            assert.equal(result.logs[1].event, "GetShareIndexDebugForTestRPCShareIndex", "expected getShareIndexDebugForTestRPC");

            submissionIndex = new BigNumber(result.logs[0].args.index);        
            shareIndex = new BigNumber(result.logs[1].args.index);            
    });
  });


  it("Verify claim", function() {  
    // Sending and receiving data in JSON format using POST mothod
    helpers.SendEther(accounts[2],poolAddressString,1);
            
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    var poolBalanceBefore;
    var poolBalanceAfter;

    var sumbitClaimInput = inputs.getSubmitClaimInput();
    var numShares = sumbitClaimInput.numShares;
    var shareDiff = sumbitClaimInput.difficulty;
    var networkDiff = 900000000; // hardcoded for testrpc
    
    var expectedPayment = helpers.ExpectedPayment( numShares,
                                                   shareDiff,
                                                   networkDiff,
                                                   uncleRate,
                                                   poolFee );    
    
    return pool.getPoolBalance().then(function(result){
        poolBalanceBefore = result;
        return pool.verifyClaim(verifyClaimInput.rlpHeader,
                                verifyClaimInput.nonce,
                                0,
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