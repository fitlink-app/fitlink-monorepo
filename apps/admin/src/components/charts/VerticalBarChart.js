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
        'rgba(132, 220, 198, 0.5)',
        'rgba(172, 215, 236, 0.5)',
        'rgba(139, 149, 201, 0.5)',
        'rgba(153, 102, 255, 0.5)',
      ],
      borderColor: [
        'rgba(0, 233, 215, 1)',
        'rgba(132, 220, 198, 1)',
        'rgba(172, 215, 236, 1)',
        'rgba(139, 149, 201, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderRadius: [
        16, 16, 16, 16, 16
      ],
      borderWidth: 1,
    },
  ],
}

let options = ChartOptions
options.scales.y.ticks.beginAtZero = true

const VerticalBar = () => (
  <Bar data={data} options={options} />
)

export default VerticalBar