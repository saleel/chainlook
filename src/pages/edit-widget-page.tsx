import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import API from '../data/api';
import usePromise from '../hooks/use-promise';
import WidgetEditor from '../components/widget-editor';
import Widget from '../domain/widget';
import { AuthContext } from '../context/auth-context';

function EditWidgetPage() {
  const { widgetId } = useParams();

  const navigate = useNavigate();

  const [editingWidget, setEditingWidget] = React.useState<Widget>();

  const { user } = React.useContext(AuthContext);

  const [widget, { isFetching, error }] = usePromise<Widget>(
    () => API.getWidget(widgetId as string),
    {
      dependencies: [widgetId],
      conditions: [widgetId],
    },
  );

  React.useEffect(() => {
    if (!widget) return;

    setEditingWidget(widget);
    document.title = `Edit ${widget.title} - ChainLook`;
  }, [widget]);

  function updateWidget(key: string, value: string | object) {
    setEditingWidget((existing) => ({ ...(existing as Widget), [key]: value }));
  }

  async function onSaveClick(e: any) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await API.editWidget(editingWidget as Widget);
      navigate(`/widgets/${widgetId}`);
    } finally {
      submitButton.disabled = false;
    }
  }

  if (isFetching || !editingWidget) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const { definition, title, tags } = editingWidget;

  const isWidgetOwner = widget.user.id === user?.id;

  if (!isWidgetOwner) {
    return <div className='message text-center'>You are not allowed to edit this widget.</div>;
  }

  return (
    <div className='page create-widget-page'>
      <h2 className='section-title'>Create new widget</h2>

      <div className='create-widget-container'>
        <div className='create-widget-section'>
          <WidgetEditor onChange={(d) => updateWidget('definition', d)} definition={definition} />

          <form className='create-widget-helper' onSubmit={onSaveClick}>
            <div className='field'>
              <label className='label'>Title</label>
              <div className='control'>
                <input
                  type='text'
                  className='input'
                  placeholder='Enter widget title'
                  required
                  value={title}
                  onChange={(e) => updateWidget('title', e.target.value)}
                />
              </div>
            </div>
            <div className='field'>
              <label className='label'>Tags</label>
              <input
                type='text'
                className='input'
                placeholder='Enter tags separated by comma'
                value={tags}
                onChange={(e) => updateWidget('tags', e.target.value.split(','))}
              />
            </div>
            <hr />
            <button type='submit' className='button'>
              Publish
            </button>
          </form>
        </div>

        <hr />

        <div className='create-widget-preview'>
          <div className='section-title'>Preview</div>
          <WidgetView widget={editingWidget} />
        </div>
      </div>
    </div>
  );
}

export default EditWidgetPage;
