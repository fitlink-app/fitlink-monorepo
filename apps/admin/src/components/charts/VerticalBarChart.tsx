import { Bar } from 'react-chartjs-2'
import { ChartOptions } from './ChartOptions'

const data = {
  labels: ['Running', 'Cycling', 'Walking', 'Swimming', 'Yoga'],
  datasets: [
    {
      label: 'Number of activities',
      data: [124, 111, 98, 12, 3],
      backgroundColor: [
        'rgba(0, 233, 215, 0.5)',
        'rgba(0, 174, 232, 0.5)',
        'rgba(90, 139, 209, 0.5)',
        'rgba(126, 105, 168, 0.5)',
        'rgba(134, 74, 118, 0.5)',
      ],
      borderColor: [
        'rgba(0, 233, 215, 1)',
        'rgba(0, 174, 232, 1)',
        'rgba(90, 139, 209, 1)',
        'rgba(126, 105, 168, 1)',
        'rgba(134, 74, 118, 1)',
      ],
      borderRadius: [
        16, 16, 16, 16, 16
      ],
      borderWidth: 1,
    },
  ],
}

const options = JSON.parse(JSON.stringify(ChartOptions))
options.scales.y.ticks.beginAtZero = true

const VerticalBarChart = () => (
  <Bar data={data} options={options} type="bar" />
)

export default VerticalBarChart