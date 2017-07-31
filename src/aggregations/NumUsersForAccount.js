import R from 'ramda'

const agg = {
	"response": {
		"location": "request",
		"mimeType": "application/json"
	},
	"request":
		{
			"name": "accounts-last30days",
			"pipeline": [
				{
					"source": {
						"events": {
							"eventClass": ["web", "ios"]
						},
            "timeSeries": {
              "period": "dayRange",
              "count": "%NUM_DAYS%",
              "first": "%FIRST_DATE_STR%"
            }
					}
				},
				{
					"filter": {
						"field":"accountId",
						"operator":"==",
						"value":"%ACCT_ID%"
					}
				},
				{
					"reduce": [
						{
							"count": {
								"count": "visitorId"
							}
						}
					]
				}
			],
			"requestId": "accounts-last30days"
		}
};

const buildTimeSeries = (days) => `dateAdd(now(), -${days}, "days")`

const NumUsers = R.memoize((accountId, lastNDays=30) => {
  try {

		var pipeline = agg.request.pipeline;
		pipeline = R.map((piece) => {
			if (!!piece.source) {
				piece.source.timeSeries.first = buildTimeSeries(lastNDays);//"dateAdd(now(), -30, \"days\")";
				piece.source.timeSeries.count = lastNDays;
			}
			else if (!!piece.filter) {
				piece.filter.value = accountId;
			}

			return piece;
		}, pipeline);

		agg.request.pipeline = pipeline;

		return agg;
	} catch(e){ console.log("error", e)}
});

export default NumUsers;
