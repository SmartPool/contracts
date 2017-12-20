# contracts

## Deploy

To deploy the contracts:

### You will need a synced ethereum node:
```
geth --testnet --fast --unlock "0" --password ~/.ethereum/testnet/password.txt
```

For mainnet you do NOT want to have things unlucked all the time, but for testnet this will simplify things.  If you do not want to store your passphrase in a file you can unlock in the geth shell wth:
```javascript
personal.unlockAccount(eth.accounts[0], 'PASSPHRASE')
```

You will need three addresses to use as the owner of the contracts and one contract to use as the withdrawal address.  For testnet they can all be yours but for mainnet the three contracts should belong to different people and the withdrawal address should be a multisig address.  You will also need enough eth in one of the addresses (we will assume account 0 below) to deploy the scripts.

### Compile the smart contracts:

```
cd contracts/contracts
echo "var solcOutput=`solc --optimize --combined-json abi,bin,interface Ethash.sol`" > Ethash.js
echo "var solcOutput=`solc --optimize --combined-json abi,bin,interface SmartPool.sol`" > SmartPool.js
echo "var solcOutput=`solc --optimize --combined-json abi,bin,interface SmartpoolVersion.sol`" > SmartpoolVersion.js
cd ..
```

### Copy the sample config file:
```
cp settings.js-sample settings.js
```
and edit the file so it has your owner and withdrawal address in it.  If you need to change the account to fund things, it should also be changed in this file.  You can also change the required version of the client in this file.

### Deploy the Ethash contract:
```
geth --preload "./deploy-helpers.js" attach ~/.ethereum/testnet/geth.ipc
```
Then in the geth terminal:
```javascript
deploy_ethash()
```

Once your contract is mined, put that value in the `ethashAddr` variable of settings.js.

### Determine the epoch:

```
geth attach ~/.ethereum/testnet/geth.ipc --exec "eth.blockNumber/30000"
```

Update the epoch data.  You should start with the current epoch (--from) and go at least one epoch past that (--to).  You can add more epoch data later.
```
./epoch --keystore ~/.ethereum/testnet/keystore/ --ethash-contract $HASH --from $EPOCH --to $EPOCH+2
```

### Deploy the SmartPool contract:
```
geth --preload "./deploy-helpers.js" attach ~/.ethereum/testnet/geth.ipc
```
Then in the geth terminal:
```javascript
deploy_smartpool()
```

Once your contract is mined, put that value in the `sAddr` variable of settings.js.

### Deploy the SmartpoolVersion contract:
```
geth --preload "./deploy-helpers.js" attach ~/.ethereum/testnet/geth.ipc
```
Then in the geth terminal:
```javascript
deploy_smartpoolversion()
```

Once your contract is mined, put that value in the `gateAddr` variable of settings.js.

### Update the address of the SmartPool contract and the required version number:
```
geth --preload "./deploy-helpers.js" attach ~/.ethereum/testnet/geth.ipc
```
Then in the geth terminal:
```javascript
var g = load_smartpoolversion();
g.contract.updatePoolContract(sAddr, {from: funding[0]})
g.contract.updateClientVersion(version, {from: funding[0]})
```

Provide initial funds to the pool:
```
geth --preload "./deploy-helpers.js" attach ~/.ethereum/testnet/geth.ipc
```
Then in the geth terminal:
```javascript
eth.sendTransaction({from:funding[0], to:sAddr, value: web3.toWei(20, "ether")})
```

## Testing

A set of test code for the contracts is included.  Use the following steps to run the tests against a simulated chain.

These tests requre a recent (v7 at least) version of node.  v7.10.0 is known to work although more recent ones should also work.

1. Install dependancies: `npm install` (`sudo` might be needed on ubuntu OS)
2. Run: `npm test`

Alternatively, you can run the commands manually:
1. Run `./node_modules/.bin/testrpc -p 18545 --deterministic smartpool`
2. Run `./node_modules/.bin/truffle test`
