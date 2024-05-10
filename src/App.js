import React, { useState, useContext, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, NavbarToggle, Container } from 'react-bootstrap';
import CreateNFT from './CreateNFT';
import Home from './Home';
import Web3Context from './Web3Context';
import { abbreviatedAddress } from './Web3Context';

function App() {
    const [activeContent, setActiveContent] = useState('home');
    const { web3, contract, ethAddress, ipfs, errorMsg } = useContext(Web3Context);
    const [NFTName, setNFTName] = useState('null');

    const [balance, setBalance] = useState(0);
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchBalance = async () => {
            if (contract && ethAddress) {
                const fetchedBalance = await contract.methods.balanceOf(ethAddress).call();
                setBalance(Number(fetchedBalance));
            }
        };
        fetchBalance();
    }, [contract, ethAddress]);

    useEffect(() => {
        const fetchName = async () => {
            if (contract) {
                const name = await contract.methods.symbol().call();
                console.log("name: ", name);
                setNFTName(String(name));
            }
        };
        console.log('fetchName Effect:', contract);
        fetchName();
    }, [contract]);

    useEffect(() => {
        console.log('balance:', balance);
    }, [balance]);

    useEffect(() => {
        console.log('errorMsg:', errorMsg);
        if (errorMsg) {
            setContent(<div className='centered-div'>{errorMsg}</div>);
            return;
        }
        switch (activeContent) {
            case 'home': {
                setContent(<Home />);
                return;
            }
            case 'CreateNFT': {
                setContent(<CreateNFT />);
                return;
            }
            default: {
                setContent(<Home />);
                return;
            }
        }
    }, [activeContent, errorMsg]);


    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href='#home'>{NFTName}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" >
                        <Nav className='me-auto'>
                            <Nav.Link href='#home' onClick={() => setActiveContent('home')}>
                                Home
                            </Nav.Link>
                            <Nav.Link href='#CreateNFT' onClick={() => setActiveContent('CreateNFT')}>
                                CreateNFT
                            </Nav.Link>
                        </Nav>
                        <Nav className='ml-auto'>
                            {/* add some space between */}
                            <Navbar.Text style={{ marginRight: '10px' }}>Address : {abbreviatedAddress(ethAddress)}</Navbar.Text>
                            <Navbar.Text>Balance : {balance}</Navbar.Text>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <br />
            {content}
        </>

    );


}

export default App;