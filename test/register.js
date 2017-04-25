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
    return pool.isRegistered.call(account).then(function(result) {
        assert.equal(result,isRegistered, "unexpected is registered value" );
        return pool.canRegister.call(account);
    }).then(function(result){
        assert.equal(result,! isRegistered, "unexpected can register value" );        
    });    
};

////////////////////////////////////////////////////////////////////////////////
var pool;

contract('TestPool_register', function(accounts) {
  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });


  it("register with two accounts", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],{from:accounts[0]}).then(function(instance){
      pool = instance;
      return checkIsAndCanRegister( pool, accounts[0],false);
    }).then(function(result){
      return pool.register(accounts[1],{from: accounts[0]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( pool, accounts[0],true);
    }).then(function(result){    
        return pool.register(accounts[1],{from: accounts[1]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( pool, accounts[1],true);        
    });
  });
  
////////////////////////////////////////////////////////////////////////////////
  
  it("register twice", function() {
    
    return pool.register(accounts[1],{from: accounts[2]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( pool, accounts[2],true);
        }).then(function(result){
        
        return pool.register(accounts[1],{from: accounts[2]});
    }).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000000 );
        return checkIsAndCanRegister( pool, accounts[2],true);
    });
  });

  it("register with payment address 0", function() {
    return pool.register(0,{from: accounts[3]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000001 );
        return checkIsAndCanRegister( pool, accounts[3],false);
    });
  });  
});
