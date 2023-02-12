import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';
import TextView from './text-view';
import WidgetView from './widget-view';

const ResponsiveGridLayout = WidthProvider(Responsive);

type Props = {
  dashboard: Dashboard;
  isEditable?: boolean;
  onLayoutChange?: (layouts: any) => void;
  onRemoveWidgetClick?: (widget: any) => void;
}

export default function DashboardView(props: Props) {
  const {
    dashboard, isEditable = false, onLayoutChange, onRemoveWidgetClick,
  } = props;

  const { elements = [] } = dashboard.definition;

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
        draggableHandle=".widget-header"
        {...onLayoutChange && { onLayoutChange }}
        onDragStart={(e) => e.dataTransfer?.setData('text/plain', '')}
      >
        {elements.map((element, index) => (
          <div key={index} data-grid={{ ...element.layout }}>

            {element.widget && (
              <WidgetView widget={element.widget as Widget} />
            )}

            {element.text && (
              <TextView text={element.text} />
            )}

            {isEditable && (
              <button type="button" className="new-dashboard-widget-delete" onClick={() => onRemoveWidgetClick?.(element)}>
                +
              </button>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

    </div>
  );
}
