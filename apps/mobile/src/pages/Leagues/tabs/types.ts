export interface IRefreshableTabHandle {
  refresh: () => Promise<unknown>;
}
