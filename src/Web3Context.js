import React, { createContext, useState, useEffect } from 'react';
import { unixfs } from '@helia/unixfs'; // Import Helia Client
import { createHelia } from 'helia';
import {Web3} from 'web3';
//Package path . is not exported from package C:\Users\73448\Desktop\nft-frontend\node_modules\ipfs-http-client

const NFTABI = require("./contracts/NFT.json")["abi"];
// test addr
const contract_addr = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';
//const contract_addr = '0xC2DD0D9B8b632eF3F1c1159Cc86546778fEe431E';

const Web3Context = createContext(null);

//IPFS
export const abbreviatedAddress = (address) => {
  if(address)
    return address.substring(0,7) + '...' + address.slice(-5);
  else
    return '0x0';
}

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setNFTContract] = useState(null);
  const [ethAddress, setEthAddress] = useState(null);
  const [ipfs, setIPFS] = useState(null);
  
  useEffect(() => {
    const setupContracts = () => {
      console.log('NFTABI ', NFTABI);
      setNFTContract(new web3.eth.Contract(NFTABI, contract_addr));
    }  

    if(web3)
    {
      setupContracts();

    }
  },[web3]);

  // Initialize Web3 and IPFS when first loaded
  useEffect(() => {
    const initWeb3 = async () => {
      const web3 = new Web3(window.ethereum);   
      console.log('NFTABI ', NFTABI);
      setNFTContract(new web3.eth.Contract(NFTABI, contract_addr));

      if (window.ethereum) {
        try {
                 
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          setWeb3(web3);
          const accounts = await web3.eth.getAccounts();
          setEthAddress(accounts[0]);
          window.ethereum.on('accountsChanged', (accounts) => {
            setEthAddress(accounts[0]);
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    const initIPFS = async () => {
      const helia = await createHelia();
      const fs = unixfs(helia);
      helia.libp2p.addEventListener("peer:discovery", (evt) => {
        //discoveredPeers.set(evt.detail.id.toString(), evt.detail);
        //console.log(`Discovered peer ${evt.detail.id.toString()}`);
      });
    
      helia.libp2p.addEventListener("peer:connect", (evt) => {
        //console.log(`Connected to ${evt.detail.toString()}`);
      });
      helia.libp2p.addEventListener("peer:disconnect", (evt) => {
        //console.log(`Disconnected from ${evt.detail.toString()}`);
      });
      setIPFS(fs);
    }

    initWeb3();
    initIPFS();

  }, []);

  useEffect(() => {
    console.log('web3 ', web3);
  }, [web3]); 

  useEffect(() => {
    console.log('contract ', contract);
  }, [contract]);

  useEffect(() => {
    console.log('ethAddress ', ethAddress);
  }, [ethAddress]);

  const contextValue = {
    web3,
    contract,
    ethAddress,
    ipfs
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};

export default Web3Context;
