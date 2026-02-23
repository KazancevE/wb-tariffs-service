declare module 'googleapis' {
  const google: {
    auth: {
      GoogleAuth: new () => any;
    };
    sheets: (options: { version: string; auth: any }) => any;
  };
  export = google;
}
