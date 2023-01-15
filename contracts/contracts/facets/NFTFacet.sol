// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

library LibERC721 {
    struct ERC721DiamondStorage {
        bool initialized;
        // Token name
        string _name;
        // Token symbol
        string _symbol;
        // Number of minted tokens
        uint256 _totalSupply;
        // Mapping from token ID to owner address
        mapping(uint256 => address) _owners;
        // Mapping owner address to token count
        mapping(address => uint256) _balances;
        // Mapping from token ID to approved address
        mapping(uint256 => address) _tokenApprovals;
        // Mapping from owner to operator approvals
        mapping(address => mapping(address => bool)) _operatorApprovals;
    }

    // Returns the struct from a specified position in contract storage
    // ds is short for DiamondStorage
    function diamondStorage() internal pure returns (ERC721DiamondStorage storage ds) {
        // Specifies a random position from a hash of a string
        bytes32 storagePosition = keccak256("diamond.standard.erc721.storage");

        // Set the position of our struct in contract storage
        assembly {
            ds.slot := storagePosition
        }
    }
}

contract NFTFacet {
    using Address for address;
    using Strings for uint256;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function initialize(string calldata name_, string calldata symbol_) public {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        LibERC721.ERC721DiamondStorage storage dsERC721 = LibERC721.diamondStorage();

        /*==================== ERC721DiamondStorage ====================*/
        dsERC721._name = name_;
        dsERC721._symbol = symbol_;
        dsERC721.initialized = true;

        /*==================== DiamondStorage ====================*/
        ds.supportedInterfaces[0x80ac58cd] = true;
    }
}
