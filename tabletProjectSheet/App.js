import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/splashscreen';
import LoginScreen from './src/screens/login';
import drawer from './src/navigation/drawer';
import dashboard from './src/screens/dashboard/index';
import buatchecksheet from './src/screens/checksheet/checksheettipe';
import checksheettungguttd from './src/screens/checksheet/checksheettungguttd';
import ChecksheetTerbaru from './src/components/ListingChecksheet';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="drawer" component={drawer} options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" component={dashboard} options={{ headerShown: false }} />
        <Stack.Screen name="buatchecksheet" component={buatchecksheet} options={{ headerShown: false }} />
        <Stack.Screen name="checksheettungguttd" component={checksheettungguttd} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
