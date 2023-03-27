export interface SnackbarQueryModel {
  snackbar: SnackbarModel;
  timeout?: number;
}

export interface SnackbarModel {
  type?: SnackbarType;
  text: string;
  action?: {onPress?: () => void; text: string};
}

export enum SnackbarType {
  DEFAULT_ERROR = 'DEFAULT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
