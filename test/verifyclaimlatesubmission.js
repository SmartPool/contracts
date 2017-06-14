const helpers = require('./helpers');
const inputs  = require('./verifyclaiminputsepoch26');

var BigNumber = require('bignumber.js');
var TestPool = artifacts.require("./SmartPool.sol");
var Ethash = artifacts.require("./Ethash.sol");

////////////////////////////////////////////////////////////////////////////////
var pool;
var poolAddressString = "0x07a457d878bf363e0bb5aa0b096092f941e19962";
var shareIndex; 
var submissionIndex;

contract('TestPool_verifyclaimlatesubmission', function(accounts) {
  
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
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,accounts[7],false,false,{from:accounts[9]}).then(function(instance){
        pool = instance;
        assert.equal(pool.address, parseInt(poolAddressString), "unexpected pool contract address");
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

  it("store seed before time", function() {
    return pool.storeClaimSeed(accounts[0]).then(function(result){
        helpers.CheckEvent( result, "StoreClaimSeed", 0x8000002 );
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("Get share index", function() {
    helpers.mineBlocks(260,accounts[7]);
    return pool.getShareIndexDebugForTestRPC(accounts[0]).then(function(result){
            assert.equal(result.logs.length, 2, "expected two events");
            assert.equal(result.logs[0].event, "GetShareIndexDebugForTestRPCSubmissionIndex", "expected getShareIndexDebugForTestRPC");
            assert.equal(result.logs[1].event, "GetShareIndexDebugForTestRPCShareIndex", "expected getShareIndexDebugForTestRPC");

            submissionIndex = new BigNumber(result.logs[0].args.index);        
            shareIndex = new BigNumber(result.logs[1].args.index);
    });
  });


  it("store seed", function() {
    return pool.storeClaimSeed(accounts[0]).then(function(result){
        helpers.CheckEvent( result, "StoreClaimSeed", 0x8000001 );
    });
  });



  it("Verify claim", function() {  
    // Sending and receiving data in JSON format using POST mothod
    helpers.SendEther(accounts[1],poolAddressString,1);    
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000001 );                            
    });
  });


////////////////////////////////////////////////////////////////////////////////  
});

