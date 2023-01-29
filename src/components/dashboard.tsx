import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import WidgetView from './widget-view';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard(props) {
  const {
    config, isEditable = false, onLayoutChange, onRemoveWidgetClick,
  } = props;

  const { widgets } = config;

  return (
    <div className="dashboard">

      <ResponsiveGridLayout
        className="layout"
        rowHeight={100}
        width={1400}
        margin={[20, 20]}
        style={{ margin: '-20px', marginBottom: '1rem' }}
        breakpoints={{
          lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
        }}
        cols={{
          lg: 8, md: 8, sm: 4, xs: 4, xxs: 1,
        }}
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
            <WidgetView id={widget.cid} title={widget.title} definition={widget.widget} enableFork={!isEditable} />

            {isEditable && (
              <button type="button" className="new-dashboard-widget-delete" onClick={() => onRemoveWidgetClick(widget)}>
                +
              </button>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

    </div>
  );
}
