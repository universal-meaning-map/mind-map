# Interplanetary Mind Map instructions
_This is a proof of concept. Far from being a re-usable piece of code or tool._

## For users
[Live version](https://arxiu.github.io/ipld-mindmap-pts-render/)

We recommend using [IPFS Companion](https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch?hl=en)

### Basic interactions
- Long press to create a node.
- Click and drag on a node to create a relation.
- Double click and drag on a node to move it around.
  
### Play around
The URL hash supports the following properties:

**autoLayout** _bool_  
If `true` it enables a particle engine that facilitates the layout of nodes.

**canReferenceNodes** _bool_  
If `true` it allows creating relations that point towards nodes. This may be a little unintuitive at first.

To create this relation towards a node, hover around where the arrow coming out of a node starts.

**isDebug** _bool_ 
If enabled, some extra stuff is shown.
- The particle radius.
- The text input box.
- Some logs on the inspector

**src** _CID_  
`src` is the `CID` of:
```json
{
  "cids":["cidOfNode1", "cidOfNode2"]
}
```
When you add or modify a node, the `CID` of the `src` will change.

## For Devs

`git clone git@github.com:arxiu/ipld-mindmap-pts-render.git`  
`cd ipld-mindmap-pts-render`  
`npm start`