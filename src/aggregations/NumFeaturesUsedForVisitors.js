import R from 'ramda'

const agg = {
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
			{
				"filter": {
					"field": "visitorId",
					"operator": "==",
					"value": "brec@pendo.io"
				}
			},
			{
				"select": {
					"Feature Name": "featureInfo.name",
					"Visitor Id": "visitorInfo.auto.id",
					"Visitor Email": "visitorInfo.agent.email",
					"Time on Feature": "minutes",
					"Events on Feature": "events",
					"Day": "formatTime(\"2006-01-02\", day)"
				}
			}
		],
		"requestId": "Feature usage by day for each visitor"
	}
};

const buildTimeSeries = (days) => `dateAdd(now(), -${days}, "days")`

const NumFeaturesUsed = R.memoize((visitorId, lastNDays=30) => {
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

export default NumFeaturesUsed;
