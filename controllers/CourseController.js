var _ = require('underscore');

var CourseModel = require('../models/CourseModel.js');
var UserModel = require('../models/UserModel.js');

/**
* CourseController.js
*
* @description :: Server-side logic for managing courses.
*/
module.exports = {

  /**
  * CourseController.list()
  */
  list: function(req, res) {
    CourseModel.find({
      client: req.user.client
    }).populate('term registrations location').exec(function(err, courses){
      if(err) {
        return res.json(500, {
          message: 'Error getting course.',
          error: err
        });
      }
      var sorted = courses.sort(function(x, y) {
        var XstartDate = x.term.start_date;
        var YstartDate = y.term.start_date;;
        if (XstartDate === YstartDate) {
          if (x.name === y.name) {
            return 0;
          }
          return x.name > y.name ? 1 : -1;
        }
        return XstartDate > YstartDate ? -1 : 1;
      });

      return res.json(sorted);
    });
  },

  /**
  * CourseController.show()
  */
  show: function(req, res) {
    var id = req.params.id;
    CourseModel.findOne({
      _id: id,
      client: req.user.client
    }).populate('term registrations location').exec(function(err, course){
      if(err) {
        return res.json(500, {
          message: 'Error getting course.',
          error: err
        });
      }
      if(!course) {
        return res.json(404, {
          message: 'No such course'
        });
      }
      return res.json(course);
    });
  },

  /**
  * CourseController.create()
  */
  create: function(req, res) {
    UserModel.findOne({
      _id: req.user.id
    }).populate('client').exec(function(err, currentUser) {
      var course = new CourseModel({
        name : req.body.name,
        term : req.body.term._id,
        days : req.body.days,
        seats : req.body.seats,
        textbook: req.body.textbook,
        videos: req.body.videos,
        cost: req.body.cost,
        location : req.body.location._id,
        client: currentUser.client._id
      });

      course.save(function(err, course) {
        if(err) {
          return res.json(500, {
            message: 'Error saving course',
            error: err
          });
        }
        course.populate('location term').populate(function(err, course) {
          return res.json(200, course);
        });
      });
    });
  },

  /**
  * CourseController.update()
  */
  update: function(req, res) {
    var id = req.params.id;
    CourseModel.findOne({
      _id: id,
      client: req.user.client
    }, function(err, course){
      if(err) {
        return res.json(500, {
          message: 'Error saving course',
          error: err
        });
      }
      if(!course) {
        return res.json(404, {
          message: 'No such course'
        });
      }

      var adminAttributes = [
        'name',
        'session',
        'client',
        'days',
        'seats',
        'holidays',
        'grades',
        'textbook',
        'videos',
        'cost',
        'term'
      ];

      var instructorAttributes = [
        'grades',
        'videos'
      ];

      if (req.user.is_admin) {
        _.each(adminAttributes, function(attr) {
          course[attr] =  req.body[attr] ? req.body[attr] : course[attr];
        });
        course.location =  req.body.location._id ? req.body.location._id : course.location;
      } else {
        _.each(instructorAttributes, function(attr) {
          course[attr] =  req.body[attr] ? req.body[attr] : course[attr];
        });
      }

      course.registrations = req.body.registrations ? _.map(req.body.registrations, '_id') : course.registrations;

      course.save(function(err, course){
        if(err) {
          return res.json(500, {
            message: 'Error getting course.',
            error: err
          });
        }
        if(!course) {
          return res.json(404, {
            message: 'No such course'
          });
        }
        course.populate('registrations location term').populate(function(err, course) {
          return res.json(course);
        });
      });
    });
  },

  /**
  * CourseController.remove()
  */
  remove: function(req, res) {
    var id = req.params.id;
    CourseModel.remove({
      client: req.user.client,
      _id: id
    }, function(err, course){
      if(err) {
        return res.json(500, {
          message: 'Error getting course.',
          error: err
        });
      }
      return res.json(course);
    });
  },

  /**
  * CourseController.screencasts()
  */
  screencasts: function(req, res) {
    _.each(req.body, function(screencast) {
      CourseModel.findOne({ _id: screencast.course_id }, function(err, course) {
        if(err) {
          return res.json(500, {
            message: 'Error finding course',
            error: err
          });
        }
        if (course) {
          if (!course.videos) {
            course.videos = [];
          }
          course.videos.push({
            youtubeId: screencast.youtubeId,
            link: screencast.link,
            timestamp: screencast.timestamp
          });
          course.save();
        }
      });
    });
  return res.json(req.body);
},

  /**
  * CourseController.register()
  */
  register: function(req, res) {
    var id = req.params.id;
    CourseModel.findOne({
      _id: id,
      client: req.user.client
    }).populate('term registrations').exec(function(err, course){
      if(err) {
        return res.json(500, {
          message: 'Error saving course',
          error: err
        });
      }
      if(!course) {
        return res.json(404, {
          message: 'No such course'
        });
      }

      course.registrations = req.body.registrations ? _.map(req.body.registrations, '_id') : course.registrations;

      course.save(function(err, course){
        if(err) {
          return res.json(500, {
            message: 'Error getting course.',
            error: err
          });
        }
        if(!course) {
          return res.json(404, {
            message: 'No such course'
          });
        }
        course.populate('registrations').populate(function(err, course) {
          return res.json(course);
        });
      });
    });
  }
};
