var createError = require("http-errors");
var express = require("express");
var bodyparser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var methodOverride = require("method-override");
var axios = require("axios");



var indexRouter = require("./src/routes/index");
var infoRouter = require("./src/routes/info");
var detailRouter = require("./src/routes/detail");
var logRouter = require("./src/routes/log");
var findRRRouter = require("./src/routes/findRR");


var app = express();

app.use(methodOverride("_method"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.json());
app.use(express.json({limit: '1000mb'}));
app.use(express.urlencoded({limit: '1000mb', extended: false}));


app.use("/", indexRouter);
app.use("/info", infoRouter);
app.use("/detail", detailRouter);
app.use("/log", logRouter);
app.use("/findRR", findRRRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;