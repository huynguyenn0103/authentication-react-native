import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import IconButton from './components/ui/IconButton';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { Colors } from './constants/styles';
import AuthContextProvider, { AuthContext } from './store/auth-context';
import { useContext , useEffect, useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
const Stack = createNativeStackNavigator();
let logoutTimer = null
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: 'white',
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext)
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: 'white',
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{
        headerRight: ({tintColor}) => <IconButton icon="exit" color={tintColor} size={24} onPress={() => {
          authCtx.logout(logoutTimer)
        }}/>
      }}/>
    </Stack.Navigator>
  );
}

function Navigation({onReady}) {
  const authCtx = useContext(AuthContext)
  return (
      <NavigationContainer onReady={onReady}>
        {!authCtx.isAuthenticated && <AuthStack />}
        {authCtx.isAuthenticated && <AuthenticatedStack/>}
      </NavigationContainer>
  );
}
function Root () {
  const [isTryingLogin, setIsTryingLogin] = useState(true)
  const authCtx = useContext(AuthContext);
    useEffect(() => {
      const fetchToken = async () => {
          await SplashScreen.preventAutoHideAsync();
          const storedToken = await AsyncStorage.getItem('token')
          const expiredTime = await AsyncStorage.getItem('expiredTime')
          if(storedToken) {
              authCtx.authenticate(storedToken, expiredTime, true)
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
          setIsTryingLogin(false)
      }
      fetchToken()
      
  },[])
  const onLayoutRootView = useCallback(async () => {
    if (!isTryingLogin) {
      await SplashScreen.hideAsync();
    }
  }, [isTryingLogin]);
  if(isTryingLogin) return null
  return <Navigation onReady={onLayoutRootView}/>
}
export default function App() {

  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root/>
      </AuthContextProvider>
    </>
  );
}
// npm install @react-native-async-storage/async-storage
// expo install expo-app-loading
