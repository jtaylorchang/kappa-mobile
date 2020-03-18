import React from 'react';

import { NavigationTypes } from '@types';
import Content from '@screens/content/LoginContent';

const LoginScreen: React.FC<{
  navigation: NavigationTypes.ParamType;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default LoginScreen;
