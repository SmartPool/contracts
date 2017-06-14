const helpers = require('./helpers');
const inputs  = require('./verifyagtinputs');

var BigNumber = require('bignumber.js');
var TestPool = artifacts.require("./SmartPool.sol");
var Ethash = artifacts.require("./Ethash.sol");


////////////////////////////////////////////////////////////////////////////////

var pool;
var poolAddressString = "0x07a457d878bf363e0bb5aa0b096092f941e19962";
var shareIndex;

contract('TestPool_verifyagt', function(accounts) {
  
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
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,accounts[7],false,false,{from:accounts[1]}).then(function(instance){
        pool = instance;
    });    
  });
  
////////////////////////////////////////////////////////////////////////////////  
  
  it("Valid agt 0", function() {
    agtInput = inputs.ValidAgtFirstShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckNoEvents( result );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("Valid agt 1", function() {
    agtInput = inputs.ValidAgtLastShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckNoEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("Valid agt 2", function() {
    agtInput = inputs.ValidAgtMiddleShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckNoEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("single duplication at first share 1", function() {
    agtInput = inputs.DuplicationSingleAgtFirstShare1();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("single duplication at first share 2", function() {
    agtInput = inputs.DuplicationSingleAgtFirstShare2();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("single duplication at last share", function() {
    agtInput = inputs.DuplicationSingleAgtLastShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("single duplication at middle share", function() {
    agtInput = inputs.DuplicationSingleAgtMiddleShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

  
////////////////////////////////////////////////////////////////////////////////

  it("bulk duplication at first share 1", function() {
    agtInput = inputs.DuplicationBulkAgtFirstShare1();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("bulk duplication at first share 2", function() {
    agtInput = inputs.DuplicationBulkAgtFirstShare2();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("bulk duplication at last share", function() {
    agtInput = inputs.DuplicationBulkAgtLastShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("bulk duplication at middle share", function() {
    agtInput = inputs.DuplicationBulkAgtMiddleShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("pattern duplication at middle share", function() {
    agtInput = inputs.DuplicationPatternAgtMiddleShare();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckThatThereWasAnEvents( result );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("invalid leaf counter", function() {
    agtInput = inputs.InvalidAgtLeafCounter();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000009 );
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("invalid leaf value", function() {
    agtInput = inputs.InvalidAgtLeafValue();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000005 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid left node min >= max", function() {
    agtInput = inputs.InvalidAgtNodeMinGeqLeftMax();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000000 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid right node min >= max", function() {
    agtInput = inputs.InvalidAgtNodeMinGeqRightMax();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000000 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid left leaf min >= max", function() {
    agtInput = inputs.InvalidAgtLeftLeafMinGtMax();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000001 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid right leaf min >= max", function() {
    agtInput = inputs.InvalidAgtRightLeafMinGtMax();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000002 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid left.max >= right.min", function() {
    agtInput = inputs.InvalidAgtLeftMaxGeRightMin();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000009 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid root min", function() {
    agtInput = inputs.InvalidAgtRootMin();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000003 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid root max", function() {
    agtInput = inputs.InvalidAgtRootMax();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000004 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid root hash", function() {
    agtInput = inputs.InvalidAgtRootHash();
    return pool.verifyAgtDebugForTesting( agtInput.rootHash,
                                          agtInput.rootMin,
                                          agtInput.rootMax,
                                          agtInput.leafHash,
                                          agtInput.leafCounter,
                                          agtInput.branchIndex,
                                          agtInput.countersBranch,
                                          agtInput.hashesBranch ).then(function(result){
        helpers.CheckEvent( result, "VerifyAgt", 0x80000005 );
    });
  });


////////////////////////////////////////////////////////////////////////////////  
});

