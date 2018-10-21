# Interplanetary Mind Map
_This is a proof of concept. Far from being re-usble piece of code or tool._

For a fool context of what this is about check this [IPLD-Mindmap repository](https://github.com/arxiu/ipld-mindmap)

## For users
[Live version](https://arxiu.github.io/ipld-mindmap-pts-render/)

We recommend using [IPFS Companion](https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch?hl=en)

### Basic interactions
- Long press to create a node.
- Click and drag on a node to create a relation.
- Double click and drag on a node to move it around.
  
### Play around
The url hash supports the following properties:

**autoLayout `bool`**  
If `true` it enables a particle engine that facilitates the layout of nodes

**canReferenceNodes `bool`**   
If `true` it allows to create relations that point towards nodes. This maybe a little un-intuitive at first, that's why is disabled.
To create this relation towards a node, hover around where the arrow coming out of the target node starts.

**isDebug `bool`**  
If enabled, some extra stuff is shown.
- The particle radius.
- The text input box.
- Some logs on the inspector

**src `CID`**  
`src` is the `CID` of:
```json
{
  "cids":["cidOfNode1", "cidOfNode2"]
}
```
When you add or modify a node, the `CID` of the `src` will change.

## For devs

`git clone git@github.com:arxiu/ipld-mindmap-pts-render.git`  
`cd ipld-mindmap-pts-render`  
`npm start`  