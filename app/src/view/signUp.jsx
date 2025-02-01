import { useEffect, useState } from 'react'
import { Login } from './login'
import { ValidAccount } from './validAccount'
import * as func from "../controller/userController.js"



/**
 * @file Pantalla donde los usuarios pueden registrarse.
 * @module signUp
 */



/**
 * Componente que carga los elementos html de la pantalla para registrarse.
 * @function SignUp
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function SignUp({ socket }) {
    const [loginGo, setLoginGo] = useState(false)
    const [ValidAccountGo, setValidAccountGo] = useState(false)

    if (loginGo) return (<Login socket={socket} />)
    if (ValidAccountGo) return (<ValidAccount socket={socket} userName={document.getElementById("userName").value} />)

    return (
        <>
            <h1 id="loginHeader">SIGN UP</h1>
            <div id="initialMenu">
                <input id="userName" className="textInput" type="text" placeholder="USER NAME" maxLength="10" autoComplete="off" />
                <input id="password" className="textInput" type="password" placeholder="PASSWORD" maxLength="10" autoComplete="off" />
                <input id="email" className="textInput" type="text" placeholder="E-MAIL" autoComplete="off" />

                <button id="confirmButton" className="optionButton" onClick={() => func.signUp(setValidAccountGo)}> <img src="ok.png" /></button>
            </div>

            <button id="backButton" className="optionButton" onClick={() => setLoginGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}