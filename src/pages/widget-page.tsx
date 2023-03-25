import React from 'react';
import { IoCalendarClearOutline, IoPerson } from 'react-icons/io5';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ShareModal from '../components/share-modal';
import WidgetView from '../components/widget-view';
import { AuthContext } from '../context/auth-context';
import API from '../data/api';
import Store from '../data/store';
import usePromise from '../hooks/use-promise';
import { formatDate } from '../utils/time';

function WidgetPage() {
  const { widgetId } = useParams();
  const navigate = useNavigate();

  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const { user } = React.useContext(AuthContext);

  const [widget, { isFetching, error }] = usePromise(() => API.getWidget(widgetId as string), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  React.useEffect(() => {
    if (widget) {
      document.title = `${widget.title} - ChainLook`;
    }
  }, [widget]);

  function onForkClick() {
    if (Store.getWidgetDraft()) {
      if (
        !confirm(
          'You already have an unsaved widget that is being edited. Forking this will discard your changes. Would you like to continue?',
        )
      ) {
        return;
      }
    }

    Store.saveWidgetDraft({
      ...widget,
      forkId: widget.id,
      forkVersion: widget.version,
      id: '',
      user: { id: '', address: '' },
    });

    navigate('/widgets/new');
  }

  const isWidgetOwner = user?.id === widget?.user?.id;

  if (isFetching) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className='page widget-page'>
      <div className='dashboard-header'>
        <div className='dashboard-title'>
          <h2>{widget?.title}</h2>

          <div className='dashboard-info mt-1'>
            {widget.user && (
              <Link to={`/users/${widget.user.username}`} className='tag mr-2'>
                <span className='tag mr-2'>
                  <IoPerson size={10} />
                  <span className='ml-3'>{widget.user?.username}</span>
                </span>
              </Link>
            )}

            {widget.createdOn && (
              <span
                className='tag mr-2'
                data-tooltip={`This widget was created on ${formatDate(
                  widget.createdOn,
                )} and was last updated on ${formatDate(widget.updatedOn)}`}
              >
                <IoCalendarClearOutline size={10} />
                <span className='ml-3'>{formatDate(widget.createdOn)}</span>
              </span>
            )}

            {widget.tags?.map((tag: string) => (
              <span key={tag} className='tag mr-2'>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className='widget-actions'>
          <div className='flex-row'>
            <button
              role='button'
              tabIndex={0}
              className='button is-normal'
              onClick={onForkClick}
              title='Make a copy of this widget and edit'
            >
              Fork
            </button>

            <button
              role='button'
              tabIndex={0}
              className='button is-normal'
              onClick={() => setIsShareModalOpen(true)}
            >
              Share
            </button>

            {isWidgetOwner && (
              <Link
                className='button is-normal'
                to={`/widgets/${widget.id}/edit`}
                title='Edit the widget'
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      <WidgetView widget={widget} showActions={true} />

      <ShareModal
        isOpen={isShareModalOpen}
        onRequestClose={() => setIsShareModalOpen(false)}
        type='widget'
        title={widget?.title}
        url={`https://chainlook.xyz/#/widgets/${widget?.id}`}
      />
    </div>
  );
}

export default WidgetPage;
