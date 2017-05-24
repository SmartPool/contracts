var TestPool = artifacts.require("./TestPool.sol");
var Ethash = artifacts.require("./Ethash.sol");
var BigNumber = require('bignumber.js');

const helpers = require('./helpers');

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
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,false,{from:accounts[0]}).then(function(instance){
      pool = instance;
    });
  });
    
////////////////////////////////////////////////////////////////////////////////
  
  it("register and submit", function() {
    return pool.register(accounts[1],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );        
        return pool.submitClaim(7, 7, 7, 100, 9, false,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("submit lower counter", function() {
    return pool.submitClaim(7, 7, 50, 150, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000001 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("submit different difficulty", function() {
    return pool.submitClaim(7, 8, 200, 250, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000003 );
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("overflow submitted shares", function() {
    
    return pool.submitClaim((new BigNumber(2).pow(64)).minus(5), 7, 300, 350, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000005 );
    });
  });
    
////////////////////////////////////////////////////////////////////////////////

  it("close submission", function() {
    
    return pool.submitClaim(2, 7, 400, 450, 9,true,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });
    
////////////////////////////////////////////////////////////////////////////////

  it("submit after closing batch", function() {
    
    return pool.submitClaim(2, 7, 500, 550, 9,false,{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000002 );
    });
  });


    
// TODO - submit with ready for verification
// TODO - check that caculation of odds is ok
    
});
