export default class Now {


    static nodeRadius()
    {
        return Now._nodeRadius * Now._zoom
    }

    static originRadius()
    {
        return Now._originRadius * Now._zoom
    }

    static nodeArm()
    {
        return Now._nodeArm * Now._zoom
    }

    static setZoom(z)
    {
        Now._zoom = z
    }

    static get currentBurl()
    {
        return this._currentBurl
    }

    static set currentBurl(burl)
    {   
        this._currentBurl = burl
    }


    static get startBurl()
    {
        return this._startBurl
    }

    static set startBurl(burl)
    {   
        this._startBurl = burl
    }


}

Now._zoom = 1
Now._originRadius = 50
Now._nodeRadius = Now._originRadius * 1.2
Now._nodeArm = 100

Now._isPressing = false

Now._currentBurl = null
Now._startBurl = null
Now._startNode = null