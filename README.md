# Diamond ERC721

This implements ERC721 using [EIP-2535](https://github.com/ethereum/EIPs/issues/2535) Diamond Pattern.

Uses code from https://github.com/mudgen/diamond-1-hardhat as base code.

## Installation

1. Clone this repository

`$ git clone https://github.com/Frenchkebab/diamond-erc721.git`

2. Install dependencides

`$ npm install`

## Test

`$ npx hardhat test test/nftFacet.test.js`

### Test Result

```
  [NFTFacet Test]
        DiamondInit deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3

        <Deploying facets>
        DiamondCutFacet deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
        DiamondLoupeFacet deployed: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
        OwnershipFacet deployed: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

        Diamond deployed: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

    NFTFacet
        DiamondNFTFacet deployed:  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
      ✔ should add NFTFacet functions (185ms)
      ✔ should initialize NFT Facet
      ✔ should revert when initializing more than once
      ✔ should have a name
      ✔ should have a symbol
      ✔ should support ERC165 and ERC721 interface
      ✔ should mint
    NFTFacetV2
      ✔ should replace mint function (91ms)
      ✔ should add setERC20TokenAddress function (68ms)
      ✔ should add ERC20TokenAddress function
      ✔ should set ERC20 token address
      ✔ should mint NFT with 10 JungTokens (52ms)
      ✔ should revert when trying to mint with 0.001 ETH
```

## Facet Information

- `contracts/Diamond.sol`: an example implementation of a diamond.

- `contracts/facets/DiamondCutFacet.sol`: implementats `diamondCut` external function

- `contracts/facets/DiamondLoupeFacet.sol`: implements the four standard loupe functions.

- `contracts/libraries/LibDiamond.sol`: implements Diamond Storage and a `diamondCut` internal function

- `contracts/facets/NFTFacet.sol`: implementation of a classic ERC721 NFT contract. Need `0.001 ether` to mint NFT.

- `contracts/facets/NFTFacetV2.sol`: Stores ERC20 token address and requires `10` JungToken(ERC20) to mint NFT.
