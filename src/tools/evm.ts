import { ethers } from 'ethers';

// Helper function to validate address
function validateAddress(address: any) {
  if (!ethers.isAddress(address)) {
    return 'Invalid Ethereum address';
  }
  return '';
}

// Helper function to validate private key
function validatePrivateKey(privateKey: any) {
  if (!ethers.isHexString(privateKey, 32)) {
    return 'Invalid private key';
  }
  return '';
}

// Helper function to validate ABI
function validateABI(abi: any) {
  if (!Array.isArray(abi)) {
    return 'Invalid ABI format';
  }
  return '';
}

// Helper function to validate transaction
function validateTransaction(transaction: any) {
  if (!transaction.to || !transaction.value) {
    return 'Invalid transaction object';
  }
  return '';
}

export default {
  enabled: true,
  tools: {
    wallet_create: {
      schema: {
        "name": "wallet_create",
        "description": "Create a new Ethereum wallet",
        "input_schema": {
          "type": "object",
          "properties": {}
        }
      },
      action: async () => {
        const wallet = ethers.Wallet.createRandom();
        return wallet.privateKey;
      },
      nextState: null,
    },
    wallet_import: {
      schema: {
        "name": "wallet_import",
        "description": "Import an Ethereum wallet from a private key",
        "input_schema": {
          "type": "object",
          "properties": {
            "privateKey": {
              "type": "string",
              "description": "The private key of the wallet"
            }
          },
          "required": ["privateKey"]
        }
      },
      action: async ({ privateKey }: any) => {
        const error = validatePrivateKey(privateKey);
        if (error) return error;
        const wallet = new ethers.Wallet(privateKey);
        return wallet.privateKey;
      },
      nextState: null,
    },
    wallet_balance: {
      schema: {
        "name": "wallet_balance",
        "description": "Get the balance of an Ethereum wallet.",
        "input_schema": {
          "type": "object",
          "properties": {
            "address": {
              "type": "string",
              "description": "The address of the wallet."
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["address", "provider"]
        }
      },
      action: async ({ address, provider }: any) => {
        const error = validateAddress(address);
        if (error) return error;
        const balance = await new ethers.JsonRpcProvider(provider).getBalance(address);
        return ethers.formatEther(balance);
      },
    },
    wallet_sendTransaction: {
      schema: {
        "name": "wallet_sendTransaction",
        "description": "Send a transaction from an Ethereum wallet.",
        "input_schema": {
          "type": "object",
          "properties": {
            "privateKey": {
              "type": "string",
              "description": "The private key of the wallet."
            },
            "transaction": {
              "type": "object",
              "properties": {
                "to": {
                  "type": "string",
                  "description": "The address of the recipient."
                },
                "value": {
                  "type": "string",
                  "description": "The amount to send."
                }
              }
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["privateKey", "transaction", "provider"]
        }
      },
        action: async ({ privateKey, transaction, provider }: any) => {
        const privateKeyError = validatePrivateKey(privateKey);
        if (privateKeyError) return privateKeyError;
        const transactionError = validateTransaction(transaction);
        if (transactionError) return transactionError;
        const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(provider));
        const tx = await wallet.sendTransaction(transaction);
        return tx.hash;
      },
      nextState: null,
    },
    wallet_estimateGas: {
      schema: {
        "name": "wallet_estimateGas",
        "description": "Estimate the gas cost of an Ethereum transaction.",
        "input_schema": {
          "type": "object",
          "properties": {
            "transaction": {
              "type": "object",
              "properties": {
                "to": {
                  "type": "string",
                  "description": "The address of the recipient."
                },
                "value": {
                  "type": "string",
                  "description": "The amount to send."
                }
              }
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["transaction", "provider"]
        }
      },
      action: async ({ transaction, provider }: any) => {
        const error = validateTransaction(transaction);
        if (error) return error;
        const gasEstimate = await new ethers.JsonRpcProvider(provider).estimateGas(transaction);
        return gasEstimate.toString();
      },
      nextState: null,
    },
    contract_deploy: {
      schema: {
        "name": "contract_deploy",
        "description": "Deploy an Ethereum smart contract.",
        "input_schema": {
          "type": "object",
          "properties": {
            "privateKey": {
              "type": "string",
              "description": "The private key of the wallet."
            },
            "abi": {
              "type": "string",
              "description": "The ABI of the contract, as a JSON string."
            },
            "bytecode": {
              "type": "string",
              "description": "The bytecode of the contract."
            },
            "args": {
              "type": "string",
              "description": "The arguments for the contract constructor, comma-separated"
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["privateKey", "abi", "bytecode", "provider"]
        }
      },
      action: async ({ privateKey, abi, bytecode, args, provider }: any) => {
        const privateKeyError = validatePrivateKey(privateKey);
        if (privateKeyError) return privateKeyError;
        const abiError = validateABI(JSON.parse(abi));
        if (abiError) return abiError;
        const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(provider));
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy(...(args ? args.split(',') : []));
        await (contract as any).deployed();
        return (contract as any).address;
      },
      nextState: null,
    },
    contract_interact: {
      schema: {
        "name": "contract_interact",
        "description": "Interact with an Ethereum smart contract.",
        "input_schema": {
          "type": "object",
          "properties": {
            "privateKey": {
              "type": "string",
              "description": "The private key of the wallet."
            },
            "contractAddress": {
              "type": "string",
              "description": "The address of the contract."
            },
            "abi": {
              "type": "string",
              "description": "The ABI of the contract, as a JSON string."
            },
            "methodName": {
              "type": "string",
              "description": "The name of the method to call."
            },
            "args": {
              "type": "string",
              "description": "The arguments for the method, comma-separated"
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["privateKey", "contractAddress", "abi", "methodName", "args", "provider"]
        }
      },
      action: async ({ privateKey, contractAddress, abi, methodName, args, provider }: any) => {
        const privateKeyError = validatePrivateKey(privateKey);
        if (privateKeyError) return privateKeyError;
        const addressError = validateAddress(contractAddress);
        if (addressError) return addressError;
        const abiError = validateABI(JSON.parse(abi));
        if (abiError) return abiError;
        const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(provider));
        const contract = new ethers.Contract(contractAddress, abi, wallet);
        const result = await contract[methodName](...args.split(','));
        return result.toString();
      },
      nextState: null,
    },
    contract_call: {
      schema: {
        "name": "contract_call",
        "description": "Call a method of an Ethereum smart contract.",
        "input_schema": {
          "type": "object",
          "properties": {
            "contractAddress": {
              "type": "string",
              "description": "The address of the contract."
            },
            "abi": {
              "type": "string",
              "description": "The ABI of the contract, as a JSON string."
            },
            "methodName": {
              "type": "string",
              "description": "The name of the method to call."
            },
            "args": {
              "type": "string",
              "description": "The arguments for the method, comma-separated"
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["contractAddress", "abi", "methodName", "args", "provider"]
        }
      },
      action: async ({ contractAddress, abi, methodName, args, provider }: any) => {
        const addressError = validateAddress(contractAddress);
        if (addressError) return addressError;
        const abiError = validateABI(JSON.parse(abi));
        if (abiError) return abiError;
        const contract = new ethers.Contract(contractAddress, abi, new ethers.JsonRpcProvider(provider));
        const result = await contract[methodName](...args.split(','));
        return result.toString();
      },
      nextState: null,
    },
    contract_events: {
      schema: {
        "name": "contract_events",
        "description": "Get events emitted by an Ethereum smart contract.",
        "input_schema": {
          "type": "object",
          "properties": {
            "contractAddress": {
              "type": "string",
              "description": "The address of the contract."
            },
            "abi": {
              "type": "string",
              "description": "The ABI of the contract, as a JSON string."
            },
            "eventName": {
              "type": "string",
              "description": "The name of the event to listen for."
            },
            "filters": {
              "type": "object",
              "description": "The filters to apply to the event."
            },
            "provider": {
              "type": "string",
              "description": "The provider URL."
            }
          },
          "required": ["contractAddress", "abi", "eventName", "filters", "provider"]
        }
      },
      action: async ({ contractAddress, abi, eventName, filters, provider }: any) => {
        const addressError = validateAddress(contractAddress);
        if (addressError) return addressError;
        const abiError = validateABI(JSON.parse(abi));
        if (abiError) return abiError;
        const contract = new ethers.Contract(contractAddress, abi, new ethers.JsonRpcProvider(provider));
        const events = await contract.queryFilter(contract.filters[eventName](), filters);
        return JSON.stringify(events.map((event: any) => event.args));
      },
      nextState: null,
    },
    utilities_formatEther: {
      schema: {
        "name": "utilities_formatEther",
        "description": "Convert a value from wei to ether.",
        "input_schema": {
          "type": "object",
          "properties": {
            "wei": {
              "type": "string",
              "description": "The value in wei."
            }
          }
        }
      },
      action: async ({ wei }: any) => {
        return ethers.formatEther(wei);
      },
      nextState: null,
    },
    utilities_parseEther: {
      schema: {
        "name": "utilities_parseEther",
        "description": "Convert a value from ether to wei.",
        "input_schema": {
          "type": "object",
          "properties": {
            "ether": {
              "type": "string",
              "description": "The value in ether."
            }
          }
        }
      },
      action: async ({ ether }: any) => {
        return ethers.parseEther(ether).toString();
      },
      nextState: null,
    },
    utilities_hash: {
      schema: {
        "name": "utilities_hash",
        "description": "Compute the hash of a value.",
        "input_schema": {
          "type": "object",
          "properties": {
            "input": {
              "type": "string",
              "description": "The input value."
            }
          }
        }
      },
      action: async ({ input }: any) => {
        return ethers.keccak256(ethers.toUtf8Bytes(input));
      },
      nextState: null,
    },
    utilities_computeAddress: {
      schema: {
        "name": "utilities_computeAddress",
        "description": "Compute the address of a public key.",
        "input_schema": {
          "type": "object",
          "properties": {
            "publicKey": {
              "type": "string",
              "description": "The public key."
            }
          }
        }
      },
      action: async ({ publicKey }: any) => {
        return ethers.computeAddress(publicKey);
      },
      nextState: null,
    },
  },
};