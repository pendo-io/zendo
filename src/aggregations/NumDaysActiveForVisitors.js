import R from 'ramda';
//
// example first value: "dateAdd(now(), -30, \"days\")""

const agg = {
	"response":{
		"location": "request",
    "mimeType": "application/json"
	},
	"request": {
		"requestId":"zendo-visitorNumActiveDays-lastNdays",
    "pipeline": [
			{
				"source": {
	        "events": {"eventClass":["web", "ios"]},
					"timeSeries": {
    	    	"period": "dayRange",
      	  	"count": "%NUM_DAYS%",
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

const buildTimeSeries = (days) => `dateAdd(now(), -${days}, "days")`

const NumDaysRequest = R.memoize((visitorId, lastNDays=30) => {
	try {

		var pipeline = agg.request.pipeline;
		pipeline = R.map((piece) => {
			if (!!piece.source) {
				piece.source.timeSeries.first = buildTimeSeries(lastNDays);//"dateAdd(now(), -30, \"days\")";
				piece.source.timeSeries.count = lastNDays;
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
