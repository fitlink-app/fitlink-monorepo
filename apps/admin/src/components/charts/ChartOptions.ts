export const ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      titleFont: {
        family: "'Lato', sans-serif",
      },
      titleColor: '#232323',
      titleAlign: 'center',
      titleMarginBottom: 2,
      bodyFont: {
        family: "'Lato', sans-serif",
      },
      bodyColor: '#232323',
      bodyAlign: 'center',
      xPadding: '0.5rem',
      yPadding: '0.5rem',
      caretPadding: 6,
      footerSpacing: 0,
      displayColors: false,
      borderWidth: 1,
      borderColor: '#555555',
      yAlign: 'bottom',
      padding: 8,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#939393',
        font: {
          family: "'Lato', sans-serif",
        },
      },
    },
    y: {
      ticks: {
        color: '#939393',
        font: {
          family: "'Lato', sans-serif",
        },
      },
    },
  },
}