import cors from 'cors'
import express from 'express'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import JsonToTS from 'json-to-ts'

const app = express()

app.use(cors())
app.use(express.json({ limit: 52428800 }))

app.get('/wc3-ui-edits.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript')
    res.send(readFileSync(__dirname + '/dev.js'))
})

// Keep track of messageType formats
{
    if (!existsSync('./log/messageTypes/')) {
        mkdirSync('./log/messageTypes/')
    }

    let messageTypes: { [x: string]: { json: string; ts: string } } = {}

    app.post('/postMessage', (req, res) => {
        const targetType = req.body.messageType
        const oldTypes = messageTypes[targetType]?.ts

        messageTypes = {
            ...messageTypes,
            [targetType]: { json: req.body, ts: JsonToTS(req.body, { rootName: 'events' }).join('\n') },
        }

        if (oldTypes !== messageTypes[targetType].ts) {
            writeFileSync(`./log/messageTypes/${targetType}.ts`, messageTypes[targetType].ts)
            writeFileSync(
                `./log/messageTypes/${targetType}.json`,
                JSON.stringify(messageTypes[targetType].json, null, 4)
            )
        }

        res.send('OK')
    })
}

app.listen(8080, () => {
    console.log('Listening on 8080')
})
