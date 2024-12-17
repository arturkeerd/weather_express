const { rejects } = require('assert')
const { render } = require('ejs')
const express = require('express')
const path = require('path')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const key = 'a45eed51515e95ce07fc38c41b486155' // API key
let city = 'Tartu'

const getWeatherData = (city) => {
    return new Promise((resolve, reject) => {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
        fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            let description = data.weather[0].description
            let city = data.name
            let temp = Math.round(parseFloat(data.main.temp) - 273.15)
            const result = {
                description: description,
                city: city,
                temp: temp,
                error: null
            }
            resolve(result)
        })
        .catch(error => {
            reject(error)
        })
    })
}

app.all('/', (req, res) => {
    let city
    if (req.method == 'GET'){
        city ='Tartu'
    } else if (req.method =='POST'){
        let error = req.body.cityname.trim().length == 0 ?'Yout input is empty' : null
        if (error !== 0) {
        res.render('index', {
            error:error
        })
    }
        return
     } else {
        city = req.body.cityname
    }
    getWeatherData(city)
    .then((data) => {
        res.render('index', data)
    })
    .catch(error => {
        res.render('index', {
            error: 'Problem with getting data, try again...'
        })
    })
})

app.listen(3005)