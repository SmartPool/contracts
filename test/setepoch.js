const helpers = require('./helpers');
var TestPool = artifacts.require("./TestPool.sol");
var pool;


////////////////////////////////////////////////////////////////////////////////


contract('TestPool_setepoch', function(accounts) {  

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });
  
  it("set epoch without authorization", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],{from:accounts[0]}).then(function(instance){
        pool = instance;

        return pool.setEpochData(0, 10, 10, [8], 0, 12, {from: accounts[3]}).then(function(result) {
            helpers.CheckEvent( result, "SetEpochData", 0x82000000 );
        });
        
    });
    
  });
    
////////////////////////////////////////////////////////////////////////////////
  
  it("set epoch", function() {
    return pool.setEpochData(0, 10, 10, [8,9,10], 0, 3, {from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "SetEpochData", 0 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("set epoch twice", function() {
    return pool.setEpochData(0, 10, 10, [8,9,10], 1, 1, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "SetEpochData", 0x82000001 );
    });
  });  
});
