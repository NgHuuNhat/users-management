const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function generateCaptcha(length = 8) {
    let captcha = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CHARACTERS.length)
        captcha += CHARACTERS[randomIndex]
    }
    return captcha
}