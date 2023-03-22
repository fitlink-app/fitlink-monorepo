class AuthPromise {
  private promise: Promise<void> | undefined;
  private resolver: (() => void) | undefined;

  init() {
    this.promise = new Promise<void>(resolve => {
      this.resolver = resolve;
    });
  }

  get() {
    return this.promise;
  }

  resolve() {
    this.resolver?.();
  }
}

export const AuthPromiseProvider = (() => {
  let instance: AuthPromise;

  const getInstance = () => {
    if (instance) {
      return instance;
    }
    instance = new AuthPromise();
    return instance;
  };

  return {getInstance};
})();
