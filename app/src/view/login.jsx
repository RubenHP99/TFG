import { useEffect, useState } from 'react'
import { SignUp } from './signUp'
import { ForgotPassword } from './forgotPassword'
import { Menu } from '../view/menu'
import { ValidAccount } from './validAccount'
import * as func from "../controller/userController.js"



/**
 * @file Pantalla donde los usuarios pueden iniciar sesión.
 * @module login
 */


/**
 * Componente que carga los elementos html de la pantalla de login.
 * @function Login
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
//Necesario pasar el socket a todos los componentes para poder volver a cargar el menu correctamente
export function Login({ socket }) {
    const [menuGo, setMenuGo] = useState(false)
    const [signUpGo, setSignUpGo] = useState(false)
    const [forgotPassGo, setForgotPassGo] = useState(false)
    const [ValidAccountGo, setValidAccountGo] = useState(false)

    if (menuGo) return (<Menu socket={socket} />)
    if (signUpGo) return (<SignUp socket={socket} />)
    if (forgotPassGo) return (<ForgotPassword socket={socket} />)
    if (ValidAccountGo) return (<ValidAccount socket={socket} userName={document.getElementById("userName").value} />)


    return (
        <>
            <h1 id="loginHeader">LOGIN</h1>
            <div id="initialMenu">
                <input id="userName" className="textInput" type="text" placeholder="USER NAME" maxLength="10" autoComplete="off" />
                <input id="password" className="textInput" type="password" placeholder="PASSWORD" maxLength="10" autoComplete="off" />

                <button id="loginButton" className="simpleButton" onClick={() => func.login(setMenuGo, setValidAccountGo)}>LOGIN</button>
                <button id="signUpButton" className="simpleButton" onClick={() => setSignUpGo(true)}> SIGN UP</button>
                <button id="forgotPassButton" className="simpleButton" onClick={() => setForgotPassGo(true)}> FORGOT PASSWORD?</button>
            </div>

            <button id="backButton" className="optionButton" onClick={() => setMenuGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}