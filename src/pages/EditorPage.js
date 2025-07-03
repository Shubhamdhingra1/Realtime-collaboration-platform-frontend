import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Container, Card, Badge, Row, Col, Form, Alert } from 'react-bootstrap';
import VersionHistory from '../components/VersionHistory';

const socket = io('http://localhost:5000');

function getColorForUser(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

export default function EditorPage() {
  const { id } = useParams();
  const username = localStorage.getItem('username') || 'Anonymous';
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [inviteUser, setInviteUser] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/documents/${id}`).then(res => {
      setContent(res.data.content);
      setTitle(res.data.title);
      setIsOwner(res.data.ownerUsername === username);
      setCollaborators(res.data.collaboratorsUsernames || []);
    }).catch(() => setError('Failed to load document'));

    API.get(`/documents/${id}/versions`).then(res => setVersions(res.data));
    socket.emit('join-document', { docId: id, username });

    socket.on('document', data => setContent(data));
    socket.on('receive-changes', data => setContent(data));
    socket.on('user-joined', name => setCollaborators(prev => prev.includes(name) ? prev : [...prev, name]));
    socket.on('user-left', name => setCollaborators(prev => prev.filter(n => n !== name)));

    return () => {
      socket.off('document');
      socket.off('receive-changes');
      socket.off('user-joined');
      socket.off('user-left');
    };
    // eslint-disable-next-line
  }, [id]);

  const handleChange = value => {
    setContent(value);
    socket.emit('send-changes', value);
  };

  const save = async () => {
    await API.put(`/documents/${id}`, { content });
    API.get(`/documents/${id}/versions`).then(res => setVersions(res.data));
    alert('Saved!');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/documents/${id}/invite`, { username: inviteUser });
      setInviteMsg(res.data.msg);
      setInviteUser('');
      setCollaborators(prev => prev.includes(inviteUser) ? prev : [...prev, inviteUser]);
    } catch (err) {
      setInviteMsg(err.response?.data?.msg || 'Error');
    }
  };

  const revert = async (versionId) => {
    await API.post(`/documents/${id}/revert`, { versionId });
    API.get(`/documents/${id}`).then(res => setContent(res.data.content));
    API.get(`/documents/${id}/versions`).then(res => setVersions(res.data));
    setShowHistory(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#181c20' }}>
      {/* Topbar */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand mb-0 h1">ReplitCollab</span>
        <span className="text-light">Logged in as <b>{username}</b></span>
      </nav>

      <Container fluid className="py-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Row>
          {/* Sidebar */}
          <Col md={3} className="mb-3">
            <Card bg="dark" text="light" className="mb-3">
              <Card.Body>
                <Card.Title>Collaborators</Card.Title>
                <div className="mb-2">
                  {collaborators.map(name => (
                    <Badge
                      key={name}
                      style={{
                        background: getColorForUser(name),
                        color: '#222',
                        marginRight: 6,
                        fontSize: 16,
                        padding: '0.5em 0.8em'
                      }}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
                {isOwner && (
                  <Form onSubmit={handleInvite} className="d-flex">
                    <Form.Control
                      value={inviteUser}
                      onChange={e => setInviteUser(e.target.value)}
                      placeholder="Invite by username"
                      className="mr-2"
                      required
                    />
                    <Button type="submit" variant="primary">Invite</Button>
                  </Form>
                )}
                {inviteMsg && <div className="mt-2 text-info">{inviteMsg}</div>}
              </Card.Body>
            </Card>
            <Card bg="dark" text="light">
              <Card.Body>
                <Card.Title>Document</Card.Title>
                <div>
                  <b>Title:</b> {title}
                </div>
                <div>
                  <b>Owner:</b> {isOwner ? 'You' : ''}
                </div>
                <Button
                  variant="info"
                  className="mt-3"
                  onClick={() => setShowHistory(true)}
                  block
                >
                  Version History
                </Button>
                <Button
                  variant="secondary"
                  className="mt-2"
                  href="/"
                  block
                >
                  Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Editor */}
          <Col md={9}>
            <Card
              style={{
                minHeight: '80vh',
                background: '#23272e',
                border: 'none',
                boxShadow: '0 0 24px #0008'
              }}
            >
              <Card.Body>
                <ReactQuill
                  value={content}
                  onChange={handleChange}
                  style={{
                    height: '65vh',
                    background: '#181c20',
                    color: '#fff',
                    borderRadius: '8px'
                  }}
                  theme="snow"
                />
                <div className="mt-4 d-flex">
                  <Button variant="success" onClick={save}>Save</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <VersionHistory
          show={showHistory}
          onHide={() => setShowHistory(false)}
          versions={versions}
          onRevert={revert}
        />
      </Container>
    </div>
  );
}