/* bootstrap database in your FaunaDB account */
const faunadb = require('faunadb')
const q = faunadb.query



/* idempotent operation */
function setupFaunaDB(key) {

  console.log('Creating the schema!')
  const client = new faunadb.Client({
    secret: key
  })

  /* Based on your requirements, change the schema here */

  return client.query(
      q.CreateCollection({
        name: "users"
      }))
    .then(() => client.query(
      q.Do(
        q.CreateCollection({
          name: "posts",
          permissions: {
            create: q.Class("users")
          }
        })
      )))
    .then(() => client.query(
      q.Do(
        q.CreateIndex({
          name: 'users_by_id',
          source: q.Class("users"),
          terms: [{
            field: ['data', 'id']
          }],
          unique: true
        }),
        q.CreateIndex({
          // this index is optional but useful in development for browsing users
          name: `all_users`,
          source: q.Collection("users")
        }),
        q.CreateIndex({
          name: "all_posts",
          source: q.Collection("posts"),
          permissions: {
            read: q.Collection("users")
          }
        })
      )
    ))
    .then(console.log("built db schema"))
    .catch((e) => {
      if (e.message === 'instance not unique') {
        console.log("schema already created... skipping");
      } else {
        console.error(e)
        throw e
      }
    })
}

setupFaunaDB("")
.then(resp => console.log(resp))
.catch(err => console.error(err))