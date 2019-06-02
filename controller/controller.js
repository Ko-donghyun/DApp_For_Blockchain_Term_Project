const NodeRSA = require('node-rsa');
const fs = require('fs');
const Web3 = require('web3');
const util = require('ethereumjs-util');
const tx = require('ethereumjs-tx');
const crypto = require('crypto');
// const lightwallet = require('eth-lightwallet');
// const txutils = lightwallet.txutils;
const acl = require('../config/access_control_list');
const white_account_list = acl.accounts;
const client_config = require('../config/client_config');
const client_private_key_path = client_config.private_key_path;
const client_user_EOA = client_config.EOA;
const client_user_PP = client_config.passphrase;

const web3 = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
);

const contract_address = '0xa84938d75c48dc53c8711f1419cbb92832bf1dce';
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
            ppdl_helper_contract.methods.deploy_public_key(public_key).send({from: user_EOA, gasLimit: 3000000}, (err, result) => {
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


/** Request List 배포 */
exports.register_request_list = (req, res) => {
    console.log(`Request List 배포 시작`);
    const user_EOA = req.body.user_EOA;
    const pass_phrase = req.body.pass_phrase;
    const target_EOAs = req.body.target_EOAs;
    const target_EOAs_array = target_EOAs.split(',');
    console.log(target_EOAs_array);

    web3.eth.personal.unlockAccount(user_EOA, pass_phrase, 600).then(() => {
        console.log(`계정 unlock 성공 [account: ${user_EOA}].`);

        // 1. Request List 배포
        ppdl_helper_contract.methods.register_request_list(target_EOAs_array).send({from: user_EOA, gasLimit: 3000000}, (err, result) => {
            if (err) {
                console.log(`Request List 배포 실패`);
                return res.json({
                    "status": 500,
                });
            } else {
                console.log(`Request List 배포 완료`);
                return res.json({status: 200, result: result});
            }
        });
    });
};


/** Request List 획득 */
exports.get_request_list = (req, res) => {
    console.log(`Request List 조회 시작`);
    const target_EOA = req.query.target_EOA;
    console.log(target_EOA);

    ppdl_helper_contract.methods.get_request_list(target_EOA).call().then((result) => {
        console.log(`Request List 조회 성공`);
        return res.json({status: 200, result: result});
    });
};

/** 데이터 요청 처리 */
exports.get_encrypted_data = (req, res) => {
    console.log(`데이터 요청 처리 시작`);
    const request_EOA = req.query.request_EOA;

    // 0. 요청한 EOA가 Client 서버를 운용하는 Access Control List에 등록되어 있는지 확인
    if (white_account_list.indexOf(request_EOA) >= 0) {
        console.log('0. 요청한 EOA 허가 확인');

        // 1. 암호화 할 Public Key 획득
        ppdl_helper_contract.methods.get_public_key(request_EOA).call().then((result) => {
            console.log(`1. Public Key 조회 성공`);
            const public_key = result;
            console.log(public_key);

            // 2. 데이터 암호화
            const text = 'Hello RSA!';
            const buf = Buffer.from(text, 'utf8');
            const encrypted = crypto.publicEncrypt(public_key, buf);
            console.log(encrypted);

            // 3. 암호화된 데이터 응답
            return res.json({status: 200, result: encrypted});
        }).catch(err => {
            console.log(err);
            return res.json({status: 500});
        });
    } else {
        console.log(`0. 요청한 EOA 허가 거부 ${request_EOA}`);
        return res.json({
            "status": 500,
        });
    }
};

/** 학습 결과 처리 */
exports.handle_learning_result = (req, res) => {
    console.log(`학습 결과 처리 시작`);
    const encrypted_result = req.body.encrypted_result;
    const blacklist_exist = req.body.blacklist_exist;
    const blacklist_EOA = req.body.blacklist_EOA;
    const encrypted_result_buf = Buffer.from(JSON.parse(encrypted_result).data);

    // 1. 결과 복호화
    fs.readFile(client_private_key_path, 'utf8', function(err, data) {
        console.log(`결과 복호화 시작`);
        const decrypted_result = crypto.privateDecrypt(data, encrypted_result_buf);
        console.log(blacklist_exist);
        console.log(decrypted_result);
        console.log(decrypted_result.toString());

        if (blacklist_exist === "true") {
            web3.eth.personal.unlockAccount(client_user_EOA, client_user_PP, 600).then(() => {
                console.log(`계정 unlock 성공 [account: ${client_user_EOA}].`);

                // 2. Black List 등록
                ppdl_helper_contract.methods.register_blacklist(blacklist_EOA).send({from: client_user_EOA, gasLimit: 3000000}, (err, result) => {
                    if (err) {
                        console.log(`학습 결과 처리 성공, 블랙리스트 등록 실패`);
                        return res.json({status: 201, result: decrypted_result.toString()});
                    } else {
                        console.log(`학습 결과 처리 및 블랙리스트 등록 완료`);
                        return res.json({status: 200, TransactionID: result, result: decrypted_result.toString()});
                    }
                });
            });
        } else {
            console.log(`학습 결과 처리 완료`);
            return res.json({status: 200, result: decrypted_result.toString()});
        }
    });
};


