// Not sure where to put this note yet but putting it here for now
// because it wasted 24 hours of my life.
//
// If you have multiple different subset collections of a single superset
// and change a model such that it moves between them, the @remove@ event
// can be triggered after the @add@ event (because the @change@ event is
// triggered for each subset in an abritrary order, and it will trigger a
// @add@ event in one and a @remove@ event in another). Since a @remove@
// event in a collection will trigger the model's @remove@ event (as it should),
// *ALL* views that are listening for that event on that model will be fired,
// even if the view represents the collection to which we are adding the model.
// The consequence of this is that all views representing the changed models
// are removed from the DOM, even though they are still in the collection.
//
// To avoid this, make sure your view's event listeners check the collection
// from which the event originated before actually removing the view.
extend('Backbone.SubsettableCollection', {
  subset: function(filter) {
    filter || (filter = function() { return true; });

    var B = window.Backbone || window.vendor.Backbone;
    var _ = window._        || B._;


    Object.getPrototypeOf || (Object.getPrototypeOf = function(obj) {
      return obj.__proto__ || obj.constructor.prototype;
    });

    var constructor = function(obj) {
      return obj.constructor || Object.getPrototypeOf(obj).constructor;
    }

    var superset = this;
    var Subset   = constructor(superset);
    var subset   = new Subset(superset.filter(filter));

    _.bindAll(subset, 'add', 'remove');
    var add    = subset.add;
    var remove = subset.remove;

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
        var matches    = filter(model),
            inSuperset = superset.contains(model),
            inSubset   = subset.contains(model);

        if(inSuperset) {
          if(!matches && inSubset) {
            remove(model, options);
          }
        } else {
          remove(model, options);
        }
      });
    };

    var reset = function(collection) {
      subset.reset(collection.models);
    };

    var change = function(model) {
      var matches = filter(model);

      if(matches && !subset.contains(model)) {
        subset.add(model);
        return;
      }

      if(!matches && subset.contains(model)) {
        subset.remove(model);
        return;
      }
    };

    superset.bind('change', change,        subset);
    superset.bind('add',    subset.add,    subset);
    superset.bind('remove', subset.remove, subset);
    superset.bind('reset',  reset,         subset);

    return subset;
  }
});
