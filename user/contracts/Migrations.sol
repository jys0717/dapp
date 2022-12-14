//SPDX-License-Identifier: SimPL-2.0
pragma solidity >0.8.0;
//pragma experimental ABIEncoderV2;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }
}
