import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProductPage() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState({ logged: false, admin: false, id: undefined });

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axiosInstance.get('/api/products');
            if (response.status == 200)
                setProducts(response.data);
        };
        fetchProducts();
    }, []);

    const addToCart = async (productId) => {
        try {
            const response = await axiosInstance.post(`/api/orders/user/${user.id}/cart`, { productId, quantity: 1, plus: true });
            navigate("/cart")
        } catch (error) {
            alert('Eroare!');
        }
    };

    const verifyUser = () => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded) {
                setUser({ admin: decoded.role == 'admin', logged: true, id: decoded.id });
                if(decoded.role == 'admin'){
                    navigate("/admin")
                }
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
        <Container className="mt-5">
            <h1>Produse</h1>
            <Row>
                {products.map((product) => (
                    <Col key={product.id} md={4}>
                        <Card className="mb-3">
                            <Card.Img variant="top" style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                                src={product.image} />
                            <Card.Body>
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>{product.price} lei</Card.Text>
                                <Button variant="primary" onClick={() => addToCart(product.id)}>
                                    Adaugă în coș
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default ProductPage;
