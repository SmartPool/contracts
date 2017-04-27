const helpers = require('./helpers');
const inputs  = require('./verifyclaiminputsepoch26');

var BigNumber = require('bignumber.js');
var TestPool = artifacts.require("./TestPool.sol");


////////////////////////////////////////////////////////////////////////////////
var pool;
var poolAddressString = "0x07a457d878bf363e0bb5aa0b096092f941e19962";
var shareIndex;

contract('TestPool_verifyclaimsuccesful', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("Create new pool", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],{from:accounts[9]}).then(function(instance){
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
        pool.setEpochData( setEpochDataInput.epoch,
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
                            sumbitClaimInput.augMerkle ).then(function(result){
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("Get share index", function() {
    helpers.mineBlocks(26,accounts[7]);
    return pool.getShareIndexDebugForTestRPC(accounts[0]).then(function(result){
            assert.equal(result.logs.length, 1, "expected a single event");
            assert.equal(result.logs[0].event, "GetShareIndexDebugForTestRPC", "expected getShareIndexDebugForTestRPC");
        
            shareIndex = new BigNumber(result.logs[0].args.index);
    });
  });


  it("Verify claim", function() {  
    // Sending and receiving data in JSON format using POST mothod
    helpers.SendEther(accounts[0],poolAddressString,1);    
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    return pool.verifyClaim(verifyClaimInput.rlpHeader,
                            verifyClaimInput.nonce,
                            verifyClaimInput.shareIndex,
                            verifyClaimInput.dataSetLookup,
                            verifyClaimInput.witnessForLookup,
                            verifyClaimInput.augCountersBranchArray,
                            verifyClaimInput.augHashesBranch, {from:accounts[0]} ).then(function(result){
        assert.equal(result.logs.length, 2, "unexpected number of events");
        assert.equal(result.logs[0].event, "ValidShares", "unexpected event" );
        assert.equal(result.logs[1].event, "VerifyClaim", "unexpected event" );
        assert.equal(result.logs[1].args.error, 0, "unexpected error" );                                    
    });
  });


////////////////////////////////////////////////////////////////////////////////  
});

