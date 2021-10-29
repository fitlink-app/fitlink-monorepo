import {useState} from 'react';
import CodePush, {DownloadProgress} from 'react-native-code-push';

export function useCodePush() {
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<number>();
  const [progress, setProgress] = useState<DownloadProgress | null>();
  const [progressFraction, setProgressFraction] = useState(0);
  const [isUpToDate, setIsUpToDate] = useState(false);
  const [isError, setIsError] = useState(false);

  function codePushStatusDidChange(syncStatus: CodePush.SyncStatus) {
    setSyncStatus(syncStatus);

    switch (syncStatus) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        setSyncMessage('Checking for updates...');
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        setSyncMessage('Downloading package...');
        break;
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        setSyncMessage('Awaiting user action');
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        setSyncMessage('Installing update...');
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        setSyncMessage('App up to date');
        setProgress(null);
        setIsUpToDate(true);
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        setSyncMessage('Update cancelled by user');
        setProgress(null);
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        setSyncMessage('Update installed and will be applied on restart');
        setProgress(null);
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        setSyncMessage('An unknown error occurred');
        setProgress(null);
        setIsError(true);
        break;
    }
  }

  function codePushDownloadDidProgress(progress: DownloadProgress) {
    setProgress(progress);

    // Calculate progress fraction
    let fraction = 0;

    if (progress.receivedBytes && progress.totalBytes) {
      fraction = progress.receivedBytes / progress.totalBytes;
    }

    setProgressFraction(fraction);
  }

  /** Update pops a confirmation dialog, and then immediately reboots the app */
  async function syncImmediate() {
    try {
      await CodePush.sync(
        {
          installMode: CodePush.InstallMode.IMMEDIATE,
        },
        codePushStatusDidChange,
        codePushDownloadDidProgress,
      );
    } catch (e) {
      codePushStatusDidChange(CodePush.SyncStatus.UNKNOWN_ERROR);
    }
  }

  return {
    progress,
    progressFraction,
    syncStatus,
    syncMessage,
    isUpToDate,
    isError,
    syncImmediate,
  };
}
