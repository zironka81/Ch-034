define(function(require) {
    "use strict";

    var CMS = require("CMS"),
        ManagementView = require("./managementView"),
        Model = require("../models/managementModel"),
    View = CMS.View.extend({
        template: _.template(require("text!../templates/managementsTemplate.html")),
        events: {
            "click #managementAddButton": "addManagement",
        },

        serialize: function() {
            return {
                management: this.collection,
                name      : this.name,
                title     : this.title,
            };
        },

        initialize: function() {
            this.listenTo(this.collection, "sync request change", this.render, this);
        },

        beforeRender: function(){
            this.collection.each(this.renderOne, this);
        },

        afterRender: function(){
            this.$el.find("#" + this.name).addClass("active").find("a").addClass("active");
        },

        renderOne: function(el){
            switch (this.name) {
                case "courses":
                    this.child = {
                        name     : "модулі",
                        hrefPart : "modules"
                    };
                    break;
                case "modules":
                    this.child = {
                        name     : "тести",
                        hrefPart : "tests"
                    };
                    break;
                case "tests":
                    this.child = {
                        name     : "питання",
                        hrefPart : "questions"
                    };
                    break;
                default:
                    this.child = "";
                    break;
            }
            this.insertView("#managementlist", new ManagementView({
                model: el,
                kind: this.name,
                child: this.child
            }));
        },

        addManagement: function () {
            var managementName = _.escape(this.$el.find("#managementAddInput").val());
            if(!managementName) return;
            var management= new Model({name: managementName });
            management.url = this.collection.url();
            management.save();
            this.collection.fetch({reset:true});
        }
     });

    return View;
});
