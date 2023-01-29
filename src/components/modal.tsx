import { ReactNode } from "react";
import ReactModal from "react-modal";

type ModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  children: ReactNode;
  height?: string | number;
};

function Modal(props: ModalProps) {
  const { isOpen, onRequestClose, title, children, height } = props;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose()}
      style={{
        content: {
          top: "40%",
          left: "50%",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          height: height || "400px",
          width: "600px",
        },
      }}
      contentLabel={title}
    >
      <h3 className="subtitle">{title}</h3>

      <hr />

      <div className="modal-body">{children}</div>

      <button
        type="button"
        className="modal-close"
        aria-label="close"
        onClick={() => onRequestClose()}
      />
    </ReactModal>
  );
}

export default Modal;
