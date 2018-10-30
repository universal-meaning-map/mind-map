# Mind Map
_[Live version](http://interplanetarymindmap.github.io/mind-map)_

_[Usage instructions](https://github.com/interplanetarymindmap/mind-map/blob/master/instructions.md)_

[![Interplanetary Mind Map demo](https://img.youtube.com/vi/R4D8xT_KNP8/0.jpg)](http://www.youtube.com/watch?v=R4D8xT_KNP8)

## Context
We're in a personal contest to understand and try to change how do we organize our own information, and how it relates to everything else. The full explanation of why and how is something we're still [working on](https://github.com/interplanetarymindmap/index).

Since the scope of the project is immense, we're going to tackle small projects to get insight, while creating new tools to allow new ways to relate to information.

The limitations around organizing information in a way that is meaningful for the individual (understand "mind") has been one of the driving frustrations that have triggered us to dig deep into these issues. At the same time, we believe that defining how information is organized and structured is a necessary building block before exploring more advanced systems.

## Documentation
This is the first "project" we try to tackle. While creating a tool is the main goal, is likely that we will also be exploring working frameworks and different documentation praxis.

Documentation is important to us because we are looking to solve transversal problems in the best way possible, so if the logic behind is not good enough, we want to know. And if you're reading this, probably you can help. We invite you to open an issue so we can discuss any question further :)

## Mind map
The idea of a [mind-map](https://en.wikipedia.org/wiki/Mind_map), a tool that allows organizing information in the way that your brain works and not in a simplified way restricted by a user interface or a data structure.

## Original specs

-  Create a tool that would allow representing what you could do in an analogue mind map but in a digital format.
-  The main goal is to design and justify the correct data structure.
    - It needs to work on a global domain. This means that two different mind maps pointing to the same concept should converge if put together.
    -  It extends [IPLD](https://ipld.io/).
    -  As simple as possible.
    -  As generic as possible (can cover as many use-cases as possible).
    -  Any type of data should be able to be referenced.
-  Eventually, we'll explore authorship, accessibility, networking... but not yet.
-  It should have some basic visualization.
-  The tool is "render" agnostic. Different renders can be eventually used.
-  We should document the process and the reasoning behind as close as possible.
-  It should work on the web. Because of ease of use and development.
-  MVP approach. Keep things lean.
-  Nice to have:
    -  Load content and render via IPFS.
    -  Compatible with any IPFS/IPLD object.

### Nodes in the global domain
_Since writting this, we've have iterated over how to represent this information. A more updated vision is reflected here: [Atomic data structure](https://github.com/interplanetarymindmap/mind-map/issues/4)_

For _Global domain_ we understand that there is only one single giant mind map.

Which means that we need to be able to break in down into smaller subsets/pieces. The atomic piece of a mind map is what until now we've called a `node` (which is a very conflicting name that we would like to change).

A `node` is nothing but a set of `relations` around a concept/content/idea. We call this "concept" `origin`.
So the `origin` is the data that represents where the `relations` are coming from.

These relations are towards another piece of data. From the `node` perspective, we call these data `targets`.

**This implies that each `node` needs to contain and describe the `relations` with all the other `targets` it is interested in because if broken apart, it will lose information it cares about.**

In other words, `relations` come out of the `origin`, **never** in (at least from the `origin` perspective). If that was the case we will have a duplicated source of truth (the `relation` from the incoming `origin` and the `relation` from the current `origin`). This does not mean that the relation can't represent an incoming direction.

It makes a `node` behave selfishly, which is the logical behaviour in a distributed system.

Since we're in a global domain we will need to represent a subset of the global mind map. Which will be just a list of nodes.


### Relationships and nodes
We understand `relation` as of how a piece of data (`origin`) relates to another piece of data (`target`). A node can have an arbitrary number of `relations`.

```json
    {
        "origin":"content1",
        "relations": [
            {"target": "content2"}
            {"target": "content3"}
        ]
    }
```

### Relationship types
One of our frustrations and things we are exploring in detail is how can we extend how do we relate to information beyond what a user interface or the underlying system allows.

In this case, it translates on allowing the user to define how a piece of information relates to another. So a `relation` can have a `type`, which is nothing but a reference to an expression of the `type` of relation.

A `type` of a `relation` could be "depends on", "is my dad", "contains"... or anything (text or not). It is the job of the `render` to understand what this `type` means and how to represent it.

Because the selfish behaviour of a node described above, a relationship is always described from the perspective of the `origin` towards the `target`

```json
[
    {
        "origin":"Son",
        "relations": [
            {
                "target": "Dad",
                "type": "Is my dad"
            }
        ]
    },
    {
        "origin":"Dad",
        "relations": [
            {
                "target": "Son",
                "type": "Is my son"
            }
        ]
    }
]
```
The selfish behaviour implies that there is no way to guarantee the integrity of the information since the nodes could express conflicting information. And that's ok because **each node have its own truth**.

```json
[
    {
        "origin":"Son",
        "relations": [
            {
                "target": "Dad",
                "type": "Is NOT my dad"
            }
        ]
    },
    {
        "origin":"Dad",
        "relations": [
            {
                "target": "Son",
                "type": "Is my son"
            }
        ]
    },
]
```

### Merkle paths as identifiers
In the previous examples, we've used sample text in the `origin` field, to uniquely identify a piece of data.
This was just used for explanation purposes. It does not make sense in a global domain. And identifier needs to be global.

We first thought about using the [CID](https://github.com/ipld/cid) of the content. This is basically its hash, but then we realized that a  [`merkle-path`](https://github.com/ipld/specs/blob/master/IPLD.md#what-is-a-merkle-path) was a better choice.

Both the `CIDs` and the `merkle-paths` are unique global identifiers. But the `merkle-path` allows pointing to mutable content (if referencing to an [IPNS](http://127.0.0.1:8080/ipns/docs.ipfs.io/guides/concepts/ipns/) link).
Plus a `CID` can be represented as `merkle-path` as well.

This also allows us to not have to dereference the `merkle-path` in order to obtain the `CID`.

### The data structure
Considering all the above, a representation of a `node` as an `IPLD` object looks like this:

_TODO: The links are `CIDs` and should be `merkle-paths`._

```json
{
    "origin": {
        "link": {
            "/": "QmUmg7BZC1YP1ca66rRtWKxpXp77WgVHrnv263JtDuvs2k"
        }
    },
    "relations": [
        {
            "target": {
                "link": {
                    "/": "zdpuAvYJaZxBjTV4WH3irwThm5t2a7yTccoN9cWpDmtV4CiNz"
                }
            },
            "type": {
                "link": {
                    "/": "zdpuAvYJaZxBjTV4WH3irwThm5t2a7yTccoN9cWpDmtV4CiNz"
                }
            }
        },
        {
            "target": {
                "link": {
                    "/": "zdpuAyvmoJWTiVrCv1aCHV5xUZ1fxUf4XLkrprKPMMFCNKfj3"
                }
            }
        }
    ]
}
```
We've been abstracting out parts of this readme into issues in order to make them more discussable. We invite you to join the conversation :)
- [Atomic data structure](https://github.com/interplanetarymindmap/mind-map/issues/4)
- [Beyond semantics. Literal definition trees](https://github.com/interplanetarymindmap/mind-map/issues/2)
- [Dimensions and recursivity](https://github.com/interplanetarymindmap/mind-map/issues/3)
- [Requirements to make it usable](https://github.com/interplanetarymindmap/mind-map/issues/1)
- [Render vs structure data](https://github.com/interplanetarymindmap/mind-map/issues/5)

## Terminology

Terminology is problem. We need more precise vocabulary in order to just discuss all this. At the same time, this is forcing us to re-define concepts that had a little too broad definition.

Is likley you will see constant changes in the terminology we use, we will try to keep things well referenced and explained.


## Log (just to give a vague idea of the progress)
- `13/09/2018`: We've figured out a basic data structure to start. Defined in the section above
- `18/09/2018`: We started exploring the first render _(22/10/2018 edit: We merged two repositories, the render is this repo now)_
- `21/09/2018`: Documenting node identification. Documenting render format.
- `26/09/2018`: Render shows basic nodes with mock data, nodes are selectable and can be navigated with arrow keys
- `27/09/2018`: Converting this repo into a React-Create-App and the render into a standalone component. _(22/10/2018 edit: We merged two repositories, the render is this repo now)_
- `30/09/2018`: _Initital deadline reached_ (it's ok)
- `01/09/2018`: A lot of discussions regarding the way nodes are organized
- . Hierarchical vs lists...
- `05/10/2018`: Render has been refactored to fit all the new find-outs. Data structures are pretty solid. A lot of UI work is required.
- `13/10/2018`: The previous week has mostly been dedicated to adding mutability to the nodes in the render. Because of it, the render codebase got a little more complex than I would like.
- `14/10/2018`: There is now a [first version](http://interplanetarymindmap.github.io/mind-map) you can play around!
- `15/10/2018`: We met with [Victor](https://github.com/VictorBjelkholm) and discussed deeply this project. By chance we end up doing an choppy demo at the [IPFS hands-on call](https://www.youtube.com/watch?v=xzYEjHER6x4). 
- `17/10/2018`: We're travelling (by car) from Girona to Berlin, to be around the Web3 Summit.
- `19/10/2018`: We still travelling, but we've been using the free time to consolidate the documentation so it can be shared soon.
- `21/10/2018`: We've renamed the github organization and some repos. We made a [demo video](https://www.youtube.com/watch?v=R4D8xT_KNP8).
- `21/10/2018`: Added the project at the [ipfs/notes repository issues](https://github.com/ipfs/notes/issues/299).
- `28/10/2018`: In Prague for Devcon4.
- `29/10/2018`: We've been abastracting some topics and discussions [into issues](https://github.com/interplanetarymindmap/mind-map/issues), to make them more discussable.
- `30/10/2018`: [Created a topic](https://discuss.ipfs.io/t/help-us-build-the-interplanetary-mind-map/4197) in the discuss.ipfs to invite people to the conversation. 

_This document was copied into this repo on 21/10/2108. You can still get the historic at [its original repository](https://github.com/interplanetarymindmap/ipld-mindmap-old-readme/blob/master/README.md)_