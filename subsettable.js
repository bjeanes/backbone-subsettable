extend('Backbone.SubsettableCollection', {
  subset: function(filter) {
    filter || (filter = function() { return true; });

    var B = window.Backbone || window.vendor.Backbone;
    var _ = window._        || B._;

    var superset = this;
    var subset   = new superset.__proto__.constructor(superset.filter(filter)); // nicer way?

    _.bindAll(subset, 'add', 'remove', 'reset');
    var add    = subset.add;
    var remove = subset.remove;
    var reset  = subset.reset;

    var flattenedEach = function(items, fn) {
      items = _.isArray(items) ? items : [items];
      _.each(items, fn);
    };

    subset.add = function(models, options) {
      flattenedEach(models, function(model) {
        if(superset.contains(model) && filter(model)) {
          add(model, options);
        }
      });
    };

    subset.remove = function(models, options) {
      flattenedEach(models, function(model) {
        if(!(superset.contains(model) && filter(model))) {
          remove(model, options);
        }
      });
    };

    subset.reset = function(collection) {
      reset(collection.models);
    };

    var change = function(model) {
      var matches = filter(model);

      if(matches && !subset.contains(model)) {
        subset.add(model);
      } else {
        subset.remove(model);
      }
    };

    superset.bind('change', change,        subset);
    superset.bind('add',    subset.add,    subset);
    superset.bind('remove', subset.remove, subset);
    superset.bind('reset',  subset.reset,  subset);
    superset.bind('all', function(event) {
      console.log("DEBUG superset event", event, arguments);
    });

    return subset;
  }
});
