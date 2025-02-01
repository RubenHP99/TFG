import { useEffect, useState } from 'react'
import { Login } from './login'
import * as func from "../controller/userController.js"




/**
 * @file Archivo para obtener una nueva contraseña.
 * @module forgotPassword
 */




/**
 * Componente que carga los elementos html de la pantalla de contraseña olvidada.
 * @function ForgotPassword
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function ForgotPassword({ socket }) {
    const [loginGo, setLoginGo] = useState(false)

    if (loginGo) return (<Login socket={socket} />)

    return (
        <>
            <h1 id="loginHeader">FORGOT<br />PASSWORD?</h1>
            <div id="initialMenu">
                <input id="userName" className="textInput" type="text" placeholder="user name" maxLength="10" autoComplete="off" />
            </div>

            <button id="confirmButton" className="optionButton" onClick={() => func.forgotPassword(setLoginGo)}> <img src="ok.png" /></button>
            <button id="backButton" className="optionButton" onClick={() => setLoginGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}