pragma solidity ^0.5.1;

contract PPDL_HELPER {
    // This creates an array with all balances
    mapping (address => string) public_key;
    mapping (address => address[]) request_list;
    mapping (address => mapping (address => uint)) blacklist;

    // # Public Key
    function deploy_public_key(string memory _value) public {
        public_key[msg.sender] = _value;
    }
    function get_public_key(address _target) view public returns (string memory) {
        return public_key[_target];
    }

    // # Request List
    function register_request_list(address[] memory _addresses) public {
        request_list[msg.sender] = _addresses;
    }
    function get_request_list(address _target) view public returns (address[] memory) {
        return request_list[_target];
    }

    // # Blacklist
    function register_blacklist(address _to) public {
        blacklist[msg.sender][_to] = 1;
    }
    function get_blacklist(address _target) view public returns (uint) {
        return blacklist[msg.sender][_target];
    }
    function unregister_blacklist(address _to) public {
        blacklist[msg.sender][_to] = 0;
    }
}