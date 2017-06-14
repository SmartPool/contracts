const helpers = require('./helpers');

var TestPool = artifacts.require("./SmartPool.sol");
var Ethash = artifacts.require("./Ethash.sol");


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

var checkIsAndCanRegister = function ( pool, account, isRegistered, canRegister = ! isRegistered ) {
    return pool.isRegistered.call(account).then(function(result) {
        assert.equal(result,isRegistered, "unexpected is registered value" );
        return pool.canRegister.call(account);
    }).then(function(result){
        assert.equal(result,canRegister, "unexpected can register value" );        
    });    
};

////////////////////////////////////////////////////////////////////////////////
var pool;
var whiteListPool;
var blackListPool;

contract('TestPool_register', function(accounts) {
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


  it("register with two accounts", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,accounts[7],false,false,{from:accounts[0]}).then(function(instance){
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
  
////////////////////////////////////////////////////////////////////////////////

  it("try to update white list when white list is disabled", function() {
    return pool.updateWhiteList(accounts[0], true, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateWhiteList", 0x80000001 );
        return;
    });
  });  

////////////////////////////////////////////////////////////////////////////////

  it("try to update black list when white list is disabled", function() {
    return pool.updateBlackList(accounts[0], true, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateBlackList", 0x80000001 );
        return;
    });
  });  

  
////////////////////////////////////////////////////////////////////////////////


  it("create pool with white list", function() {
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,accounts[7],true,true,{from:accounts[0]}).then(function(instance){
      whiteListPool = instance;
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("add account 0 to whitelist from non-owner account", function() {
    return whiteListPool.updateWhiteList(accounts[0], true, {from: accounts[3]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateWhiteList", 0x80000000 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("add account 0 to whitelist from owner account", function() {
    return whiteListPool.updateWhiteList(accounts[0], true, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateWhiteList", 0 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],false, true);        
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register without premission", function() {
    return whiteListPool.register(accounts[3],{from: accounts[3]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000002 );
        return checkIsAndCanRegister( whiteListPool, accounts[3],false, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register with premission", function() {
    return whiteListPool.register(accounts[3],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],true, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("remove from whitelist account 0", function() {
    return whiteListPool.updateWhiteList(accounts[0], false, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateWhiteList", 0 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],false, false);        
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register after removed from whitelist", function() {
    return whiteListPool.register(accounts[0],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000002 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],false, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("disable whitelist from non-owner", function() {
    return whiteListPool.disableWhiteListForever({from: accounts[5]}).then(function(result) {
        helpers.CheckEvent( result, "DisableWhiteListForever", 0x80000000 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],false, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("disable whitelist from owner", function() {
    return whiteListPool.disableWhiteListForever({from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "DisableWhiteListForever", 0 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],false);
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("register after whitelist disabled", function() {
    return whiteListPool.register(accounts[0],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( whiteListPool, accounts[0],true);
    });
  });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////

  it("add account 0 to blacklist from non-owner account", function() {
  
    blackListPool = whiteListPool;
    
    return blackListPool.updateBlackList(accounts[0], true, {from: accounts[3]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateBlackList", 0x80000000 );
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("add account 0 to blacklist from owner account", function() {
    return blackListPool.updateBlackList(accounts[0], true, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateBlackList", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[0],false, false);        
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("add account 1 to blacklist from owner account", function() {
    return blackListPool.updateBlackList(accounts[1], true, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateBlackList", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[1],false, false);        
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("register without premission", function() {
    return blackListPool.register(accounts[0],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000003 );
        return checkIsAndCanRegister( blackListPool, accounts[0],false, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register with premission", function() {
    return blackListPool.register(accounts[3],{from: accounts[3]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[3],true, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("remove from blacklist account 0", function() {
    return blackListPool.updateBlackList(accounts[0], false, {from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "UpdateBlackList", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[0],false, true);        
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register after removed from blacklist", function() {
    return blackListPool.register(accounts[0],{from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[0],true, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("register after different account was removed from blacklist", function() {
    return blackListPool.register(accounts[1],{from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0x80000003 );
        return checkIsAndCanRegister( blackListPool, accounts[1],false, false);
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("disable blacklist from non-owner", function() {
    return blackListPool.disableBlackListForever({from: accounts[5]}).then(function(result) {
        helpers.CheckEvent( result, "DisableBlackListForever", 0x80000000 );
        return checkIsAndCanRegister( blackListPool, accounts[1],false, false);
    });
  });

////////////////////////////////////////////////////////////////////////////////

  it("disable whitelist from owner", function() {
    return blackListPool.disableBlackListForever({from: accounts[0]}).then(function(result) {
        helpers.CheckEvent( result, "DisableBlackListForever", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[1],false);
    });
  });


////////////////////////////////////////////////////////////////////////////////

  it("register after blacklist disabled", function() {
    return blackListPool.register(accounts[1],{from: accounts[1]}).then(function(result) {
        helpers.CheckEvent( result, "Register", 0 );
        return checkIsAndCanRegister( blackListPool, accounts[1],true);
    });
  });
});








