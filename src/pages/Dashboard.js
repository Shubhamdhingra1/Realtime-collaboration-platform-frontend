import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Form, Card, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/documents')
      .then(res => setDocs(res.data))
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  const createDoc = async e => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await API.post('/documents', { title });
      setDocs([res.data, ...docs]);
      setTitle('');
    } catch {
      setError('Failed to create document');
    }
  };

  const deleteDoc = async id => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await API.delete(`/documents/${id}`);
      setDocs(docs.filter(doc => doc._id !== id));
    } catch {
      setError('Failed to delete document');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #23272e 0%, #181c20 100%)',
      paddingTop: 0
    }}>
      <Container className="py-5">
        <Card className="mb-4 shadow-lg" style={{ background: '#23272e', color: '#fff', border: 'none' }}>
          <Card.Body>
            <h1 className="display-4 mb-3" style={{ fontWeight: 700, letterSpacing: 1 }}>Your Documents</h1>
            <p className="lead mb-4" style={{ color: '#aaa' }}>
              Create, edit, and collaborate in real time. Click <b>Edit</b> to start collaborating!
            </p>
            <Form onSubmit={createDoc} className="mb-3">
              <InputGroup>
                <Form.Control
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="New Document Title"
                  className="mr-2"
                  style={{ background: '#181c20', color: '#fff', border: '1px solid #444' }}
                />
                <Button type="submit" variant="success">Create</Button>
              </InputGroup>
            </Form>
            {error && <Alert variant="danger">{error}</Alert>}
          </Card.Body>
        </Card>
        <Row>
          {docs.length === 0 && !loading && (
            <Col>
              <Card className="text-center" style={{ background: '#181c20', color: '#aaa', border: 'none' }}>
                <Card.Body>
                  <h4>No documents yet. Create your first one!</h4>
                </Card.Body>
              </Card>
            </Col>
          )}
          {docs.map(doc => (
            <Col key={doc._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100 shadow" style={{ background: '#23272e', color: '#fff', border: 'none' }}>
                <Card.Body>
                  <Card.Title style={{ fontWeight: 600, fontSize: '1.2rem' }}>{doc.title}</Card.Title>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/doc/${doc._id}`)}
                      title="Edit"
                    >
                      <FaEdit className="mb-1" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteDoc(doc._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}