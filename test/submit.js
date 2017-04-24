var TestPool = artifacts.require("./TestPool.sol");

const helpers = require('./helpers');

////////////////////////////////////////////////////////////////////////////////

contract('TestPool', function(accounts) {
  it("submit without register", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      return pool.submitClaim(7, 7, 7, 8, 9,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000000 );
    });
  });
    
////////////////////////////////////////////////////////////////////////////////
  
  it("register and submit", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      return pool.register(accounts[1],{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );        
        return pool.submitClaim(7, 7, 7, 100, 9,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0 );
    });
  });
  
////////////////////////////////////////////////////////////////////////////////

  it("submit lower counter", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      return pool.submitClaim(7, 7, 50, 150, 9,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000001 );
    });
  });
});
