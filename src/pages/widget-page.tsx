import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import { AuthContext } from '../context/auth-context';
import API from '../data/api';
import Store from '../data/store';
import usePromise from '../hooks/use-promise';

function WidgetPage() {
  const { widgetId } = useParams();
  const navigate = useNavigate();

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
            {widget.user && <span className='tag mr-2'>👤 {widget.user?.username}</span>}

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

            {isWidgetOwner && (
              <Link className='button is-normal' to={`/widgets/${widget.id}/edit`} title='Edit the widget'>
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      <WidgetView widget={widget} showActions={false} />
    </div>
  );
}

export default WidgetPage;
