import React, { useState, useContext, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, NavbarToggle, Container } from 'react-bootstrap';
import CreateNFT from './CreateNFT';
import Home from './Home';
import Web3Context from './Web3Context';
import { abbreviatedAddress } from './Web3Context';

function App() {
    const [activeContent, setActiveContent] = useState('home');
    const { web3, contract, ethAddress } = useContext(Web3Context);
    const [NFTName, setNFTName] = useState('null');

    const [balance, setBalance] = useState(0);

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
        fetchName();
    }, [contract]);

    useEffect(() => {
        console.log('balance:', balance);
    }, [balance])

    const handleNavClick = (content) => {
        setActiveContent(content);
    };

    const renderContent = () => {
        switch (activeContent) {
            case 'home':
                return (
                    <Home />
                );
            case 'CreateNFT':
                return (
                    <CreateNFT />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href='#home'>{NFTName}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" >
                        <Nav className='me-auto'>
                            <Nav.Link href='#home' onClick={() => handleNavClick('home')}>
                                Home
                            </Nav.Link>
                            <Nav.Link href='#CreateNFT' onClick={() => handleNavClick('CreateNFT')}>
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
            {renderContent()}
        </>

    );


}

export default App;