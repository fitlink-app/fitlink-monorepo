import { useState } from 'react'
import IconClose from '../icons/IconClose'
import IconUpload from '../icons/IconUpload'

export default function ImportUsers() {
  const [users, setUsers] = useState([])

  const loadPreview = (e) => {
    const reader = new FileReader()
    reader.onload = function () {
      let str: string = reader.result as string
      str = str.replace('\r', '')
      const lines = str.split('\n')
      const result = []
      const headers = lines[0].split(',')
      for (let i = 1; i < lines.length; i++) {
        var obj = {}
        var currentline = lines[i].split(',')
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j].replace('\r', '')
        }
        result.push(obj)
      }
      setUsers(result)
    }
    reader.readAsBinaryString(e.target.files[0])
  }

  const removeRow = (index) => {
    const edited = users
      .slice(0, index)
      .concat(users.slice(index + 1, users.length))
    setUsers(edited)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="light mb-3">Bulk invite users to your team</h4>
      <p>Upload a CSV file with the following structure:</p>
      <code className="block">
        <pre>
          <strong>firstName,lastName,email</strong>
          <br />
          Daryl,Owens,d.owens@myco.com
          <br />
          Derek,Clark,d.clark@myco.com
          <br />
          ...
        </pre>
      </code>
      <div className="basic-file-select">
        <input type="file" id="image" onChange={loadPreview} accept=".csv" />
        <IconUpload />
        <label htmlFor="image">Upload a CSV file</label>
      </div>
      {users.length > 0 && (
        <table className="static-table static-table--roomy mt-4">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((r, i) => (
              <tr key={`row${i}`}>
                <td>{r.firstName}</td>
                <td>{r.lastName}</td>
                <td>{r.email}</td>
                <td className="text-right">
                  <div className="delete-row" onClick={() => removeRow(i)}>
                    <IconClose />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="text-right mt-2">
        <button className="button">Invite users</button>
      </div>
    </form>
  )
}
