import { createContext, useCallback, useEffect, useState } from "react";
import { baseURL, postRequest } from "../utils/services";
import { json } from "react-router-dom";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false)
    const [registerInfo, setRegisterInfo] = useState({
        tag: "",
        email: "",
        password: "",
        regToken: "",
    });
    const [loginError, setLoginError] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false)
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [pfp, newPfp] = useState ({
        pfp: "",
    });

    
    

    useEffect(() => {
        const user = localStorage.getItem("User")

        setUser(JSON.parse(user))
    },[])


    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, [])

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, [])

    const updatePfp = useCallback((info) => {
        newPfp(info);
    })

    const registerUser = useCallback(async(e) => {
        e.preventDefault()
        setIsRegisterLoading(true)
        setRegisterError(null)
        const res = await postRequest(
            `${baseURL}/users/register`,
            JSON.stringify(registerInfo),
        )

        setIsRegisterLoading(false)
        
        if(res.error){
            return setRegisterError(res)
        }


        localStorage.setItem("User", JSON.stringify(res))
        setUser(res)
    }, [registerInfo]
    );

    const loginUser = useCallback(async(e) => {

        e.preventDefault()

        setIsLoginLoading(true)
        setLoginError(null)

        const res = await postRequest(
            `${baseURL}/users/login`,
            JSON.stringify(loginInfo),
        )

        setIsLoginLoading(false)
        if(res.error){
            return setLoginError(res)
        }

        localStorage.setItem("User", JSON.stringify(res))
        setUser(res)
    }, [loginInfo])


    const setPfp = useCallback(async(e) => {
        e.preventDefault()

        const file = e.target.file
        const fr = new FileReader();
        console.log(file)
        const altfile = document.getElementById("fileEl")
        fr.readAsDataURL(altfile.files[0])
        fr.addEventListener('load', () => {
            const url = fr.result;
            console.log(url);
        })

        const cart = localStorage.getItem("user")
        cart.pfp = url
        
        localStorage.setItem("User", JSON.stringify(cart))
        console.log(cart);

    }, [pfp])


    const logoutUser = useCallback(() => {
        localStorage.removeItem("User")
        setUser(null)
    })

    return <AuthContext.Provider value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                logoutUser,
                loginUser,
                loginError,
                loginInfo,
                updateLoginInfo,
                isLoginLoading,
                setPfp,
            }}>
                {children}
            </AuthContext.Provider>
}