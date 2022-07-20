import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import Widget from './widget';
import Text from './text';

export default function Dashboard(props) {
  const { config, isEditable = false } = props;

  const { elements, title } = config;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">
        {title}
      </h2>

      <ReactGridLayout
        className="layout"
        rowHeight={100}
        width={1400}
        margin={[20, 20]}
        style={{ margin: '-20px', marginBottom: '1rem' }}
        breakpoints={{
          lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
        }}
        cols={8}
        isDraggable={isEditable}
        isResizable={isEditable}
        compactType={null}
      >
        {elements.map((element, index) => {
          if (element.type === 'widget') {
            return (
              <div key={element.id || index} data-grid={{ ...element.layout }}>
                <Widget id={element.widgetId} config={element.widget} />
              </div>
            );
          }

          if (element.type === 'text') {
            return (
              <div key={element.id || index} data-grid={{ ...element.layout }}>
                <Text config={element.text} />
              </div>
            );
          }

          return null;
        })}
      </ReactGridLayout>
    </div>

  );
}
