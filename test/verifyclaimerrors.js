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

contract('TestPool_verifyclaimerros', function(accounts) {
  
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

  it("Verify before registration", function() {
    var verifyClaimInput = inputs.getValidClaimVerificationInput(0);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x8400000c );        
    });
  });


////////////////////////////////////////////////////////////////////////////////  
  
  it("Register", function() {
    return pool.register(accounts[1],{from:accounts[0]}).then(function(result){
        helpers.CheckEvent( result, "Register", 0 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("Verify before submit claim", function() {
    var verifyClaimInput = inputs.getValidClaimVerificationInput(0);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000003 );        
    });
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

  it("Verify before set epoch data", function() {
    var verifyClaimInput = inputs.getValidClaimVerificationInput(0);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x8400000a );        
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
                             setEpochDataInput.numElems, {from:accounts[0]} ).then(function(result){
                                 helpers.CheckEvent( result, "SetEpochData", 0 );
                             });
    }
    
    return null;
  });

////////////////////////////////////////////////////////////////////////////////

  it("Verify claim before time", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getValidClaimVerificationInput(0);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000001 );        
    });
  });

  it("store seed before time", function() {
    return pool.storeClaimSeed(accounts[0]).then(function(result){
        helpers.CheckEvent( result, "StoreClaimSeed", 0x8000002 );
    });
  });


  it("Verify claim wrong miner id", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getWrongMinderIdClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvents( result, ["VerifyExtraData","VerifyClaim"], [0x83000000,0x84000004] );
        
        
        
    });
  });

  it("Verify claim wrong difficulty", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getWrongDifficultyClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvents( result, ["VerifyExtraData","VerifyClaim"], [0x83000001,0x84000004] );
        
        
        
    });
  });

  it("Verify claim wrong coinbase", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getWrongCoinbaseClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000005 );        
    });
  });

  it("Verify claim too small counter", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getSmallCounterClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000007 );        
    });
  });

  it("Verify claim too big counter", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getBigCounterClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000008 );        
    });
  });

  it("Verify claim invalid agt", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getWrongAgtClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvents( result, ["VerifyAgt","VerifyClaim"], [0x80000009 , 0x84000009] );
    });
  });

  it("Verify claim invalid hashimoto", function() {
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getWrongEthashClaimVerificationInput();
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x8400000b );        
    });
  });


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

/* this will be verified in verify3claimssuccesful.js
  it("Verify claim with wrong submission index", function() {  
    // Sending and receiving data in JSON format using POST mothod
    var index;
    if( submissionIndex > 0 ) index = submissionIndex - 1;
    else index = 1;
    
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            index,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000002 );        
    });
  });
*/

  it("Verify claim with wrong share index", function() {  
    // Sending and receiving data in JSON format using POST mothod
    var index;
    if( shareIndex > 0 ) index = shareIndex - 1;
    else index = 1;
    
    var verifyClaimInput = inputs.getValidClaimVerificationInput(index);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000002 );        
    });
  });


  it("Verify claim in time with zero balance", function() {  
    // Sending and receiving data in JSON format using POST mothod
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            0,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
        helpers.CheckEvent( result, "VerifyClaim", 0x84000000 );        
    });
  });

////////////////////////////////////////////////////////////////////////////////  
});

