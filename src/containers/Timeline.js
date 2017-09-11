import React   from 'react';
import recycle from 'recycle';
import R       from 'ramda';
import Rx      from 'rxjs';

import Paper            from 'material-ui/Paper';
import Subheader        from 'material-ui/Subheader';
import {
  List,
  ListItem
} from 'material-ui/List';
import DatePicker       from 'material-ui/DatePicker';
import TimePicker       from 'material-ui/TimePicker';

import ActionReportProblem   from 'material-ui/svg-icons/action/report-problem';
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file';
import MapsLocalOffer        from 'material-ui/svg-icons/maps/local-offer';
import MapsMap               from 'material-ui/svg-icons/maps/map';

import dateformat from 'dateformat';

import Streams from '../Streams';
import ZAF     from '../sources/ZAFClient';
import Pendo   from '../sources/PendoClient';
import Storage from '../sources/Storage';

import {
  PickTimelineDate,
  TimelineItemTouchAction
} from '../actions';

const getDay = (d) => dateformat(d, 'fullDate')
const getTimeOfDay = (d) => dateformat(d, 'longTime')
const lookupItem = (item, lookupMap) => {
  if (item.type === 'ticket') return "Ticket Submitted";
  const id = item.pageId || item.featureId || item.guideId;
  if (!lookupMap[item.type][id]) return `${item.type} (${id})`;
  const model = lookupMap[item.type][id];
  return `${model.name}`;
}

// talkdesk issue
// https://app.pendo.io/api/v1/visitor/5988e5c6c46ecd591b84cfa5/history?starttime=1504549858000

const getIcon = (type) => {
  if (type === 'page') return (<EditorInsertDriveFile/>);
  if (type === 'feature') return (<MapsLocalOffer/>);
  if (type === 'guide') return (<MapsMap/>);
  else return (<ActionReportProblem/>);
}

// const onItemTouch = (item) => {
//   const id = item.pageId || item.featureId || item.guideId;
//   window.open(`${Pendo.url}/${item.type}s/${id}`, '_newtab');
// }

const Timeline = recycle({
  initialState: {
    ts: null,
    day: '',
    time: '',
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
          state.ts = date.getTime();
          return state;
        }),

      Streams.getVisitorHistory()
        .reducer( (state, history) => {
          if (R.is(Error, history)) {
            console.log("Got error", history);
            state.error = history;
            return state;
          }
          state.history = history;
          return state;
        }),

      Streams.getPendoModels()
        .reducer( (state, models) => {
          const guides = models[0],
            pages = models[1],
            features = models[2];

          guides.map((g) => state.lookup.guide[g.id] = g);
          pages.map((p) => state.lookup.page[p.id] = p);
          features.map((f) => state.lookup.feature[f.id] = f);

          return state;
        }),

      ZAF.getTicketId()
        .map( (tId) => Storage.getTicketStorage(tId).read('timeline-date') )
        .merge(Streams.watchStorage('timeline-date'))
        .map( (ts) => {
          console.log(ts);
          let d = !!ts ? new Date(ts) : null;
          return d;
        })
        .merge(
          ZAF.getTicketCreateDate()
          .map((date) => [date, 'default'] )
        )
        .catch( e => Rx.Observable.of(e) )
        .reducer( (state, date) => {
          if (R.is(Error, date)){
            state.error = date;
            return state;
          }

          if ((R.is(Array, date) && !state.pickedDate) || ( R.is(Date, date) )) {
            console.log("did this work?", date);
            state.pickedDate = date;
          }

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
        <Subheader>{state.day}</Subheader>
        {!!state.pickedDate &&
          <DatePicker
            hintText="Controlled Date Input"
            value={state.pickedDate}
            onChange={(e,date) => PickTimelineDate(date)}
          />
        }
        <Paper zDepth={0} style={{margin: '5px 5px 15px'}}>
          <List>
            <ListItem disabled={true}
              style={{background: '#fffbe5', border: '1px solid #ecb'}}
              leftIcon={getIcon('ticket')}
              primaryText={lookupItem({type:'ticket'})}>
                <div style={{'float':'right', 'font-size':'10px'}}>{state.time}</div>
            </ListItem>
            {state.history.map((item) =>
              <ListItem
                onTouchTap={(e) => TimelineItemTouchAction(item)}
                leftIcon={getIcon(item.type)}
                primaryText={lookupItem(item, state.lookup)}>
                  <div style={{float: 'right', 'font-size':'10px'}}>{getTimeOfDay(new Date(item.ts))}</div>
              </ListItem>
            )}
          </List>
          {!state.history.length &&
            <div>No history to show on the timeline.</div>
          }
        </Paper>
      </div>
    );
  }
})

export default Timeline;
