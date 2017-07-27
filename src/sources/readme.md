# example pendo aggregation for num days active

```
{
	"response":{
		"location": "request",
    "mimeType": "application/json"
	},
	"request": {
		"name":"abcdefg",
		"requestId":"zendo-testing-visitorNumActiveDays-last30days",
    "pipeline": [
			{
				"source": {
	        "events": {"eventClass":["web", "ios"]},
					"timeSeries": {
    	    	"period": "dayRange",
      	  	"count": 30,
        		"first": "dateAdd(now(), -30, \"days\")"
    			}
    		}
			},
      {
				"filter": {
					"field": "visitorId",
					"operator":"==",
					"value":"brec@pendo.io"
				}
			},
			{
				"reduce":[{"daysActive":{"count":"day"}}]
			}
    ]
	}
}
```

# features used in last 30 days

```
{
    "response": {
        "location": "request",
        "mimeType": "application/json"
    },
    "request": {
        "name": "feature usage per day",
        "pipeline": [
            {
                "source": {
                    "featureEvents": null,
                    "timeSeries": {
                        "period": "dayRange",
                        "first": "dateAdd(now(), -30, \"days\")",
                        "count": 30
                    }
                }
            },
            {
                "group": {
                    "group": [
                        "visitorId",
                        "featureId",
                        "day"
                    ],
                    "fields": [
                        {
                            "events": {
                                "sum": "numEvents"
                            }
                        },
                        {
                            "minutes": {
                                "sum": "numMinutes"
                            }
                        }
                    ]
                }
            },
            {
                "expand": {
                    "featureInfo": {
                        "feature": "featureId"
                    }
                }
            },
            {
                "bulkExpand": {
                    "visitorInfo": {
                        "visitor": "visitorId"
                    }
                }
            },
						{"filter":{
					"field": "visitorId",
					"operator":"==",
					"value":"brec@pendo.io"
				}},
          	{
              "select" : {
                "Feature Name" : "featureInfo.name",
                "Visitor Id" : "visitorInfo.auto.id",
                "Visitor Email" : "visitorInfo.agent.email",
                "Time on Feature" : "minutes",
                "Events on Feature" : "events",
                "Day": "formatTime(\"2006-01-02\", day)"
              }
            }
          ],
        "requestId": "Feature usage by day for each visitor"
    }
}
```
