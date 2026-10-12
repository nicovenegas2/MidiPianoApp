export function streak(key) {

    // get body
    const body = document.querySelector('body')
    // create div with class streak
    const streak = document.createElement('div')
    streak.classList.add('streak')
    // make streak different of any other streak, including the same key
    streak.id = Math.random().toString(36).substr(2, 9)
    // if key is black, add class black
    if (key.classList.contains('black')) {
        streak.classList.add('black')
    }

    // add to key
    body.appendChild(streak)



    // get key position
    const keyPos = key.getBoundingClientRect()
    console.log('keyPos', keyPos)

    let top = keyPos.top
    let left = keyPos.left + keyPos.width / 4
    let height = 0
    let canGrow = true

    // set thin width to avoid weird animation
    let offwidth = keyPos.width / 2
    // set streak position
    streak.style.top = `${top}px`
    streak.style.left = `${left}px`
    streak.style.width = `${offwidth}px`

    console.log(streak.style.top, streak.style.left, streak.style.width)

    // animate streak
    let interval = setInterval(() => {
        streak.style.top = `${top}px`
        streak.style.height = `${height}px`
        if (top + height <= 0) {
            console.log("destroy")
            streak.remove()
            clearInterval(interval)
        }
        if(key.classList.contains('press') && canGrow){
            height += 1
        }else{
            canGrow = false
        }
        top -= 1
    }, 5)



}