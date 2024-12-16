import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ logged: false, admin: false });
    const [products, setProducts] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        image: '',
    });

    const fetchProducts = async () => {
        const response = await axiosInstance.get('/api/products');
        if (response.status == 200) {
            setProducts(response.data);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded) {
                if (decoded.role != 'admin') {
                    setUser({ admin: false, logged: true });
                    navigate("/")
                } else {
                    setUser({ admin: true, logged: true });
                }
            } else {
                localStorage.removeItem('token')
                navigate("/signup")
            }
        } else {
            navigate("/signup")
        }

    }, []);

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/products', { ...newProduct, image: imageBase64 });
            await fetchProducts()
            setNewProduct({ name: '', price: '', stock: '', description: '', image: '' });
            alert('Adăugat!');
        } catch (error) {
            console.error(error)
            alert('Failed to add product!', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axiosInstance.delete(`/api/products/${productId}`);
            await fetchProducts()
            alert('Adăugat!');
        } catch (error) {
            alert('Eroarea!');
        }
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(selectedImage);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Adăugare produs</h1>

            <Form className="mb-4" onSubmit={handleAddProduct}>
                <Row>
                    <Col md={2}>
                        <Form.Control
                            placeholder="Nume"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Control
                            placeholder="Image"
                            type='file'
                            value={undefined} onChange={(event) => {
                                const type = event.currentTarget.files[0].type.toString()
                                console.log(type)
                                if (!type.includes("image")) {
                                    alert("Adaugă o imagine!");
                                } else {
                                    handleImageChange(event)
                                }
                            }}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Control
                            placeholder="Preț"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Control
                            placeholder="Stoc"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Control
                            placeholder="Descriere"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="success">
                            Adaugă
                        </Button>
                    </Col>
                </Row>
            </Form>

            <Row>
                {products.map((product) => (
                    <Col key={product.id} md={4}>
                        <Card className="mb-3">
                            <Card.Img
                                variant="top"
                                style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                                src={product.image || 'https://via.placeholder.com/150'}
                            />
                            <Card.Body>
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>Preț: {product.price} lei</Card.Text>
                                <Card.Text>Stoc: {product.stock}</Card.Text>
                                <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                                    Șterge
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default AdminPage;
