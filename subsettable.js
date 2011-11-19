extend('Backbone.SubsettableCollection', {
  subset: function(filter) {
    // subset = new (Backbone.Collection.extend(this))(this.filter(filter));

    filter || (filter = function() { return true; });

    subset = _.extend(this);
    models = this.filter(filter);

    subset.reset(models);

    return subset;
  }
});
