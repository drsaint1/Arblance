// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EscrowPayment
 * @dev Milestone-based escrow contract for secure payments
 */
contract EscrowPayment {
    struct Milestone {
        string description;
        uint256 amount;
        bool released;
    }

    struct EscrowContract {
        address payable creator;
        address payable recipient;
        uint256 totalAmount;
        uint256 releasedAmount;
        Milestone[] milestones;
        bool cancelled;
        bool completed;
        uint256 createdAt;
    }

    uint256 private contractIdCounter;

    mapping(uint256 => EscrowContract) public contracts;

    mapping(address => uint256[]) public userContracts;

    event ContractCreated(
        uint256 indexed contractId,
        address indexed creator,
        address indexed recipient,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    event MilestoneReleased(
        uint256 indexed contractId,
        uint256 milestoneIndex,
        uint256 amount,
        address recipient
    );

    event ContractCompleted(uint256 indexed contractId);
    event ContractCancelled(uint256 indexed contractId);
    event RefundIssued(uint256 indexed contractId, uint256 amount);

    function createContract(
        address payable _recipient,
        string[] memory _descriptions,
        uint256[] memory _amounts
    ) external payable returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_recipient != msg.sender, "Cannot create contract with yourself");
        require(_descriptions.length > 0, "At least one milestone required");
        require(_descriptions.length == _amounts.length, "Descriptions and amounts length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Milestone amount must be greater than 0");
            require(bytes(_descriptions[i]).length > 0, "Milestone description required");
            totalAmount += _amounts[i];
        }

        require(msg.value == totalAmount, "Sent value does not match total milestone amounts");

        uint256 contractId = contractIdCounter++;

        EscrowContract storage newContract = contracts[contractId];
        newContract.creator = payable(msg.sender);
        newContract.recipient = _recipient;
        newContract.totalAmount = totalAmount;
        newContract.releasedAmount = 0;
        newContract.cancelled = false;
        newContract.completed = false;
        newContract.createdAt = block.timestamp;

        for (uint256 i = 0; i < _descriptions.length; i++) {
            newContract.milestones.push(
                Milestone({
                    description: _descriptions[i],
                    amount: _amounts[i],
                    released: false
                })
            );
        }

        userContracts[msg.sender].push(contractId);
        userContracts[_recipient].push(contractId);

        emit ContractCreated(contractId, msg.sender, _recipient, totalAmount, _descriptions.length);

        return contractId;
    }

    function releaseMilestone(uint256 _contractId, uint256 _milestoneIndex) external {
        EscrowContract storage escrow = contracts[_contractId];

        require(msg.sender == escrow.creator, "Only creator can release milestones");
        require(!escrow.cancelled, "Contract is cancelled");
        require(!escrow.completed, "Contract already completed");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.released, "Milestone already released");

        milestone.released = true;
        escrow.releasedAmount += milestone.amount;

        (bool success, ) = escrow.recipient.call{value: milestone.amount}("");
        require(success, "Transfer failed");

        emit MilestoneReleased(_contractId, _milestoneIndex, milestone.amount, escrow.recipient);

        if (escrow.releasedAmount == escrow.totalAmount) {
            escrow.completed = true;
            emit ContractCompleted(_contractId);
        }
    }

    function cancelContract(uint256 _contractId) external {
        EscrowContract storage escrow = contracts[_contractId];

        require(msg.sender == escrow.creator, "Only creator can cancel contract");
        require(!escrow.cancelled, "Contract already cancelled");
        require(!escrow.completed, "Cannot cancel completed contract");

        uint256 remainingAmount = escrow.totalAmount - escrow.releasedAmount;
        require(remainingAmount > 0, "No funds to refund");

        escrow.cancelled = true;

        (bool success, ) = escrow.creator.call{value: remainingAmount}("");
        require(success, "Refund failed");

        emit ContractCancelled(_contractId);
        emit RefundIssued(_contractId, remainingAmount);
    }

    function getContract(uint256 _contractId)
        external
        view
        returns (
            address creator,
            address recipient,
            uint256 totalAmount,
            uint256 releasedAmount,
            bool cancelled,
            bool completed,
            uint256 createdAt,
            uint256 milestoneCount
        )
    {
        EscrowContract storage escrow = contracts[_contractId];
        return (
            escrow.creator,
            escrow.recipient,
            escrow.totalAmount,
            escrow.releasedAmount,
            escrow.cancelled,
            escrow.completed,
            escrow.createdAt,
            escrow.milestones.length
        );
    }

    function getMilestone(uint256 _contractId, uint256 _milestoneIndex)
        external
        view
        returns (
            string memory description,
            uint256 amount,
            bool released
        )
    {
        EscrowContract storage escrow = contracts[_contractId];
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        return (milestone.description, milestone.amount, milestone.released);
    }

    function getUserContracts(address _user) external view returns (uint256[] memory) {
        return userContracts[_user];
    }

    function getTotalContracts() external view returns (uint256) {
        return contractIdCounter;
    }

    function getAllMilestones(uint256 _contractId)
        external
        view
        returns (
            string[] memory descriptions,
            uint256[] memory amounts,
            bool[] memory released
        )
    {
        EscrowContract storage escrow = contracts[_contractId];
        uint256 length = escrow.milestones.length;

        descriptions = new string[](length);
        amounts = new uint256[](length);
        released = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            descriptions[i] = escrow.milestones[i].description;
            amounts[i] = escrow.milestones[i].amount;
            released[i] = escrow.milestones[i].released;
        }

        return (descriptions, amounts, released);
    }
}
