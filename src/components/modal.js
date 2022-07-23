import React from 'react';
import ReactModal from 'react-modal';

function Modal(props) {
  const {
    isOpen, onRequestClose, title, children,
  } = props;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(false)}
      style={{
        content: {
          top: '40%',
          left: '50%',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          height: '400px',
          width: '600px',
        },
      }}
      contentLabel={title}
    >
      <h3 className="subtitle">{title}</h3>

      <hr />

      <div className="modal-body">
        {children}
      </div>

      <button
        type="button"
        className="modal-close"
        aria-label="close"
        onClick={() => onRequestClose(false)}
      />
    </ReactModal>
  );
}

export default Modal;
