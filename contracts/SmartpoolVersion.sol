pragma solidity ^0.4.17;

contract SmartpoolVersion {
    address    public poolContract;
    bytes32    public clientVersion;

    mapping (address=>bool) owners;

    function SmartpoolVersion( address[3] _owners ) public {
        owners[_owners[0]] = true;
        owners[_owners[1]] = true;
        owners[_owners[2]] = true;
    }

    function updatePoolContract( address newAddress ) public {
        require( owners[msg.sender] );

        poolContract = newAddress;
    }

    function updateClientVersion( bytes32 version ) public {
        require( owners[msg.sender] );

        clientVersion = version;
    }
}
