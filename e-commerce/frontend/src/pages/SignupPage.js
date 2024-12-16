import React, { useState } from 'react';
import { Form, Button, Container, Col } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';


function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/users/signup', { name, email, password });
            navigate('/login')
        } catch (error) {
            alert('Signup failed!');
        }
    };

    return (
        <Container style={{ display: 'flex', alignItems: 'center', width: '100%' }} className="mt-5 p-4">
            <Col md={3} sm={3}></Col>
            <Col md={6} sm={6} className='shadow-lg p-4 rounded'>
                <h1>Înregistrare</h1>
                <Form onSubmit={handleSignup}>
                    <Form.Group controlId="name">
                        <Form.Label>Nume</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nume"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
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
                        Creează cont
                    </Button>
                    <Form.Group controlId="password">
                        <Link to={"/login"}>Ai cont?</Link>
                    </Form.Group>
                </Form></Col>
            <Col md={3} sm={3}></Col>
        </Container>
    );
}

export default SignupPage;
