const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'solar_app_',
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const mongoConnectionStatus = new client.Gauge({
  name: 'mongo_connection_status',
  help: 'MongoDB connection status (1=connected, 0=disconnected)',
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(mongoConnectionStatus);



// ---------------- HTTP Metrics Middleware ----------------
app.use((req, res, next) => {
  // مسیر را به‌شکل منطقی لیبل کنیم
  const routePath = req.route?.path || req.path || 'unknown';

  // اگر خود /metrics باشد، می‌توانیم از اندازه‌گیری حذفش کنیم (اختیاری)
  if (routePath === '/metrics') {
    return next();
  }

  // شروع تایمر برای latency
  const end = httpRequestDurationSeconds.startTimer({
    method: req.method,
    route: routePath,
  });

  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: routePath,
      status_code: res.statusCode,
    };

    // افزایش Counter
    httpRequestsTotal.inc(labels);

    // ثبت مدت زمان
    end({ status_code: res.statusCode });
  });

  next();
});




mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ Mongo connection error:', err); process.exit(1); });
var Schema = mongoose.Schema;

var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

mongoose.connection.on('connected', () => {
  mongoConnectionStatus.set(1);
});

mongoose.connection.on('disconnected', () => {
  mongoConnectionStatus.set(0);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
  mongoConnectionStatus.set(0);
});


var planetModel = mongoose.model('planets', dataSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())

app.post('/planet', async (req, res) => {
  try {
    // console.log("Received Planet ID " + req.body.id);
    const planetData = await planetModel.findOne({ id: req.body.id });

    if (!planetData) {
      // در صورتی که داده‌ای پیدا نشد
      return res.status(404).send("Ooops, We only have 9 planets and a sun. Select a number from 0 - 9");
    }

    // اگر پیدا شد، داده را ارسال کن
    res.json(planetData);
  } catch (err) {
    console.error("Error in Planet Data:", err);
    res.status(500).send("Error in Planet Data");
  }
});

app.get('/',   async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});


app.get('/os',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
})

app.get('/live',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
})

app.get('/ready',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
})

// ---------------- /metrics endpoint ----------------
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error('Error generating metrics:', err);
    res.status(500).end();
  }
});


app.listen(3000, () => {
    console.log("Server successfully running on port - " +3000);
})


module.exports = app;