/* eslint-disable no-redeclare */
/* eslint-disable eqeqeq */
/* eslint-disable no-loop-func */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
 
import {
  maxBy,
  isEmpty,
  sortBy,
  minBy,
  find,
  flattenDeep,
  groupBy,
  mapValues,
  get,
} from 'lodash';
//  import './styles.scss'
import HeatMap from 'react-light-heatmap';
// import { CustomReportHeader } from '../../customReportHeader';
 

 const HeatMapComponent = ({
  inReportLbl = false, // to identify in report radio btn available
  isInReport = false, // to identify this chart included in given outcome report
  isDisabledInReportGrpBtn = false, // to identify this chart include in burton disable
  ...props
}) => {
  const [totalParticipant, setTotalParticipant] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [totalRespondents, setTotalRespondents] = useState(0);
  const [evalCount, setEvalCount] = useState(0);
  const [programsActivityCount, setProgramsActivityCount] = useState(0);
  const [linkedActivityCount, setLinkedActivityCount] = useState(0);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);
  const [data, setData] = useState([]);
  const [xLabelsVisibility, setXLabelsVisibility] = useState([]);
  const [yLabelsVisibility, setYLabelsVisibility] = useState([]);
  const [inReport, setInReport] = useState(isInReport);

  useEffect(() => {
    setInReport(isInReport);
  }, [isInReport]);

  const createChart = async () => {
    try {
      let { participantsChange, activity } = props;

      let flatArr = [];

      setTotalParticipant(get(participantsChange, 'totalParticipants', 0));
      setTotalRespondents(get(participantsChange, 'totalRespondents', 0));
      setActivityCount(get(participantsChange, 'activityCount', 0));
      setEvalCount(get(participantsChange, 'evalCount', 0));
      setProgramsActivityCount(
        get(participantsChange, 'programsActivityCount', 0)
      );
      setLinkedActivityCount(get(participantsChange, 'linkedActivityCount', 0));

      let resultsArr = [];

      participantsChange &&
        !isEmpty(participantsChange.results) &&
        participantsChange.results.map((item) => resultsArr.push(item));

      // make one single array - flat array
      flatArr = flattenDeep(resultsArr);

      //group by possible outcomes
      let groupedArr = groupBy(flatArr, 'preResult');
      groupedArr = mapValues(groupedArr, (data) => {
        return groupBy(data, 'postResult');
      });

      //get the total count of each possibilities
      for (var item in groupedArr) {
        for (var value in groupedArr[item]) {
          let total = 0;
          groupedArr[item][value].map((element) => {
            if (
              parseInt(element.preResult, 10) <=
              parseInt(element.postResult, 10)
            ) {
              total = total + parseInt(element.count, 10);
              element.count = total;
            } else {
              element.count = 0;
            }
            return element;
          });
        }
      }
      //arrange the possibilities to get only the total count in one possibility
      let arrangedResults = [];
      for (var item in groupedArr) {
        for (var value in groupedArr[item]) {
          let finalItem = maxBy(groupedArr[item][value], (o) => {
            return o.count;
          });
          arrangedResults.push(finalItem);
        }
      }

      // let { xLabels, xLabelsVisibility, yLabelsVisibility } = this.state;
      let xLabels = new Array(10).fill(0).map((_, i) => `${i + 1}`);
      setXLabels(xLabels);

      //create all possible pre-post value outcomes
      let verticleAxisLabels = [];
      for (var j = 1; j <= 10; j++) {
        for (var i = 1; i <= 10; i++) {
          if (j <= i) {
            verticleAxisLabels.push(j + '-' + i);
          }
        }
      }

      //display only the values which have equal pre-post values
      let yLabelsVisibility = verticleAxisLabels.map((item) => {
        let prePostVal = item.split('-');
        if (prePostVal[0] === prePostVal[1]) {
          return item;
        } else {
          return '';
        }
      });

      setYLabelsVisibility(yLabelsVisibility);

      let totalCount = 0;
      let data; //final data array to be displayed in heat map. 2nd order array
      if (!isEmpty(arrangedResults)) {
        arrangedResults = sortBy(arrangedResults, [{ preResult: 'asc' }]);
        arrangedResults.forEach((item) => {
          let count = parseInt(item.count);
          totalCount = count + totalCount;
        });
        const percentageArr = [];
        arrangedResults.forEach((res, i) => {
          let count = parseInt(res.count);
          res.percentage = parseFloat(count / totalCount);
          percentageArr.push(count / totalCount);
        });
        let maxCount = maxBy(arrangedResults, (o) => {
          return o.percentage;
        });
        let minCount = minBy(arrangedResults, (o) => {
          return o.percentage;
        });

        arrangedResults.forEach((item) => {
          item.per =
            0.09 +
            parseFloat(minCount.percentage) +
            ((1 - 0.09) /
              (parseFloat(maxCount.percentage) -
                parseFloat(minCount.percentage))) *
              (parseFloat(item.percentage) - parseFloat(minCount.percentage));
        });

        data = verticleAxisLabels.reverse().map((item, i) => {
          let prePostVal = item.split('-');

          let existingPossibility = find(arrangedResults, (o) => {
            return (
              o.preResult == prePostVal[0] && o.postResult == prePostVal[1]
            );
          });

          // let activityCount = find(arrangedResults, (o, i) => {
          //   return (o.activityCount =
          //     clonedParticipantsChange[i].activityCount);
          // });

          if (existingPossibility) {
            return xLabels.map((item) => {
              if (
                parseInt(existingPossibility.preResult, 10) <= item &&
                item <= parseInt(existingPossibility.postResult, 10)
              ) {
                return {
                  percentage: existingPossibility.per || 1,
                  preResult: prePostVal[0],
                  postResult: prePostVal[1],
                  count: existingPossibility.count,
                  activityCount: activity ? 0 : activityCount.activityCount,
                };
              } else {
                return item * 0;
              }
            });
          } else {
            return xLabels.map((item) => item * 0);
          }
        });
      } else {
        data = verticleAxisLabels.reverse().map((item, i) => {
          return xLabels.map((item) => item * 0);
        });
      }

      setXLabels(xLabels);
      setYLabels(yLabels);
      setData(data);
      setXLabelsVisibility(xLabelsVisibility);
      setYLabelsVisibility(yLabelsVisibility.reverse());
    } catch (error) {
      console.error('PostPreSurvey -> componentDidMount -> error', error);
    }
  };

  const renderCellHover = ({ title, ...rest }) => {
    return (
      <div {...rest} />
    );
  };

  const getTitle = (rest) => {
    const { activity, evalPlan } = props;
    let possibleOutcome;

    if (rest.value !== 0) {
      possibleOutcome = find(data[rest.y], (o) => {
        return !isEmpty(o);
      });
      let hoverStr = (
        <p>
          {'pre result: ' + get(possibleOutcome, 'preResult', 0) + ','}
          <br />
          {'post result: ' + get(possibleOutcome, 'postResult', 0) + ','}
          <br />
          {'count: ' + get(possibleOutcome, 'count', 0) + ','}
          <br />
          {!activity && get(possibleOutcome, 'activityCount', null) ? (
            <>
              {`${evalPlan ? 'evaluation plan' : 'activity'} count: ${get(
                possibleOutcome,
                'activityCount',
                0
              )}`}
              <br />
            </>
          ) : null}
        </p>
      );
      return hoverStr;
    } else {
      return 'no response';
    }
  };

  const onChangeInReport = () => {
    const _inReport = !inReport;
    setInReport(_inReport);

    props && props.onChangeInReport && props.onChangeInReport(_inReport);
  };

  useEffect(() => {
    createChart();
  }, [props.participantsChange]);

  const {
    date,
    outcome,
    evalPlan,
    method,
    evaluationObject,
    fromDocumentation,
    avoidLabel = false,
  } = props;

 
  let summary = {
    totalParticipant: totalParticipant,
    totalResponse: totalRespondents,
    activityCount: activityCount,
    evalCount: evalCount,
    programsActivityCount: programsActivityCount,
    linkedActivityCount: linkedActivityCount,
  };

  // DA DATA CREATION PLACE
  let da = {};
  if (fromDocumentation) {
    let documentationSummary = {
      totalParticipant: evaluationObject.totalParticipants,
      totalResponse: evaluationObject.actualParticipantsEvaluated,
    };
    da.summary = documentationSummary;
  } else {
    da.summary = summary;
  }

  
 
  return (
    <div className="outcomes-summary-chart-div">
     
      <div className="report-border-container">
        <div className="individualRateChart" id="heat-map-chart">
          <div className="right">
            {data ? (
              <HeatMap
                xLabels={xLabels}
                yLabels={yLabelsVisibility}
                xLabelsLocation={'bottom'}
                yLabelsVisibility={yLabelsVisibility}
                xLabelWidth={100}
                labels={['Title']}
                yLabelWidth={20}
                yLabelTextAlign={'right'}
                data={data}
                cellStyle={(
                  background,
                  value,
                  min,
                  max,
                  data,
                  x,
                  y,
                  height,
                  width
                ) => ({
                  background: `rgb(254, 169, 78, ${value.percentage})`,
                  fontSize: '9px', // Adjust the font size as needed
                  color: '#000',
                  height: `12px`,
                  width: '5vw',
                  padding: '0px',
                  border: '1px solid #e7e7e7',
                  margin: '0px',
                })}
                components={{
                  Cell: (v) => renderCellHover(v),
                }}
              />
            ) : (
              <div className="no-data-div">No responses</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapComponent