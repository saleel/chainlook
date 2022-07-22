import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import Widget from './widget';

export default function Dashboard(props) {
  const { config, isEditable = false, onLayoutChange } = props;

  const { widgets, title } = config;

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
        preventCollision
        resizeHandles={['se']}
        {...onLayoutChange && { onLayoutChange }}
      >
        {widgets.map((widget, index) => (
          <div key={widget.id || index} data-grid={{ ...widget.layout }}>
            <Widget id={widget.cid} config={widget.widget} />
          </div>
        ))}
      </ReactGridLayout>

    </div>
  );
}
