import {SnackbarModel, SnackbarQueryModel} from './types';
import {isSameSnackbar} from './utils';

export class SnackbarQueryController {
  private timer: NodeJS.Timeout | undefined;
  private showSnackbar;
  private hideSnackbar;
  private query: SnackbarQueryModel[] = [];
  private currentSnackbar: SnackbarQueryModel | undefined;

  constructor(
    showSnackbar: (model: SnackbarModel) => void,
    hideSnackbar: () => void,
  ) {
    this.showSnackbar = showSnackbar;
    this.hideSnackbar = hideSnackbar;
    this.show = this.show.bind(this);
    this.enqueue = this.enqueue.bind(this);
    this.removeSnackbarFromQuery = this.removeSnackbarFromQuery.bind(this);
    this.hideSnackbar = hideSnackbar;
  }

  private showSnackbarWithActionCheck(model: SnackbarQueryModel) {
    if (model.snackbar.action) {
      this.showSnackbar({
        ...model.snackbar,
        action: {
          ...model.snackbar.action,
          onPress: () => {
            model.snackbar.action?.onPress?.();
            this.removeSnackbarFromQuery(model);
          },
        },
      });
      return;
    }
    this.showSnackbar(model.snackbar);
  }

  private unshiftSnackbar(model: SnackbarQueryModel) {
    this.query.unshift(model);
  }

  private pushSnackbar(model: SnackbarQueryModel) {
    this.query.push(model);
  }

  public removeSnackbarFromQuery(model: SnackbarQueryModel) {
    this.query = this.query.filter(queryModel => queryModel !== model);
    this.showSnackbarFromQuery();
  }

  private showSnackbarFromQuery() {
    if (!this.query[0]) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.hideSnackbar();
      this.currentSnackbar = undefined;
      return;
    }
    if (this.currentSnackbar !== this.query[0]) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.currentSnackbar = this.query[0];
      this.showSnackbarWithActionCheck(this.currentSnackbar);
      if (this.currentSnackbar.timeout) {
        this.timer = setTimeout(() => {
          if (this.currentSnackbar) {
            this.removeSnackbarFromQuery(this.currentSnackbar);
          }
        }, this.currentSnackbar.timeout);
      }
    }
  }

  public show(model: SnackbarQueryModel, withDuplicate = false) {
    console.log('showSnackbar');
    if (withDuplicate) {
      this.unshiftSnackbar(model);
      this.showSnackbarFromQuery();
      return;
    }
    if (
      this.currentSnackbar &&
      isSameSnackbar(model.snackbar, this.currentSnackbar.snackbar)
    ) {
      console.log('showSnackbarDuplicate');
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (model.timeout) {
        this.timer = setTimeout(() => {
          if (this.currentSnackbar) {
            this.removeSnackbarFromQuery(this.currentSnackbar);
          }
        }, model.timeout);
      }
      return;
    }
    this.unshiftSnackbar(model);
    this.showSnackbarFromQuery();
  }

  public enqueue(model: SnackbarQueryModel, withDuplicate = false) {
    if (
      !withDuplicate &&
      isSameSnackbar(
        model.snackbar,
        this.query[this.query.length - 1]?.snackbar,
      )
    ) {
      this.pushSnackbar(model);
      this.showSnackbarFromQuery();
      return;
    }
    this.pushSnackbar(model);
    this.showSnackbarFromQuery();
  }
}
