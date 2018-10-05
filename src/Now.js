export default class Now {


    static getNodeRadius()
    {
        return Now.nodeRadius * Now.zoom
    }

    static getOriginRadius()
    {
        return Now.originRadius * Now.zoom
    }
}

Now.zoom = 1
Now.originRadius = 30
Now.nodeRadius = Now.originRadius * 1.2