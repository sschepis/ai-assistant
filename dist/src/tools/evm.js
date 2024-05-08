"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// Helper function to validate address
function validateAddress(address) {
    if (!ethers_1.ethers.isAddress(address)) {
        return 'Invalid Ethereum address';
    }
    return '';
}
// Helper function to validate private key
function validatePrivateKey(privateKey) {
    if (!ethers_1.ethers.isHexString(privateKey, 32)) {
        return 'Invalid private key';
    }
    return '';
}
// Helper function to validate ABI
function validateABI(abi) {
    if (!Array.isArray(abi)) {
        return 'Invalid ABI format';
    }
    return '';
}
// Helper function to validate transaction
function validateTransaction(transaction) {
    if (!transaction.to || !transaction.value) {
        return 'Invalid transaction object';
    }
    return '';
}
exports.default = {
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
            action: () => __awaiter(void 0, void 0, void 0, function* () {
                const wallet = ethers_1.ethers.Wallet.createRandom();
                return wallet.privateKey;
            }),
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
            action: ({ privateKey }) => __awaiter(void 0, void 0, void 0, function* () {
                const error = validatePrivateKey(privateKey);
                if (error)
                    return error;
                const wallet = new ethers_1.ethers.Wallet(privateKey);
                return wallet.privateKey;
            }),
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
            action: ({ address, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const error = validateAddress(address);
                if (error)
                    return error;
                const balance = yield new ethers_1.ethers.JsonRpcProvider(provider).getBalance(address);
                return ethers_1.ethers.formatEther(balance);
            }),
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
            action: ({ privateKey, transaction, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const privateKeyError = validatePrivateKey(privateKey);
                if (privateKeyError)
                    return privateKeyError;
                const transactionError = validateTransaction(transaction);
                if (transactionError)
                    return transactionError;
                const wallet = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(provider));
                const tx = yield wallet.sendTransaction(transaction);
                return tx.hash;
            }),
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
            action: ({ transaction, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const error = validateTransaction(transaction);
                if (error)
                    return error;
                const gasEstimate = yield new ethers_1.ethers.JsonRpcProvider(provider).estimateGas(transaction);
                return gasEstimate.toString();
            }),
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
            action: ({ privateKey, abi, bytecode, args, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const privateKeyError = validatePrivateKey(privateKey);
                if (privateKeyError)
                    return privateKeyError;
                const abiError = validateABI(JSON.parse(abi));
                if (abiError)
                    return abiError;
                const wallet = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(provider));
                const factory = new ethers_1.ethers.ContractFactory(abi, bytecode, wallet);
                const contract = yield factory.deploy(...(args ? args.split(',') : []));
                yield contract.deployed();
                return contract.address;
            }),
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
            action: ({ privateKey, contractAddress, abi, methodName, args, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const privateKeyError = validatePrivateKey(privateKey);
                if (privateKeyError)
                    return privateKeyError;
                const addressError = validateAddress(contractAddress);
                if (addressError)
                    return addressError;
                const abiError = validateABI(JSON.parse(abi));
                if (abiError)
                    return abiError;
                const wallet = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(provider));
                const contract = new ethers_1.ethers.Contract(contractAddress, abi, wallet);
                const result = yield contract[methodName](...args.split(','));
                return result.toString();
            }),
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
            action: ({ contractAddress, abi, methodName, args, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const addressError = validateAddress(contractAddress);
                if (addressError)
                    return addressError;
                const abiError = validateABI(JSON.parse(abi));
                if (abiError)
                    return abiError;
                const contract = new ethers_1.ethers.Contract(contractAddress, abi, new ethers_1.ethers.JsonRpcProvider(provider));
                const result = yield contract[methodName](...args.split(','));
                return result.toString();
            }),
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
            action: ({ contractAddress, abi, eventName, filters, provider }) => __awaiter(void 0, void 0, void 0, function* () {
                const addressError = validateAddress(contractAddress);
                if (addressError)
                    return addressError;
                const abiError = validateABI(JSON.parse(abi));
                if (abiError)
                    return abiError;
                const contract = new ethers_1.ethers.Contract(contractAddress, abi, new ethers_1.ethers.JsonRpcProvider(provider));
                const events = yield contract.queryFilter(contract.filters[eventName](), filters);
                return JSON.stringify(events.map((event) => event.args));
            }),
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
            action: ({ wei }) => __awaiter(void 0, void 0, void 0, function* () {
                return ethers_1.ethers.formatEther(wei);
            }),
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
            action: ({ ether }) => __awaiter(void 0, void 0, void 0, function* () {
                return ethers_1.ethers.parseEther(ether).toString();
            }),
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
            action: ({ input }) => __awaiter(void 0, void 0, void 0, function* () {
                return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(input));
            }),
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
            action: ({ publicKey }) => __awaiter(void 0, void 0, void 0, function* () {
                return ethers_1.ethers.computeAddress(publicKey);
            }),
            nextState: null,
        },
    },
};
