// import React, {useContext, useState} from 'react'
//
// const LoginContext = React.createContext()
// const SetLoginContext = React.createContext()
//
// export const useLogin = () => {
//     return useContext(LoginContext)
// }
//
// export const useSetLogin = () => {
//     return useContext(SetLoginContext)
// }
//
// export const setLoginMemo = setLogin => {
//     return (login) => {
//         localStorage.setItem('login', login);
//         setLogin(login);
//     }
// }
//
// export const LoginProvider = ({ children }) => {
//     let value = false;
//
//     if (localStorage.getItem('login') === "true") {
//         value = true;
//     }
//
//     const [login, setLogin] = useState(value);
//
//     return (
//         <LoginContext.Provider value={login}>
//             <SetLoginContext.Provider value={setLoginMemo(setLogin)}>
//                 { children }
//             </SetLoginContext.Provider>
//         </LoginContext.Provider>
//     )
// }
