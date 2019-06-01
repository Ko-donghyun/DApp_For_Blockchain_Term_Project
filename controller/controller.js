const NodeRSA = require('node-rsa');
const fs = require('fs');
const Web3 = require('web3');
const util = require('ethereumjs-util');
const tx = require('ethereumjs-tx');
const crypto = require('crypto');
// const lightwallet = require('eth-lightwallet');
// const txutils = lightwallet.txutils;

const web3 = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
);

const contract_address = '0x7d64ffa7113a378a78454e03d9a233067c6f0874';
const contract_interface = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_value",
                "type": "string"
            }
        ],
        "name": "deploy_public_key",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "register_blacklist",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_addresses",
                "type": "address[]"
            }
        ],
        "name": "register_request_list",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "unregister_blacklist",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_target",
                "type": "address"
            }
        ],
        "name": "get_blacklist",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_target",
                "type": "address"
            }
        ],
        "name": "get_public_key",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_target",
                "type": "address"
            }
        ],
        "name": "get_request_list",
        "outputs": [
            {
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
const ppdl_helper_contract = new web3.eth.Contract(contract_interface, contract_address);

/** Private Key 생성 */
exports.generate_private_key = (req, res) => {
    console.log(`Private Key 생성 시작`);

    // 1. Private Key 생성
    const key = new NodeRSA({b: 512});
    const private_key = key.exportKey(['private']);

    // 2. Private Key 리턴
    console.log(`Private Key 생성 완료`);
    return res.json({status: 200, key: private_key});
};

/** Public Key 배포 */
exports.deploy_public_key = (req, res) => {
    console.log(`Public Key 배포 시작`);
    const user_EOA = req.body.user_EOA;
    const pass_phrase = req.body.pass_phrase;
    const private_key_path = req.body.private_key_path;

    fs.readFile(private_key_path, 'utf8', function(err, data) {
        // 1. Public Key 생성
        const key = new NodeRSA(data);
        const public_key = key.exportKey('pkcs1-public-pem');

        web3.eth.personal.unlockAccount(user_EOA, pass_phrase, 600).then(() => {
            console.log(`계정 unlock 성공 [account: ${user_EOA}].`);

            // 2. Public Key 배포
            ppdl_helper_contract.methods.deploy_public_key(public_key.replace(/\r?\n|\r/g, "")).send({from: user_EOA, gasLimit: 3000000}, (err, result) => {
                if (err) {
                    console.log(`Public Key 배포 실패`);
                    return res.json({
                        "status": 500,
                    });
                } else {
                    console.log(`Public Key 배포 완료`);
                    return res.json({status: 200, result: result});
                }
            });
        });
    });
};


/** Public Key 획득 */
exports.get_public_key = (req, res) => {
    console.log(`Public Key 조회 시작`);
    const target_EOA = req.query.target_EOA;
    console.log(target_EOA);

    ppdl_helper_contract.methods.get_public_key(target_EOA).call().then((result) => {
        console.log(`Public Key 조회 성공`);
        return res.json({status: 200, result: result});
    });
};