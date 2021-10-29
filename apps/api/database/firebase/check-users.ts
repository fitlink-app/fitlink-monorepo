import { readFile } from 'fs/promises'
;(async function () {
  ;(JSON.parse((await readFile(__dirname + '/users.json')).toString())
    .users as any)
    .filter(
      (e) => (!e.photoUrl || e.photoUrl.indexOf('robohash') === -1) && e.email
    )
    .map((e) => {
      console.log(e)
    })
})()
