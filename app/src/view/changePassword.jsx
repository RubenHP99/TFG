import { useEffect, useState } from 'react'
import { Profile } from './profile'
import * as func from "../controller/userController.js"



/**
 * @file Archivo para cambiar la contraseña.
 * @module changePassword
 */



/**
 * Componente que carga los elementos html de la pantalla para cambiar la contraseña.
 * @function ChangePassword
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function ChangePassword({ socket }) {
    const [profileGo, setProfileGo] = useState(false)

    if (profileGo) return (<Profile socket={socket} />)


    return (
        <>
            <h1 id="changePassHeader">CHANGE<br />PASSWORD</h1>
            <div id="changePassMenu">
                <input id="oldPassword" className="textInput" type="password" placeholder="OLD PASSWORD" maxLength="10" autoComplete="off" />
                <input id="newPassword" className="textInput" type="password" placeholder="NEW PASSWORD" maxLength="10" autoComplete="off" />
                <input id="confirmPassword" className="textInput" type="password" placeholder="CONFIRM PASSWORD" maxLength="10" autoComplete="off" />

                <button id="changePassButton" className="simpleButton" onClick={() => func.changePassword(setProfileGo)}>CHANGE PASSWORD</button>
            </div>

            <button id="backButton" className="optionButton" onClick={() => setProfileGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}