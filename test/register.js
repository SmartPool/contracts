const helpers = require('./helpers');

var TestPool = artifacts.require("./TestPool.sol");



////////////////////////////////////////////////////////////////////////////////

var checkIsRegistered = function ( pool, account, isRegisteredExpected ) {
    return pool.isRegistered.call(account).then(function(result) {
        assert.equal(result,isRegisteredExpected, "unexpected is registered value" );
    });
};

////////////////////////////////////////////////////////////////////////////////

var checkCanRegister = function ( pool, account, canRegisterExpected ) {
    return pool.canRegister.call(account).then(function(result) {
        assert.equal(result,canRegisterExpected, "unexpected can registered value" );
    });
};

////////////////////////////////////////////////////////////////////////////////

var checkIsAndCanRegister = function ( pool, account, isRegistered ) {
    checkIsRegistered( pool, account, isRegistered );
    checkCanRegister( pool, account, ! isRegistered );
};

////////////////////////////////////////////////////////////////////////////////

contract('TestPool', function(accounts) {
  it("register with two accounts", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      checkIsAndCanRegister( pool, accounts[0],false);
      return pool.register(accounts[1],{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        checkIsAndCanRegister( pool, accounts[0],true);
        
        return pool.register(accounts[1],{from: accounts[1]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        checkIsAndCanRegister( pool, accounts[1],true);        
    });
  });
  
////////////////////////////////////////////////////////////////////////////////
  
  it("register twice", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      checkIsAndCanRegister( pool, accounts[2],false);      
      return pool.register(accounts[1],{from: accounts[2]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        checkIsAndCanRegister( pool, accounts[2],true);
        
        return pool.register(accounts[1],{from: accounts[2]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000000 );
        checkIsAndCanRegister( pool, accounts[2],true);
    });
  });

  it("register with payment address 0", function() {
    var pool;
    
    return TestPool.deployed().then(function(instance) {
      pool = instance;
      checkIsAndCanRegister( pool, accounts[3],false);
      return pool.register(0,{from: accounts[3]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000001 );
        checkIsAndCanRegister( pool, accounts[3],false);
    });
  });  
});
