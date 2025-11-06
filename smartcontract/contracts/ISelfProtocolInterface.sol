// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISelfProtocolInterface
 * @notice Interface for Self Protocol verification
 */
interface ISelfProtocolInterface {
    /**
     * @notice Check if a user is verified
     * @param user The user address to check
     * @return bool True if user is verified
     */
    function isVerified(address user) external view returns (bool);

    /**
     * @notice Verify a user's identity proof
     * @param proof The proof bytes to verify
     * @return bool True if verification is successful
     */
    function verify(bytes calldata proof) external view returns (bool);
}
