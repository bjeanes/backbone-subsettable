extend('Backbone.SubsettableCollection', {
  subset: function(filter) {
    filter || (filter = function() { return true; });

    var superset    = this;
    var SubsetClass = Backbone.Collection.extend(superset);
    var subset      = new SubsetClass(superset.filter(filter));

    subset.add = function(models, options) {
      models = _.isArray(models) ? models : [models];

      _.each(models, function(model) {
        if(superset.contains(model) && filter(model)) {
          subset._add(model, options);
        }
      });
    };

    subset.remove = function(models, options) {
      models = _.isArray(models) ? models : [models];

      _.each(models, function(model) {
        subset._remove(model, options);
      });
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

    return subset;
  }
});
