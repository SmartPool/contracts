pragma solidity ^0.4.8;

// debug contract for testrpc
contract TestPoolStub {
    function TestPoolStub();
    function calculateSubmissionIndex( address sender, uint seed ) constant returns(uint[2]);
    function getClaimSeed(address sender) constant returns(uint);    
}


contract Debug {
    TestPoolStub testPool;
    
    function Debug( TestPoolStub _testPool ) {
        _testPool = testPool;
    }
    
    event Result(uint result);
    function getPoolETHBalance( ) {
        // debug function for testrpc
        Result( testPool.balance );
    }
    
    

    event GetShareIndexDebugForTestRPCSubmissionIndex( uint index );    
    event GetShareIndexDebugForTestRPCShareIndex( uint index );
     
    function getShareIndexDebugForTestRPC( address sender ) {
        uint seed = testPool.getClaimSeed( sender );
        uint[2] memory result = testPool.calculateSubmissionIndex( sender, seed );
        
        GetShareIndexDebugForTestRPCSubmissionIndex( result[0] );
        GetShareIndexDebugForTestRPCShareIndex( result[1] );        
    }        
    
    function getUserBalance( address user ) {
        Result( user.balance );
    }
}

