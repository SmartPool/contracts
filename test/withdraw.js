var BigNumber = require('bignumber.js');

const helpers = require('./helpers');

var TestPool = artifacts.require("./SmartPool.sol");
var Debug = artifacts.require("./Debug.sol");
var Ethash = artifacts.require("./Ethash.sol");



////////////////////////////////////////////////////////////////////////////////
var pool;
var debug;
var poolFunds = 14;
var multisig;

contract('TestPool_withdraw', function(accounts) {
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


  it("make new pool and tranfer wei", function() {
    multisig = accounts[7];
    return TestPool.new([accounts[0],accounts[1],accounts[2]],ethash.address,multisig,false,false,{from:accounts[0],value:0}).then(function(instance){
      pool = instance;
      return Debug.new(pool.address,{from:accounts[8]});
    }).then(function(instance){
      debug = instance;
      helpers.SendEther(accounts[2],pool.address.toString(),poolFunds / (10**18));
      return pool.getPoolBalance();
    }).then(function(result){
        poolBalance = result.toString(10);
        assert.equal(poolBalance,poolFunds.toString(), "unexpected pool balance" );    
    });
  });
  
////////////////////////////////////////////////////////////////////////////////
  
  it("withdraw half", function() {
    var balanceBefore;
    var withdrawalAmount = parseInt(poolFunds / 2);
    return debug.getUserBalance(multisig).then(function(result){
        balanceBefore = result.logs[0].args.result;
        return pool.withdraw( withdrawalAmount, {from:accounts[0]});
    }).then(function(result){
        return pool.getPoolBalance();
    }).then(function(result){
        assert.equal(parseInt(result.toString(10)),
                     poolFunds - withdrawalAmount,
                     "unexpected pool balance" );
        return debug.getUserBalance(multisig);
    }).then(function(result2){
        var balanceAfter = result2.logs[0].args.result.toString(10);
        var expectedBalance = balanceBefore.add(new BigNumber(withdrawalAmount));
        assert.equal(balanceAfter.toString(10), expectedBalance.toString(10), "unexpected multisig balance" );    
    });
  });
  
  it("withdraw without premission", function() {
    var balanceBefore;
    var withdrawalAmount = parseInt(poolFunds / 2);
    return pool.getPoolBalance().then(function(result){
        balanceBefore = result;
        return pool.withdraw( withdrawalAmount, {from:accounts[4]});
    }).then(function(result){
        helpers.CheckEvent( result, "Withdraw", 0x80000000 );
        return pool.getPoolBalance();
    }).then(function(result){
        assert.equal(result.toString(10),
                     balanceBefore.toString(10),
                     "unexpected pool balance" );
    });
  });
  
  it("withdraw all", function() {
    var balanceBefore;
    var withdrawalAmount = poolFunds - parseInt(poolFunds / 2);
    return debug.getUserBalance(multisig).then(function(result){
        balanceBefore = result.logs[0].args.result;
        return pool.withdraw( withdrawalAmount, {from:accounts[0]});
    }).then(function(result){
        return pool.getPoolBalance();
    }).then(function(result){
        assert.equal(parseInt(result.toString(10)),
                     0,
                     "unexpected pool balance" );
        return debug.getUserBalance(multisig);
    }).then(function(result2){
        var balanceAfter = result2.logs[0].args.result.toString(10);
        var expectedBalance = balanceBefore.add(new BigNumber(withdrawalAmount));
        assert.equal(balanceAfter.toString(10), expectedBalance.toString(10), "unexpected multisig balance" );    
    });
  });    
});
