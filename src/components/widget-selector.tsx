import API from '../data/api';
import usePromise from '../hooks/use-promise';
import Widget from '../domain/widget';
import React from 'react';
import { AuthContext } from '../context/auth-context';

type WidgetViewProps = {
  onSelect: (w: Widget) => void;
};

function WidgetView(props: WidgetViewProps) {
  const { onSelect } = props;

  const { user } = React.useContext(AuthContext);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [mode, setMode] = React.useState<'users' | 'all'>(user ? 'users' : 'all');

  const [widgetOfUser, { isFetching: isFetchingUsers, fetchedAt }] = usePromise<Widget[]>(
    () => API.getWidgetsByUser(user?.username as string),
    {
      conditions: [user?.id],
      defaultValue: [],
    },
  );

  const [allWidgets, { isFetching: isFetchingAll, reFetch }] = usePromise<Widget[]>(
    () => API.findWidgets(searchTerm),
    {
      conditions: [!!searchTerm],
      defaultValue: [],
    },
  );

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reFetch();
  }

  function renderUsersWidgets() {
    if (!user) {
      return <div>You need to sign in to see your created widgets.</div>;
    }

    if (isFetchingUsers) {
      return <div>Loading...</div>;
    }

    if (widgetOfUser.length === 0) {
      return <div>You have not created any widgets yet.</div>;
    }

    return (
      <div>
        {widgetOfUser.map((widget) => (
          <div
            key={widget.id}
            tabIndex={0}
            role='button'
            className='add-widget-item'
            onClick={() => onSelect(widget)}
          >
            {widget.definition?.type} - {widget.title}
          </div>
        ))}
      </div>
    );
  }

  function renderAllWidgets() {
    if (!searchTerm && !fetchedAt) {
      return (
        <div>
          Input a search term and press <code>Enter</code> to search for widgets.
        </div>
      );
    }

    if (isFetchingAll) {
      return <div>Loading...</div>;
    }

    if (fetchedAt && allWidgets.length === 0) {
      return <div>No widgets found.</div>;
    }

    return (
      <div>
        {allWidgets.map((widget) => (
          <div
            key={widget.id}
            tabIndex={0}
            role='button'
            className='add-widget-item'
            onClick={() => onSelect(widget)}
          >
            {widget.definition?.type} - {widget.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className='tabs'>
        <ul>
          <li className={mode === 'users' ? 'is-active' : ''} onClick={() => setMode('users')}>
            <a>My Widgets</a>
          </li>
          <li className={mode === 'all' ? 'is-active' : ''} onClick={() => setMode('all')}>
            <a>All Widgets</a>
          </li>
        </ul>
      </div>

      {mode === 'users' && renderUsersWidgets()}

      {mode === 'all' && (
        <>
          <form onSubmit={onSearch}>
            <div className='control'>
              <input
                className='input is-normal w-100 mb-4'
                type='text'
                minLength={3}
                required
                placeholder='Search'
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
          </form>
          {renderAllWidgets()}
        </>
      )}
    </div>
  );
}

export default WidgetView;
