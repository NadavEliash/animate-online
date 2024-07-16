export const generateId = () => {
    return Math.floor(Math.random() * 99999) + ''
}

export const urlToBase64 = async (url: string) => {

    const response = await fetch(url)
    const blob = await response.blob()

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result)
        }
    })
}

export const base64ToUrl = async (base64: string, contentType = '') => {
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: contentType })
    const objectUrl = URL.createObjectURL(blob)
    return objectUrl
}