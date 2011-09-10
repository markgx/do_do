(function() {
  var Todo, TodoView, Todos, todos;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        completed: false,
        starred: false,
        tags: [],
        dateCreated: new Date,
        dateCompleted: null,
        sortOrder: todos.nextSortOrder()
      };
    },
    descriptionPlusTags: function() {
      var description;
      description = this.get('description');
      if (this.get('tags').length > 0) {
        description += ' ' + _(this.get('tags')).map(function(t) {
          return "#" + t;
        }).join(' ');
      }
      return description;
    },
    parseTagsFromDescription: function() {
      var matches, tagMatches, tagString;
      matches = this.get('description').match(/[^#]+(#.*)+$/);
      if (matches) {
        this.set({
          'description': this.get('description').replace(matches[1], '').trim()
        });
        tagString = matches[1];
        tagMatches = tagString.match(/#([\w-])+/g);
        return this.set({
          tags: _(tagMatches).map(function(t) {
            return t.replace('#', '');
          })
        });
      }
    }
  });
  Todos = Backbone.Collection.extend({
    model: Todo,
    localStorage: new Store('todos'),
    comparator: function(todo) {
      return todo.get('sortOrder');
    },
    nextSortOrder: function() {
      if (this.length === 0) {
        return 0;
      } else {
        return this.last().get('sortOrder') + 1;
      }
    }
  });
  todos = new Todos;
  TodoView = Backbone.View.extend({
    tagName: 'li',
    events: {
      'click .star': 'toggleStarred',
      'click .completed': 'clickCompleted',
      'dblclick .description': 'editDescription',
      'keyup .edit-field': 'updateDescription',
      'blur .edit-field': 'updateDescription',
      'click .delete': 'deleteTodo',
      'mouseover': 'mouseOverTodo',
      'mouseout': 'mouseOutTodo'
    },
    render: function() {
      $(this.el).data('id', this.model.get('id'));
      $(this.el).html($('#todo-list-item').tmpl({
        starred: this.model.get('starred'),
        description: this.model.get('description'),
        tags: this.model.get('tags'),
        completed: this.model.get('completed'),
        dateCompleted: (this.model.get('dateCompleted') ? this.model.get('dateCompleted') : '')
      }));
      if (this.model.get('completed')) {
        $(this.el).addClass('completed');
      } else {
        $(this.el).removeClass('completed');
      }
      return $('.timeago').timeago();
    },
    toggleStarred: function() {
      this.model.set({
        starred: !this.model.get('starred')
      });
      this.model.save();
      return this.render();
    },
    clickCompleted: function(e) {
      var completed;
      completed = $(e.currentTarget).prop('checked');
      this.model.set({
        completed: completed
      });
      if (completed) {
        this.model.set({
          dateCompleted: (new Date).toISOString()
        });
      } else {
        this.model.set({
          dateCompleted: null
        });
      }
      this.model.save();
      return this.render();
    },
    editDescription: function() {
      var description;
      this.$('.description').addClass('hidden');
      this.$('.edit-field').val(this.model.descriptionPlusTags());
      this.$('.edit').removeClass('hidden');
      this.$('.edit-field').focus();
      description = this.$('.edit-field').val();
      this.$('.edit-field').val('');
      return this.$('.edit-field').val(description);
    },
    updateDescription: function(e) {
      if (e.type === 'focusout') {
        this._setDescription();
      } else if (e.type === 'keyup') {
        if (e.keyCode === 13) {
          return this._setDescription();
        } else if (e.keyCode === 27) {
          this.$('.edit').addClass('hidden');
          return this.$('.description').removeClass('hidden');
        }
      }
    },
    deleteTodo: function(e) {
      var view;
      e.preventDefault();
      view = this;
      return $('#dialog-confirm-delete').dialog({
        resizable: false,
        modal: true,
        buttons: {
          'Delete': function() {
            $(this).dialog('close');
            view.model.destroy();
            return $(view.el).slideUp(100, function() {
              return view.remove();
            });
          },
          'Cancel': function() {
            return $(this).dialog('close');
          }
        }
      });
    },
    mouseOverTodo: function() {
      this.$('.delete').removeClass('invisible');
      this.$('.move-handle').removeClass('invisible');
      if (!this.model.get('starred')) {
        return this.$('.star').css('opacity', 0.5);
      }
    },
    mouseOutTodo: function() {
      this.$('.delete').addClass('invisible');
      this.$('.move-handle').addClass('invisible');
      if (!this.model.get('starred')) {
        return this.$('.star').css('opacity', '');
      }
    },
    _setDescription: function() {
      var description;
      description = $.trim(this.$('.edit-field').val());
      this.model.set({
        description: description
      });
      this.model.parseTagsFromDescription();
      this.model.save();
      return this.render();
    }
  });
  window.AppView = Backbone.View.extend({
    initialize: function() {
      todos = new Todos;
      todos.bind('add', this.addTodo, this);
      todos.bind('reset', this.resetTodos, this);
      todos.fetch();
      this.$('#todos-list').sortable({
        handle: '.move-handle',
        revert: 200,
        update: __bind(function(e, ui) {
          var newTodos;
          newTodos = $.makeArray(this.$('#todos-list li')).reverse();
          _(newTodos).each(function(el, i) {
            var todo;
            todo = todos.get($(el).data('id'));
            todo.set({
              sortOrder: i
            });
            return todo.save();
          });
          return todos.sort({
            silent: true
          });
        }, this)
      });
      if (todos.length === 0) {
        return $('#empty-message').show();
      }
    },
    events: {
      'keyup #new-task-field': 'newTask'
    },
    newTask: function(e) {
      var $newTaskField, todo;
      $newTaskField = $(e.currentTarget);
      if (e.keyCode !== 13 || $newTaskField.val() === '') {
        return;
      }
      todo = new Todo({
        description: $newTaskField.val()
      });
      todo.parseTagsFromDescription();
      todos.create(todo);
      $newTaskField.val('');
      return $('#empty-message').hide();
    },
    addTodo: function(todo) {
      var el, todoView;
      todoView = new TodoView({
        model: todo
      });
      todoView.render();
      el = $(todoView.el);
      el.hide();
      $('#todos-list').prepend(el);
      return el.slideDown(100);
    },
    resetTodos: function() {
      return todos.each(__bind(function(todo) {
        return this.addTodo(todo);
      }, this));
    }
  });
}).call(this);
