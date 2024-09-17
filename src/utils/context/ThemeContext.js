import {  createContext, useState } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({children}) => {

    const [darkTheme,setDarkTheme] = useState(true);
    function changeTheme() {
        setDarkTheme(!darkTheme);
    }

    return (
        <ThemeContext.Provider value={{darkTheme,changeTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}
export default ThemeProvider;
