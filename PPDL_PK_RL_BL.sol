pragma solidity ^0.5.1;

contract PPDL_HELPER {
    // This creates an array with all balances
    mapping (address => string) public_key;

    // # Public Key
    function deploy_public_key(string memory _value) public {
        public_key[msg.sender] = _value;
    }
    function get_public_key(address _target) view public returns (string memory) {
        return public_key[_target];
    }
}