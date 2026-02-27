// types/expo-file-system.d.ts

declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export const bundleDirectory: string | null;

  export enum EncodingType {
    UTF8 = "utf8",
    Base64 = "base64",
  }

  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: {
      encoding?: EncodingType;
    },
  ): Promise<void>;

  export function readAsStringAsync(
    fileUri: string,
    options?: {
      encoding?: EncodingType;
    },
  ): Promise<string>;

  export function deleteAsync(
    fileUri: string,
    options?: {
      idempotent?: boolean;
    },
  ): Promise<void>;

  export function getInfoAsync(
    fileUri: string,
    options?: {
      md5?: boolean;
      size?: boolean;
    },
  ): Promise<{
    exists: boolean;
    uri: string;
    size?: number;
    modificationTime?: number;
    md5?: string;
  }>;

  export function makeDirectoryAsync(
    fileUri: string,
    options?: {
      intermediates?: boolean;
    },
  ): Promise<void>;

  export function readDirectoryAsync(fileUri: string): Promise<string[]>;

  export function moveAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;

  export function copyAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;

  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: {
      md5?: boolean;
    },
  ): Promise<{
    uri: string;
    status: number;
    headers: { [key: string]: string };
    md5?: string;
  }>;

  export function createDownloadResumable(
    uri: string,
    fileUri: string,
    options?: {
      md5?: boolean;
      headers?: { [key: string]: string };
    },
    callback?: (data: {
      totalBytesWritten: number;
      totalBytesExpectedToWrite: number;
    }) => void,
    resumeData?: string,
  ): {
    downloadAsync: () => Promise<{
      uri: string;
      status: number;
      headers: { [key: string]: string };
      md5?: string;
    }>;
    pauseAsync: () => Promise<{ uri: string; resumeData: string }>;
    resumeAsync: () => Promise<{
      uri: string;
      status: number;
      headers: { [key: string]: string };
      md5?: string;
    }>;
    savable: () => { uri: string; resumeData: string };
  };

  export const StorageAccessFramework: {
    getUriForDirectoryInRoot: (directoryName: string) => string;
    readDirectoryAsync: (directoryUri: string) => Promise<string[]>;
    makeDirectoryAsync: (
      parentUri: string,
      directoryName: string,
    ) => Promise<string>;
    createFileAsync: (
      parentUri: string,
      fileName: string,
      mimeType: string,
    ) => Promise<string>;
    writeAsStringAsync: (
      fileUri: string,
      contents: string,
      options?: { encoding?: EncodingType },
    ) => Promise<void>;
    readAsStringAsync: (
      fileUri: string,
      options?: { encoding?: EncodingType },
    ) => Promise<string>;
    deleteAsync: (fileUri: string) => Promise<void>;
    moveAsync: (options: { from: string; to: string }) => Promise<void>;
    copyAsync: (options: { from: string; to: string }) => Promise<void>;
  };
}

declare module "expo-sharing" {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(
    url: string,
    options?: {
      mimeType?: string;
      dialogTitle?: string;
      UTI?: string;
    },
  ): Promise<void>;
}
