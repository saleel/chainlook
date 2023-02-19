import { ReactNode } from 'react';
import ReactModal from 'react-modal';

type ModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  children: ReactNode;
  height?: string | number;
  width?: string | number;
};

function Modal(props: ModalProps) {
  const { isOpen, onRequestClose, title, children, height, width } = props;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose()}
      style={{
        content: {
          top: '40%',
          left: '50%',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          height: height || '400px',
          width: width || '600px',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      contentLabel={title}
    >
      <h3 className='subtitle mb-0'>{title}</h3>

      <hr className='mt-4' />

      <div className='modal-body' style={{ flexGrow: 1 }}>
        {children}
      </div>

      <button
        type='button'
        className='modal-close'
        aria-label='close'
        onClick={() => onRequestClose()}
      />
    </ReactModal>
  );
}

export default Modal;
