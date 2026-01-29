# sugarchat backend
creating rooms, users, and messages all require a curl request. unfortunately, i forgot what i wrote in this codebase but everything should be well structured, and comments are there for more complex requests.

messages contain a webkit functionality.

# usage
you'll need a [postgresql](https://www.postgresql.org/) server and you'll have to add it in your .env file
```.env
DATABASE_URL="postgresql://username:passsword@X.X.X.X:XXXX/sugarchatdb"
```
then you can run the server using 
```bash
npm run dev
```

it's missing a few things like read ticks, sending attachments, and most importantly an interface to use it all.
all of the requests should be done in the terminal, like this
```bash
curl -X PUT http://[SUGARCHAT BACKEND]:1300/users/ -H "Content-Type: application/json" -d '{"username":"[USERNAME]","password":"[PASSWORD]","displayName":"[DISPLAYNAME]"}'
```
to create an user

# features
- websocket
- sql database
- prisma schema
- password hashing
