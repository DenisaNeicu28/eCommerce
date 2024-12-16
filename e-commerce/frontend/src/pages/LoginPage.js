import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Col } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded) {
                window.location.href = "/"
            } else {
                localStorage.removeItem('token')
            }
        }
    }, [localStorage.getItem('token')]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/api/users/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate("/")
        } catch (error) {
            alert('Login failed!');
        }
    };

    return (
        <Container style={{ display: 'flex', alignItems: 'center', width: '100%' }} className="mt-5 p-4">
            <Col md={3} sm={3}></Col>
            <Col md={6} sm={6} className='shadow-lg p-4 rounded'>
                <h1>Autentificare</h1>
                <Form onSubmit={handleLogin}>
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Parolă</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Parolă"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="my-3">
                        Intră în cont
                    </Button>
                    <Form.Group controlId="password">
                        <Link to={"/signup"}>Nu ai cont?</Link>
                    </Form.Group>
                </Form></Col>
            <Col md={3} sm={3}></Col>
        </Container>
    );
}

export default LoginPage;