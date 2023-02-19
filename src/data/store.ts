import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';

export default class Store {
  static saveWidgetDraft(widget: Widget) {
    window.localStorage.setItem('widgetDraft', JSON.stringify(widget));
  }

  static getWidgetDraft() {
    try {
      const widgetJson = window.localStorage.getItem('widgetDraft');
      return widgetJson ? new Widget(JSON.parse(widgetJson)) : null;
    } catch (error) {
      return null;
    }
  }

  static deleteWidgetDraft() {
    window.localStorage.removeItem('widgetDraft');
  }

  static saveDashboardDraft(dashboard: Dashboard) {
    window.localStorage.setItem('dashboardDraft', JSON.stringify(dashboard));
  }

  static getDashboardDraft() {
    try {
      const dashboardJson = window.localStorage.getItem('dashboardDraft');
      return dashboardJson ? new Dashboard(JSON.parse(dashboardJson)) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  static deleteDashboardDraft() {
    window.localStorage.removeItem('dashboardDraft');
  }

  static setTheGraphAPIKey(key: string) {
    window.localStorage.setItem('theGraphAPIKey', key);
  }

  static getTheGraphAPIKey() {
    return window.localStorage.getItem('theGraphAPIKey');
  }
}
