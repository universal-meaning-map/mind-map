export default class Now {


    static nodeRadius() {
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

    static set clickDownBurlSelection(burlSelection) {
        Now._clickDownBurlSelection = burlSelection
    }

    static set clickUpBurlSelection(burlSelection) {
        Now._clickUpBurlSelection = burlSelection
    }

    static set currentBurlSelection(burlSelection) {
        Now._currentBurlSelection = burlSelection
    }

    static get currentBurlSelection() {
        return Now._currentBurlSelection
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

