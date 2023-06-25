const colorModeSelect = document.getElementById("color-mode")
const colorSchemeBtn = document.getElementById("color-btn")
const colorPicker = document.getElementById("color-picker")
const mainEl = document.querySelector("main")
const footerEl = document.querySelector("footer")
const snackbar = document.getElementById("snackbar")
const baseUrl = "https://www.thecolorapi.com/scheme"
let schemes

/* 
    Select a random number from 0 - 16777215 (hex: 000000 - ffffff) 
    Assign it to the color picker as hex (.toString(16) converts to hex)
    and call getColors which handles the API call and page rendering.
    getColors also populates the drop down.
*/
randomColor = Math.floor(Math.random() * 16777215)
colorPicker.value = '#' + randomColor.toString(16)
getColors()

/* 
    Color scheme button click event handler.
*/
colorSchemeBtn.addEventListener("click", () => {
    getColors()
})

/* 
    Get a color scheme. The first time this is called it also populates the drop down. 
*/
function getColors() {
    fetch(`${baseUrl}?hex=${colorPicker.value.slice(1)}&${colorModeSelect.value}`)
        .then(res => res.json())
        .then(data => {
            renderColors(data.colors)
            /* if we haven't yet populated the drop down */
            if (!schemes) {
                schemes = data._links.schemes
                addSchemeModes()
            }
        })
}

/* 
    Add color scheme modes to drop down dynamically 
*/
function addSchemeModes() {
        Object.entries(schemes).forEach(
            ([name, value]) => {
                colorModeSelect.add( 
                    new Option( name.charAt(0).toUpperCase() + name.slice(1), value )
                )
        })
}

/* 
    Takes the colors that were returned from the API call and renders them on the page 
*/
function renderColors(colorsArray) {
    mainEl.innerHTML = colorsArray.map(color => {
        return `
            <div 
                onclick="copyToClipboard('${color.hex.value}')"
                class="colors" 
                style="background-color: ${color.hex.value}">
                <div class="color-name">${color.name.value}</div>
            </div>
        `
    }).join('')

    footerEl.innerHTML = colorsArray.map(color => {
        return `
            <p 
                onclick="copyToClipboard('${color.hex.value}')"
                class="color-hex">
                ${color.hex.value}
            </p>
        `
    }).join('')
}

/* 
    Uses the Clipboard API to copy color codes to the clipboard 
*/
function copyToClipboard(str) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(str)
            .then(() => {
                showSnackbar()
            }, error => { deprecatedCopyToClipboard(str) })
    } else { // Clipboard API not supported
        deprecatedCopyToClipboard(str)
    }
}

/*  
    If the Clipboard API is not available or there's an error returned it falls back 
    to using execCommand which is now deprecated.
*/
function deprecatedCopyToClipboard(str) {
    const area = document.createElement('textarea')
    document.body.appendChild(area)
    area.value = str
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
    showSnackbar()
}

/*
    Shows the snackbar for around 3 seconds.
    This is called after a color code is copied to the clipboard.
*/
function showSnackbar() {
    snackbar.className = "show"
    setTimeout(() => snackbar.className = "", 2900)
}