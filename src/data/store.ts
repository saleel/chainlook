import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';

const adapter = new LokiIndexedAdapter();
let dbReady = false;

const db = new Loki('chainlook.db', {
  adapter,
  autoload: true,
  autosave: true,
  autosaveInterval: 1000,
  autoloadCallback: (err) => {
    if (!err) {
      dbReady = true;
    }
  },
});

async function getLocalDbCollection(collectionName) {
  if (!dbReady) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (dbReady) {
          resolve();
          clearInterval(interval);
        }
      });
    });
  }

  let collection = db.getCollection(collectionName);

  if (collection === null) {
    db.addCollection(collectionName);
    collection = db.getCollection(collectionName);
  }

  return collection;
}

export async function saveWidgetLocally(widgetConfig) {
  const widgetsDb = await getLocalDbCollection('widgets');

  // Remove existing one - TODO: improve the logic
  widgetsDb.findAndRemove({ title: widgetConfig.title, type: widgetConfig.type });

  widgetsDb.insert({ ...widgetConfig, createdAt: new Date().getTime() });
}

export async function getAllWidgets() {
  const widgetsDb = await getLocalDbCollection('widgets');

  return widgetsDb.find({}).map((w) => ({
    ...w,
    createdAt: undefined,
    $loki: undefined,
    meta: undefined,
  }));
}

export async function removeLocalDashboards() {
  const dashboardDb = await getLocalDbCollection('dashboard');

  dashboardDb.findAndRemove({}); // clear everything - using as singleton
}

export async function saveDashboardLocally(dashboardConfig) {
  await removeLocalDashboards(); // clear everything - using as singleton

  const dashboardDb = await getLocalDbCollection('dashboard');
  dashboardDb.insert({ ...dashboardConfig, createdAt: new Date().getTime() });
}

export async function getLocalDashboard() {
  const dashboardDb = await getLocalDbCollection('dashboard');
  const firstItem = dashboardDb.find({})?.map((w) => ({
    ...w,
    createdAt: undefined,
    $loki: undefined,
    meta: undefined,
  }))?.[0];

  if (!firstItem) {
    return null;
  }

  return firstItem;
}
