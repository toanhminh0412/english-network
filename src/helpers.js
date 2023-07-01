/* 
Convert vw to px
    Params: 
    - int: width in vw
    Return: 
    - int: width in px
*/
export const convertVwToPx = width => {
    return width * window.innerWidth/100;
}

/* 
Convert vh to px
    Params: 
    - int: height in vh
    Return: 
    - int: height in px
*/
export const convertVhToPx = height => {
    return height * window.innerHeight/100;
}

/* 
Convert px to vw
    Params: 
    - int: width in px
    Return: 
    - int: width in vw
*/
export const convertPxToVw = width => {
    return width / window.innerWidth*100;
}

/* 
Convert px to vh
    Params: 
    - int: width in px
    Return: 
    - int: width in vh
*/
export const convertPxToVh = height => {
    return height / window.innerHeight*100;
}