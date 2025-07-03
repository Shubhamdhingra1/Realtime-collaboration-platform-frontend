import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

export default function DocumentList({ docs, onOpen, onDelete }) {
  return (
    <ListGroup>
      {docs.map(doc => (
        <ListGroup.Item key={doc._id} className="d-flex justify-content-between align-items-center">
          <span style={{ cursor: 'pointer' }} onClick={() => onOpen(doc._id)}>
            {doc.title}
          </span>
          <Button variant="danger" size="sm" onClick={() => onDelete(doc._id)}>Delete</Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}