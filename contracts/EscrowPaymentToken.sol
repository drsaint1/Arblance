// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowPaymentToken
 * @dev Milestone-based escrow contract supporting ETH, USDT, USDC, and other ERC20 tokens
 */
contract EscrowPaymentToken is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PaymentToken {
        ETH,
        USDT,
        USDC,
        CUSTOM
    }

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
        PaymentToken tokenType;
        address tokenAddress; // ERC20 token address (if not ETH)
    }

    // Token addresses (to be set for each network)
    address public usdtAddress;
    address public usdcAddress;

    // Contract ID counter
    uint256 private contractIdCounter;

    // Mapping from contract ID to EscrowContract
    mapping(uint256 => EscrowContract) public contracts;

    // Mapping from user address to their contract IDs
    mapping(address => uint256[]) public userContracts;

    // Events
    event ContractCreated(
        uint256 indexed contractId,
        address indexed creator,
        address indexed recipient,
        uint256 totalAmount,
        uint256 milestoneCount,
        PaymentToken tokenType,
        address tokenAddress
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
    event TokenAddressesUpdated(address usdt, address usdc);

    constructor(address _usdtAddress, address _usdcAddress) {
        usdtAddress = _usdtAddress;
        usdcAddress = _usdcAddress;
    }

    /**
     * @dev Update token addresses (only owner in production)
     */
    function updateTokenAddresses(address _usdt, address _usdc) external {
        usdtAddress = _usdt;
        usdcAddress = _usdc;
        emit TokenAddressesUpdated(_usdt, _usdc);
    }

    /**
     * @dev Create escrow contract with ETH
     */
    function createContractETH(
        address payable _recipient,
        string[] memory _descriptions,
        uint256[] memory _amounts
    ) external payable nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_recipient != msg.sender, "Cannot create with yourself");
        require(_descriptions.length > 0, "At least one milestone required");
        require(_descriptions.length == _amounts.length, "Length mismatch");

        uint256 totalAmount = _validateAndCalculateTotal(_descriptions, _amounts);
        require(msg.value == totalAmount, "Incorrect ETH sent");

        return _createContract(
            _recipient,
            _descriptions,
            _amounts,
            totalAmount,
            PaymentToken.ETH,
            address(0)
        );
    }

    /**
     * @dev Create escrow contract with ERC20 token
     */
    function createContractToken(
        address payable _recipient,
        string[] memory _descriptions,
        uint256[] memory _amounts,
        PaymentToken _tokenType
    ) external nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_recipient != msg.sender, "Cannot create with yourself");
        require(_tokenType != PaymentToken.ETH, "Use createContractETH for ETH");
        require(_descriptions.length > 0, "At least one milestone required");
        require(_descriptions.length == _amounts.length, "Length mismatch");

        address tokenAddress = _getTokenAddress(_tokenType);
        require(tokenAddress != address(0), "Invalid token");

        uint256 totalAmount = _validateAndCalculateTotal(_descriptions, _amounts);

        // Transfer tokens from creator to this contract
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), totalAmount);

        return _createContract(
            _recipient,
            _descriptions,
            _amounts,
            totalAmount,
            _tokenType,
            tokenAddress
        );
    }

    /**
     * @dev Create escrow contract with custom ERC20 token
     */
    function createContractCustomToken(
        address payable _recipient,
        string[] memory _descriptions,
        uint256[] memory _amounts,
        address _tokenAddress
    ) external nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_recipient != msg.sender, "Cannot create with yourself");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_descriptions.length > 0, "At least one milestone required");
        require(_descriptions.length == _amounts.length, "Length mismatch");

        uint256 totalAmount = _validateAndCalculateTotal(_descriptions, _amounts);

        // Transfer tokens from creator to this contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), totalAmount);

        return _createContract(
            _recipient,
            _descriptions,
            _amounts,
            totalAmount,
            PaymentToken.CUSTOM,
            _tokenAddress
        );
    }

    /**
     * @dev Internal function to create contract
     */
    function _createContract(
        address payable _recipient,
        string[] memory _descriptions,
        uint256[] memory _amounts,
        uint256 _totalAmount,
        PaymentToken _tokenType,
        address _tokenAddress
    ) private returns (uint256) {
        uint256 contractId = contractIdCounter++;

        EscrowContract storage newContract = contracts[contractId];
        newContract.creator = payable(msg.sender);
        newContract.recipient = _recipient;
        newContract.totalAmount = _totalAmount;
        newContract.releasedAmount = 0;
        newContract.cancelled = false;
        newContract.completed = false;
        newContract.createdAt = block.timestamp;
        newContract.tokenType = _tokenType;
        newContract.tokenAddress = _tokenAddress;

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

        emit ContractCreated(
            contractId,
            msg.sender,
            _recipient,
            _totalAmount,
            _descriptions.length,
            _tokenType,
            _tokenAddress
        );

        return contractId;
    }

    /**
     * @dev Release milestone payment
     */
    function releaseMilestone(uint256 _contractId, uint256 _milestoneIndex)
        external
        nonReentrant
    {
        EscrowContract storage escrow = contracts[_contractId];

        require(msg.sender == escrow.creator, "Only creator can release");
        require(!escrow.cancelled, "Contract cancelled");
        require(!escrow.completed, "Contract completed");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.released, "Already released");

        milestone.released = true;
        escrow.releasedAmount += milestone.amount;

        // Transfer funds
        if (escrow.tokenType == PaymentToken.ETH) {
            (bool success, ) = escrow.recipient.call{value: milestone.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(escrow.tokenAddress).safeTransfer(escrow.recipient, milestone.amount);
        }

        emit MilestoneReleased(_contractId, _milestoneIndex, milestone.amount, escrow.recipient);

        if (escrow.releasedAmount == escrow.totalAmount) {
            escrow.completed = true;
            emit ContractCompleted(_contractId);
        }
    }

    /**
     * @dev Cancel contract and refund
     */
    function cancelContract(uint256 _contractId) external nonReentrant {
        EscrowContract storage escrow = contracts[_contractId];

        require(msg.sender == escrow.creator, "Only creator can cancel");
        require(!escrow.cancelled, "Already cancelled");
        require(!escrow.completed, "Cannot cancel completed");

        uint256 remainingAmount = escrow.totalAmount - escrow.releasedAmount;
        require(remainingAmount > 0, "No funds to refund");

        escrow.cancelled = true;

        // Refund
        if (escrow.tokenType == PaymentToken.ETH) {
            (bool success, ) = escrow.creator.call{value: remainingAmount}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(escrow.tokenAddress).safeTransfer(escrow.creator, remainingAmount);
        }

        emit ContractCancelled(_contractId);
        emit RefundIssued(_contractId, remainingAmount);
    }

    /**
     * @dev Get token address from enum
     */
    function _getTokenAddress(PaymentToken _tokenType) private view returns (address) {
        if (_tokenType == PaymentToken.USDT) return usdtAddress;
        if (_tokenType == PaymentToken.USDC) return usdcAddress;
        return address(0);
    }

    /**
     * @dev Validate milestones and calculate total
     */
    function _validateAndCalculateTotal(
        string[] memory _descriptions,
        uint256[] memory _amounts
    ) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Amount must be > 0");
            require(bytes(_descriptions[i]).length > 0, "Description required");
            total += _amounts[i];
        }
        return total;
    }

    /**
     * @dev Get contract details
     */
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
            uint256 milestoneCount,
            PaymentToken tokenType,
            address tokenAddress
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
            escrow.milestones.length,
            escrow.tokenType,
            escrow.tokenAddress
        );
    }

    /**
     * @dev Get milestone details
     */
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
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        return (milestone.description, milestone.amount, milestone.released);
    }

    /**
     * @dev Get all milestones
     */
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

    /**
     * @dev Get user contracts
     */
    function getUserContracts(address _user) external view returns (uint256[] memory) {
        return userContracts[_user];
    }

    /**
     * @dev Get total contracts
     */
    function getTotalContracts() external view returns (uint256) {
        return contractIdCounter;
    }
}
