import { format } from 'date-fns'
import IconCheck from '../icons/IconCheck'
import IconClose from '../icons/IconClose'

export const toDateCell = ({ value }) => {
  if (value === '') return '-'
  return format(new Date(value), 'yyyy-MM-dd')
}

export const toLocaleCell = ({ value }) => {
  return value.toLocaleString()
}

export const arrayToDisplayValue = (mapping: NodeJS.Dict<string>) => {
  return ({ value }) => {
    return value.map((name: string) => mapping[name]).join(', ')
  }
}

export const toChipCell = ({ value }) => {
  return <div className="chip">{value}</div>
}

export const boolToIcon = ({ value }) => {
  if (value)
    return (
      <div className="confirmed">
        <IconCheck />
      </div>
    )
  else
    return (
      <div className="unconfirmed">
        <IconClose />
      </div>
    )
}

/**
 * Falls back the value to a different cell
 * if the primary value is falsy or equal
 * to the provided value (1st argument).
 *
 * @param ifValue The value to compare
 * @param column Alternative column to use
 * @returns
 */
export const toOtherCell = (ifValue: string, column: string) => {
  return ({
    cell: {
      row: { original }
    },
    value
  }) => {
    if ((value === ifValue || !value) && original[column]) {
      return original[column]
    }
    return value
  }
}

/**
 * Join two or more cells together
 * using a separator
 *
 */
export const toJoinCells = (accessors: string[], separator = ' ') => {
  return ({
    cell: {
      row: { original }
    },
    value
  }) => {
    return accessors
      .map((name) => {
        return original[name]
      })
      .join(separator)
  }
}

export const toOwnerCell = ({
  cell: {
    row: { original }
  },
  value
}) => {
  if (value) {
    return value
  }

  let chip = 'Application'

  if (original.team) {
    chip = original.team.name
  }

  if (original.organisation) {
    chip = original.organisation.name
  }

  return <div className="chip chip-primary">{chip}</div>
}

export const toMapImage = ({ value }) => {
  return (
    <div className="map-preview">
      <img
        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${value.coordinates[1]},${value.coordinates[0]},15,0,0/400x200?access_token=pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhNWtweTBkcW8yd29idG9xems4aGIifQ.VfUo8YBLvfuqfMlBMfGn5g`}
        alt=""
      />
    </div>
  )
}
