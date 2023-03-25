import { IoLogoTwitter } from 'react-icons/io5';
import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';
import Modal from './modal';

type Props = {
  type: string;
  url: string;
  title: string;
  onRequestClose: () => void;
  isOpen: boolean;
};

function ShareModal(props: Props) {
  const { url, type, title, onRequestClose, isOpen } = props;

  return (
    <Modal
      title={`Share ${type}`}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      width='550px'
      height={type === 'widget' ? '400px' : '250px'}
    >
      <div className='share-modal'>
        <p className='mb-5'>Share this {type} using the link below.</p>
        <div className='field mb-4'>
          <div className='control'>
            <input
              className='form-input'
              type='text'
              value={url}
              readOnly
              onClick={(e) => {
                e.currentTarget.select();
              }}
            />
          </div>
        </div>

        <div className='is-flex'>
          <button
            className='button is-normal mr-3'
            onClick={(e) => {
              navigator.clipboard.writeText(url);
              e.currentTarget.textContent = 'Copied ✔';
            }}
          >
            Copy link
          </button>

          <a
            href={encodeURI(
              `https://twitter.com/intent/tweet?url=${url}&text=${title} ${type} @chainlook_xyz\n\n`,
            )}
            target='_blank'
            rel='noopener noreferrer'
            className='button is-normal'
          >
            <IoLogoTwitter size={24} />
          </a>
        </div>

        {type === 'widget' && (
          <>
            <hr />
            <div>
              Embed this widget on your website using the code below.
              <div className='field mt-4'>
                <div className='control'>
                  <textarea
                    className='form-input'
                    rows={3}
                    value={`<iframe src="${url}/embed" width="100%" height="600px" frameborder="0" />`}
                    readOnly
                    onClick={(e) => {
                      e.currentTarget.select();
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ShareModal;
