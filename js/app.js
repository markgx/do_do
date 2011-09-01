var DoDoContainerView = Backbone.View.extend({
  events: {
    'keyup #new-task-field': 'newTask'
  },

  newTask: function(e) {
    if (e.keyCode !== 13) {
      return;
    }

    var $newTaskField = $(e.currentTarget);
    var li = $('#todo-list-item').tmpl({ taskText: $newTaskField.val() });
    $('#todos-list').append(li);
    $newTaskField.val('');

    // TODO: persist
  }
});

window.app = {
  views: {},

  init: function() {
    app.views.containerView = new DoDoContainerView({ el: $('#dodo-container') });
  }
};
