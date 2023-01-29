import React from 'react';
import { useNavigate } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import API from '../data/api';
import WidgetEditor from '../components/widget-editor';
import Widget from '../domain/widget';

const DEFAULT_DEFINITION = {
  type: 'table',
  data: {
    source: {
      provider: 'graph',
      subgraphId: 'messari/uniswap-v3-ethereum',
      entity: 'financialsDailySnapshots',
    },
  },
  table: {
    columns: [
      {
        dataKey: 'timestamp',
        format: 'dateMMMdd',
        label: 'Date',
      },
      {
        dataKey: 'dailyVolumeUSD',
        label: 'Daily Volume (USD)',
        format: 'number',
      },
    ],
  },
};

function NewWidgetPage() {
  const navigate = useNavigate();

  const [widget, setWidget] = React.useState(new Widget({
    title: '',
    tags: [],
    definition: DEFAULT_DEFINITION,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  React.useEffect(() => {
    document.title = 'New Widget - ChainLook';
  }, []);

  function updateWidget(key: string, value: string | object) {
    setWidget(existing => ({ ...existing, [key]: value }));
  }

  async function onSaveClick(e: any) {
    try {
      e.target.disabled = true;
      const created = await API.createWidget(widget);
      navigate(`/widgets/${created.id}`);
    } finally {
      e.target.disabled = false;
    }
  }

  const { definition, title, tags } = widget;

  return (
    <div className="page create-widget-page">
      <h2 className="section-title">
        Create new widget
      </h2>

      <div className="create-widget-container">
        <div className="create-widget-section">
          <WidgetEditor onChange={d => updateWidget('definition', d)} definition={definition} />

          <form className="create-widget-helper">
            <div className="field">
              <label className="label">Title</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter widget title"
                  value={title}
                  onChange={(e) => updateWidget('title', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Tags</label>
              <input
                type="text"
                className="input"
                placeholder="Enter tags separated by comma"
                value={tags}
                onChange={(e) => updateWidget('tags', e.target.value.split(','))}
              />
            </div>
            <hr />
            <button type="button" onClick={onSaveClick} className="button">
              Save
            </button>
          </form>
          
        </div>

        <hr />

        <div className="create-widget-preview">
          <div className="section-title">
            Preview
          </div>

          <WidgetView widget={widget} />
        </div>

      </div>
    </div>
  );
}

export default NewWidgetPage;
