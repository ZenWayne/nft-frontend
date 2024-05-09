import React from 'react';
import Web3Context from './Web3Context';
import { readFromHttpIPFS, getcidfromuri, readFromIPFSJSON, readFromIPFSIMAGE, enable_ipfs } from './Web3Context';
import { useEffect, useState, useContext } from 'react';
import { Container, Col, Row, Image, Figure } from 'react-bootstrap';

function Home() {
    const { web3, contract, ethAddress, ipfs} = useContext(Web3Context);
    //const {enable_ipfs} = useContext(Web3Context)?.EnableIPFS ?? false;
    //id => metadata
    const [metadataMap, setMetadataMap] = useState(new Map());
    //const [metadata, setMetadata] = useState([]);
    const [listItems, setListItems] = useState(null);

    useEffect(() => {
        const decoder = new TextDecoder();
        const fetchNFTMetadata = async (token_idx) => {
            try {
                const token_id = await contract.methods.tokenByIndex(token_idx).call();
                //console.log('Token ID:', token_id);
                const token_uri = await contract.methods.tokenURI(token_id).call();
                //console.log('Token URI:', token_uri);

                // Fetch the JSON metadata from IPFS using its CID
                const cid = getcidfromuri(token_uri);

                let newMetadata = null;
                console.log('enable_ipfs:', enable_ipfs);
                if (enable_ipfs) {
                    newMetadata = await readFromIPFSJSON(ipfs, cid)
                  }else{
                    newMetadata = await readFromHttpIPFS(cid);
                  }
                  //enable_ipfs is not defined

                const image_cid = getcidfromuri(newMetadata.image);
                let blob =null;
                if (enable_ipfs) {
                    blob = await readFromIPFSIMAGE(ipfs,image_cid);
                  }else{
                    blob = await readFromHttpIPFS(image_cid);
                  }
                newMetadata.imageUrl = URL.createObjectURL(blob);
                console.log('newMetadata.imageUrl:', newMetadata.imageUrl)

                //update metadata map
                setMetadataMap(new Map(metadataMap.set(token_id, newMetadata)));

                //console.log('Content from IPFS:', newMetadata)
            } catch (error) {
                console.error('Error fetching content from IPFS:', error)
            }

        };

        const fetchNft = async () => {
            if(enable_ipfs){
                if(!ipfs){
                    console.log('IPFS is not ready')
                }
            }        

            if (contract) {
                console.log(ipfs, enable_ipfs)
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
            //map metaMap to listItems
            const listItems = Array.from(metadataMap).map(([key, value]) => {
                return (
                    <Col xs={6} md={3} key={key}>
                        <Figure>
                            <Figure.Image
                                width={200}
                                height={200}
                                alt="200x200"
                                src={value.imageUrl}
                                rounded
                            />
                            <Figure.Caption>
                                {value.name}
                            </Figure.Caption>
                        </Figure>
                    </Col>
                );
            });
            setListItems(listItems);
        }
    }, [metadataMap])

    return (
        <>
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