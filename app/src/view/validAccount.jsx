import { useEffect, useState } from 'react'
import { Login } from './login'
import { Menu } from '../view/menu'
import * as func from "../controller/userController.js"



/**
 * @file Pantalla donde los usuarios pueden validar su cuenta.
 * @module validAccount
 */




/**
 * Componente que carga los elementos html de la pantalla para validar la cuenta.
 * @function ValidAccount
 * @param {socket} socket El socket del cliente que carga la página.
 * @param {string} userName El nombre del usuario que valida la cuenta.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function ValidAccount({ socket, userName }) {
    const [menuGo, setMenuGo] = useState(false)
    const [loginGo, setLoginGo] = useState(false)


    if (loginGo) return (<Login socket={socket} />)

    if (menuGo) {
        localStorage.setItem("userName", userName)
        return (<Menu socket={socket} />)
    }



    return (
        <>
            <h1 id="loginHeader">VALID<br/>ACCOUNT</h1>
            <div id="initialMenu">
                <input id="validCode" className="textInput" type="text" placeholder="VALID CODE" maxLength="5" autoComplete="off" />
            </div>

            <button id="confirmButton" className="optionButton" onClick={() => func.validAccount(userName, setMenuGo)}> <img src="ok.png" /></button>
            <button id="backButton" className="optionButton" onClick={() => setLoginGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}