import React   from 'react';
import recycle from 'recycle';
import R       from 'ramda';
import Rx      from 'rxjs';

import Paper        from 'material-ui/Paper';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {
  List,
  ListItem
} from 'material-ui/List';
import DatePicker       from 'material-ui/DatePicker';

import ActionReportProblem   from 'material-ui/svg-icons/action/report-problem';
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file';
import MapsLocalOffer        from 'material-ui/svg-icons/maps/local-offer';
import MapsMap               from 'material-ui/svg-icons/maps/map';

import dateformat from 'dateformat';

import Streams from '../Streams';
import ZAF     from '../sources/ZAFClient';
import Storage from '../sources/Storage';

import {
  PickTimelineDate,
  TimelineItemTouchAction
} from '../actions';

const getDay = (d) => dateformat(d, 'fullDate')
const getTimeOfDay = (d) => dateformat(d, 'longTime')

const lookupItem = (item, lookupMap) => {
  if (item.type === 'ticket') return "Ticket Submitted";
  try {
    const id = item.pageId || item.featureId || item.guideId;
    if (!lookupMap[item.type][id]) {
      return `unrecognized ${item.type}`;
    } else {
      const model = lookupMap[item.type][id];
      return `${model.name}`;
    }
  } catch (e) {
    console.error(e);
  }
}

const getIcon = (type) => {
  if (type === 'page') return (<EditorInsertDriveFile/>);
  if (type === 'feature') return (<MapsLocalOffer/>);
  if (type === 'guide') return (<MapsMap/>);
  else return (<ActionReportProblem/>);
}

const observeTimelineStartDate = () => {
  return Rx.Observable.zip(
    ZAF.getTicketCreateDate(),
    ZAF.getTicketId()
      .map( (tId) => Storage.getTicketStorage(tId).read('timeline-date') )
  )
    .map( ([defaultDate, savedDate]) => {
      return (!!savedDate) ? new Date(savedDate) : defaultDate;
    })
    .merge(
      Streams.watchStorage('timeline-date').map( (ts) => new Date(ts) )
    );
}

const Timeline = recycle({
  initialState: {
    ts: null,
    day: '',
    time: '',
    history: [],
    lookup: {
      ticket: {},
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

      observeTimelineStartDate()
        .flatMap((date) => Streams.getPendoModels(date))
        .catch( e => Rx.Observable.of(e) )
        .reducer( (state, models) => {
          if (R.is(Error, models)){
            state.error = models;
            return state;
          }

          const guides = models[0],
            pages = models[1],
            features = models[2];

            guides.map((g) => state.lookup.guide[g.id] = g);
            pages.map((p) => state.lookup.page[p.id] = p);
            features.map((f) => state.lookup.feature[f.id] = f);

          return state;
        }),

      observeTimelineStartDate()
        .mergeMap( date => Streams.getVisitorHistory(date),
          (date, history) => [date, history]
        )
        .catch( e => Rx.Observable.of(e) )
        .reducer( (state, [date, h]) => {
          if (R.is(Error, arguments[1])) {
            state.error = date;
            return state;
          }

          h = R.reject( ((item) => item.type === 'untagged'), h);

          state.pickedDate = date;
          state.history = h;

          return state;
        })
    ]
  },
  view (props, state) {
    return (
      <div>
        {/*<Subheader>{state.time} on {state.day}</Subheader>*/}
        {!!state.error &&
          <h2>{state.error}</h2>
        }
        {!!state.pickedDate &&
          <div>
            <DatePicker
              floatingLabelText="Pick a Date"
              value={state.pickedDate}
              formatDate={getDay}
              onChange={(e,date) => PickTimelineDate(date)}
            />
          </div>
        }
        <Paper zDepth={0} style={{margin: '5px 5px 15px'}}>
          <List>
            {state.history.map((item) =>
              <ListItem
                onTouchTap={(e) => TimelineItemTouchAction(item)}
                leftIcon={getIcon(item.type)}
                primaryText={lookupItem(item, state.lookup)}
              >
                <div style={{float:'right', 'font-size':'10px'}}>
                  {getTimeOfDay(new Date(item.ts))}
                </div>
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

export default muiThemeable()(Timeline);
