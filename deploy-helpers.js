// Helper functions to deploy SmartPool contracts with geth.

loadScript('settings.js')

function get_contract(contractName, scriptName, contractAddress) {
  loadScript(scriptName);

  var parsedContract = eth.contract(JSON.parse(solcOutput.contracts[contractName].abi));
  var contract = parsedContract.at(contractAddress);
  return { address: contractAddress, contract: contract};
};

function deploy_contract(contractName, scriptName, initData, funding) {
  loadScript(scriptName);

  var parsedContract = eth.contract(JSON.parse(solcOutput.contracts[contractName].abi));
  var deployTransationObject = { from: funding[0], data: "0x" + solcOutput.contracts[contractName].bin, gas: funding[1] };
  var contractInstance = parsedContract.new(initData, deployTransationObject, function (e, contract) {
	if(!e) {
	  if(!contract.address) {
		console.log("Contract transaction sent: TransactionHash: " + contract.transactionHash);
	  } else {
		console.error("Contract mined: " + contract.address);
	  }
	} else {
	  console.log(e)
	}
  });
};

// Really should merge this with deploy_contract but need to get initData
// correct.
function deploy_contract2(contractName, scriptName, o1, o2, o3, a1, a2, funding) {
  loadScript(scriptName);

  var parsedContract = eth.contract(JSON.parse(solcOutput.contracts[contractName].abi));
  var deployTransationObject = { from: funding[0], data: "0x" + solcOutput.contracts[contractName].bin, gas: funding[1] };
  var contractInstance = parsedContract.new([o1, o2, o3], a1, a2, false, false, deployTransationObject, function (e, contract) {
	if(!e) {
	  if(!contract.address) {
		console.log("Contract transaction sent: TransactionHash: " + contract.transactionHash);
	  } else {
		console.log("Contract mined: " + contract.address);
	  }
	} else {
	  console.error(e)
	}
  });
};

function deploy_ethash() {
  contractName = 'Ethash.sol:Ethash';
  scriptName = 'contracts/Ethash.js';
  initData = [o1, o2, o3];

  deploy_contract(contractName, scriptName, initData, funding);
}

function deploy_smartpool() {
  contractName = 'SmartPool.sol:SmartPool';
  scriptName = 'contracts/SmartPool.js';

  deploy_contract2(contractName, scriptName, o1, o2, o3, ethashAddr, wAddr, funding);
}

function deploy_smartpoolversion() {
  contractName = 'SmartpoolVersion.sol:SmartpoolVersion';
  scriptName = 'contracts/SmartpoolVersion.js';
  initData = [o1, o2, o3];

  deploy_contract(contractName, scriptName, initData, funding);
}

function load_smartpoolversion() {
  contractName = 'SmartpoolVersion.sol:SmartpoolVersion';
  scriptName = 'contracts/SmartpoolVersion.js';

  var g = get_contract(contractName, scriptName, gateAddr);
  return g
}
