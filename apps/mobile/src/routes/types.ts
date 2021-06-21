export type RootStackParamList = {
  AuthenticationNavigator: undefined;
  HomeNavigator: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: {email?: string};
  Settings: undefined;
  Webview: {url: string; title: string};
};
