declare module 'expo-camera' {
  import * as React from 'react';
  export class Camera extends React.Component<any> {}
  export const requestCameraPermissionsAsync: () => Promise<any>;
  export const getCameraPermissionsAsync: () => Promise<any>;
} 