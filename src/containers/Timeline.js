import React/*, { Component }*/ from 'react';
import recycle from 'recycle';

import Paper   from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';

import dateformat from 'dateformat';

import Streams from '../Streams';
import ZAF from '../sources/ZAFClient';

const getDay = (d) => dateformat(d, 'fullDate')
const getTimeOfDay = (d) => dateformat(d, 'longTime')
const lookupItem = (item, lookupMap) => {
  const id = item.pageId || item.featureId || item.guideId;
  if (!lookupMap[item.type][id]) return `${item.type} (${id})`;

  const model = lookupMap[item.type][id];
  console.log(model);
  return `${model.name} (${item.type})`;
}

const Timeline = recycle({
  initialState: {
    day: null,
    time: null,
    history: [],
    lookup: {
      page: {},
      feature: {},
      guide: {}
    }
  },
  update (sources) {
    return [
      ZAF.getTicketCreateDate()
        .reducer( (state, date) => {
          state.day = getDay(date);
          state.time = getTimeOfDay(date);
          return state;
        }),

      Streams.getVisitorHistory()
        .reducer( (state, history) => {
          state.history = history;
          return state;
        }),

      Streams.getPendoModels()
        .reducer( (state, models) => {
          console.log(models);
          const guides = models[0],
            pages = models[1],
            features = models[2];

          guides.map((g) => state.lookup.guide[g.id] = g);
          pages.map((p) => state.lookup.page[p.id] = p);
          features.map((f) => state.lookup.feature[f.id] = f);

          console.log(state.lookup);

          return state;
        })
    ]
  },
  effects (sources) {
    return []
  },
  view (props, state) {
    return (
      <div>
        <Subheader>{state.day} @ {state.time}</Subheader>
        <Paper zDepth={1} style={{margin: '5px 5px 15px'}}>
          {!state.history.length &&
            <div>No history to show on the timeline.</div>
          }
          <List>
            {state.history.map((item) =>
              <ListItem disabled={true} primaryText={lookupItem(item, state.lookup)} secondaryText={getTimeOfDay(new Date(item.ts))} />
            )}
          </List>
        </Paper>
      </div>
    );
  }
})

export default Timeline;
