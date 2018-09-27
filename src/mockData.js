export default
{
    "CID1": {
        "cid":"CID1",
        "relationships": [
            {
                "destinationNode": "CID2"
            },
            {
                "destinationNode": "CID3"
            },
            {
                "destinationNode": "CID4"
            },
            {
                "destinationNode": "CID5"
            }
        ]
    },
    "CID2":{
        "cid":"CID2",
        "relationships": [
            {
                "destinationNode": "CID4"
            },
            {
                "destinationNode": "CID5"
            }
        ]
        
    },
    "CID3":{
        "cid":"CID3",
        "relationships": [
            {
                "destinationNode": "CID1"
            }
        ]
    },
    "CID4":{
        "cid":"CID4"
    }
    ,
    "CID5":{
        "cid":"CID5"
    },
    "CID6":{
        "cid":"CID6",
        "relationships": [
            {
                "destinationNode": "CID7"
            }
        ]
    },
    "CID7":{
        "cid":"CID7",
        "relationships": [
            {
                "destinationNode": "CID8"
            }
        ]
    },
    "CID8":{
        "cid":"CID8"
    }
    
}