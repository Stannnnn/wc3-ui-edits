export const dragElement = (elmnt: HTMLElement, dragElmnt: HTMLElement) => {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0

    dragElmnt.onmousedown = e => {
        e = e || window.event
        e.preventDefault()

        // get the mouse cursor position at startup:
        pos3 = e.clientX
        pos4 = e.clientY

        document.onmouseup = () => {
            // stop moving when mouse button is released:
            document.onmouseup = null
            document.onmousemove = null
        }

        // call a function whenever the cursor moves:
        document.onmousemove = e => {
            e = e || window.event
            e.preventDefault()

            // calculate the new cursor position:
            pos1 = pos3 - e.clientX
            pos2 = pos4 - e.clientY
            pos3 = e.clientX
            pos4 = e.clientY

            // set the element's new position:
            elmnt.style.top = elmnt.offsetTop - pos2 + 'px'
            elmnt.style.left = elmnt.offsetLeft - pos1 + 'px'
        }
    }
}
