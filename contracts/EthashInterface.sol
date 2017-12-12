pragma solidity ^0.4.17;

interface EthashInterface {

    function isEpochDataSet( uint epochIndex ) public constant returns(bool);
    function hashimoto( bytes32      header,
                        bytes8       nonceLe,
                        uint[]       dataSetLookup,
                        uint[]       witnessForLookup,
                        uint         epochIndex ) public constant returns(uint);
}
