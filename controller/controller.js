const NodeRSA = require('node-rsa');
const fs = require('fs');

/** Private Key 생성 */
exports.generate_private_key = (req, res) => {
    console.log(`Private Key 생성 시작`);

    // 1. Private Key 생성
    const key = new NodeRSA({b: 256});
    const private_key = key.exportKey(['private']);

    // 2. Private Key 리턴
    console.log(`Private Key 생성 완료`);
    return res.json({status: 200, key: private_key});
};

/** Public Key 배포 */
exports.deploy_public_key = (req, res) => {
    console.log(`Public Key 배포 시작`);
    const private_key_path = req.query.private_key_path;

    fs.readFile(private_key_path, 'utf8', function(err, data) {
        // 1. Public Key 생성
        const key = new NodeRSA(data);
        const public_key = key.exportKey(['public']);
        console.log(public_key);

        // 2. Public Key 배포
        console.log(`Public Key 배포 완료`);
        return res.json({success: 0, key: public_key});
    });
};