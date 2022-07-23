import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import Widget from './widget';

export default function Dashboard(props) {
  const {
    config, isEditable = false, onLayoutChange, onRemoveWidgetClick,
  } = props;

  const { widgets } = config;

  return (
    <div className="dashboard">

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
        draggableHandle=".widget-title"
        {...onLayoutChange && { onLayoutChange }}
        onDragStart={(e) => e.dataTransfer?.setData('text/plain', '')}
      >
        {widgets.map((widget, index) => (
          <div key={widget.id || index} data-grid={{ ...widget.layout }}>
            <Widget id={widget.cid} config={widget.widget} />

            {isEditable && (
              <button type="button" className="new-dashboard-widget-delete" onClick={() => onRemoveWidgetClick(widget)}>
                +
              </button>
            )}
          </div>
        ))}
      </ReactGridLayout>

    </div>
  );
}
