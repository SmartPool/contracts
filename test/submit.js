var TestPool = artifacts.require("./TestPool.sol");

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



  it("create contract", function() {    
    return TestPool.new([accounts[0],accounts[1],accounts[2]],false,{from:accounts[0],gas:0x5000000}).then(function(instance){
      pool = instance;
    });
    /*
      return pool.submitClaim(7, 7, 7, 8, 9, false,{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "SubmitClaim", 0x81000000 );
    });*/
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
});
