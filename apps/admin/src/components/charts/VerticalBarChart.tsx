import { Bar } from 'react-chartjs-2'
import { ChartOptions } from './ChartOptions'

const options = JSON.parse(JSON.stringify(ChartOptions))
options.scales.y.ticks.beginAtZero = true

type VerticalBarChartProps = {
  data: {
    labels: string[]
    values: number[]
  }
}

const VerticalBarChart = ({ data }: VerticalBarChartProps) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Number of activities',
        data: data.values,
        backgroundColor: [
          'rgba(0, 233, 215, 0.5)',
          'rgba(0, 174, 232, 0.5)',
          'rgba(90, 139, 209, 0.5)',
          'rgba(126, 105, 168, 0.5)',
          'rgba(134, 74, 118, 0.5)'
        ],
        borderColor: [
          'rgba(0, 233, 215, 1)',
          'rgba(0, 174, 232, 1)',
          'rgba(90, 139, 209, 1)',
          'rgba(126, 105, 168, 1)',
          'rgba(134, 74, 118, 1)'
        ],
        borderRadius: [16, 16, 16, 16, 16],
        borderWidth: 1
      }
    ]
  }

  return <Bar data={chartData} options={options} type="bar" />
}

export default VerticalBarChart
