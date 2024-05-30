import HeatMapComponent from "./HeatMapComponent";
import { get } from 'lodash';


export default function App() {

    const searchParams = new URLSearchParams(window.location.search);
    const dataParam = searchParams.get('data');
    console.log("🚀 ~ App ~ dataParam:", dataParam)


    // const _sampleData = JSON.parse(dataParamSample)

    // const data = _sampleData;
    const data = JSON.parse(dataParam);
    console.log("🚀 ~ App ~ data:", data)



    let _legends = [
        {
            key: "activityCount",
            label: 'Activity Count',
            value: 10
        },
        {
            key: "totalParticipants",
            label: 'Total Participants',
            value:20
        },
        {
            key: "totalRespondents",
            label: 'Total Respondents',
            value: 50
        },

    ]

    if (_legends && _legends.length > 0) {

        const _totalParticipants = _legends.find(item => item.key === 'totalParticipants').value
        const _totalRespondents = _legends.find(item => item.key === 'totalRespondents').value

        _legends = [..._legends, {
            key: "activityCount",
            label: 'Respondent Percentage',
            value: `${(Number(_totalRespondents)/ Number(_totalParticipants)) *100}%`
         }]
    }

    const _dataset = {
        activityCount: get(data, 'activityCount', 0),
        totalParticipants: get(data, 'totalParticipants', 0),
        totalRespondents: get(data, 'totalRespondents', 0),
        results: get(data, 'results', []),
        evalCount: get(data, 'evalCount', 0),

    };



    return (
        <div style={{ border: '1px solid #e0e0e0', }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e0e0e0',
                    marginBottom: '20px',
                    // width: '100%',
                    padding: '0px 20px'
                }}
            >
                {_legends.map(column => (
                    <div key={column.key} style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
                        {`${column.label} : ${column.value}`}
                    </div>
                ))}
            </div>
            <div style={{ padding: '20px', }}>
                <HeatMapComponent participantsChange={_dataset} />
            </div>
        </div>


    )
}