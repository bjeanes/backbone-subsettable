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

    var toArray = function(items) {
      items = _.isArray(items) ? items : [items];
      return _(items);
    };

    var superset = this;

    var Subset = superset.constructor.extend({
      add: function(models, options) {
        var self = this;
        toArray(models).each(function(model) {
          if(superset.contains(model) && filter(model)) {
            superset.add.call(self, model, options);
          }
        });
      },

      remove: function(models, options) {
        var self = this;
        toArray(models).each(function(model) {
          var matches    = filter(model),
              inSuperset = superset.contains(model),
              inSubset   = subset.contains(model);

          if(inSuperset) {
            if(!matches && inSubset) {
              superset.remove.call(self, model, options);
            }
          } else {
            superset.remove.call(self, model, options);
          }
        });
      }
    });

    var subset = new Subset(superset.filter(filter));

    // TODO: Optimization:
    //   - Add second parameter to the @subset@
    //     method that is an array of attributes
    //     to listen to. If present, we only bind
    //     to the @change:<attribute>@ events for
    //     each attribute, instead of any change.
    superset.bind('change', function(model) {
      var matches = filter(model);

      if(matches && !subset.contains(model)) {
        subset.add(model);
        return;
      }

      if(!matches && subset.contains(model)) {
        subset.remove(model);
        return;
      }
    }, subset);

    superset.bind('add',    subset.add,    subset);
    superset.bind('remove', subset.remove, subset);
    superset.bind('reset', function(collection) {
      subset.reset(collection.models);
    }, subset);

    return subset;
  }
});
