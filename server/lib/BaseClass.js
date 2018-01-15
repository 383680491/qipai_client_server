/**
 *  类管理器器
 */
var ClassManager = {
    id : (0|(Math.random()*998)),

    instanceId : (0|(Math.random()*998)),

    getNewID : function(){
        return this.id++;
    },

    getNewInstanceId : function(){
        return this.instanceId++;
    }
};

//
// 2) Using "extend" subclassing
// Simple JavaScript Inheritance By John Resig http://ejohn.org/
//创建一个初始化类
var Class = function(){};

//实现类继承接口
Class.extend = function (prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    var initializing = true;
    var prototype = Object.create(_super);
    initializing = false;
    var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function (name, fn) {
                return function () {
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name]) :
            prop[name];
    }

    // The dummy class constructor
    function Class() {
        // All construction is actually done in the init method
        if (!initializing) {
            if (this.ctor) {
                this.ctor.apply(this, arguments);
            }
        }
    }

    var classId = ClassManager.getNewID();
    ClassManager[classId] = _super;
    var desc = { writable: true, enumerable: false, configurable: true };
    Class.id = classId;
    desc.value = classId;
    Object.defineProperty(prototype, '__pid', desc);

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
};

/*
 * 类方法定义
 */
var BaseClass = Class.extend({

    /**new 对象 会调用的构造函数
     *
     */
    ctor:function(){

        var argList = Array.prototype.slice.call(arguments)
        this.JS_Name = "BaseClass";

        this.Init.apply(this, argList);
    },

    //初始化
    Init:function(){

    },
});
module.exports = BaseClass;