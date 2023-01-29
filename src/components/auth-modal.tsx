import { Link } from 'react-router-dom';
import Modal from './modal';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function AuthModal(props : { isOpen: boolean, onRequestClose: () => void }) {
  return (
    <Modal {...props} title="Sign in">
      
      <div>
        Sign in
        <ConnectButton />
      </div>

    </Modal>
  );
}
