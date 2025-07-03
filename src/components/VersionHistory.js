import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

export default function VersionHistory({ show, onHide, versions, onRevert }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Version History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {versions.map(v => (
            <ListGroup.Item key={v._id} className="d-flex justify-content-between align-items-center">
              <span>{new Date(v.createdAt).toLocaleString()}</span>
              <Button size="sm" variant="info" onClick={() => onRevert(v._id)}>Revert</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}