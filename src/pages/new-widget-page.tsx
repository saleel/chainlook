import React from 'react';
import { useNavigate } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import { newWidget } from '../data/api';
import WidgetEditor from '../components/widget-editor';

const defaultDefinition = {
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

  const [widgetTitle, setWidgetTitle] = React.useState('');
  const [widgetTags, setWidgetTags] = React.useState([]);
  const [widgetDefinition, setWidgetDefinition] = React.useState(defaultDefinition);

  React.useEffect(() => {
    document.title = 'New Widget - ChainLook';
  }, []);

  async function onSaveClick(e) {
    e.target.disabled = true;

    try {
      const created = await newWidget({ title: widgetTitle, tags: widgetTags.split(',').filter(Boolean), definition: widgetDefinition });
      navigate(`/widget/${created.id}`);
    } finally {
      e.target.disabled = false;
    }
  }

  return (
    <div className="page create-widget-page">
      <h2 className="section-title">
        Create new widget
      </h2>

      <div className="create-widget-container">
        <div className="create-widget-section">
          <WidgetEditor onChange={setWidgetDefinition} definition={widgetDefinition} />

          <div className="create-widget-helper">
            <form>
              <div className="field">
                <label className="label">Title</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter widget title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Tags</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter tags separated by comma"
                  value={widgetTags}
                  onChange={(e) => setWidgetTags(e.target.value)}
                />
              </div>
              <hr />
              <button type="button" onClick={onSaveClick} className="button">
                Save
              </button>
            </form>
          </div>
        </div>

        <hr />

        <div className="create-widget-preview">
          <div className="section-title">
            Preview
          </div>

          <WidgetView title={widgetTitle} definition={widgetDefinition} />
        </div>

      </div>
    </div>
  );
}

export default NewWidgetPage;
