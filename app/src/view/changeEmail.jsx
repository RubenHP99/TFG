import { useEffect, useState } from 'react'
import { Profile } from './profile'
import * as func from "../controller/userController.js"

/**
 * @file Archivo para cambiar la dirección de correo electrónico.
 * @module changeEmail
 */



/**
 * Componente que carga los elementos html de la pantalla para cambiar el correo.
 * @function ChangeEmail
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function ChangeEmail({ socket }) {
    const [profileGo, setProfileGo] = useState(false)

    if (profileGo) return (<Profile socket={socket} />)


    return (
        <>
            <h1 id="changeEmailHeader">CHANGE<br/>E-MAIL</h1>
            <div id="changeEmailMenu">
                <input id="newEmail" className="textInput" type="text" placeholder="NEW E-MAIL" autoComplete="off" />

                <button id="changeEmailButton" className="simpleButton" onClick={() => func.changeEmail(setProfileGo)}>CHANGE E-MAIL</button>
            </div>

            <button id="backButton" className="optionButton" onClick={() => setProfileGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}