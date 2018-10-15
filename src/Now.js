export default class Now {

    static nodeRadius() {
        if(!Now._canReferenceNodes)
            return Now.originRadius()

        return Now._nodeRadius * Now._zoom
    }

    static originRadius() {
        return Now._originRadius * Now._zoom
    }

    static nodeArm() {
        return Now._nodeArm * Now._zoom
    }

    static setZoom(z) {
        Now._zoom = z
    }

    static updateAction(type) {
        if (type === 'up')
            Now._isPressing = false
        if (type === 'down')
            Now._isPressing = true
    }

    static get isPressing ()
    {
        return Now._isPressing
    }

    static get downSelection() {
        return Now._clickDownBurlSelection
    }

    static set downSelection(burlSelection) {
        Now._clickDownBurlSelection = burlSelection
    }

    static get upSelection() {
        return Now._clickUpBurlSelection
    }
    static set upSelection(burlSelection) {
        Now._clickUpBurlSelection = burlSelection
    }

    static get hoverSelection() {
        return Now._currentBurlSelection
    }

    static set hoverSelection(burlSelection) {
        Now._currentBurlSelection = burlSelection
    }

    static get dragSelection() {
        return Now._currentDragBurlSelection
    }

    static set dragSelection(burlSelection) {
        Now._currentDragBurlSelection = burlSelection
    }

    static set canReferenceNodes(can)
    {
        Now._canReferenceNodes = can
    }

    static get canReferenceNodes()
    {
        return  Now._canReferenceNodes
    }


}

Now._zoom = 1
Now._originRadius = 50
Now._nodeRadius = Now._originRadius * 1.2
Now._nodeArm = 100

Now._isPressing = false

Now._clickDownBurlSelection = null
Now._clickUpBurlSelection = null
Now._currentBurlSelection = null
Now._currentDragBurlSelection = null
Now._canReferenceNodes = null

