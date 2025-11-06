// Sources flattened with hardhat v2.26.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

pragma solidity >=0.4.16;


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

pragma solidity >=0.4.16;


// File @openzeppelin/contracts/interfaces/IERC1363.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

pragma solidity >=0.6.2;


/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;


/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}


// File @openzeppelin/contracts/utils/Pausable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/IAave.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAave
 * @notice Interface for Aave V3 Protocol on Celo
 */

/**
 * @notice Main Aave V3 Pool interface
 */
interface IPool {
    /**
     * @notice Supply assets to earn interest (replaces deposit in V2)
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
    
    /**
     * @notice Withdraw assets (same as V2)
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
    
    /**
     * @notice Get user account data
     */
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

/**
 * @notice Aave aToken interface (replaces mToken)
 */
interface IAToken {
    function balanceOf(address account) external view returns (uint256);
    function scaledBalanceOf(address user) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
}


// File contracts/ISelfProtocol.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISelfProtocol
 * @notice Interface for Self Protocol Identity Hub
 * @dev Deployed at 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74 on Celo Alfajores
 */
interface ISelfProtocol {
    /**
     * @notice Verify a user's identity proof
     * @param proof The zero-knowledge proof data
     * @return bool True if verification successful
     */
    function verify(bytes calldata proof) external view returns (bool);
    
    /**
     * @notice Check if an address is verified
     * @param user The address to check
     * @return bool True if user is verified
     */
    function isVerified(address user) external view returns (bool);
    
    /**
     * @notice Get verification timestamp
     * @param user The address to check
     * @return uint256 Timestamp of verification (0 if not verified)
     */
    function getVerificationTime(address user) external view returns (uint256);
}

/**
 * @notice Self Protocol verification data structure
 */
struct IdentityProof {
    address user;           // User's wallet address
    bytes32 proofHash;      // Hash of the ZK proof
    uint256 timestamp;      // When verified
    bool isAdult;           // Age 18+ verified
    bool notSanctioned;     // Not on OFAC list
    string country;         // Country code (optional)
}


// File contracts/AttestifyVault.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;







contract AttestifyVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    // Token contracts
    IERC20 public immutable cUSD;
    IAToken public immutable acUSD;
    IPool public immutable aavePool;

    // Protocol integrations
    ISelfProtocol public immutable selfProtocol;

    // Vault accounting (share-based system)
    uint256 public totalShares;
    mapping(address => uint256) public shares;

    // User data
    mapping(address => UserProfile) public users;
    mapping(address => StrategyType) public userStrategy;

    // Strategy configurations
    mapping(StrategyType => Strategy) public strategies;

    // Limits and config
    uint256 public constant MIN_DEPOSIT = 10e18; // 10 cUSD
    uint256 public constant MAX_DEPOSIT = 10_000e18; // 10,000 cUSD per tx
    uint256 public constant MAX_TVL = 100_000e18; // 100,000 cUSD total (MVP)
    uint256 public constant RESERVE_RATIO = 10; // Keep 10% liquid for instant withdrawals

    // Admin addresses
    address public aiAgent;
    address public treasury;

    // Statistics
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public lastRebalance;

    /* ========== STRUCTS & ENUMS ========== */

    struct UserProfile {
        bool isVerified;
        uint256 verifiedAt;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 lastActionTime;
    }

    enum StrategyType {
        CONSERVATIVE, // 100% Aave (safest)
        BALANCED, // 90% Aave, 10% reserve
        GROWTH // 80% Aave, 20% for future opportunities
    }

    struct Strategy {
        string name;
        uint8 aaveAllocation; // % to deploy to Aave
        uint8 reserveAllocation; // % to keep liquid
        uint16 targetAPY; // Expected APY in basis points
        uint8 riskLevel; // 1-10
        bool isActive;
    }

    /* ========== EVENTS ========== */

    event UserVerified(address indexed user, uint256 timestamp);
    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);
    event StrategyChanged(
        address indexed user,
        StrategyType oldStrategy,
        StrategyType newStrategy
    );
    event DeployedToAave(uint256 amount, uint256 timestamp);
    event WithdrawnFromAave(uint256 amount, uint256 timestamp);
    event Rebalanced(
        uint256 aaveBalance,
        uint256 reserveBalance,
        uint256 timestamp
    );

    /* ========== ERRORS ========== */

    error NotVerified();
    error InvalidAmount();
    error ExceedsMaxDeposit();
    error ExceedsMaxTVL();
    error InsufficientShares();
    error InsufficientLiquidity();
    error ZeroAddress();

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _cUSD,
        address _acUSD,
        address _selfProtocol,
        address _aavePool
    ) Ownable(msg.sender) {
        if (
            _cUSD == address(0) ||
            _acUSD == address(0) ||
            _selfProtocol == address(0) ||
            _aavePool == address(0)
        ) {
            revert ZeroAddress();
        }

        cUSD = IERC20(_cUSD);
        acUSD = IAToken(_acUSD);
        selfProtocol = ISelfProtocol(_selfProtocol);
        aavePool = IPool(_aavePool);
        treasury = msg.sender;

        _initializeStrategies();

        // Note: cUSD approval will be done on first deposit to avoid constructor issues
    }

    function _initializeStrategies() internal {
        strategies[StrategyType.CONSERVATIVE] = Strategy({
            name: "Conservative",
            aaveAllocation: 100,
            reserveAllocation: 0,
            targetAPY: 350, // 3.5% (conservative estimate)
            riskLevel: 1,
            isActive: true
        });

        strategies[StrategyType.BALANCED] = Strategy({
            name: "Balanced",
            aaveAllocation: 90,
            reserveAllocation: 10,
            targetAPY: 350,
            riskLevel: 3,
            isActive: true
        });

        strategies[StrategyType.GROWTH] = Strategy({
            name: "Growth",
            aaveAllocation: 80,
            reserveAllocation: 20,
            targetAPY: 350, // Same APY, but more reserve for opportunities
            riskLevel: 5,
            isActive: true
        });
    }

    /* ========== MODIFIERS ========== */

    modifier onlyVerified() {
        if (!_isVerified(msg.sender)) revert NotVerified();
        _;
    }

    /* ========== IDENTITY VERIFICATION ========== */

    function verifyIdentity(bytes calldata proof) external {
        require(!users[msg.sender].isVerified, "Already verified");

        bool isValid = selfProtocol.verify(proof);
        require(isValid, "Invalid proof");

        users[msg.sender].isVerified = true;
        users[msg.sender].verifiedAt = block.timestamp;
        userStrategy[msg.sender] = StrategyType.CONSERVATIVE;

        emit UserVerified(msg.sender, block.timestamp);
    }

    function _isVerified(address user) internal view returns (bool) {
        if (users[user].isVerified) return true;
        return selfProtocol.isVerified(user);
    }

    function isVerified(address user) external view returns (bool) {
        return _isVerified(user);
    }

    /* ========== CORE FUNCTIONS: DEPOSIT ========== */

    /**
     * @notice Deposit cUSD and earn yield from Aave
     * @param assets Amount of cUSD to deposit
     * @return sharesIssued Amount of vault shares received
     */
    function deposit(
        uint256 assets
    )
        external
        nonReentrant
        whenNotPaused
        onlyVerified
        returns (uint256 sharesIssued)
    {
        if (assets < MIN_DEPOSIT) revert InvalidAmount();
        if (assets > MAX_DEPOSIT) revert ExceedsMaxDeposit();
        if (totalAssets() + assets > MAX_TVL) revert ExceedsMaxTVL();

        // Calculate shares to issue
        sharesIssued = _convertToShares(assets);

        // Update state
        shares[msg.sender] += sharesIssued;
        totalShares += sharesIssued;
        users[msg.sender].totalDeposited += assets;
        users[msg.sender].lastActionTime = block.timestamp;
        totalDeposited += assets;

        // Transfer cUSD from user
        cUSD.safeTransferFrom(msg.sender, address(this), assets);

        // Ensure Aave has approval (safer incremental approval)
        uint256 currentAllowance = cUSD.allowance(address(this), address(aavePool));
        if (currentAllowance < assets) {
            // Use incremental approval instead of unlimited
            uint256 neededAllowance = assets - currentAllowance;
            cUSD.approve(address(aavePool), currentAllowance + neededAllowance);
        }

        // Deploy to Aave immediately
        _deployToAave(assets);

        emit Deposited(msg.sender, assets, sharesIssued);
    }

    /**
     * @notice Deploy cUSD to Aave to earn interest
     * @param amount Amount to deploy
     */
    function _deployToAave(uint256 amount) internal {
        uint256 reserveAmount = (amount * RESERVE_RATIO) / 100;
        uint256 deployAmount = amount - reserveAmount;

        if (deployAmount > 0) {
            // Supply to Aave (receives acUSD in return)
            aavePool.supply(
                address(cUSD),
                deployAmount,
                address(this),
                0 // No referral code
            );

            emit DeployedToAave(deployAmount, block.timestamp);
        }
    }

    /* ========== CORE FUNCTIONS: WITHDRAW ========== */

    /**
     * @notice Withdraw cUSD (redeems from Aave if needed)
     * @param assets Amount of cUSD to withdraw
     * @return sharesBurned Amount of shares burned
     */
    function withdraw(
        uint256 assets
    ) external nonReentrant returns (uint256 sharesBurned) {
        sharesBurned = _convertToShares(assets);

        if (shares[msg.sender] < sharesBurned) revert InsufficientShares();

        // Update state BEFORE external calls
        shares[msg.sender] -= sharesBurned;
        totalShares -= sharesBurned;
        users[msg.sender].totalWithdrawn += assets;
        users[msg.sender].lastActionTime = block.timestamp;
        totalWithdrawn += assets;

        // Check if we need to withdraw from Aave
        uint256 reserveBalance = cUSD.balanceOf(address(this));

        if (reserveBalance < assets) {
            // Need to withdraw from Aave
            uint256 shortfall = assets - reserveBalance;
            _withdrawFromAave(shortfall);
        }

        // Transfer cUSD to user
        cUSD.safeTransfer(msg.sender, assets);

        emit Withdrawn(msg.sender, assets, sharesBurned);
    }

    /**
     * @notice Withdraw from Aave
     * @param amount Amount needed
     */
    function _withdrawFromAave(uint256 amount) internal {
        // Withdraw from Aave (burns acUSD, returns cUSD)
        uint256 withdrawn = aavePool.withdraw(
            address(cUSD),
            amount,
            address(this)
        );

        emit WithdrawnFromAave(withdrawn, block.timestamp);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Get total assets under management (reserve + Aave)
     * @return uint256 Total cUSD value
     */
    function totalAssets() public view returns (uint256) {
        uint256 reserveBalance = cUSD.balanceOf(address(this));
        uint256 aaveBalance = acUSD.balanceOf(address(this));
        return reserveBalance + aaveBalance;
    }

    /**
     * @notice Get user's current balance in cUSD (including yield)
     */
    function balanceOf(address user) external view returns (uint256) {
        return _convertToAssets(shares[user]);
    }

    /**
     * @notice Get user's total earnings
     */
    function getEarnings(address user) external view returns (uint256) {
        uint256 currentBalance = _convertToAssets(shares[user]);
        uint256 deposited = users[user].totalDeposited;
        uint256 withdrawn = users[user].totalWithdrawn;

        if (currentBalance + withdrawn > deposited) {
            return (currentBalance + withdrawn) - deposited;
        }
        return 0;
    }

    /**
     * @notice Get vault statistics
     */
    function getVaultStats()
        external
        view
        returns (
            uint256 _totalAssets,
            uint256 _totalShares,
            uint256 reserveBalance,
            uint256 aaveBalance,
            uint256 _totalDeposited,
            uint256 _totalWithdrawn
        )
    {
        return (
            totalAssets(),
            totalShares,
            cUSD.balanceOf(address(this)),
            acUSD.balanceOf(address(this)),
            totalDeposited,
            totalWithdrawn
        );
    }

    /**
     * @notice Get current APY
     * @dev In production, this could fetch real-time APY from Aave
     * For MVP, returns conservative estimate
     */
    function getCurrentAPY() external view returns (uint256) {
        // TODO: Implement real-time APY fetching from Aave
        // For now, return conservative estimate
        return 350; // 3.5% (350 basis points)
    }

    /* ========== SHARE CONVERSION ========== */

    function _convertToShares(uint256 assets) internal view returns (uint256) {
        uint256 _totalAssets = totalAssets();
        if (totalShares == 0 || _totalAssets == 0) return assets;
        return (assets * totalShares) / _totalAssets;
    }

    function _convertToAssets(uint256 _shares) internal view returns (uint256) {
        if (totalShares == 0) return 0;
        return (_shares * totalAssets()) / totalShares;
    }

    /* ========== STRATEGY MANAGEMENT ========== */

    function changeStrategy(StrategyType newStrategy) external onlyVerified {
        require(strategies[newStrategy].isActive, "Invalid strategy");

        StrategyType oldStrategy = userStrategy[msg.sender];
        userStrategy[msg.sender] = newStrategy;

        emit StrategyChanged(msg.sender, oldStrategy, newStrategy);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Rebalance vault (maintain target reserve ratio)
     * @dev Can be called by owner or AI agent
     */
    function rebalance() external {
        require(msg.sender == owner() || msg.sender == aiAgent, "Unauthorized");

        uint256 _totalAssets = totalAssets();
        uint256 targetReserve = (_totalAssets * RESERVE_RATIO) / 100;
        uint256 currentReserve = cUSD.balanceOf(address(this));

        if (currentReserve < targetReserve) {
            // Withdraw from Aave to meet reserve target
            uint256 needed = targetReserve - currentReserve;
            _withdrawFromAave(needed);
        } else if (currentReserve > targetReserve * 2) {
            // Too much reserve, deploy excess to Aave
            uint256 excess = currentReserve - targetReserve;
            _deployToAave(excess);
        }

        lastRebalance = block.timestamp;
        emit Rebalanced(
            acUSD.balanceOf(address(this)),
            cUSD.balanceOf(address(this)),
            block.timestamp
        );
    }

    function setAIAgent(address _aiAgent) external onlyOwner {
        if (_aiAgent == address(0)) revert ZeroAddress();
        aiAgent = _aiAgent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Manual verification for testing ONLY (REMOVE IN PRODUCTION!)
     * @dev This function should be removed before mainnet deployment
     */
    function manualVerifyForTesting(address user) external onlyOwner {
        // TODO: Remove this function before production deployment
        users[user].isVerified = true;
        users[user].verifiedAt = block.timestamp;
        userStrategy[user] = StrategyType.CONSERVATIVE;

        emit UserVerified(user, block.timestamp);
    }

    /**
     * @notice Emergency withdraw (only if paused)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(paused(), "Not paused");
        IERC20(token).safeTransfer(owner(), amount);
    }
}
