import HeatMapComponent from "./HeatMapComponent";
import { get } from 'lodash';


export default function App() {
    const searchParams = new URLSearchParams(window.location.search);
    const dataParam = searchParams.get('data');


    const data = JSON.parse(dataParam);
    let  legends = get(data, 'legends', [])

    if (legends && legends.length > 0) {

        const _totalParticipants = legends.find(item => item.key === 'totalParticipants').value
        const _totalRespondents = legends.find(item => item.key === 'totalRespondents').value

        legends = [...legends, {
            key: "activityCount",
            label: 'Respondent Percentage',
            value: `${(Number(_totalRespondents) / Number(_totalParticipants)) * 100}%`
        }]
    }
 
    return (
        <div style= {{ height: "500px"}}>
     
            <div style={{ border: '1px solid #e0e0e0', }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #e0e0e0',
                        marginBottom: '20px',
                        // width: '100%',
                        padding: '0px 20px',
                        fontSize: '24px',
                    }}
                >
                    {legends.map(column => (
                        <div   key={column.key} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '14px', }}>
                            {`${column.label} : ${column.value}`}
                        </div>
                    ))}
                </div>
                <div style={{ padding: '20px', fontSize: "14px"}}>
                    <HeatMapComponent participantsChange={{ results: get(data, 'results', []),}} />
                </div>
            </div>
        </div>


    )
}