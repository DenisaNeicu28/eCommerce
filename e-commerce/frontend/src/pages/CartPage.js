import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const navigate = useNavigate();
    const [user, setUser] = useState({ logged: false, admin: false, id: undefined });

    const verifyUser = () => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded) {
                setUser({ admin: decoded.role == 'admin', logged: true, id: decoded.id });
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

    const fetchCart = async () => {
        try {
            const response = await axiosInstance.get('/api/orders/user/' + user.id);
            console.log(response.data)
            setCartItems(response.data[0].OrderItems);
            setTotalPrice(response.data[0].totalPrice);
        } catch (error) {
            setCartItems([]);
            setTotalPrice(0);
            console.error('Failed to load cart!');
        }
    };

    useEffect(() => {
        user.id && fetchCart();
    }, [user]);

    const handleRemoveFromCart = async (itemId) => {
        try {
            await axiosInstance.delete(`api/orders/user/${user.id}/cart/${itemId}`);
            fetchCart();
        } catch (error) {
            alert('Failed to remove Product!');
        }
    };

    const changeQuantity = async (quantity, productId) => {
        try {
            const response = await axiosInstance.post(`/api/orders/user/${user.id}/cart`, { productId, quantity });
            fetchCart();
        } catch (error) {
            alert('Eroare!');
        }
    }

    const checkout = async () => {
        try {
            const response = await axiosInstance.put(`/api/orders/user/${user.id}/confirm`);
            alert("Comandă trimisă!")
            fetchCart();
        } catch (error) {
            alert('Eroare!');
        }
    }

    return (
        <Container className="mt-5">
            <h1>Coșul tău</h1>
            {cartItems.map((item) => (
                <Row key={item.id} className="align-items-center py-2" style={{ borderBottom: "1px solid violet" }}>
                    <Col xs={2}>
                        <Image
                            src={item.Product.image || 'https://via.placeholder.com/150'}
                            alt={item.Product.name}
                            fluid
                            style={{ maxWidth: '80px', height: 'auto' }}
                        />
                    </Col>
                    <Col xs={4}>
                        <div>
                            <strong>{item.Product.name}</strong>
                        </div>
                        <div>{item.Product.description || 'No description available'}</div>
                    </Col>
                    <Col xs={2}>
                        <div>{item.Product.price} RON</div>
                    </Col>
                    <Col xs={2}>
                        <select
                            value={item.quantity}
                            onChange={(e) => changeQuantity(e.target.value, item.Product.id)}
                            className="form-select"
                        >
                            {[...Array(item.Product.stock).keys()].map((x) => (
                                <option key={x + 1} value={x + 1}>
                                    {x + 1} buc.
                                </option>
                            ))}
                        </select>
                    </Col>

                    <Col xs={1}>
                        <strong>{item.Product.price * item.quantity} RON</strong>
                    </Col>
                    <Col xs={1}>
                        <Button variant="link" className="text-danger" onClick={() => handleRemoveFromCart(item.id)}>
                            șterge
                        </Button>
                    </Col>
                </Row>
            ))}
            <Row className="mt-4">
                <Col>
                    <h3>Total: {totalPrice} RON</h3>
                    <Button onClick={checkout}>Comandă</Button>
                </Col>
            </Row>
            <Row>
            </Row>

        </Container>
    );
}

export default CartPage;
