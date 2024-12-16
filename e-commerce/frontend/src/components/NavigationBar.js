import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const NavigationBar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ logged: false, admin: false });

    const onLogOut = () => {
        localStorage.removeItem('token');
        verifyUser()
    };

    const verifyUser = () => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded) {
                setUser({ admin: decoded.role == 'admin', logged: true });
            } else {
                localStorage.removeItem('token')
                setUser({ admin: false, logged: false });
                navigate("/login")
            }
        } else {
            setUser({ admin: false, logged: false });
            navigate("/login")
        }
    }

    useEffect(() => {
        verifyUser()
    }, [localStorage.getItem('token')]);

    return (
        <Navbar style={{backgroundColor: "palevioletred", color: 'violet', fontSize: '16px', fontWeight: 'bolder'}} expand="lg">
            <Navbar.Brand href="/" className='mx-3'>
                MyShop
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarNav" />
            <Navbar.Collapse id="navbarNav" className='mx-3'>
                <Nav className="me-auto">
                    {user.logged && (
                        <Nav.Link href='/' className="d-flex align-items-center my-2 position-relative">
                            Produse
                        </Nav.Link>
                    )}
                </Nav>
                <Nav>
                    {user.logged && !user.admin && (
                        <Nav.Link href='/cart' className="d-flex align-items-center my-2 position-relative">
                            Coș
                        </Nav.Link>
                    )}
                    {user.logged && (
                        <Nav.Link onClick={onLogOut} className="my-2">
                            <Button variant="outline-danger">Log out</Button>
                        </Nav.Link>
                    )}
                    {!user.logged && (
                        <Nav.Link href="/login" className="my-2">
                            <Button variant="outline-primary">Log in</Button>
                        </Nav.Link>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default NavigationBar;