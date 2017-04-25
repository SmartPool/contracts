const helpers = require('./helpers');
const inputs  = require('./verifyclaiminputs');

var BigNumber = require('bignumber.js');
var TestPool = artifacts.require("./TestPool.sol");

var Web3 = require('web3');

var pool;

function randomRange( min, max ) {
    return parseInt(Math.floor(Math.random() * (max-min))) + min;
}

////////////////////////////////////////////////////////////////////////////////

function hashimotoInput( header,
                         nonce,
                         dataSetLookup,
                         witnessForLookup,
                         epochIndex ) {
    this.header = header;
    this.nonce = nonce;
    this.dataSetLookup = dataSetLookup;
    this.witnessForLookup = witnessForLookup;
    this.epochIndex = epochIndex;                             
}

function getHashimotoValidInputForEpoch26(shareIndex) {
    var verifyClaimInput = inputs.getValidClaimVerificationInput(shareIndex);
    
    var validHashimotoInput = new hashimotoInput( web3.sha3(verifyClaimInput.rlpHeader, {encoding: 'hex'}),
                                                  "0x" + verifyClaimInput.nonce.toString(16),
                                                  verifyClaimInput.dataSetLookup,
                                                  verifyClaimInput.witnessForLookup,
                                                  26 );
    
    return validHashimotoInput;
}

var expectedHashimotoOutputsForEpoch26 = [
    new BigNumber("0x4af6e338d2984ca07cd9b3c6a7ea3f1811edc94ee3a885e025119688b5ba"),
    new BigNumber("0x9055703594377b2fc63b5d9c5f83e760c10b8026ed2f8ea902b7020b98c2"),
    new BigNumber("0x318697711d4cbc065f430b2d209f353599e9a3aac39b98fb3c2e59db7e86"),
    new BigNumber("0x6c72482cea56fe54d4b8fd41f7529ab0c677d6b52b4f706e93eaa4a7d9b7"),
    new BigNumber("0x84f495fd29c2092467e97adf5d98422365297e6a54b6ce500cef33e5d943"),
    new BigNumber("0x689dd97c89434c51912e50471281bff20a9686692b7db2b619de59ea42da"),
    new BigNumber("0x588508c195f712f74594614453688f96e66f320116fd8eb83a6a45fa6b60"),
    new BigNumber("0x5179c9cae91d4c641e374ee80f9100fbfa5b2de12b904e25f36c0ebd3a5"),
    new BigNumber("0x41266ee649b63ed1c699c0c3ca666749a15ee33e2f6580086a44469e25af"),
    new BigNumber("0x824762e2557ad4896ffa2ea2d8618317b6daf81e6f6a07d52a209d1fea4a"),
    new BigNumber("0x54b1aa1fac6de1fac32120db9a3c260a0d497906e57abe8da7863756f5dd") ];


////////////////////////////////////////////////////////////////////////////////

contract('TestPool_hashimoto', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("Create new pool", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],{from:accounts[0]}).then(function(instance){
        pool = instance;
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

  it("valid hashimoto epoch 26", function() {
    var index = randomRange(0,11); 
    var validHashimotoInput = getHashimotoValidInputForEpoch26(index);
    return pool.hashimoto.call( validHashimotoInput.header,
                                validHashimotoInput.nonce,
                                validHashimotoInput.dataSetLookup,
                                validHashimotoInput.witnessForLookup,
                                validHashimotoInput.epochIndex ).then(function(result){
        assert.equal(result.toString(16),expectedHashimotoOutputsForEpoch26[index].toString(16), "unexpected hashimoto result at index " + index.toString());
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("invalid hashimoto epoch 26: wrong header", function() {
    var index = randomRange(0,11); 
    var validHashimotoInput = getHashimotoValidInputForEpoch26(index);
    return pool.hashimoto.call( web3.sha3(validHashimotoInput.header, {encoding: 'hex'}), 
                                validHashimotoInput.nonce,
                                validHashimotoInput.dataSetLookup,
                                validHashimotoInput.witnessForLookup,
                                validHashimotoInput.epochIndex ).then(function(result){
        assert.equal(result.toString(16),"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", "unexpected hashimoto result at index " + index.toString());
    });
  });

////////////////////////////////////////////////////////////////////////////////  

  it("invalid hashimoto epoch 26: wrong nonce", function() {
    var index = randomRange(0,11); 
    var validHashimotoInput = getHashimotoValidInputForEpoch26(index);
    var nonce = new String(validHashimotoInput.nonce);

    if( nonce.charAt(2) == '5' ) {
        nonce = nonce.replace('5', '6');
    }
    else {
        nonce = nonce.replace(nonce[2], '5');
    }

    return pool.hashimoto.call( validHashimotoInput.header,
                                nonce.toString(),
                                validHashimotoInput.dataSetLookup,
                                validHashimotoInput.witnessForLookup,
                                validHashimotoInput.epochIndex ).then(function(result){
        assert.equal(result.toString(16),"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", "unexpected hashimoto result at index " + index.toString());
    });
  });

////////////////////////////////////////////////////////////////////////////////  

  it("valid hashimoto epoch 26: wrong dataSetLookup", function() {
    var index = randomRange(0,11); 
    var validHashimotoInput = getHashimotoValidInputForEpoch26(index);
    
    var dataSetLookup = validHashimotoInput.dataSetLookup;
    
    var elemIndex = randomRange(0, validHashimotoInput.dataSetLookup.length - 1);
    dataSetLookup[elemIndex].plus("1");  
    
    return pool.hashimoto.call( validHashimotoInput.header,
                                validHashimotoInput.nonce,
                                dataSetLookup,
                                validHashimotoInput.witnessForLookup,
                                validHashimotoInput.epochIndex ).then(function(result){
        assert.equal(result.toString(16),expectedHashimotoOutputsForEpoch26[index].toString(16), "unexpected hashimoto result at index " + index.toString() + " at elem " + elemIndex.toString());
    });
  });

////////////////////////////////////////////////////////////////////////////////  

  it("valid hashimoto epoch 26: wrong witnessForLookup", function() {
    var index = randomRange(0,11); 
    var validHashimotoInput = getHashimotoValidInputForEpoch26(index);
    
    var witnessForLookup = validHashimotoInput.witnessForLookup;
    
    var elemIndex = randomRange(0, validHashimotoInput.witnessForLookup.length - 1);
    var chooseLsb = randomRange(0,1);

    if( witnessForLookup[elemIndex].lessThanOrEqualTo(new BigNumber("0xffffffffffffffffffffffffffffffff"))) {
        chooseLsb = 1;
    }    
    
    var additionToElem;
    if( chooseLsb > 0 ) {
        additionToElem = new BigNumber( "0x1");
    }
    else {
        additionToElem = new BigNumber( "0x100000000000000000000000000000000");
    }
    
    witnessForLookup[elemIndex].plus(additionToElem);  
    
    return pool.hashimoto.call( validHashimotoInput.header,
                                validHashimotoInput.nonce,
                                validHashimotoInput.dataSetLookup,
                                witnessForLookup,
                                validHashimotoInput.epochIndex ).then(function(result){
        assert.equal(result.toString(16),expectedHashimotoOutputsForEpoch26[index].toString(16), "unexpected hashimoto result at index " + index.toString() + " at elem " + elemIndex.toString() + " choose lsb " + chooseLsb.toString());
    });
  });

  
});
