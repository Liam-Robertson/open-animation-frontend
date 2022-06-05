
export interface Rectangle {
    startXPos: number;
    endXPos: number;
    xCenter: number;
    startYPos: number;
    endYPos: number;
    yCenter: number;
}

export interface ImageCorners {
    topLeft: Rectangle;
    topRight: Rectangle;
    bottomLeft: Rectangle;
    bottomRight: Rectangle;
}