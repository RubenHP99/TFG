import * as EmailValidator from 'email-validator';
import Swal from 'sweetalert2'

/**
 * @file Archivo con funciones necesarias para la lógica y gestión de los usaurios.
 * @module userController
 */



/**
 * Función para aplicar una animación de agitado a un elemento de tipo input.
 * @function shake
 * @param {html} input Elemento al que se le va a aplicar la animación.
 */
function shake(input) {
    input.style.animation = "shake 0.5s"
    setTimeout(() => { input.style.animation = 'none' }, 500)
}



/**
 * Función que para validar los campos y llamar a un servicio web para modificar el correo.
 * @function changeEmail
 * @param {function} setProfileGo Función para cambiar el atributo profileGo.
 */
export function changeEmail(setProfileGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const newEmailInput = document.getElementById("newEmail")

    //Comprobar correo valido
    if (!EmailValidator.validate(newEmailInput.value)) {
        shake(newEmailInput)
        return
    }


    const formData = new FormData();
    formData.append("userName", localStorage.getItem("userName"))
    formData.append("newEmail", newEmailInput.value)


    http.open("PUT", url + "/changeEmail")
    http.send(formData)

    Swal.fire(
        'E-mail changed!',
        'You changed your E-mail!',
        'success'

    ).then(() => {
        setProfileGo(true)
    })

}




/**
 * Función que para validar los campos y llamar a un servicio web para modificar la contraseña.
 * @function changePassword
 * @param {function} setProfileGo Función para cambiar el atributo profileGo.
 */
export function changePassword(setProfileGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const oldPassInput = document.getElementById("oldPassword")
    const newPassInput = document.getElementById("newPassword")
    const confirmPassInput = document.getElementById("confirmPassword")

    //Crear las condiciones de campo vacio o solo espacios en blanco
    const cond1 = oldPassInput.value.trim() == ""
    const cond2 = newPassInput.value.trim() == ""
    const cond3 = confirmPassInput.value.trim() == ""

    //Comprobar campos vacios
    if (cond1) { shake(oldPassInput) }
    if (cond2) { shake(newPassInput) }
    if (cond3) { shake(confirmPassInput) }
    if (cond1 || cond2 || cond3) { return }


    //No se permiten espacios en blanco en las contraseñas
    if (oldPassInput.value.includes(" ") || newPassInput.value.includes(" ") || confirmPassInput.value.includes(" ")) {
        Swal.fire(
            'ERROR',
            'Not blank spaces allowed',
            'error'
        )
        return
    }


    //Comprobar que las 2 nuevas contraseñas coinciden
    if (newPassInput.value != confirmPassInput.value) {
        Swal.fire(
            'ERROR',
            'Different new and confirm password',
            'error'
        )
        return
    }


    const formData = new FormData();
    formData.append("userName", localStorage.getItem("userName"))
    formData.append("oldPass", oldPassInput.value)
    formData.append("newPass", newPassInput.value)

    //POST porque se envia informacion sensible
    http.open("POST", url + "/changePassword")
    http.send(formData)
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText

            if (result == "OK") {
                Swal.fire(
                    'Password changed!',
                    'You changed your password!',
                    'success'

                ).then(() => {
                    setProfileGo(true)
                })

            } else {
                Swal.fire(
                    'ERROR',
                    'Incorrect old password',
                    'error'
                )
            }

        }
    }
}




/**
 * Función que para validar los campos y llamar a un servicio web para obtener una nueva contraseña.
 * @function forgotPassword
 * @param {function} setLoginGo Función para cambiar el atributo loginGo.
 */
export function forgotPassword(setLoginGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const userNameInput = document.getElementById("userName")

    //Comprobar si el nombre de usuaio esta vacio
    if (userNameInput.value.trim() == "") {
        shake(userNameInput)
        return
    }

    http.open("PUT", url + "/forgetPass?userName=" + userNameInput.value)
    http.send()
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText

            console.log(result)

            if (result != "OK") {
                Swal.fire(
                    'ERROR',
                    'Invalid username',
                    'error'
                )

            } else {
                setLoginGo(true)
            }
        }
    }
}



/**
 * Función que para validar los campos y llamar a un servicio web para iniciar sesión.
 * @function login
 * @param {function} setMenuGo Función que cambia el estado menuGo.
 * @param {function} setValidAccountGo Función que cambia el estado validAccountGo.
 */
export function login(setMenuGo, setValidAccountGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const userNameInput = document.getElementById("userName")
    const passwordInput = document.getElementById("password")


    //Crear las condiciones de campo vacio o solo espacios en blanco
    const cond1 = userNameInput.value.trim() == ""
    const cond2 = passwordInput.value.trim() == ""


    //Comprobar campos vacios
    if (cond1) { shake(userNameInput) }
    if (cond2) { shake(passwordInput) }
    if (cond1 || cond2) { return }


    //No se permiten espacios en blacno en el nimbre de usuario ni contraseña
    if (userNameInput.value.includes(" ") || passwordInput.value.includes(" ")) {
        Swal.fire(
            'ERROR',
            'Not blank spaces allowed',
            'error'
        )
        return
    }


    const formData = new FormData();
    formData.append("name", userNameInput.value)
    formData.append("password", passwordInput.value)

    //POST porque se envia informacion sensible
    http.open("POST", url + "/login")
    http.send(formData)
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText

            switch (result) {
                case "NOUSER": //No existe una cuenta con ese usuario y contraseña
                    Swal.fire(
                        'ERROR',
                        'Invalid username or password',
                        'error'
                    )
                    break;

                case "NOVAL": //No se ha validado la cuenta
                    setValidAccountGo(true)
                    break;

                case "OK": //Login correcto
                    localStorage.setItem("userName", userNameInput.value)
                    setMenuGo(true)
                    break;

                default:
                    break;
            }

        }
    }
}



/**
 * Función para borrar la cuenta.
 * @function deleteAccount
 * @param {function} setMenuGo Función que cambia el estado menuGo.
 */
export function deleteAccount(setMenuGo) {

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Your account has been deleted.',
                'success'
            )

            const url = sessionStorage.getItem("dataBaseUrl")
            const http = new XMLHttpRequest()
            http.open("DELETE", url + "/deleteAccount?userName=" + localStorage.getItem("userName"))
            http.send()
            localStorage.removeItem("userName")
            setMenuGo(true)
        }
    })
}






/**
 * Función para validar los campos y llamar a un servicio web para registrarse.
 * @function signUp
 * @param {function} setValidAccountGo Función para cambiar el estado validAccountGo.
 */
export function signUp(setValidAccountGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const userNameInput = document.getElementById("userName")
    const passwordInput = document.getElementById("password")
    const emailInput = document.getElementById("email")


    const cond1 = userNameInput.value.split(" ").join("") == ""
    const cond2 = passwordInput.value.split(" ").join("") == ""
    const cond3 = !EmailValidator.validate(emailInput.value)

    //Comprobar campos vacios
    if (cond1) { shake(userNameInput) }
    if (cond2) { shake(passwordInput) }
    if (cond3) { shake(emailInput) }
    if (cond1 || cond2 || cond3) { return }


    //No se permiten espacios en blanco en el nombre de usuario ni contraseña
    if (userNameInput.value.includes(" ") || passwordInput.value.includes(" ")) {
        Swal.fire(
            'ERROR',
            'Not blank spaces allowed',
            'error'
        )
        return
    }


    const formData = new FormData();
    formData.append("name", userNameInput.value)
    formData.append("password", passwordInput.value)
    formData.append("email", emailInput.value)


    http.open("POST", url + "/addUser")
    http.send(formData)
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText

            //Comprobar si el usuario no existe
            if (result == "OK") {
                setValidAccountGo(true)

            } else {
                Swal.fire(
                    'ERROR',
                    'User already exists',
                    'error'
                )
            }

        }
    }

}




/**
 * Función que para mostrar las estadísticas de un usuario registrado.
 * @function loadStatistics
 */
export function loadStatistics() {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const statsLabels = ["Played games: ", "Winned games: ", "Guessed doodles: ", "Last game: "]

    http.open("GET", url + "/getStats?userName=" + localStorage.getItem("userName"))
    http.responseType = "json" //Para poder trabaja con el valor de vuelto como lista
    http.send()
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.response

            const stats = document.getElementById("stats")

            result.forEach((stat, index) => {
                var statElement = document.createElement("label")
                statElement.innerText = statsLabels[index] + stat
                statElement.style = "font-family: gochiHand; font-size: 7vh; display: block; margin: 5vh"
                stats.append(statElement)
            });
        }
    }
}




/**
 * Función para validar los campos y llamar a un servicio web para validar la cuenta.
 * @function validAccount
 * @param {string} userName Nombre del usuario que todavía no ha validado la cuenta.
 * @param {function} setMenuGo Función para cambiar el estado menuGo.
 */
export function validAccount(userName, setMenuGo) {
    const url = sessionStorage.getItem("dataBaseUrl")
    const http = new XMLHttpRequest()

    const validCodeInput = document.getElementById("validCode")

    //Comprobar si el codigo esta vacio o si no es un numero
    if (validCodeInput.value.trim() == "" || isNaN(validCodeInput.value)) {
        shake(validCodeInput)
        return
    }


    const formData = new FormData()
    formData.append("userName", userName)
    formData.append("validCode", validCodeInput.value)


    http.open("PUT", url + "/validAccount")
    http.send(formData)
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText

            //Comprobar que el codigo es correcto
            if (result == "OK") {
                localStorage.setItem("userName", formData[0])
                setMenuGo(true)

            } else {
                // shake(validCodeInput)
                Swal.fire(
                    'ERROR',
                    'Incorrect valid code',
                    'error'
                )
            }

        }
    }
}