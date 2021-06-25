export type RootStackParamList = {
  AuthenticationNavigator: undefined;
  HomeNavigator: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: {email?: string};
  Settings: undefined;
  UpdateEmail: undefined;
  UpdatePassword: undefined;
  Webview: {url: string; title: string};
  Friends: {tab: number};
};
