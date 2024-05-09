import React from 'react';
import Web3Context from './Web3Context';
import { useEffect, useState, useContext } from 'react';
import { Container, Col, Row, Image, Figure } from 'react-bootstrap';

function Home() {
    const { web3, contract, ethAddress, ipfs } = useContext(Web3Context);
    //id => metadata
    const [metadataMap, setMetadataMap] = useState(new Map());
    //const [metadata, setMetadata] = useState([]);
    const [listItems, setListItems] = useState(null);

    useEffect(() => {
        const decoder = new TextDecoder();
        async function loadImageFromIPFS(url) {
            const readfilefromipfs = async (cid) => {
                //get ipfs content from filebase http gateway
                const url="https://ipfs.filebase.io/ipfs/"+cid;
                //get image from url and return blob
                const response = await fetch(url);
                const blob = await response.blob();
                //or get ipfs content from ipfs node
                //const blob = ipfs.cat(cid);
                return blob;
            }
            try {
                const cid = getcidfromuri(url);
                // Fetch the image from IPFS using its CID
                //const fileStream = await ipfs.cat(cid);

                const blob = await readfilefromipfs(cid);

                // Check if the blob is valid
                if (!blob || !(blob instanceof Blob)) {
                    throw new Error('Invalid Blob data from IPFS');
                }

                // Create a URL for the Blob object
                //TypeError: Failed to execute 'createObjectURL' on 'URL': Overload resolution failed
                const imageUrl = URL.createObjectURL(blob);

                // Return the image URL
                return imageUrl;
            } catch (error) {
                console.error('Error loading image from IPFS:', error);
                return null;
            }
        };
        const getcidfromuri = (uri) => {
            const parts = uri.split('/');
            const cid = parts[parts.length - 1];
            return cid;
        };
        const fetchNFTMetadata = async (token_idx) => {
            const readjsonfromipfs = async (cid) => {
                //get ipfs content from filebase http gateway
                const url="https://ipfs.filebase.io/ipfs/"+cid;
                //get image from url and return blob
                const response = await fetch(url);
                const metadata = await response.json();
                console.log('metadata.image:', metadata.image);
                //or get ipfs content from ipfs node
                //const blob = ipfs.cat(cid);
                // let content = '';

                // for await (const chunk of fileStream) {
                //     content += decoder.decode(chunk, {
                //         stream: true
                //     })
                // }
                //const metadata = JSON.parse(content);
                return metadata;
            }
            try {
                const token_id = await contract.methods.tokenByIndex(token_idx).call();
                //console.log('Token ID:', token_id);
                const token_uri = await contract.methods.tokenURI(token_id).call();
                //console.log('Token URI:', token_uri);

                // Fetch the JSON metadata from IPFS using its CID
                const cid = getcidfromuri(token_uri);

                const newMetadata = await readjsonfromipfs(cid);

                newMetadata.imageUrl = await loadImageFromIPFS(newMetadata.image);
                
                //update metadata map
                setMetadataMap(new Map(metadataMap.set(token_id, newMetadata)));

                //console.log('Content from IPFS:', newMetadata)
            } catch (error) {
                console.error('Error fetching content from IPFS:', error)
            }

        };

        const fetchNft = async () => {
            if (contract && ipfs) {
                //Error happened while trying to execute a function inside a smart contract
                const totalSupply = await contract.methods.totalSupply().call();

                for (let i = 0; i < totalSupply; i++) {
                    fetchNFTMetadata(i);
                }
            }
        };

        fetchNft();
    }, [contract, ipfs]);

    useEffect(() => {
        if (metadataMap) {
            const metadata = Array.from(metadataMap.values());
            const listItems = metadata.map(token =>
                <Col xs={6} md={3}>
                    <Figure>
                        <Figure.Image
                            width={200}
                            height={200}
                            alt="256x256"
                            src={token.imageUrl}
                            rounded
                        />
                        <Figure.Caption>
                            {token.name}
                        </Figure.Caption>
                    </Figure>
                </Col>
            );
            setListItems(listItems);
        }
    }, [metadataMap])

    return (
        <>
            <Row></Row>
            <Container>
                <Row>
                    {listItems}
                </Row>
            </Container>
        </>

    );
}

export default Home;
//list item is not defined