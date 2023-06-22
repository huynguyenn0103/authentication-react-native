import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStatusBarBackgroundColor } from "expo-status-bar";
export const AuthContext = createContext({
    token: '',
    isAuthenticated: false,
    authenticate: (token) => {},
    logout: () => {}
})
let logoutTimer = null
const AuthContextProvider = ({children}) => {
    const [authToken, setAuthToken] = useState()
    const authenticate = (token, expiredTime, isAuto) => {
        setAuthToken(token)
        AsyncStorage.setItem('token', token )//NEW: remember second paramenter always string
        let now = new Date();
        if(isAuto){         
            if(now >= expiredTime){
                logout();
            }
            else{
                logoutTimer = setTimeout(() => {
                    logout(),
                    console.log("Call logout auto")
                }, new Date(expiredTime) - now)
            }
        }
        else {
            AsyncStorage.setItem('expiredTime', new Date(now.getTime() + 60000).toISOString())
            logoutTimer = setTimeout(() => {
                logout()
                console.log("Call logout login")
            }, 60000)
        }
    }
    const logout = () => {
        setAuthToken(null)
        clearTimeout(logoutTimer)
        AsyncStorage.removeItem('token')
        AsyncStorage.removeItem('expiredTime')
    }
    const value = {
        token: authToken,
        isAuthenticated: !!authToken,
        authenticate: authenticate,
        logout: logout
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export default AuthContextProvider