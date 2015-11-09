var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Course = require('../models/course'),
    Module = require('../models/module');


var pageAble = function(req, res, next) {
    var data = res.locals.data;
    //console.log(data);
    if (data.length === 0 ) {
        res.status(204);
        return res.json([{success: false}]);
    }
    res.header('X-Total-Count', data.length);

    Course
        .find({"_id": {$in: data}})
        .skip(req.query._start)
        .limit(req.query._limit)
        .exec(function(err, courses) {
            if (err) throw err;
            console.log(courses);
            return res.json(courses);
        })
}

router.get('/', function(req, res, next) {
    var chain = Course.find().exec(function(err, courses) {
        res.locals.data = courses;
        next();
    });
}, pageAble );

router.get('/filter', function(req, res, next) {
    console.log("/filter");
    if (req.query.s) {
        var searchString = req.query.s.split(' '),
            regexString = "",
            q;

        for (var i = 0; i < searchString.length; i++)
        {
            regexString += searchString[i];
            if (i < searchString.length - 1) regexString += '|';
        }

        q = new RegExp(regexString, 'ig');
        Course
            .find()
            .or([{'name': {$regex: q}}, {'description': {$regex: q}}, {'schedule': {$regex: q}}])
            .select('-area -groups')
            .exec(function(err, courses) {
                res.locals.data = courses;
                next();
            })
            
    }
    if (req.query.area || req.query.group) {
        console.log("area group");
        var areaQ = [].concat(req.query.area ? req.query.area : []), 
            groupQ = [].concat(req.query.group ? req.query.group : []);

        var chain = Course.find();
        if (areaQ.length !== 0 && groupQ.length !== 0) {
            console.log("TWO");
            chain.and([{"area.name": {$in: areaQ}}, {"groups.name": {$in: groupQ}}])
        } else
        if (areaQ.length !== 0) {
            console.log("AREA");
            chain.where("area.name").in(areaQ)
        } else
        if (groupQ.length !== 0) {
            console.log("GROUP");
            chain.where("groups.name").in(groupQ)
        }
        chain.exec(function(err, courses) {
            if (err) throw err;
            res.locals.data = courses;
            next();
        })
    }
}, pageAble);

router.get('/:id', function(req, res) {
    Course
        .findById(req.params.id, function(err, course) {
            res.json(course);
        });
});
router.get('/:courseId/modules/:moduleId', function(req, res) {
    Module
        .findOne({"_course": req.params.courseId, "_id": req.params.moduleId})
        .populate('_course', '_id')
        .populate('_resources')
        .exec(function(error, module) {
            if (error) throw error
            res.json(module);
        })
});
router.get('/:id/modules', function(req, res) {
    console.log("match1");
    Module
        .find({'_course': req.params.id})
        .populate('_course', '_id')
        .sort({'_id': 1})
        .exec(function(error, modules) {
            res.json(modules);
        });
});


module.exports = router;