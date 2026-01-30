import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Image, Badge } from 'react-bootstrap';
import { Search, Send, MessageCircle, MoreVertical, Paperclip, Smile } from 'lucide-react';

const CHAT_USERS = [
    { id: 1, name: 'Alice Johnson', message: 'Hi, I have a question about my order.', status: 'online', unread: 2, time: '2m' },
    { id: 2, name: 'Bob Smith', message: 'Thanks for your help!', status: 'offline', unread: 0, time: '1h' },
    { id: 3, name: 'Charlie Davis', message: 'When will the item be restocked?', status: 'online', unread: 0, time: '3h' },
];

const MESSAGE_HISTORY = [
    { id: 1, sender: 'Alice Johnson', text: 'Hi, I have a question about my order.', time: '10:00 AM', isUser: true },
    { id: 2, sender: 'Support Agent', text: 'Hello Alice! I would be happy to help. Can you please provide your order ID?', time: '10:01 AM', isUser: false },
    { id: 3, sender: 'Alice Johnson', text: 'Sure, it is #ORD-12345.', time: '10:02 AM', isUser: true },
];

const LiveChat = () => {
    const [selectedUser, setSelectedUser] = useState(CHAT_USERS[0]);
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (message.trim()) {
            console.log('Sending message:', message);
            setMessage('');
        }
    };

    return (
        <div className="p-3" style={{ height: 'calc(100vh - 100px)' }}> {/* Adjust height based on layout */}
            <Row className="h-100 g-3">
                {/* Users List */}
                <Col md={4} lg={3} className="h-100">
                    <Card className="h-100 border-0 shadow-sm d-flex flex-column">
                        <Card.Header className="bg-white border-bottom p-3">
                            <h6 className="fw-bold mb-3">Chats</h6>
                            <div className="position-relative">
                                <Search size={16} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
                                <Form.Control size="sm" type="search" placeholder="Search..." className="ps-4 bg-light border-0" />
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0 overflow-auto">
                            <ListGroup variant="flush">
                                {CHAT_USERS.map((user) => (
                                    <ListGroup.Item
                                        key={user.id}
                                        action
                                        active={selectedUser.id === user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className="border-0 py-3 px-3 d-flex align-items-center gap-3"
                                    >
                                        <div className="position-relative">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.status === 'online' && <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1"></span>}
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6 className="mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>{user.name}</h6>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user.time}</small>
                                            </div>
                                            <p className="mb-0 text-muted text-truncate small">{user.message}</p>
                                        </div>
                                        {user.unread > 0 && <Badge bg="danger" pill>{user.unread}</Badge>}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Chat Window */}
                <Col md={8} lg={9} className="h-100">
                    <Card className="h-100 border-0 shadow-sm d-flex flex-column">
                        {/* Chat Header */}
                        <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">{selectedUser.name}</h6>
                                    <small className="text-muted d-flex align-items-center gap-1">
                                        <span className={`d-inline-block rounded-circle ${selectedUser.status === 'online' ? 'bg-success' : 'bg-secondary'}`} style={{ width: '8px', height: '8px' }}></span>
                                        {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                                    </small>
                                </div>
                            </div>
                            <Button variant="link" className="text-muted p-0"><MoreVertical size={20} /></Button>
                        </Card.Header>

                        {/* Messages Area */}
                        <Card.Body className="flex-grow-1 overflow-auto bg-light p-4 d-flex flex-column gap-3">
                            {MESSAGE_HISTORY.map((msg) => (
                                <div key={msg.id} className={`d-flex ${msg.isUser ? 'justify-content-start' : 'justify-content-end'}`}>
                                    <div
                                        className={`p-3 rounded-3 shadow-sm ${msg.isUser ? 'bg-white text-dark rounded-bottom-left-0' : 'bg-primary text-white rounded-bottom-right-0'}`}
                                        style={{ maxWidth: '70%' }}
                                    >
                                        <p className="mb-1">{msg.text}</p>
                                        <div className={`small text-end ${msg.isUser ? 'text-muted' : 'text-white-50'}`} style={{ fontSize: '0.7rem' }}>{msg.time}</div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>

                        {/* Input Area */}
                        <Card.Footer className="bg-white border-top p-3">
                            <div className="d-flex align-items-center gap-2">
                                <Button variant="light" className="text-muted rounded-circle p-2"><Paperclip size={20} /></Button>
                                <Button variant="light" className="text-muted rounded-circle p-2"><Smile size={20} /></Button>
                                <Form.Control
                                    type="text"
                                    placeholder="Type a message..."
                                    className="border-0 bg-light rounded-pill px-4 py-2 shadow-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button variant="primary" className="rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={handleSendMessage}>
                                    <Send size={20} />
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LiveChat;
