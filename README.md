# Mind Map
_[Live version](http://interplanetarymindmap.github.io/mind-map)_  
_[Usage instructions](https://github.com/interplanetarymindmap/mind-map/blob/master/instructions.md)_  
_[Small video demo](http://www.youtube.com/watch?v=R4D8xT_KNP8)_  
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

### Mind-maps in a global domain

For _Global domain_ we understand that there is only one single giant mind map.

Which means that we need to be able to break in down into smaller subsets/pieces. These pieces need to keep its integrity, so having the right data structure is key.

Most of the work in this repository is around justifiying those data structures. We've been abstracting them into their own issue, in order to keep them discussable.
I suggest you to read the following:  

[Original data structure](https://github.com/interplanetarymindmap/mind-map/issues/7)  
[Atomic data structure](https://github.com/interplanetarymindmap/mind-map/issues/4)  
[Beyond semantics. Literal definition trees](https://github.com/interplanetarymindmap/mind-map/issues/2)  
[Mind-maps for mappers and packers](https://github.com/interplanetarymindmap/mind-map/issues/6)  
  
And if you want to get deeper, those are also relevant:  
[Dimensions and recursivity](https://github.com/interplanetarymindmap/mind-map/issues/3)    
[Render vs structure data](https://github.com/interplanetarymindmap/mind-map/issues/5)  

## Log (just to give a vague idea of how we spend the time)
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
- `15/11/2018`: A lot of travelling and other projects on our way. We keep updating and adding insights in the issues. 

_This document was copied into this repo on 21/10/2108. You can still get the historic at [its original repository](https://github.com/interplanetarymindmap/ipld-mindmap-old-readme/blob/master/README.md)_