import R from 'ramda';
//
// example first value: "dateAdd(now(), -30, \"days\")""

const agg = {
	"response":{
		"location": "request",
    "mimeType": "application/json"
	},
	"request": {
		"requestId":"zendo-testing-visitorNumActiveDays-last30days",
    "pipeline": [
			{
				"source": {
	        "events": {"eventClass":["web", "ios"]},
					"timeSeries": {
    	    	"period": "dayRange",
      	  	"count": 30,
        		"first": "%FIRST_DATE_STR%"
    			}
    		}
			},
      {
				"filter": {
					"field": "visitorId",
					"operator":"==",
					"value":"%VISITOR_ID%"
				}
			},
			{
				"reduce":[{"daysActive":{"count":"day"}}]
			}
    ]
	}
}

const NumDaysRequest = R.memoize((visitorId) => {
	try {

		var pipeline = agg.request.pipeline;
		pipeline = R.map((piece) => {
			if (!!piece.source) {
				piece.source.timeSeries.first = "dateAdd(now(), -30, \"days\")";
			}
			else if (!!piece.filter) {
				piece.filter.value = visitorId;
			}

			return piece;
		}, pipeline);

		agg.request.pipeline = pipeline;

		return agg;
	} catch(e){ console.log("error", e)}
});

export default NumDaysRequest;
