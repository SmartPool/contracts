var TestPool = artifacts.require("./SmartPool.sol");
var Ethash = artifacts.require("./Ethash.sol");
var BigNumber = require('bignumber.js');

const helpers = require('./helpers');

var numShares  = 10;
var difficulty = 100;

////////////////////////////////////////////////////////////////////////////////

var pool;

contract('TestPool_submit', function(accounts) {
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


  it("create contract", function() {    
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,accounts[7],false,false,{from:accounts[0]}).then(function(instance){
      pool = instance;
    });
  });
    
////////////////////////////////////////////////////////////////////////////////
  
  it("register and submit", function() {
    return pool.register(accounts[1],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );        
        return pool.submitClaim(numShares, difficulty, 7, 100, 9, false,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("submit lower counter", function() {
    return pool.submitClaim(7, difficulty, 50, 150, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000001 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("submit different difficulty", function() {
    return pool.submitClaim(7, difficulty+1, 200, 250, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000003 );
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("overflow submitted shares", function() {
    var prevBlockDiff = new BigNumber(900000000);
  
    var ether = (new BigNumber(10).pow(18));
    var blockReward = ether.mul(5);
        
    var thisBlockDiff = prevBlockDiff.mul(2);
    var nextBlockDiff = prevBlockDiff.mul(3);
    
    var maxInt128 = ((new BigNumber(2)).pow(127));
    var thisNumShares = (maxInt128.div(blockReward.mul(difficulty))).mul(thisBlockDiff);
    var nextNumShares = (maxInt128.div(blockReward.mul(difficulty))).mul(nextBlockDiff);
    
    //var nextPayment = (blockReward.mul(thisNumShares).mul(difficulty)).div(thisBlockDiff);
    
    return pool.submitClaim(thisNumShares, difficulty, 300, 350, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
        return pool.submitClaim(nextNumShares, difficulty, 351, 352, 9,false,{from: accounts[0]});    
    }).then(function(result){
        helpers.CheckEvent( result, "SubmitClaim", 0x81000005 );
    });
  });
    
////////////////////////////////////////////////////////////////////////////////

  it("close submission", function() {
    
    return pool.submitClaim(2, difficulty, 400, 450, 9,true,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });
    
////////////////////////////////////////////////////////////////////////////////

  it("submit after closing batch", function() {
    
    return pool.submitClaim(2, difficulty, 500, 550, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000002 );
    });
  });


    
// TODO - submit with ready for verification
// TODO - check that caculation of odds is ok
    
});
