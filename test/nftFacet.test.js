/* eslint-disable no-unused-expressions */
/* global describe it before ethers */

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');

const { deployDiamond } = require('../scripts/deploy.js');

const { assert, expect } = require('chai');

describe('[NFTFacet Test]', async function () {
  let owner;

  let diamondAddress;
  let diamondCutFacet;
  let diamondLoupeFacet;

  let diamondNFTFacet;
  let diamondNFTFacetV2;

  let tx;
  let receipt;
  let result;
  const addresses = [];

  /* ==================== Adding Facet ==================== */

  before(async function () {
    diamondAddress = await deployDiamond();
    diamondCutFacet = await ethers.getContractAt(
      'DiamondCutFacet',
      diamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      'DiamondLoupeFacet',
      diamondAddress
    );

    [owner] = await ethers.getSigners();
  });

  context('NFTFacet', function () {
    it('should add NFTFacet functions', async function () {
      const NFTFacet = await ethers.getContractFactory('NFTFacet');
      const nftFacet = await NFTFacet.deploy();
      await nftFacet.deployed();

      console.log('\tDiamondNFTFacet deployed: ', nftFacet.address);

      addresses.push(nftFacet.address);

      const selectors = getSelectors(nftFacet).remove([
        'supportsInterface(bytes4)',
      ]);

      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: nftFacet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        '0x',
        { gasLimit: 800000 }
      );
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(nftFacet.address);
      assert.sameMembers(result, selectors);
    });

    it('should initialize NFT Facet', async () => {
      diamondNFTFacet = await ethers.getContractAt('NFTFacet', diamondAddress);
      await expect(diamondNFTFacet.initialize('Jung NFT', 'JFT')).not.to.be
        .reverted;
    });

    it('should revert when initializing more than once', async () => {
      // const nftFacet = await ethers.getContractAt('NFTFacet', diamondAddress);
      await expect(diamondNFTFacet.initialize('Jung NFT', 'JFT')).to.be
        .reverted;
    });

    it('should have a name', async function () {
      expect(await diamondNFTFacet.name()).to.equal('Jung NFT');
    });

    it('should have a symbol', async function () {
      expect(await diamondNFTFacet.symbol()).to.equal('JFT');
    });

    it('should support ERC165 and ERC721 interface', async function () {
      expect(await diamondNFTFacet.supportsInterface('0x80ac58cd')).to.be.true;
      expect(await diamondNFTFacet.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('should mint', async function () {
      await diamondNFTFacet
        .connect(owner)
        .mint({ value: ethers.utils.parseEther('0.0001') });

      expect(await diamondNFTFacet.balanceOf(owner.address)).to.equal(1);
      expect(await diamondNFTFacet.ownerOf('0')).to.equal(owner.address);
    });
  });

  context('NFTFacetV2', function () {
    let jungToken;
    let NFTFacetV2;
    let nftFacetV2;

    before(async function () {
      const JungToken = await ethers.getContractFactory('JungToken');
      jungToken = await JungToken.deploy();
      await jungToken.deployed();
    });

    it('should replace mint function', async function () {
      NFTFacetV2 = await ethers.getContractFactory('NFTFacetV2');
      nftFacetV2 = await NFTFacetV2.deploy();
      await nftFacetV2.deployed();

      diamondNFTFacetV2 = await ethers.getContractAt(
        'NFTFacetV2',
        diamondAddress
      );

      const selectors = getSelectors(NFTFacetV2).get(['mint()']);

      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: nftFacetV2.address,
            action: FacetCutAction.Replace,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        '0x',
        { gasLimit: 800000 }
      );
      receipt = await tx.wait();

      result = await diamondLoupeFacet.facetFunctionSelectors(
        nftFacetV2.address
      );
      assert.sameMembers(result, selectors);
    });

    it('should add setERC20TokenAddress function', async function () {
      let selectors = getSelectors(nftFacetV2).get([
        'setERC20TokenAddress(address)',
      ]);

      addresses.push(nftFacetV2.address);

      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: nftFacetV2.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        '0x',
        { gasLimit: 800000 }
      );

      receipt = await tx.wait();

      selectors = getSelectors(NFTFacetV2).get([
        'mint()',
        'setERC20TokenAddress(address)',
      ]);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        nftFacetV2.address
      );
      assert.sameMembers(result, selectors);

      await diamondNFTFacetV2.setERC20TokenAddress(jungToken.address);
    });

    it('should add ERC20TokenAddress function', async function () {
      let selectors = getSelectors(NFTFacetV2).get(['ERC20TokenAddress()']);

      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: nftFacetV2.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        '0x',
        { gasLimit: 800000 }
      );

      receipt = await tx.wait();

      selectors = getSelectors(NFTFacetV2).get([
        'mint()',
        'setERC20TokenAddress(address)',
        'ERC20TokenAddress()',
      ]);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        nftFacetV2.address
      );
      assert.sameMembers(result, selectors);
    });

    it('should set ERC20 token address', async function () {
      tx = await diamondNFTFacetV2.setERC20TokenAddress(jungToken.address);
      await tx.wait();

      expect(await diamondNFTFacetV2.ERC20TokenAddress()).to.equal(
        jungToken.address
      );
    });

    it('should mint NFT with 10 JungTokens', async function () {
      tx = await jungToken.approve(
        diamondAddress,
        ethers.utils.parseEther('10')
      );
      tx.wait();

      tx = await diamondNFTFacetV2.mint();
      await tx.wait();

      expect(await diamondNFTFacetV2.balanceOf(owner.address)).to.equal('2');
      expect(await diamondNFTFacetV2.ownerOf('1')).to.equal(owner.address);
    });

    it('should revert when trying to mint with 0.001 ETH', async function () {
      await expect(
        diamondNFTFacetV2.mint({
          value: ethers.utils.parseEther('0.001'),
        })
      ).to.be.reverted;
    });
  });
});
