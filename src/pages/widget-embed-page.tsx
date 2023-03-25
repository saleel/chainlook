import { useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import API from '../data/api';
import usePromise from '../hooks/use-promise';

function WidgetEmbedPage() {
  const { widgetId } = useParams();

  const [widget, { isFetching, error }] = usePromise(() => API.getWidget(widgetId as string), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  if (isFetching) {
    return <div className='widget p-4'>Loading</div>;
  }

  if (error) {
    return <div className='widget p-4'>{error.message}</div>;
  }

  return <WidgetView widget={widget} showActions={false} />;
}

export default WidgetEmbedPage;
