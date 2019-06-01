const NodeRSA = require('node-rsa');/** Private Key 생성 */
exports.generate_private_key = (req, res) => {
    console.log(`Private Key 생성 시작`);

    // 1. Private Key 생성
    const key = new NodeRSA({b: 256});
    const private_key = key.exportKey(['private']);

    // 2. Private Key 리턴
    console.log(`Private Key 생성 완료`);
    return res.json({key: private_key});
};