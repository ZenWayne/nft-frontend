import React, { createContext, useState, useEffect, useContext } from 'react';
import { unixfs } from '@helia/unixfs'; // Import Helia Client
import { createHelia } from 'helia';
import { Web3 } from 'web3';
//Package path . is not exported from package C:\Users\73448\Desktop\nft-frontend\node_modules\ipfs-http-client

const NFTABI = require("./contracts/NFT.json")["abi"];
// test addr
//const contract_addr = '0x0165878a594ca255338adfa4d48449f69242eb8f';
const contract_addr = '0x4C327Faf044B323472C71E212808396e1BF26fB5';

const Web3Context = createContext(null);
export const enable_ipfs = true;

//IPFS
export const abbreviatedAddress = (address) => {
  if (address)
    return address.substring(0, 7) + '...' + address.slice(-5);
  else
    return '0x0';
}

//you should check ipfs variable is initialized before calling this function
export const readFromHttpIPFS = async (cid) => {
  console.log('readFromHttpIPFS:', cid);
  //get ipfs content from filebase http gateway
  const url = "https://ipfs.filebase.io/ipfs/" + cid;
  //get image from url and return blob
  const response = await fetch(url);
  //check reponse type is json or image
  const contentType = response.headers.get('content-type');
  if (contentType.includes('application/json')) {
    const metadata = await response.json();
    console.log('metadata.image:', metadata.image);
    return metadata;
  }
  if (contentType.includes('image')) {
    const blob = await response.blob();
    console.log('blob:', blob);
    return blob;
  }
  return metadata;
};

export const readFromIPFSJSON = async (ipfs, cid) => {
  //use ipfs state in Web3Provider in this file
  
  const decoder = new TextDecoder();
  let content = '';
  for await (const chunk of ipfs.cat(cid)) {
    content += decoder.decode(chunk, {
      stream: true
    })
  }
  const jsonData = JSON.parse(content);
  return jsonData;
}

export const readFromIPFSIMAGE = async (ipfs, cid) => {
  console.log('readFromIPFSIMAGE:', cid);
  let content = new Uint8Array(); // Initialize as a Uint8Array to handle binary data
  for await (const chunk of ipfs.cat(cid)) {
      content = new Uint8Array([...content, ...chunk]); // Concatenate binary data correctly
  }
  const blob = new Blob([content], { type: 'image/jpeg' });
  console.log('blob:', blob);
  return blob;
}
//read all of the ipfs file

export const getcidfromuri = (uri) => {
  const parts = uri.split('/');
  const cid = parts[parts.length - 1];
  return cid;
};

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

    if (web3) {
      setupContracts();

    }
  }, [web3]);

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
    };

    if(enable_ipfs){
      initIPFS();
    }
    
    initWeb3();
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
    //EnableIPFS
    ipfs
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};

export default Web3Context;
