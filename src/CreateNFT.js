import React, { useState, useContext, isValidElement } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import './CenteredDiv.css';
import Web3Context from './Web3Context';

function CreateNFT() {
  const { web3, contract, ethAddress, ipfs } = useContext(Web3Context);
  const [tokenId, setTokenId] = useState('');
  const [ipfsUri, setIpfsUri] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const handleTokenIdChange = (e) => {
    setTokenId(e.target.value);
  };

  const handleIpfsUriChange = (e) => {
    setIpfsUri(e.target.value);
  };

  const isipfsuri = (str) => {
    //is prefix with "ipfs://" and is a valid CID
    const ipfsRegex = /^ipfs:\/\/(Qm|bafy)[a-zA-Z0-9]+$/;
    return ipfsRegex.test(str);
  };

  const decoder = new TextDecoder();

  const getcidfromuri = (uri) => {
    const parts = uri.split('/');
    const cid = parts[parts.length - 1];
    return cid;
  };
 
  const checkifMetadataValid = async (metadata_json_uri) => {
    try {
      if (!isipfsuri(metadata_json_uri)) {
        throw new Error('Invalid URI');
      }
      // Fetch JSON data from the ipfs URI
      //ipfs cat is not a function fix it
      console.log(ipfs, ipfs.cat);
      //const fileStream = ;
      let content = '';
      for await (const chunk of ipfs.cat(getcidfromuri(metadata_json_uri))) {
        content += decoder.decode(chunk, {
          stream: true
        })
      }
      const jsonData = JSON.parse(content);

      if (!isipfsuri(jsonData.image)) {
        throw new Error('Invalid image');
      }
      return true;
  
    } catch (error) {
      console.error('There was a problem fetching the JSON data:', error);
      // Return null or handle the error as needed
      return false;
    }

  }

  const handleCreateNFT = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Token ID:', tokenId);
    console.log('IPFS URI:', ipfsUri);
    if (!tokenId || !ipfsUri) {
      setAlertMsg('Token ID and IPFS URI are required');
      return;
    }
    if (await checkifMetadataValid(ipfsUri)) {
      await contract.methods.create(ipfsUri, tokenId).send({ from: ethAddress });
    }
    else {
      setAlertMsg('Invalid URI');
    }
    //else enable Alert in bootstrap

    setTokenId('');
    setIpfsUri('');
  };
  //set page to loding if ipfs or web3 is not initialized
  if (!web3 || !contract || !ipfs) {
    return <div className='centered-div'>Loading...</div>;
  }

  return (
    <div className='centered-div'>
      <h1>CreateNFT</h1>
      <Form onSubmit={handleCreateNFT}>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Token ID"
            value={tokenId}
            onChange={handleTokenIdChange}
            aria-label="Token ID"
            aria-describedby="basic-addon1"
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="IPFS URI"
            value={ipfsUri}
            onChange={handleIpfsUriChange}
            aria-label="IPFS URI"
            aria-describedby="basic-addon3"
          />
        </InputGroup>
        {alertMsg && (
          <Alert key="warning" variant="warning">
            {alertMsg}
          </Alert>
        )}
        <Button variant="primary" type="submit">
          Create
        </Button>

      </Form>
    </div>
  );
}

export default CreateNFT;
