import {AxiosError} from 'axios';

export class AxiosErrorEventHandler {
  private static listeners: Array<(error: any) => void> = [];

  static addListener(listener: (error: AxiosError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners.filter(l => l !== listener);
    };
  }

  static $emit(error: AxiosError) {
    console.log(error);
    this.listeners.forEach(listener => {
      listener(error);
    });
  }
}
