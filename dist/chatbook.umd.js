(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source);

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`'
  };

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Built-in value references. */
  var Symbol$1 = root.Symbol;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * The inverse of `_.escape`; this method converts the HTML entities
   * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to
   * their corresponding characters.
   *
   * **Note:** No other HTML entities are unescaped. To unescape additional
   * HTML entities use a third-party library like [_he_](https://mths.be/he).
   *
   * @static
   * @memberOf _
   * @since 0.6.0
   * @category String
   * @param {string} [string=''] The string to unescape.
   * @returns {string} Returns the unescaped string.
   * @example
   *
   * _.unescape('fred, barney, &amp; pebbles');
   * // => 'fred, barney, & pebbles'
   */
  function unescape(string) {
    string = toString(string);
    return (string && reHasEscapedHtml.test(string))
      ? string.replace(reEscapedHtml, unescapeHtmlChar)
      : string;
  }

  var lodash_unescape = unescape;

  /**
   * lodash 3.0.0 (Custom Build) <https://lodash.com/>
   * Build: `lodash modern modularize exports="npm" -o ./`
   * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
   * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
   * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   * Available under MIT license <https://lodash.com/license>
   */

  /** Used to match template delimiters. */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  var lodash__reinterpolate = reInterpolate;

  /**
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */


  /** Used as references for various `Number` constants. */
  var INFINITY$1 = 1 / 0;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      symbolTag$1 = '[object Symbol]',
      undefinedTag = '[object Undefined]';

  /** Used to match HTML entities and HTML characters. */
  var reUnescapedHtml = /[&<>"']/g,
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g;

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /** Detect free variable `global` from Node.js. */
  var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf$1(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar = basePropertyOf$1(htmlEscapes);

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$1.toString;

  /** Built-in value references. */
  var Symbol$2 = root$1.Symbol,
      symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
      symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : undefined;

  /**
   * By default, the template delimiters used by lodash are like those in
   * embedded Ruby (ERB) as well as ES2015 template strings. Change the
   * following template settings to use alternative delimiters.
   *
   * @static
   * @memberOf _
   * @type {Object}
   */
  var templateSettings = {

    /**
     * Used to detect `data` property values to be HTML-escaped.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'escape': reEscape,

    /**
     * Used to detect code to be evaluated.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'evaluate': reEvaluate,

    /**
     * Used to detect `data` property values to inject.
     *
     * @memberOf _.templateSettings
     * @type {RegExp}
     */
    'interpolate': lodash__reinterpolate,

    /**
     * Used to reference the data object in the template text.
     *
     * @memberOf _.templateSettings
     * @type {string}
     */
    'variable': '',

    /**
     * Used to import variables into the compiled template.
     *
     * @memberOf _.templateSettings
     * @type {Object}
     */
    'imports': {

      /**
       * A reference to the `lodash` function.
       *
       * @memberOf _.templateSettings.imports
       * @type {Function}
       */
      '_': { 'escape': escape }
    }
  };

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString$1(value);
  }

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString$1(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString$1) + '';
    }
    if (isSymbol$1(value)) {
      return symbolToString$1 ? symbolToString$1.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
  }

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString$1(value) {
    return nativeObjectToString.call(value);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike$1(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol$1(value) {
    return typeof value == 'symbol' ||
      (isObjectLike$1(value) && baseGetTag(value) == symbolTag$1);
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString$1(value) {
    return value == null ? '' : baseToString$1(value);
  }

  /**
   * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
   * corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional
   * characters use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value. See
   * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * When working with HTML you should always
   * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
   * XSS vectors.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
  function escape(string) {
    string = toString$1(string);
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }

  var lodash_templatesettings = templateSettings;

  var lodash_template = createCommonjsModule(function (module, exports) {
  /**
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */


  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      asyncTag = '[object AsyncFunction]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      domExcTag = '[object DOMException]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      nullTag = '[object Null]',
      objectTag = '[object Object]',
      proxyTag = '[object Proxy]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      undefinedTag = '[object Undefined]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /**
   * Used to match
   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule && freeModule.require && freeModule.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString.call(Object);

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined,
      Symbol = root.Symbol,
      getPrototype = overArg(Object.getPrototypeOf, Object),
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
      nativeKeys = overArg(Object.keys, Object),
      nativeMax = Math.max,
      nativeNow = Date.now;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + '');
  }

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
        ? (length--, customizer)
        : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  /**
   * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
   * of source objects to the destination object for all destination properties
   * that resolve to `undefined`.
   *
   * @private
   * @param {*} objValue The destination value.
   * @param {*} srcValue The source value.
   * @param {string} key The key of the property to assign.
   * @param {Object} object The parent object of `objValue`.
   * @returns {*} Returns the value to assign.
   */
  function customDefaultsAssignIn(objValue, srcValue, key, object) {
    if (objValue === undefined ||
        (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
      return srcValue;
    }
    return objValue;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

    return value === proto;
  }

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = shortOut(baseSetToString);

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  /**
   * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
   * `SyntaxError`, `TypeError`, or `URIError` object.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
   * @example
   *
   * _.isError(new Error);
   * // => true
   *
   * _.isError(Error);
   * // => false
   */
  function isError(value) {
    if (!isObjectLike(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == errorTag || tag == domExcTag ||
      (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString.call(Ctor) == objectCtorString;
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * This method is like `_.assignIn` except that it accepts `customizer`
   * which is invoked to produce the assigned values. If `customizer` returns
   * `undefined`, assignment is handled by the method instead. The `customizer`
   * is invoked with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @alias extendWith
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} sources The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @returns {Object} Returns `object`.
   * @see _.assignWith
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignInWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
    copyObject(source, keysIn(source), object, customizer);
  });

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  /**
   * Creates a compiled template function that can interpolate data properties
   * in "interpolate" delimiters, HTML-escape interpolated data properties in
   * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
   * properties may be accessed as free variables in the template. If a setting
   * object is given, it takes precedence over `_.templateSettings` values.
   *
   * **Note:** In the development build `_.template` utilizes
   * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
   * for easier debugging.
   *
   * For more information on precompiling templates see
   * [lodash's custom builds documentation](https://lodash.com/custom-builds).
   *
   * For more information on Chrome extension sandboxes see
   * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The template string.
   * @param {Object} [options={}] The options object.
   * @param {RegExp} [options.escape=_.templateSettings.escape]
   *  The HTML "escape" delimiter.
   * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
   *  The "evaluate" delimiter.
   * @param {Object} [options.imports=_.templateSettings.imports]
   *  An object to import into the template as free variables.
   * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
   *  The "interpolate" delimiter.
   * @param {string} [options.sourceURL='templateSources[n]']
   *  The sourceURL of the compiled template.
   * @param {string} [options.variable='obj']
   *  The data object variable name.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Function} Returns the compiled template function.
   * @example
   *
   * // Use the "interpolate" delimiter to create a compiled template.
   * var compiled = _.template('hello <%= user %>!');
   * compiled({ 'user': 'fred' });
   * // => 'hello fred!'
   *
   * // Use the HTML "escape" delimiter to escape data property values.
   * var compiled = _.template('<b><%- value %></b>');
   * compiled({ 'value': '<script>' });
   * // => '<b>&lt;script&gt;</b>'
   *
   * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
   * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the internal `print` function in "evaluate" delimiters.
   * var compiled = _.template('<% print("hello " + user); %>!');
   * compiled({ 'user': 'barney' });
   * // => 'hello barney!'
   *
   * // Use the ES template literal delimiter as an "interpolate" delimiter.
   * // Disable support by replacing the "interpolate" delimiter.
   * var compiled = _.template('hello ${ user }!');
   * compiled({ 'user': 'pebbles' });
   * // => 'hello pebbles!'
   *
   * // Use backslashes to treat delimiters as plain text.
   * var compiled = _.template('<%= "\\<%- value %\\>" %>');
   * compiled({ 'value': 'ignored' });
   * // => '<%- value %>'
   *
   * // Use the `imports` option to import `jQuery` as `jq`.
   * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
   * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
   * compiled({ 'users': ['fred', 'barney'] });
   * // => '<li>fred</li><li>barney</li>'
   *
   * // Use the `sourceURL` option to specify a custom sourceURL for the template.
   * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
   * compiled(data);
   * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
   *
   * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
   * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
   * compiled.source;
   * // => function(data) {
   * //   var __t, __p = '';
   * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
   * //   return __p;
   * // }
   *
   * // Use custom template delimiters.
   * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
   * var compiled = _.template('hello {{ user }}!');
   * compiled({ 'user': 'mustache' });
   * // => 'hello mustache!'
   *
   * // Use the `source` property to inline compiled templates for meaningful
   * // line numbers in error messages and stack traces.
   * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
   *   var JST = {\
   *     "main": ' + _.template(mainText).source + '\
   *   };\
   * ');
   */
  function template(string, options, guard) {
    // Based on John Resig's `tmpl` implementation
    // (http://ejohn.org/blog/javascript-micro-templating/)
    // and Laura Doktorova's doT.js (https://github.com/olado/doT).
    var settings = lodash_templatesettings.imports._.templateSettings || lodash_templatesettings;

    if (guard && isIterateeCall(string, options, guard)) {
      options = undefined;
    }
    string = toString(string);
    options = assignInWith({}, options, settings, customDefaultsAssignIn);

    var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
        importsKeys = keys(imports),
        importsValues = baseValues(imports, importsKeys);

    var isEscaping,
        isEvaluating,
        index = 0,
        interpolate = options.interpolate || reNoMatch,
        source = "__p += '";

    // Compile the regexp to match each delimiter.
    var reDelimiters = RegExp(
      (options.escape || reNoMatch).source + '|' +
      interpolate.source + '|' +
      (interpolate === lodash__reinterpolate ? reEsTemplate : reNoMatch).source + '|' +
      (options.evaluate || reNoMatch).source + '|$'
    , 'g');

    // Use a sourceURL for easier debugging.
    // The sourceURL gets injected into the source that's eval-ed, so be careful
    // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
    // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
    var sourceURL = hasOwnProperty.call(options, 'sourceURL')
      ? ('//# sourceURL=' +
         (options.sourceURL + '').replace(/[\r\n]/g, ' ') +
         '\n')
      : '';

    string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);

      // Escape characters that can't be included in string literals.
      source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

      // Replace delimiters with snippets.
      if (escapeValue) {
        isEscaping = true;
        source += "' +\n__e(" + escapeValue + ") +\n'";
      }
      if (evaluateValue) {
        isEvaluating = true;
        source += "';\n" + evaluateValue + ";\n__p += '";
      }
      if (interpolateValue) {
        source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
      }
      index = offset + match.length;

      // The JS engine embedded in Adobe products needs `match` returned in
      // order to produce the correct `offset` value.
      return match;
    });

    source += "';\n";

    // If `variable` is not specified wrap a with-statement around the generated
    // code to add the data object to the top of the scope chain.
    // Like with sourceURL, we take care to not check the option's prototype,
    // as this configuration is a code injection vector.
    var variable = hasOwnProperty.call(options, 'variable') && options.variable;
    if (!variable) {
      source = 'with (obj) {\n' + source + '\n}\n';
    }
    // Cleanup code by stripping empty strings.
    source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
      .replace(reEmptyStringMiddle, '$1')
      .replace(reEmptyStringTrailing, '$1;');

    // Frame code as the function body.
    source = 'function(' + (variable || 'obj') + ') {\n' +
      (variable
        ? ''
        : 'obj || (obj = {});\n'
      ) +
      "var __t, __p = ''" +
      (isEscaping
         ? ', __e = _.escape'
         : ''
      ) +
      (isEvaluating
        ? ', __j = Array.prototype.join;\n' +
          "function print() { __p += __j.call(arguments, '') }\n"
        : ';\n'
      ) +
      source +
      'return __p\n}';

    var result = attempt(function() {
      return Function(importsKeys, sourceURL + 'return ' + source)
        .apply(undefined, importsValues);
    });

    // Provide the compiled function's source by its `toString` method or
    // the `source` property as a convenience for inlining compiled templates.
    result.source = source;
    if (isError(result)) {
      throw result;
    }
    return result;
  }

  /**
   * Attempts to invoke `func`, returning either the result or the caught error
   * object. Any additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Util
   * @param {Function} func The function to attempt.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {*} Returns the `func` result or error object.
   * @example
   *
   * // Avoid throwing errors for invalid selectors.
   * var elements = _.attempt(function(selector) {
   *   return document.querySelectorAll(selector);
   * }, '>_>');
   *
   * if (_.isError(elements)) {
   *   elements = [];
   * }
   */
  var attempt = baseRest(function(func, args) {
    try {
      return apply(func, undefined, args);
    } catch (e) {
      return isError(e) ? e : new Error(e);
    }
  });

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  module.exports = template;
  });

  var marked = createCommonjsModule(function (module, exports) {
  (function(root) {

  /**
   * Block-Level Grammar
   */

  var block = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    fences: /^ {0,3}(`{3,}|~{3,})([^`~\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
    hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: '^ {0,3}(?:' // optional indentation
      + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
      + '|comment[^\\n]*(\\n+|$)' // (2)
      + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
      + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
      + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
      + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
      + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
      + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
      + ')',
    def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
    nptable: noop,
    table: noop,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
    text: /^[^\n]+/
  };

  block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit(block.def)
    .replace('label', block._label)
    .replace('title', block._title)
    .getRegex();

  block.bullet = /(?:[*+-]|\d{1,9}\.)/;
  block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
  block.item = edit(block.item, 'gm')
    .replace(/bull/g, block.bullet)
    .getRegex();

  block.list = edit(block.list)
    .replace(/bull/g, block.bullet)
    .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
    .replace('def', '\\n+(?=' + block.def.source + ')')
    .getRegex();

  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
    + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
    + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
    + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
    + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
    + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?-->/;
  block.html = edit(block.html, 'i')
    .replace('comment', block._comment)
    .replace('tag', block._tag)
    .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
    .getRegex();

  block.paragraph = edit(block._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} +')
    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}|~{3,})[^`\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
    .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
    .getRegex();

  block.blockquote = edit(block.blockquote)
    .replace('paragraph', block.paragraph)
    .getRegex();

  /**
   * Normal Block Grammar
   */

  block.normal = merge({}, block);

  /**
   * GFM Block Grammar
   */

  block.gfm = merge({}, block.normal, {
    nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
    table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
  });

  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */

  block.pedantic = merge({}, block.normal, {
    html: edit(
      '^ *(?:comment *(?:\\n|\\s*$)'
      + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
      + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
      .replace('comment', block._comment)
      .replace(/tag/g, '(?!(?:'
        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
        + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
        + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
      .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
    fences: noop, // fences not supported
    paragraph: edit(block.normal._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' *#{1,6} *[^\n]')
      .replace('lheading', block.lheading)
      .replace('blockquote', ' {0,3}>')
      .replace('|fences', '')
      .replace('|list', '')
      .replace('|html', '')
      .getRegex()
  });

  /**
   * Block Lexer
   */

  function Lexer(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);
    this.options = options || marked.defaults;
    this.rules = block.normal;

    if (this.options.pedantic) {
      this.rules = block.pedantic;
    } else if (this.options.gfm) {
      this.rules = block.gfm;
    }
  }

  /**
   * Expose Block Rules
   */

  Lexer.rules = block;

  /**
   * Static Lex Method
   */

  Lexer.lex = function(src, options) {
    var lexer = new Lexer(options);
    return lexer.lex(src);
  };

  /**
   * Preprocessing
   */

  Lexer.prototype.lex = function(src) {
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n');

    return this.token(src, true);
  };

  /**
   * Lexing
   */

  Lexer.prototype.token = function(src, top) {
    src = src.replace(/^ +$/gm, '');
    var next,
        loose,
        cap,
        bull,
        b,
        item,
        listStart,
        listItems,
        t,
        space,
        i,
        tag,
        l,
        isordered,
        istask,
        ischecked;

    while (src) {
      // newline
      if (cap = this.rules.newline.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[0].length > 1) {
          this.tokens.push({
            type: 'space'
          });
        }
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        var lastToken = this.tokens[this.tokens.length - 1];
        src = src.substring(cap[0].length);
        // An indented code block cannot interrupt a paragraph.
        if (lastToken && lastToken.type === 'paragraph') {
          lastToken.text += '\n' + cap[0].trimRight();
        } else {
          cap = cap[0].replace(/^ {4}/gm, '');
          this.tokens.push({
            type: 'code',
            codeBlockStyle: 'indented',
            text: !this.options.pedantic
              ? rtrim(cap, '\n')
              : cap
          });
        }
        continue;
      }

      // fences
      if (cap = this.rules.fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2] ? cap[2].trim() : cap[2],
          text: cap[3] || ''
        });
        continue;
      }

      // heading
      if (cap = this.rules.heading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if (cap = this.rules.nptable.exec(src)) {
        item = {
          type: 'table',
          header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          src = src.substring(cap[0].length);

          for (i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          for (i = 0; i < item.cells.length; i++) {
            item.cells[i] = splitCells(item.cells[i], item.header.length);
          }

          this.tokens.push(item);

          continue;
        }
      }

      // hr
      if (cap = this.rules.hr.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'hr'
        });
        continue;
      }

      // blockquote
      if (cap = this.rules.blockquote.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: 'blockquote_start'
        });

        cap = cap[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top);

        this.tokens.push({
          type: 'blockquote_end'
        });

        continue;
      }

      // list
      if (cap = this.rules.list.exec(src)) {
        src = src.substring(cap[0].length);
        bull = cap[2];
        isordered = bull.length > 1;

        listStart = {
          type: 'list_start',
          ordered: isordered,
          start: isordered ? +bull : '',
          loose: false
        };

        this.tokens.push(listStart);

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        listItems = [];
        next = false;
        l = cap.length;
        i = 0;

        for (; i < l; i++) {
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) */, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic
              ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
              : item.replace(/^ {1,4}/gm, '');
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if (i !== l - 1) {
            b = block.bullet.exec(cap[i + 1])[0];
            if (bull.length > 1 ? b.length === 1
              : (b.length > 1 || (this.options.smartLists && b !== bull))) {
              src = cap.slice(i + 1).join('\n') + src;
              i = l - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);
          if (i !== l - 1) {
            next = item.charAt(item.length - 1) === '\n';
            if (!loose) loose = next;
          }

          if (loose) {
            listStart.loose = true;
          }

          // Check for task list items
          istask = /^\[[ xX]\] /.test(item);
          ischecked = undefined;
          if (istask) {
            ischecked = item[1] !== ' ';
            item = item.replace(/^\[[ xX]\] +/, '');
          }

          t = {
            type: 'list_item_start',
            task: istask,
            checked: ischecked,
            loose: loose
          };

          listItems.push(t);
          this.tokens.push(t);

          // Recurse.
          this.token(item, false);

          this.tokens.push({
            type: 'list_item_end'
          });
        }

        if (listStart.loose) {
          l = listItems.length;
          i = 0;
          for (; i < l; i++) {
            listItems[i].loose = true;
          }
        }

        this.tokens.push({
          type: 'list_end'
        });

        continue;
      }

      // html
      if (cap = this.rules.html.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize
            ? 'paragraph'
            : 'html',
          pre: !this.options.sanitizer
            && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]
        });
        continue;
      }

      // def
      if (top && (cap = this.rules.def.exec(src))) {
        src = src.substring(cap[0].length);
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        if (!this.tokens.links[tag]) {
          this.tokens.links[tag] = {
            href: cap[2],
            title: cap[3]
          };
        }
        continue;
      }

      // table (gfm)
      if (cap = this.rules.table.exec(src)) {
        item = {
          type: 'table',
          header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          src = src.substring(cap[0].length);

          for (i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          for (i = 0; i < item.cells.length; i++) {
            item.cells[i] = splitCells(
              item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
              item.header.length);
          }

          this.tokens.push(item);

          continue;
        }
      }

      // lheading
      if (cap = this.rules.lheading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1]
        });
        continue;
      }

      // top-level paragraph
      if (top && (cap = this.rules.paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'paragraph',
          text: cap[1].charAt(cap[1].length - 1) === '\n'
            ? cap[1].slice(0, -1)
            : cap[1]
        });
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }

      if (src) {
        throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    return this.tokens;
  };

  /**
   * Inline-Level Grammar
   */

  var inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noop,
    tag: '^comment'
      + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
      + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
      + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
      + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
      + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
    nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
    strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
    em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noop,
    text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
  };

  // list of punctuation marks from common mark spec
  // without ` and ] to workaround Rule 17 (inline code blocks/links)
  inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
  inline.em = edit(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit(inline.autolink)
    .replace('scheme', inline._scheme)
    .replace('email', inline._email)
    .getRegex();

  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

  inline.tag = edit(inline.tag)
    .replace('comment', block._comment)
    .replace('attribute', inline._attribute)
    .getRegex();

  inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

  inline.link = edit(inline.link)
    .replace('label', inline._label)
    .replace('href', inline._href)
    .replace('title', inline._title)
    .getRegex();

  inline.reflink = edit(inline.reflink)
    .replace('label', inline._label)
    .getRegex();

  /**
   * Normal Inline Grammar
   */

  inline.normal = merge({}, inline);

  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge({}, inline.normal, {
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
    link: edit(/^!?\[(label)\]\((.*?)\)/)
      .replace('label', inline._label)
      .getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
      .replace('label', inline._label)
      .getRegex()
  });

  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge({}, inline.normal, {
    escape: edit(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^~+(?=\S)([\s\S]*?\S)~+/,
    text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
  });

  inline.gfm.url = edit(inline.gfm.url, 'i')
    .replace('email', inline.gfm._extended_email)
    .getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge({}, inline.gfm, {
    br: edit(inline.br).replace('{2,}', '*').getRegex(),
    text: edit(inline.gfm.text)
      .replace('\\b_', '\\b_| {2,}\\n')
      .replace(/\{2,\}/g, '*')
      .getRegex()
  });

  /**
   * Inline Lexer & Compiler
   */

  function InlineLexer(links, options) {
    this.options = options || marked.defaults;
    this.links = links;
    this.rules = inline.normal;
    this.renderer = this.options.renderer || new Renderer();
    this.renderer.options = this.options;

    if (!this.links) {
      throw new Error('Tokens array requires a `links` property.');
    }

    if (this.options.pedantic) {
      this.rules = inline.pedantic;
    } else if (this.options.gfm) {
      if (this.options.breaks) {
        this.rules = inline.breaks;
      } else {
        this.rules = inline.gfm;
      }
    }
  }

  /**
   * Expose Inline Rules
   */

  InlineLexer.rules = inline;

  /**
   * Static Lexing/Compiling Method
   */

  InlineLexer.output = function(src, links, options) {
    var inline = new InlineLexer(links, options);
    return inline.output(src);
  };

  /**
   * Lexing/Compiling
   */

  InlineLexer.prototype.output = function(src) {
    var out = '',
        link,
        text,
        href,
        title,
        cap,
        prevCapZero;

    while (src) {
      // escape
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += escape(cap[1]);
        continue;
      }

      // tag
      if (cap = this.rules.tag.exec(src)) {
        if (!this.inLink && /^<a /i.test(cap[0])) {
          this.inLink = true;
        } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
          this.inLink = false;
        }
        if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.inRawBlock = true;
        } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.inRawBlock = false;
        }

        src = src.substring(cap[0].length);
        out += this.options.sanitize
          ? this.options.sanitizer
            ? this.options.sanitizer(cap[0])
            : escape(cap[0])
          : cap[0];
        continue;
      }

      // link
      if (cap = this.rules.link.exec(src)) {
        var lastParenIndex = findClosingBracket(cap[2], '()');
        if (lastParenIndex > -1) {
          var linkLen = 4 + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = '';
        }
        src = src.substring(cap[0].length);
        this.inLink = true;
        href = cap[2];
        if (this.options.pedantic) {
          link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          } else {
            title = '';
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }
        href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
        out += this.outputLink(cap, {
          href: InlineLexer.escapes(href),
          title: InlineLexer.escapes(title)
        });
        this.inLink = false;
        continue;
      }

      // reflink, nolink
      if ((cap = this.rules.reflink.exec(src))
          || (cap = this.rules.nolink.exec(src))) {
        src = src.substring(cap[0].length);
        link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = this.links[link.toLowerCase()];
        if (!link || !link.href) {
          out += cap[0].charAt(0);
          src = cap[0].substring(1) + src;
          continue;
        }
        this.inLink = true;
        out += this.outputLink(cap, link);
        this.inLink = false;
        continue;
      }

      // strong
      if (cap = this.rules.strong.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
        continue;
      }

      // em
      if (cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]));
        continue;
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.codespan(escape(cap[2].trim(), true));
        continue;
      }

      // br
      if (cap = this.rules.br.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.br();
        continue;
      }

      // del (gfm)
      if (cap = this.rules.del.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.del(this.output(cap[1]));
        continue;
      }

      // autolink
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === '@') {
          text = escape(this.mangle(cap[1]));
          href = 'mailto:' + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out += this.renderer.link(href, null, text);
        continue;
      }

      // url (gfm)
      if (!this.inLink && (cap = this.rules.url.exec(src))) {
        if (cap[2] === '@') {
          text = escape(cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          do {
            prevCapZero = cap[0];
            cap[0] = this.rules._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);
          text = escape(cap[0]);
          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }
        src = src.substring(cap[0].length);
        out += this.renderer.link(href, null, text);
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        if (this.inRawBlock) {
          out += this.renderer.text(this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]);
        } else {
          out += this.renderer.text(escape(this.smartypants(cap[0])));
        }
        continue;
      }

      if (src) {
        throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    return out;
  };

  InlineLexer.escapes = function(text) {
    return text ? text.replace(InlineLexer.rules._escapes, '$1') : text;
  };

  /**
   * Compile Link
   */

  InlineLexer.prototype.outputLink = function(cap, link) {
    var href = link.href,
        title = link.title ? escape(link.title) : null;

    return cap[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(cap[1]))
      : this.renderer.image(href, title, escape(cap[1]));
  };

  /**
   * Smartypants Transformations
   */

  InlineLexer.prototype.smartypants = function(text) {
    if (!this.options.smartypants) return text;
    return text
      // em-dashes
      .replace(/---/g, '\u2014')
      // en-dashes
      .replace(/--/g, '\u2013')
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
      // closing singles & apostrophes
      .replace(/'/g, '\u2019')
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
      // closing doubles
      .replace(/"/g, '\u201d')
      // ellipses
      .replace(/\.{3}/g, '\u2026');
  };

  /**
   * Mangle Links
   */

  InlineLexer.prototype.mangle = function(text) {
    if (!this.options.mangle) return text;
    var out = '',
        l = text.length,
        i = 0,
        ch;

    for (; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }

    return out;
  };

  /**
   * Renderer
   */

  function Renderer(options) {
    this.options = options || marked.defaults;
  }

  Renderer.prototype.code = function(code, infostring, escaped) {
    var lang = (infostring || '').match(/\S*/)[0];
    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return '<pre><code>'
        + (escaped ? code : escape(code, true))
        + '</code></pre>';
    }

    return '<pre><code class="'
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '</code></pre>\n';
  };

  Renderer.prototype.blockquote = function(quote) {
    return '<blockquote>\n' + quote + '</blockquote>\n';
  };

  Renderer.prototype.html = function(html) {
    return html;
  };

  Renderer.prototype.heading = function(text, level, raw, slugger) {
    if (this.options.headerIds) {
      return '<h'
        + level
        + ' id="'
        + this.options.headerPrefix
        + slugger.slug(raw)
        + '">'
        + text
        + '</h'
        + level
        + '>\n';
    }
    // ignore IDs
    return '<h' + level + '>' + text + '</h' + level + '>\n';
  };

  Renderer.prototype.hr = function() {
    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
  };

  Renderer.prototype.list = function(body, ordered, start) {
    var type = ordered ? 'ol' : 'ul',
        startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
    return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
  };

  Renderer.prototype.listitem = function(text) {
    return '<li>' + text + '</li>\n';
  };

  Renderer.prototype.checkbox = function(checked) {
    return '<input '
      + (checked ? 'checked="" ' : '')
      + 'disabled="" type="checkbox"'
      + (this.options.xhtml ? ' /' : '')
      + '> ';
  };

  Renderer.prototype.paragraph = function(text) {
    return '<p>' + text + '</p>\n';
  };

  Renderer.prototype.table = function(header, body) {
    if (body) body = '<tbody>' + body + '</tbody>';

    return '<table>\n'
      + '<thead>\n'
      + header
      + '</thead>\n'
      + body
      + '</table>\n';
  };

  Renderer.prototype.tablerow = function(content) {
    return '<tr>\n' + content + '</tr>\n';
  };

  Renderer.prototype.tablecell = function(content, flags) {
    var type = flags.header ? 'th' : 'td';
    var tag = flags.align
      ? '<' + type + ' align="' + flags.align + '">'
      : '<' + type + '>';
    return tag + content + '</' + type + '>\n';
  };

  // span level renderer
  Renderer.prototype.strong = function(text) {
    return '<strong>' + text + '</strong>';
  };

  Renderer.prototype.em = function(text) {
    return '<em>' + text + '</em>';
  };

  Renderer.prototype.codespan = function(text) {
    return '<code>' + text + '</code>';
  };

  Renderer.prototype.br = function() {
    return this.options.xhtml ? '<br/>' : '<br>';
  };

  Renderer.prototype.del = function(text) {
    return '<del>' + text + '</del>';
  };

  Renderer.prototype.link = function(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }
    var out = '<a href="' + escape(href) + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  };

  Renderer.prototype.image = function(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }

    var out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
  };

  Renderer.prototype.text = function(text) {
    return text;
  };

  /**
   * TextRenderer
   * returns only the textual part of the token
   */

  function TextRenderer() {}

  // no need for block level renderers

  TextRenderer.prototype.strong =
  TextRenderer.prototype.em =
  TextRenderer.prototype.codespan =
  TextRenderer.prototype.del =
  TextRenderer.prototype.text = function(text) {
    return text;
  };

  TextRenderer.prototype.link =
  TextRenderer.prototype.image = function(href, title, text) {
    return '' + text;
  };

  TextRenderer.prototype.br = function() {
    return '';
  };

  /**
   * Parsing & Compiling
   */

  function Parser(options) {
    this.tokens = [];
    this.token = null;
    this.options = options || marked.defaults;
    this.options.renderer = this.options.renderer || new Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.slugger = new Slugger();
  }

  /**
   * Static Parse Method
   */

  Parser.parse = function(src, options) {
    var parser = new Parser(options);
    return parser.parse(src);
  };

  /**
   * Parse Loop
   */

  Parser.prototype.parse = function(src) {
    this.inline = new InlineLexer(src.links, this.options);
    // use an InlineLexer with a TextRenderer to extract pure text
    this.inlineText = new InlineLexer(
      src.links,
      merge({}, this.options, { renderer: new TextRenderer() })
    );
    this.tokens = src.reverse();

    var out = '';
    while (this.next()) {
      out += this.tok();
    }

    return out;
  };

  /**
   * Next Token
   */

  Parser.prototype.next = function() {
    this.token = this.tokens.pop();
    return this.token;
  };

  /**
   * Preview Next Token
   */

  Parser.prototype.peek = function() {
    return this.tokens[this.tokens.length - 1] || 0;
  };

  /**
   * Parse Text Tokens
   */

  Parser.prototype.parseText = function() {
    var body = this.token.text;

    while (this.peek().type === 'text') {
      body += '\n' + this.next().text;
    }

    return this.inline.output(body);
  };

  /**
   * Parse Current Token
   */

  Parser.prototype.tok = function() {
    switch (this.token.type) {
      case 'space': {
        return '';
      }
      case 'hr': {
        return this.renderer.hr();
      }
      case 'heading': {
        return this.renderer.heading(
          this.inline.output(this.token.text),
          this.token.depth,
          unescape(this.inlineText.output(this.token.text)),
          this.slugger);
      }
      case 'code': {
        return this.renderer.code(this.token.text,
          this.token.lang,
          this.token.escaped);
      }
      case 'table': {
        var header = '',
            body = '',
            i,
            row,
            cell,
            j;

        // header
        cell = '';
        for (i = 0; i < this.token.header.length; i++) {
          cell += this.renderer.tablecell(
            this.inline.output(this.token.header[i]),
            { header: true, align: this.token.align[i] }
          );
        }
        header += this.renderer.tablerow(cell);

        for (i = 0; i < this.token.cells.length; i++) {
          row = this.token.cells[i];

          cell = '';
          for (j = 0; j < row.length; j++) {
            cell += this.renderer.tablecell(
              this.inline.output(row[j]),
              { header: false, align: this.token.align[j] }
            );
          }

          body += this.renderer.tablerow(cell);
        }
        return this.renderer.table(header, body);
      }
      case 'blockquote_start': {
        body = '';

        while (this.next().type !== 'blockquote_end') {
          body += this.tok();
        }

        return this.renderer.blockquote(body);
      }
      case 'list_start': {
        body = '';
        var ordered = this.token.ordered,
            start = this.token.start;

        while (this.next().type !== 'list_end') {
          body += this.tok();
        }

        return this.renderer.list(body, ordered, start);
      }
      case 'list_item_start': {
        body = '';
        var loose = this.token.loose;
        var checked = this.token.checked;
        var task = this.token.task;

        if (this.token.task) {
          body += this.renderer.checkbox(checked);
        }

        while (this.next().type !== 'list_item_end') {
          body += !loose && this.token.type === 'text'
            ? this.parseText()
            : this.tok();
        }
        return this.renderer.listitem(body, task, checked);
      }
      case 'html': {
        // TODO parse inline content if parameter markdown=1
        return this.renderer.html(this.token.text);
      }
      case 'paragraph': {
        return this.renderer.paragraph(this.inline.output(this.token.text));
      }
      case 'text': {
        return this.renderer.paragraph(this.parseText());
      }
      default: {
        var errMsg = 'Token with "' + this.token.type + '" type was not found.';
        if (this.options.silent) {
          console.log(errMsg);
        } else {
          throw new Error(errMsg);
        }
      }
    }
  };

  /**
   * Slugger generates header id
   */

  function Slugger() {
    this.seen = {};
  }

  /**
   * Convert string to unique id
   */

  Slugger.prototype.slug = function(value) {
    var slug = value
      .toLowerCase()
      .trim()
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
      .replace(/\s/g, '-');

    if (this.seen.hasOwnProperty(slug)) {
      var originalSlug = slug;
      do {
        this.seen[originalSlug]++;
        slug = originalSlug + '-' + this.seen[originalSlug];
      } while (this.seen.hasOwnProperty(slug));
    }
    this.seen[slug] = 0;

    return slug;
  };

  /**
   * Helpers
   */

  function escape(html, encode) {
    if (encode) {
      if (escape.escapeTest.test(html)) {
        return html.replace(escape.escapeReplace, function(ch) { return escape.replacements[ch]; });
      }
    } else {
      if (escape.escapeTestNoEncode.test(html)) {
        return html.replace(escape.escapeReplaceNoEncode, function(ch) { return escape.replacements[ch]; });
      }
    }

    return html;
  }

  escape.escapeTest = /[&<>"']/;
  escape.escapeReplace = /[&<>"']/g;
  escape.replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }

  function edit(regex, opt) {
    regex = regex.source || regex;
    opt = opt || '';
    return {
      replace: function(name, val) {
        val = val.source || val;
        val = val.replace(/(^|[^\[])\^/g, '$1');
        regex = regex.replace(name, val);
        return this;
      },
      getRegex: function() {
        return new RegExp(regex, opt);
      }
    };
  }

  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      try {
        var prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase();
      } catch (e) {
        return null;
      }
      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }
    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }
    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }
    return href;
  }

  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (/^[^:]+:\/*[^/]*$/.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }
    base = baseUrls[' ' + base];

    if (href.slice(0, 2) === '//') {
      return base.replace(/:[\s\S]*/, ':') + href;
    } else if (href.charAt(0) === '/') {
      return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
    } else {
      return base + href;
    }
  }
  var baseUrls = {};
  var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

  function noop() {}
  noop.exec = noop;

  function merge(obj) {
    var i = 1,
        target,
        key;

    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }

  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    var row = tableRow.replace(/\|/g, function(match, offset, str) {
          var escaped = false,
              curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/),
        i = 0;

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push('');
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
  }

  // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
  // /c*$/ is vulnerable to REDOS.
  // invert: Remove suffix of non-c chars instead. Default falsey.
  function rtrim(str, c, invert) {
    if (str.length === 0) {
      return '';
    }

    // Length of suffix matching the invert condition.
    var suffLen = 0;

    // Step left until we fail to match the invert condition.
    while (suffLen < str.length) {
      var currChar = str.charAt(str.length - suffLen - 1);
      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }

    return str.substr(0, str.length - suffLen);
  }

  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }
    var level = 0;
    for (var i = 0; i < str.length; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;
        if (level < 0) {
          return i;
        }
      }
    }
    return -1;
  }

  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  }

  /**
   * Marked
   */

  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }

    if (callback || typeof opt === 'function') {
      if (!callback) {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      var highlight = opt.highlight,
          tokens,
          pending,
          i = 0;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      pending = tokens.length;

      var done = function(err) {
        if (err) {
          opt.highlight = highlight;
          return callback(err);
        }

        var out;

        try {
          out = Parser.parse(tokens, opt);
        } catch (e) {
          err = e;
        }

        opt.highlight = highlight;

        return err
          ? callback(err)
          : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;

      if (!pending) return done();

      for (; i < tokens.length; i++) {
        (function(token) {
          if (token.type !== 'code') {
            return --pending || done();
          }
          return highlight(token.text, token.lang, function(err, code) {
            if (err) return done(err);
            if (code == null || code === token.text) {
              return --pending || done();
            }
            token.text = code;
            token.escaped = true;
            --pending || done();
          });
        })(tokens[i]);
      }

      return;
    }
    try {
      if (opt) opt = merge({}, marked.defaults, opt);
      checkSanitizeDeprecation(opt);
      return Parser.parse(Lexer.lex(src, opt), opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if ((opt || marked.defaults).silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }
  }

  /**
   * Options
   */

  marked.options =
  marked.setOptions = function(opt) {
    merge(marked.defaults, opt);
    return marked;
  };

  marked.getDefaults = function() {
    return {
      baseUrl: null,
      breaks: false,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      highlight: null,
      langPrefix: 'language-',
      mangle: true,
      pedantic: false,
      renderer: new Renderer(),
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartLists: false,
      smartypants: false,
      xhtml: false
    };
  };

  marked.defaults = marked.getDefaults();

  /**
   * Expose
   */

  marked.Parser = Parser;
  marked.parser = Parser.parse;

  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;

  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;

  marked.InlineLexer = InlineLexer;
  marked.inlineLexer = InlineLexer.output;

  marked.Slugger = Slugger;

  marked.parse = marked;

  {
    module.exports = marked;
  }
  })();
  });

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  var BLOCK_COMMENT = /\/\*.*?\*\//g;
  var INLINE_COMMENT = /^\/\/.*(\r\n?|\n)/g;
  var IS_EXTERNAL_URL = /^\w+:\/\/\/?\w/i;
  var LINK_PATTERN = /\[\[(.*?)\]\]/g;

  var findStory = function findStory(win) {
    if (win && win.story) {
      return win.story;
    }

    return {
      state: {}
    };
  };

  var nomark = function nomark(s) {
    return s;
  };

  var renderPassage = function renderPassage(passage) {
    var source = passage.source;
    var story = passage.story;
    var markup = passage.hasTag("system") || passage.hasTag("no-markdown") ? nomark : marked;
    var result = lodash_template(source)({
      state: story.state
    });

    if (passage) {
      // remove links if set previously
      passage.links = [];
    } // remove comments


    result = result.replace(BLOCK_COMMENT, "").replace(INLINE_COMMENT, ""); // [[links]]

    result = result.replace(LINK_PATTERN, function (match, t) {
      var display = t;
      var target = t; // display|target format

      var barIndex = t.indexOf("|");
      var rightArrIndex = t.indexOf("->");
      var leftArrIndex = t.indexOf("<-");

      switch (true) {
        case barIndex >= 0:
          display = t.substr(0, barIndex);
          target = t.substr(barIndex + 1);
          break;

        case rightArrIndex >= 0:
          display = t.substr(0, rightArrIndex);
          target = t.substr(rightArrIndex + 2);
          break;

        case leftArrIndex >= 0:
          display = t.substr(leftArrIndex + 2);
          target = t.substr(0, leftArrIndex);
          break;
      } // render an external link & stop?


      if (IS_EXTERNAL_URL.test(target)) {
        return '<a href="' + target + '">' + display + "</a>";
      } // handle passage


      if (passage) {
        passage.links.push({
          display: display,
          target: target
        });
      }

      return ""; // render nothing if it's a twee link
    }); // if prompt tag is set, notify the story

    if (passage) {
      var prompts = passage.prefixTag("prompt");

      if (prompts.length) {
        passage.story.prompt(prompts[0]);
      }
    } // if this is a multiline item, trim, split, and mark each item
    // return the array


    if (passage.hasTag("multiline")) {
      result = result.trim();
      return result.split(/[\r\n]+/g).map(function (line) {
        return markup(line);
      });
    } // if a single item, and the system tag is set, fence the block


    if (passage.hasTag("system")) {
      result = "<pre><code>".concat(result.trim(), "</code></pre>");
    } // else returns an array of 1


    return [markup(result)];
  };

  var Passage = function Passage(id, name, tags, source, story) {
    var _this = this;

    classCallCheck(this, Passage);

    defineProperty(this, "id", null);

    defineProperty(this, "name", null);

    defineProperty(this, "tags", null);

    defineProperty(this, "tagDict", {});

    defineProperty(this, "source", null);

    defineProperty(this, "links", []);

    defineProperty(this, "getSpeaker", function () {
      var speakerTag = _this.tags.find(function (t) {
        return t.indexOf("speaker-") === 0;
      }) || "";

      var systemTag = _this.hasTag("system");

      if (speakerTag) return speakerTag.replace(/^speaker-/, "");
      if (systemTag) return "system";
      return null;
    });

    defineProperty(this, "prefixTag", function (pfx, asDict) {
      return _this.tags.filter(function (t) {
        return t.indexOf("".concat(pfx, "-")) === 0;
      }).map(function (t) {
        return t.replace("".concat(pfx, "-"), "");
      }).reduce(function (a, t) {
        if (asDict) return _objectSpread({}, a, defineProperty({}, t, 1));
        return [].concat(toConsumableArray(a), [t]);
      }, asDict ? {} : []);
    });

    defineProperty(this, "hasTag", function (t) {
      return _this.tagDict[t];
    });

    defineProperty(this, "render", function () {
      return renderPassage(_this);
    });

    this.id = id;
    this.name = name;
    this.tags = tags;
    this.source = lodash_unescape(source);
    this.story = story;
    this.tags.forEach(function (t) {
      return _this.tagDict[t] = 1;
    });
  };

  defineProperty(Passage, "render", function (str) {
    return renderPassage(new Passage(null, null, null, str, findStory(window || null)));
  });

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as references for various `Number` constants. */
  var INFINITY$2 = 1 / 0;

  /** `Object#toString` result references. */
  var symbolTag$2 = '[object Symbol]';

  /** Used to match HTML entities and HTML characters. */
  var reUnescapedHtml$1 = /[&<>"'`]/g,
      reHasUnescapedHtml$1 = RegExp(reUnescapedHtml$1.source);

  /** Used to map characters to HTML entities. */
  var htmlEscapes$1 = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };

  /** Detect free variable `global` from Node.js. */
  var freeGlobal$2 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf$2 = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$2 = freeGlobal$2 || freeSelf$2 || Function('return this')();

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf$2(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar$1 = basePropertyOf$2(htmlEscapes$1);

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$2 = objectProto$2.toString;

  /** Built-in value references. */
  var Symbol$3 = root$2.Symbol;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$2 = Symbol$3 ? Symbol$3.prototype : undefined,
      symbolToString$2 = symbolProto$2 ? symbolProto$2.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString$2(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isSymbol$2(value)) {
      return symbolToString$2 ? symbolToString$2.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike$2(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol$2(value) {
    return typeof value == 'symbol' ||
      (isObjectLike$2(value) && objectToString$2.call(value) == symbolTag$2);
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString$2(value) {
    return value == null ? '' : baseToString$2(value);
  }

  /**
   * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
   * their corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional
   * characters use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value. See
   * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * Backticks are escaped because in IE < 9, they can break out of
   * attribute values or HTML comments. See [#59](https://html5sec.org/#59),
   * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
   * [#133](https://html5sec.org/#133) of the
   * [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.
   *
   * When working with HTML you should always
   * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
   * XSS vectors.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
  function escape$1(string) {
    string = toString$2(string);
    return (string && reHasUnescapedHtml$1.test(string))
      ? string.replace(reUnescapedHtml$1, escapeHtmlChar$1)
      : string;
  }

  var lodash_escape = escape$1;

  var name = "chatbook";
  var version = "0.0.1";
  var description = "A modified Twine (Trialogue) engine specifically for chat conversations";
  var author = "Jakob Heuser <jakob+npm@felocity.com>";
  var license = "Apache-2.0";
  var repository = "github:jakobo/chatbook";
  var main = "index.js";
  var browser = "dist/chatbook.umd.js";
  var scripts = {
  	dev: "concurrently \"npm:watch\" \"npm:serve\"",
  	clean: "rm -rf dist/",
  	watch: "nodemon -L --ignore dist/ --exec yarn build",
  	build: "yarn clean && yarn build.rollup && yarn build.format && concurrently \"npm:build.test:*\"",
  	"build.rollup": "rollup -c -m inline",
  	"build.format": "node scripts/createTwine",
  	"build.test:onboarding": "yarn tweego -f ChatbookViewer -o ./examples/onboarding.html ./examples/onboarding.twee",
  	"build.test:onboarding.xml": "yarn tweego -f Chatbook -o ./examples/onboarding.min.html ./examples/onboarding.twee",
  	serve: "nodemon -L --watch build/ --exec node scripts/serve",
  	test: "echo \"Error: no test specified\" && exit 1",
  	tweego: "TWEEGO_PATH=./dist/Twine2 tweego"
  };
  var files = [
  	"dist"
  ];
  var browserslist = {
  	production: [
  		">0.2%",
  		"not dead",
  		"not op_mini all"
  	],
  	development: [
  		"last 1 chrome version",
  		"last 1 firefox version",
  		"last 1 safari version"
  	]
  };
  var dependencies = {
  	"@babel/runtime": "^7.5.5",
  	"lodash.escape": "^4.0.1",
  	"lodash.template": "^4.5.0",
  	"lodash.unescape": "^4.0.1",
  	marked: "^0.7.0"
  };
  var devDependencies = {
  	"@babel/cli": "^7.4.4",
  	"@babel/core": "^7.4.5",
  	"@babel/plugin-proposal-class-properties": "^7.5.5",
  	"@babel/plugin-proposal-object-rest-spread": "^7.5.5",
  	"@babel/plugin-transform-runtime": "^7.5.5",
  	"@babel/preset-env": "7.4.5",
  	concurrently: "^4.1.1",
  	extwee: "^1.5.0",
  	"fs-extra": "^8.1.0",
  	nodemon: "^1.19.1",
  	rollup: "^1.0.0",
  	"rollup-plugin-babel": "^4.2.0",
  	"rollup-plugin-commonjs": "^9.2.0",
  	"rollup-plugin-json": "^4.0.0",
  	"rollup-plugin-node-resolve": "^4.0.0",
  	"static-server": "^2.2.1"
  };
  var pkg = {
  	name: name,
  	"private": true,
  	version: version,
  	description: description,
  	author: author,
  	license: license,
  	repository: repository,
  	main: main,
  	browser: browser,
  	scripts: scripts,
  	files: files,
  	browserslist: browserslist,
  	dependencies: dependencies,
  	devDependencies: devDependencies
  };

  var TWEE_TEMPLATE = lodash_template("\n:: StoryTitle\n<%= story.title %>\n\n\n:: StoryData\n{\n\t\"ifid\": \"<%= story.ifid %>\",\n\t\"format\": \"Chatbook\",\n\t\"format-version\": \"<%= story.formatVersion %>\",\n\t\"start\": \"<%= story.start %>\",\n\t\"tag-colors\": <%= JSON.stringify(story.tags, null, 2) %>,\n\t\"zoom\": 1\n}\n\n<%= story.passages.join(\"\") %>\n");
  var PASSAGE_TEMPLATE = lodash_template("\n:: <%= passage.name %> [<%= passage.tags %>] {\"position\":\"<%= passage.position %>\",\"size\":\"<%= passage.size %>\"}\n<%= passage.contents %>\n\n\n");

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(source, true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  var selectPassages = "tw-passagedata";
  var selectCss = '*[type="text/twine-css"]';
  var selectJs = '*[type="text/twine-javascript"]';
  var selectActiveLink = "#user-response-panel a[data-passage]";
  var selectActiveButton = "#user-response-panel button[data-passage]";
  var selectActiveInput = "#user-response-panel input";
  var selectActive = ".chat-panel .active";
  var selectHistory = ".chat-panel .history";
  var selectResponses = "#user-response-panel";
  var typingIndicator = "#animation-container";
  var IS_NUMERIC = /^[\d]+$/;
  /**
   * Determine if a provided string contains only numbers
   * In the case of `pid` values for passages, this is true
   */

  var isNumeric = function isNumeric(d) {
    return IS_NUMERIC.test(d);
  };
  /**
   * Format a user passage (such as a response)
   */


  var USER_PASSAGE_TMPL = function USER_PASSAGE_TMPL(_ref) {
    var id = _ref.id,
        text = _ref.text;
    return "\n  <div class=\"chat-passage-wrapper\" data-speaker=\"you\">\n    <div class=\"chat-passage phistory\" data-speaker=\"you\" data-upassage=\"".concat(id, "\">\n      ").concat(text, "\n    </div>\n  </div>\n");
  };
  /**
   * Format a message from a non-user
   */


  var OTHER_PASSAGE_TMPL = function OTHER_PASSAGE_TMPL(_ref2) {
    var speaker = _ref2.speaker,
        tags = _ref2.tags,
        text = _ref2.text;
    return "\n  <div data-speaker=\"".concat(speaker, "\" class=\"chat-passage-wrapper ").concat(tags.join(" "), "\">\n    <div data-speaker=\"").concat(speaker, "\" class=\"chat-passage\">\n      ").concat(text, "\n    </div>\n  </div>\n");
  };
  /**
   * Forces a delay via promises in order to spread out messages
   */


  var delay =
  /*#__PURE__*/
  function () {
    var _ref3 = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee() {
      var t,
          _args = arguments;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              t = _args.length > 0 && _args[0] !== undefined ? _args[0] : 0;
              return _context.abrupt("return", new Promise(function (resolve) {
                return setTimeout(resolve, t);
              }));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function delay() {
      return _ref3.apply(this, arguments);
    };
  }(); // Find one/many nodes within a context. We [...findAll] to ensure we're cast as an array
  // not as a node list


  var find = function find(ctx, s) {
    return ctx.querySelector(s);
  };

  var findAll = function findAll(ctx, s) {
    return toConsumableArray(ctx.querySelectorAll(s)) || [];
  }; // export a story back to twee format


  var exportTwee = function exportTwee(s) {
    var storyData = find(s.document, "tw-storydata");
    var passages = findAll(s.document, "tw-passagedata");
    var story = {
      title: s.name,
      ifid: storyData.getAttribute("ifid"),
      formatVersion: pkg.version,
      start: s.passages[s.startsAt].id,
      tags: findAll(s.document, "tw-tag").reduce(function (a, t) {
        return _objectSpread$1({}, a, defineProperty({}, t.getAttribute("name"), t.getAttribute("color")));
      }, {}),
      passages: []
    }; // our output story

    passages.forEach(function (p) {
      // <tw-passagedata pid="1" name="gql references" tags="system prologue" position="25,125" size="200,100">
      var passage = {
        name: p.getAttribute("name"),
        tags: p.getAttribute("tags"),
        position: p.getAttribute("position"),
        size: p.getAttribute("size"),
        contents: lodash_unescape(p.innerHTML)
      };
      var block = PASSAGE_TEMPLATE({
        passage: passage
      });
      story.passages.push(block);
    });
    console.log(TWEE_TEMPLATE({
      story: story
    }));
  };
  /**
   * Standard Twine Format Story Object
   */


  var Story = function Story(win, src) {
    var _this = this;

    classCallCheck(this, Story);

    defineProperty(this, "version", 2);

    defineProperty(this, "document", null);

    defineProperty(this, "story", null);

    defineProperty(this, "name", "");

    defineProperty(this, "creator", "");

    defineProperty(this, "creatorVersion", "");

    defineProperty(this, "startsAt", 0);

    defineProperty(this, "history", []);

    defineProperty(this, "current", 0);

    defineProperty(this, "state", {});

    defineProperty(this, "passages", {});

    defineProperty(this, "ignoreErrors", false);

    defineProperty(this, "showDelay", false);

    defineProperty(this, "showPrompt", false);

    defineProperty(this, "errorMessage", "\u26A0 %s");

    defineProperty(this, "elements", {});

    defineProperty(this, "userScripts", []);

    defineProperty(this, "userStyles", []);

    defineProperty(this, "start", function () {
      // activate userscripts and styles
      _this.userStyles.forEach(function (s) {
        var t = _this.document.createElement("style");

        t.innerHTML = s;

        _this.document.body.appendChild(t);
      });

      _this.userScripts.forEach(function (s) {
        eval(s);
      }); // when you click on a[data-passage] (response link)...


      _this.document.body.addEventListener("click", function (e) {
        if (!e.target.matches(selectActiveLink)) {
          return;
        }

        _this.advance(_this.findPassage(e.target.getAttribute("data-passage")), e.target.innerHTML);
      }); // when you click on button[data-passage] (response input)...


      _this.document.body.addEventListener("click", function (e) {
        if (!e.target.matches(selectActiveButton)) {
          return;
        } // capture and disable showPrompt feature


        var value = find(_this.document, selectActiveInput).value;
        _this.state[_this.showPrompt.saveAs] = value;
        _this.showPrompt = false;

        _this.advance(_this.findPassage(e.target.getAttribute("data-passage")), value);
      });

      _this.advance(_this.findPassage(_this.startsAt));
    });

    defineProperty(this, "findPassage", function (idOrName) {
      if (isNumeric(idOrName)) {
        return _this.passages[idOrName];
      } else {
        // handle passages with ' and " (can't use a css selector consistently)
        var p = findAll(_this.story, "tw-passagedata").filter(function (p) {
          return p.getAttribute("name") === idOrName;
        })[0];
        if (!p) return null;
        return _this.passages[p.getAttribute("pid")];
      }
    });

    defineProperty(this, "advance",
    /*#__PURE__*/
    function () {
      var _ref4 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee2(passage) {
        var userText,
            last,
            existing,
            _args2 = arguments;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                userText = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;

                _this.history.push(passage.id);

                last = _this.current; // .active is captured & cleared

                existing = _this.elements.active.innerHTML;
                _this.elements.active.innerHTML = ""; // whatever was in active is moved up into history

                _this.elements.history.innerHTML += existing; // if there is userText, it is added to .history

                if (userText) {
                  _this.renderUserMessage(last, userText, function (s) {
                    return _this.elements.history.innerHTML += s;
                  });
                } // The new passage is rendered and placed in .active
                // after all renders, user options are displayed


                _context2.next = 9;
                return _this.renderPassage(passage, function (s) {
                  return _this.elements.active.innerHTML += s;
                });

              case 9:
                if (!passage.hasTag("auto")) {
                  _context2.next = 12;
                  break;
                }

                // auto advance if the auto tag is set, skipping anything that
                // could pause our operation
                _this.advance(_this.findPassage(passage.links[0].target));

                return _context2.abrupt("return");

              case 12:
                // if prompt is set from the current node, enable freetext
                if (_this.showPrompt) {
                  _this.renderTextInput(passage);
                } else {
                  _this.renderChoices(passage);
                }

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x) {
        return _ref4.apply(this, arguments);
      };
    }());

    defineProperty(this, "renderUserMessage",
    /*#__PURE__*/
    function () {
      var _ref5 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee3(pid, text, renderer) {
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return renderer(USER_PASSAGE_TMPL({
                  pid: pid,
                  text: text
                }));

              case 2:
                _this.scrollToBottom();

                return _context3.abrupt("return", Promise.resolve());

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x2, _x3, _x4) {
        return _ref5.apply(this, arguments);
      };
    }());

    defineProperty(this, "renderPassage",
    /*#__PURE__*/
    function () {
      var _ref6 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee4(passage, renderer) {
        var speaker, statements, next, content;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                speaker = passage.getSpeaker();
                statements = passage.render();
                next = statements.shift();

                _this.showTyping();

              case 4:
                if (!next) {
                  _context4.next = 13;
                  break;
                }

                content = OTHER_PASSAGE_TMPL({
                  speaker: speaker,
                  tags: passage.tags,
                  text: next
                });
                _context4.next = 8;
                return delay(_this.calculateDelay(next));

              case 8:
                _context4.next = 10;
                return renderer(content);

              case 10:
                next = statements.shift();
                _context4.next = 4;
                break;

              case 13:
                _this.hideTyping();

                _this.scrollToBottom();

                return _context4.abrupt("return", Promise.resolve());

              case 16:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      return function (_x5, _x6) {
        return _ref6.apply(this, arguments);
      };
    }());

    defineProperty(this, "calculateDelay", function (txt) {
      var typingDelayRatio = 0.3;
      var rate = 20; // ms

      return txt.length * rate * typingDelayRatio;
    });

    defineProperty(this, "showTyping", function () {
      find(_this.document, typingIndicator).style.visibility = "visible";
    });

    defineProperty(this, "hideTyping", function () {
      find(_this.document, typingIndicator).style.visibility = "hidden";
    });

    defineProperty(this, "scrollToBottom", function () {
      var hist = find(_this.document, "#phistory");
      document.scrollingElement.scrollTop = hist.offsetHeight;
    });

    defineProperty(this, "removeChoices", function () {
      var panel = find(_this.document, selectResponses);
      panel.innerHTML = "";
    });

    defineProperty(this, "renderChoices", function (passage) {
      _this.removeChoices();

      var panel = find(_this.document, selectResponses);
      passage.links.forEach(function (l) {
        panel.innerHTML += "<a href=\"javascript:void(0)\" class=\"user-response\" data-passage=\"".concat(lodash_escape(l.target), "\">").concat(l.display, "</a>");
      });
    });

    defineProperty(this, "renderTextInput", function (passage) {
      _this.removeChoices();

      var panel = find(_this.document, selectResponses);
      panel.innerHTML = "<input type=\"text\" id=\"user-input\" placeholder=\"".concat(_this.showPrompt.placeholder, "\" /><button data-passage=\"").concat(lodash_escape(passage.links[0].target), "\">&gt;</button>");
    });

    defineProperty(this, "prompt", function (saveAs, placeholder) {
      return _this.showPrompt = {
        saveAs: saveAs,
        placeholder: placeholder
      };
    });

    defineProperty(this, "exportTwee", function () {
      return exportTwee(_this);
    });

    this.window = win;

    if (src) {
      this.document = document.implementation.createHTMLDocument("Chatbook Injected Content");
    } else {
      this.document = document;
    }

    this.story = find(this.document, "tw-storydata"); // elements

    this.elements = {
      active: find(this.document, selectActive),
      history: find(this.document, selectHistory)
    }; // properties of story node

    this.name = this.story.getAttribute("name") || "";
    this.startsAt = this.story.getAttribute("startnode") || 0;
    this.creator = this.story.getAttribute("creator");
    this.creatorVersion = this.story.getAttribute("creator-version");
    findAll(this.story, selectPassages).forEach(function (p) {
      var id = parseInt(p.getAttribute("pid"));
      var name = p.getAttribute("name");
      var tags = (p.getAttribute("tags") || "").split(/\s+/g);
      var passage = p.innerHTML || "";
      _this.passages[id] = new Passage(id, name, tags, passage, _this);
    });
    find(this.document, "title").innerHTML = this.name;
    find(this.document, "#ptitle").innerHTML = this.name;
    this.userScripts = (findAll(this.document, selectJs) || []).map(function (el) {
      return el.innerHTML;
    });
    this.userStyles = (findAll(this.document, selectCss) || []).map(function (el) {
      return el.innerHTML;
    });
  }
  /**
   * Starts the story by setting up listeners and then advancing
   * to the first item in the stack
   */
  ;

  (function (win) {
    if (typeof win !== "undefined") {
      win.document.addEventListener("DOMContentLoaded", function (event) {
        window.story = new Story(win);
        window.story.start();
      });
    }
  })(window || undefined);

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdGJvb2sudW1kLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXJyYXlXaXRob3V0SG9sZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9ub25JdGVyYWJsZVNwcmVhZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoLnVuZXNjYXBlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmVpbnRlcnBvbGF0ZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGVzZXR0aW5ncy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanMiLCIuLi9zcmMvdHdpbmUvUGFzc2FnZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL2luZGV4LmpzIiwiLi4vc3JjL3R3aW5lL2NvbnN0YW50cy5qcyIsIi4uL3NyYy90d2luZS9TdG9yeS5qcyIsIi4uL3NyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWZpbmVQcm9wZXJ0eTsiLCJmdW5jdGlvbiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgYXJyMltpXSA9IGFycltpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheVdpdGhvdXRIb2xlczsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5KGl0ZXIpIHtcbiAgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcikgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXIpID09PSBcIltvYmplY3QgQXJndW1lbnRzXVwiKSByZXR1cm4gQXJyYXkuZnJvbShpdGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXRlcmFibGVUb0FycmF5OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVNwcmVhZDsiLCJ2YXIgYXJyYXlXaXRob3V0SG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhvdXRIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheSA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheVwiKTtcblxudmFyIG5vbkl0ZXJhYmxlU3ByZWFkID0gcmVxdWlyZShcIi4vbm9uSXRlcmFibGVTcHJlYWRcIik7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHtcbiAgcmV0dXJuIGFycmF5V2l0aG91dEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5KGFycikgfHwgbm9uSXRlcmFibGVTcHJlYWQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdG9Db25zdW1hYmxlQXJyYXk7IiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykge1xuICB0cnkge1xuICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlamVjdChlcnJvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGluZm8uZG9uZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihfbmV4dCwgX3Rocm93KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF90aHJvdyhlcnIpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcInRocm93XCIsIGVycik7XG4gICAgICB9XG5cbiAgICAgIF9uZXh0KHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FzeW5jVG9HZW5lcmF0b3I7IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggSFRNTCBlbnRpdGllcyBhbmQgSFRNTCBjaGFyYWN0ZXJzLiAqL1xudmFyIHJlRXNjYXBlZEh0bWwgPSAvJig/OmFtcHxsdHxndHxxdW90fCMzOXwjOTYpOy9nLFxuICAgIHJlSGFzRXNjYXBlZEh0bWwgPSBSZWdFeHAocmVFc2NhcGVkSHRtbC5zb3VyY2UpO1xuXG4vKiogVXNlZCB0byBtYXAgSFRNTCBlbnRpdGllcyB0byBjaGFyYWN0ZXJzLiAqL1xudmFyIGh0bWxVbmVzY2FwZXMgPSB7XG4gICcmYW1wOyc6ICcmJyxcbiAgJyZsdDsnOiAnPCcsXG4gICcmZ3Q7JzogJz4nLFxuICAnJnF1b3Q7JzogJ1wiJyxcbiAgJyYjMzk7JzogXCInXCIsXG4gICcmIzk2Oyc6ICdgJ1xufTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eU9mKG9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbi8qKlxuICogVXNlZCBieSBgXy51bmVzY2FwZWAgdG8gY29udmVydCBIVE1MIGVudGl0aWVzIHRvIGNoYXJhY3RlcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIHVuZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5lc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xudmFyIHVuZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sVW5lc2NhcGVzKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG4vKipcbiAqIFRoZSBpbnZlcnNlIG9mIGBfLmVzY2FwZWA7IHRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBIVE1MIGVudGl0aWVzXG4gKiBgJmFtcDtgLCBgJmx0O2AsIGAmZ3Q7YCwgYCZxdW90O2AsIGAmIzM5O2AsIGFuZCBgJiM5NjtgIGluIGBzdHJpbmdgIHRvXG4gKiB0aGVpciBjb3JyZXNwb25kaW5nIGNoYXJhY3RlcnMuXG4gKlxuICogKipOb3RlOioqIE5vIG90aGVyIEhUTUwgZW50aXRpZXMgYXJlIHVuZXNjYXBlZC4gVG8gdW5lc2NhcGUgYWRkaXRpb25hbFxuICogSFRNTCBlbnRpdGllcyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjYuMFxuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSBzdHJpbmcgdG8gdW5lc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB1bmVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnVuZXNjYXBlKCdmcmVkLCBiYXJuZXksICZhbXA7IHBlYmJsZXMnKTtcbiAqIC8vID0+ICdmcmVkLCBiYXJuZXksICYgcGViYmxlcydcbiAqL1xuZnVuY3Rpb24gdW5lc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzRXNjYXBlZEh0bWwudGVzdChzdHJpbmcpKVxuICAgID8gc3RyaW5nLnJlcGxhY2UocmVFc2NhcGVkSHRtbCwgdW5lc2NhcGVIdG1sQ2hhcilcbiAgICA6IHN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1bmVzY2FwZTtcbiIsIi8qKlxuICogbG9kYXNoIDMuMC4wIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kZXJuIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxNSBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS43LjAgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDE1IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIG1hdGNoIHRlbXBsYXRlIGRlbGltaXRlcnMuICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIExvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IE9wZW5KUyBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vb3BlbmpzZi5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggSFRNTCBlbnRpdGllcyBhbmQgSFRNTCBjaGFyYWN0ZXJzLiAqL1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IC9bJjw+XCInXS9nLFxuICAgIHJlSGFzVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cChyZVVuZXNjYXBlZEh0bWwuc291cmNlKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggdGVtcGxhdGUgZGVsaW1pdGVycy4gKi9cbnZhciByZUVzY2FwZSA9IC88JS0oW1xcc1xcU10rPyklPi9nLFxuICAgIHJlRXZhbHVhdGUgPSAvPCUoW1xcc1xcU10rPyklPi9nO1xuXG4vKiogVXNlZCB0byBtYXAgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLiAqL1xudmFyIGh0bWxFc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5T2Yob2JqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbCxcbiAgICBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IGxvZGFzaCBhcmUgbGlrZSB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKSBhcyB3ZWxsIGFzIEVTMjAxNSB0ZW1wbGF0ZSBzdHJpbmdzLiBDaGFuZ2UgdGhlXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciB0ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGJlIEhUTUwtZXNjYXBlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2VzY2FwZSc6IHJlRXNjYXBlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgJ2V2YWx1YXRlJzogcmVFdmFsdWF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUge1JlZ0V4cH1cbiAgICovXG4gICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gcmVmZXJlbmNlIHRoZSBkYXRhIG9iamVjdCBpbiB0aGUgdGVtcGxhdGUgdGV4dC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICovXG4gICAgJ18nOiB7ICdlc2NhcGUnOiBlc2NhcGUgfVxuICB9XG59O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB2YWx1ZXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICByZXR1cm4gYXJyYXlNYXAodmFsdWUsIGJhc2VUb1N0cmluZykgKyAnJztcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIFwiJlwiLCBcIjxcIiwgXCI+XCIsICdcIicsIGFuZCBcIidcIiBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqICoqTm90ZToqKiBObyBvdGhlciBjaGFyYWN0ZXJzIGFyZSBlc2NhcGVkLiBUbyBlc2NhcGUgYWRkaXRpb25hbFxuICogY2hhcmFjdGVycyB1c2UgYSB0aGlyZC1wYXJ0eSBsaWJyYXJ5IGxpa2UgW19oZV9dKGh0dHBzOi8vbXRocy5iZS9oZSkuXG4gKlxuICogVGhvdWdoIHRoZSBcIj5cIiBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZVxuICogXCI+XCIgYW5kIFwiL1wiIGRvbid0IG5lZWQgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmdcbiAqIHVubGVzcyB0aGV5J3JlIHBhcnQgb2YgYSB0YWcgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBTZWVcbiAqIFtNYXRoaWFzIEJ5bmVucydzIGFydGljbGVdKGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcylcbiAqICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFdoZW4gd29ya2luZyB3aXRoIEhUTUwgeW91IHNob3VsZCBhbHdheXNcbiAqIFtxdW90ZSBhdHRyaWJ1dGUgdmFsdWVzXShodHRwOi8vd29ua28uY29tL3Bvc3QvaHRtbC1lc2NhcGluZykgdG8gcmVkdWNlXG4gKiBYU1MgdmVjdG9ycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ2ZyZWQsIGJhcm5leSwgJiBwZWJibGVzJyk7XG4gKiAvLyA9PiAnZnJlZCwgYmFybmV5LCAmYW1wOyBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIHJldHVybiAoc3RyaW5nICYmIHJlSGFzVW5lc2NhcGVkSHRtbC50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKVxuICAgIDogc3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlU2V0dGluZ3M7XG4iLCIvKipcbiAqIExvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IE9wZW5KUyBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vb3BlbmpzZi5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpLFxuICAgIHRlbXBsYXRlU2V0dGluZ3MgPSByZXF1aXJlKCdsb2Rhc2gudGVtcGxhdGVzZXR0aW5ncycpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG90IGZ1bmN0aW9ucyBieSBudW1iZXIgb2YgY2FsbHMgd2l0aGluIGEgc3BhbiBvZiBtaWxsaXNlY29uZHMuICovXG52YXIgSE9UX0NPVU5UID0gODAwLFxuICAgIEhPVF9TUEFOID0gMTY7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDAsXG4gICAgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBkb21FeGNUYWcgPSAnW29iamVjdCBET01FeGNlcHRpb25dJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZS4gKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoXG4gKiBbRVMgdGVtcGxhdGUgZGVsaW1pdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdGVtcGxhdGUtbGl0ZXJhbC1sZXhpY2FsLWNvbXBvbmVudHMpLlxuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqIFVzZWQgdG8gZW5zdXJlIGNhcHR1cmluZyBvcmRlciBvZiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLiAqL1xudmFyIHJlTm9NYXRjaCA9IC8oJF4pLztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggdW5lc2NhcGVkIGNoYXJhY3RlcnMgaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzLiAqL1xudmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuICovXG52YXIgc3RyaW5nRXNjYXBlcyA9IHtcbiAgJ1xcXFwnOiAnXFxcXCcsXG4gIFwiJ1wiOiBcIidcIixcbiAgJ1xcbic6ICduJyxcbiAgJ1xccic6ICdyJyxcbiAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBVc2UgYHV0aWwudHlwZXNgIGZvciBOb2RlLmpzIDEwKy5cbiAgICB2YXIgdHlwZXMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUucmVxdWlyZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUoJ3V0aWwnKS50eXBlcztcblxuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIC8vIExlZ2FjeSBgcHJvY2Vzcy5iaW5kaW5nKCd1dGlsJylgIGZvciBOb2RlLmpzIDwgMTAuXG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy52YWx1ZXNgIGFuZCBgXy52YWx1ZXNJbmAgd2hpY2ggY3JlYXRlcyBhblxuICogYXJyYXkgb2YgYG9iamVjdGAgcHJvcGVydHkgdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5IG5hbWVzXG4gKiBvZiBgcHJvcHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgbmFtZXMgdG8gZ2V0IHZhbHVlcyBmb3IuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VWYWx1ZXMob2JqZWN0LCBwcm9wcykge1xuICByZXR1cm4gYXJyYXlNYXAocHJvcHMsIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgfSk7XG59XG5cbi8qKlxuICogVXNlZCBieSBgXy50ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKGNocikge1xuICByZXR1cm4gJ1xcXFwnICsgc3RyaW5nRXNjYXBlc1tjaHJdO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZCxcbiAgICBTeW1ib2wgPSByb290LlN5bWJvbCxcbiAgICBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KSxcbiAgICBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICAgIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkLFxuICAgIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpLFxuICAgIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBzZXRUb1N0cmluZ2Agd2l0aG91dCBzdXBwb3J0IGZvciBob3QgbG9vcCBzaG9ydGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBiYXNlU2V0VG9TdHJpbmcgPSAhZGVmaW5lUHJvcGVydHkgPyBpZGVudGl0eSA6IGZ1bmN0aW9uKGZ1bmMsIHN0cmluZykge1xuICByZXR1cm4gZGVmaW5lUHJvcGVydHkoZnVuYywgJ3RvU3RyaW5nJywge1xuICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogY29uc3RhbnQoc3RyaW5nKSxcbiAgICAnd3JpdGFibGUnOiB0cnVlXG4gIH0pO1xufTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWZhdWx0c2AgdG8gY3VzdG9taXplIGl0cyBgXy5hc3NpZ25JbmAgdXNlIHRvIGFzc2lnbiBwcm9wZXJ0aWVzXG4gKiBvZiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllc1xuICogdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IG9ialZhbHVlIFRoZSBkZXN0aW5hdGlvbiB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHNvdXJjZSB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgcGFyZW50IG9iamVjdCBvZiBgb2JqVmFsdWVgLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gY3VzdG9tRGVmYXVsdHNBc3NpZ25JbihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAoZXEob2JqVmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICByZXR1cm4gc3JjVmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9ialZhbHVlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlID09ICdudW1iZXInIHx8XG4gICAgICAodHlwZSAhPSAnc3ltYm9sJyAmJiByZUlzVWludC50ZXN0KHZhbHVlKSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IDEgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYEVycm9yYCwgYEV2YWxFcnJvcmAsIGBSYW5nZUVycm9yYCwgYFJlZmVyZW5jZUVycm9yYCxcbiAqIGBTeW50YXhFcnJvcmAsIGBUeXBlRXJyb3JgLCBvciBgVVJJRXJyb3JgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBlcnJvciBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Vycm9yKG5ldyBFcnJvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Vycm9yKEVycm9yKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBlcnJvclRhZyB8fCB0YWcgPT0gZG9tRXhjVGFnIHx8XG4gICAgKHR5cGVvZiB2YWx1ZS5tZXNzYWdlID09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnICYmICFpc1BsYWluT2JqZWN0KHZhbHVlKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0LCB0cnVlKSA6IGJhc2VLZXlzSW4ob2JqZWN0KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24gdGhhdCBjYW4gaW50ZXJwb2xhdGUgZGF0YSBwcm9wZXJ0aWVzXG4gKiBpbiBcImludGVycG9sYXRlXCIgZGVsaW1pdGVycywgSFRNTC1lc2NhcGUgaW50ZXJwb2xhdGVkIGRhdGEgcHJvcGVydGllcyBpblxuICogXCJlc2NhcGVcIiBkZWxpbWl0ZXJzLCBhbmQgZXhlY3V0ZSBKYXZhU2NyaXB0IGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLiBEYXRhXG4gKiBwcm9wZXJ0aWVzIG1heSBiZSBhY2Nlc3NlZCBhcyBmcmVlIHZhcmlhYmxlcyBpbiB0aGUgdGVtcGxhdGUuIElmIGEgc2V0dGluZ1xuICogb2JqZWN0IGlzIGdpdmVuLCBpdCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYF8udGVtcGxhdGVTZXR0aW5nc2AgdmFsdWVzLlxuICpcbiAqICoqTm90ZToqKiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQgYF8udGVtcGxhdGVgIHV0aWxpemVzXG4gKiBbc291cmNlVVJMc10oaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybClcbiAqIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlXG4gKiBbbG9kYXNoJ3MgY3VzdG9tIGJ1aWxkcyBkb2N1bWVudGF0aW9uXShodHRwczovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkcykuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gQ2hyb21lIGV4dGVuc2lvbiBzYW5kYm94ZXMgc2VlXG4gKiBbQ2hyb21lJ3MgZXh0ZW5zaW9ucyBkb2N1bWVudGF0aW9uXShodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlPV8udGVtcGxhdGVTZXR0aW5ncy5lc2NhcGVdXG4gKiAgVGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGU9Xy50ZW1wbGF0ZVNldHRpbmdzLmV2YWx1YXRlXVxuICogIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHM9Xy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNdXG4gKiAgQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBmcmVlIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5pbnRlcnBvbGF0ZT1fLnRlbXBsYXRlU2V0dGluZ3MuaW50ZXJwb2xhdGVdXG4gKiAgVGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc291cmNlVVJMPSd0ZW1wbGF0ZVNvdXJjZXNbbl0nXVxuICogIFRoZSBzb3VyY2VVUkwgb2YgdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnZhcmlhYmxlPSdvYmonXVxuICogIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEVuYWJsZXMgdXNlIGFzIGFuIGl0ZXJhdGVlIGZvciBtZXRob2RzIGxpa2UgYF8ubWFwYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY29tcGlsZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIFVzZSB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSB1c2VyICU+IScpO1xuICogY29tcGlsZWQoeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkISdcbiAqXG4gKiAvLyBVc2UgdGhlIEhUTUwgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIGRhdGEgcHJvcGVydHkgdmFsdWVzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicpO1xuICogY29tcGlsZWQoeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAqXG4gKiAvLyBVc2UgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZXhlY3V0ZSBKYXZhU2NyaXB0IGFuZCBnZW5lcmF0ZSBIVE1MLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgXy5mb3JFYWNoKHVzZXJzLCBmdW5jdGlvbih1c2VyKSB7ICU+PGxpPjwlLSB1c2VyICU+PC9saT48JSB9KTsgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXJzJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gVXNlIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzLlxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIHVzZXIpOyAlPiEnKTtcbiAqIGNvbXBpbGVkKHsgJ3VzZXInOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIFVzZSB0aGUgRVMgdGVtcGxhdGUgbGl0ZXJhbCBkZWxpbWl0ZXIgYXMgYW4gXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIC8vIERpc2FibGUgc3VwcG9ydCBieSByZXBsYWNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyAkeyB1c2VyIH0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ3BlYmJsZXMnIH0pO1xuICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMhJ1xuICpcbiAqIC8vIFVzZSBiYWNrc2xhc2hlcyB0byB0cmVhdCBkZWxpbWl0ZXJzIGFzIHBsYWluIHRleHQuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCc8JT0gXCJcXFxcPCUtIHZhbHVlICVcXFxcPlwiICU+Jyk7XG4gKiBjb21waWxlZCh7ICd2YWx1ZSc6ICdpZ25vcmVkJyB9KTtcbiAqIC8vID0+ICc8JS0gdmFsdWUgJT4nXG4gKlxuICogLy8gVXNlIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBgalF1ZXJ5YCBhcyBganFgLlxuICogdmFyIHRleHQgPSAnPCUganEuZWFjaCh1c2VycywgZnVuY3Rpb24odXNlcikgeyAlPjxsaT48JS0gdXNlciAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUodGV4dCwgeyAnaW1wb3J0cyc6IHsgJ2pxJzogalF1ZXJ5IH0gfSk7XG4gKiBjb21waWxlZCh7ICd1c2Vycyc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIFVzZSB0aGUgYHNvdXJjZVVSTGAgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gc291cmNlVVJMIGZvciB0aGUgdGVtcGxhdGUuXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gdXNlciAlPiEnLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IEZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3IuXG4gKlxuICogLy8gVXNlIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLnVzZXIgJT4hJywgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAvLyAgIHZhciBfX3QsIF9fcCA9ICcnO1xuICogLy8gICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS51c2VyICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAvLyAgIHJldHVybiBfX3A7XG4gKiAvLyB9XG4gKlxuICogLy8gVXNlIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLlxuICogXy50ZW1wbGF0ZVNldHRpbmdzLmludGVycG9sYXRlID0gL3t7KFtcXHNcXFNdKz8pfX0vZztcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIHt7IHVzZXIgfX0hJyk7XG4gKiBjb21waWxlZCh7ICd1c2VyJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gVXNlIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcy5cbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdqc3QuanMnKSwgJ1xcXG4gKiAgIHZhciBKU1QgPSB7XFxcbiAqICAgICBcIm1haW5cIjogJyArIF8udGVtcGxhdGUobWFpblRleHQpLnNvdXJjZSArICdcXFxuICogICB9O1xcXG4gKiAnKTtcbiAqL1xuZnVuY3Rpb24gdGVtcGxhdGUoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkge1xuICAvLyBCYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gIC8vIChodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nLylcbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qcyAoaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVCkuXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcblxuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc3RyaW5nLCBvcHRpb25zLCBndWFyZCkpIHtcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkO1xuICB9XG4gIHN0cmluZyA9IHRvU3RyaW5nKHN0cmluZyk7XG4gIG9wdGlvbnMgPSBhc3NpZ25JbldpdGgoe30sIG9wdGlvbnMsIHNldHRpbmdzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKTtcblxuICB2YXIgaW1wb3J0cyA9IGFzc2lnbkluV2l0aCh7fSwgb3B0aW9ucy5pbXBvcnRzLCBzZXR0aW5ncy5pbXBvcnRzLCBjdXN0b21EZWZhdWx0c0Fzc2lnbkluKSxcbiAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgIGltcG9ydHNWYWx1ZXMgPSBiYXNlVmFsdWVzKGltcG9ydHMsIGltcG9ydHNLZXlzKTtcblxuICB2YXIgaXNFc2NhcGluZyxcbiAgICAgIGlzRXZhbHVhdGluZyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICBzb3VyY2UgPSBcIl9fcCArPSAnXCI7XG5cbiAgLy8gQ29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyLlxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gIC8vIFRoZSBzb3VyY2VVUkwgZ2V0cyBpbmplY3RlZCBpbnRvIHRoZSBzb3VyY2UgdGhhdCdzIGV2YWwtZWQsIHNvIGJlIGNhcmVmdWxcbiAgLy8gd2l0aCBsb29rdXAgKGluIGNhc2Ugb2YgZS5nLiBwcm90b3R5cGUgcG9sbHV0aW9uKSwgYW5kIHN0cmlwIG5ld2xpbmVzIGlmIGFueS5cbiAgLy8gQSBuZXdsaW5lIHdvdWxkbid0IGJlIGEgdmFsaWQgc291cmNlVVJMIGFueXdheSwgYW5kIGl0J2QgZW5hYmxlIGNvZGUgaW5qZWN0aW9uLlxuICB2YXIgc291cmNlVVJMID0gaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAnc291cmNlVVJMJylcbiAgICA/ICgnLy8jIHNvdXJjZVVSTD0nICtcbiAgICAgICAob3B0aW9ucy5zb3VyY2VVUkwgKyAnJykucmVwbGFjZSgvW1xcclxcbl0vZywgJyAnKSArXG4gICAgICAgJ1xcbicpXG4gICAgOiAnJztcblxuICBzdHJpbmcucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICBpbnRlcnBvbGF0ZVZhbHVlIHx8IChpbnRlcnBvbGF0ZVZhbHVlID0gZXNUZW1wbGF0ZVZhbHVlKTtcblxuICAgIC8vIEVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2FuJ3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzLlxuICAgIHNvdXJjZSArPSBzdHJpbmcuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyBSZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0cy5cbiAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgIGlzRXNjYXBpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyBUaGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIG5lZWRzIGBtYXRjaGAgcmV0dXJuZWQgaW5cbiAgICAvLyBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlLlxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAvLyBJZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpbi5cbiAgLy8gTGlrZSB3aXRoIHNvdXJjZVVSTCwgd2UgdGFrZSBjYXJlIHRvIG5vdCBjaGVjayB0aGUgb3B0aW9uJ3MgcHJvdG90eXBlLFxuICAvLyBhcyB0aGlzIGNvbmZpZ3VyYXRpb24gaXMgYSBjb2RlIGluamVjdGlvbiB2ZWN0b3IuXG4gIHZhciB2YXJpYWJsZSA9IGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ3ZhcmlhYmxlJykgJiYgb3B0aW9ucy52YXJpYWJsZTtcbiAgaWYgKCF2YXJpYWJsZSkge1xuICAgIHNvdXJjZSA9ICd3aXRoIChvYmopIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICB9XG4gIC8vIENsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5ncy5cbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBGcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5LlxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArICh2YXJpYWJsZSB8fCAnb2JqJykgKyAnKSB7XFxuJyArXG4gICAgKHZhcmlhYmxlXG4gICAgICA/ICcnXG4gICAgICA6ICdvYmogfHwgKG9iaiA9IHt9KTtcXG4nXG4gICAgKSArXG4gICAgXCJ2YXIgX190LCBfX3AgPSAnJ1wiICtcbiAgICAoaXNFc2NhcGluZ1xuICAgICAgID8gJywgX19lID0gXy5lc2NhcGUnXG4gICAgICAgOiAnJ1xuICAgICkgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHZhciByZXN1bHQgPSBhdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGdW5jdGlvbihpbXBvcnRzS2V5cywgc291cmNlVVJMICsgJ3JldHVybiAnICsgc291cmNlKVxuICAgICAgLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gIH0pO1xuXG4gIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uJ3Mgc291cmNlIGJ5IGl0cyBgdG9TdHJpbmdgIG1ldGhvZCBvclxuICAvLyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3IgaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzLlxuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICBpZiAoaXNFcnJvcihyZXN1bHQpKSB7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gaW52b2tlIGBmdW5jYCwgcmV0dXJuaW5nIGVpdGhlciB0aGUgcmVzdWx0IG9yIHRoZSBjYXVnaHQgZXJyb3JcbiAqIG9iamVjdC4gQW55IGFkZGl0aW9uYWwgYXJndW1lbnRzIGFyZSBwcm92aWRlZCB0byBgZnVuY2Agd2hlbiBpdCdzIGludm9rZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGF0dGVtcHQuXG4gKiBAcGFyYW0gey4uLip9IFthcmdzXSBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBgZnVuY2AgcmVzdWx0IG9yIGVycm9yIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgdGhyb3dpbmcgZXJyb3JzIGZvciBpbnZhbGlkIHNlbGVjdG9ycy5cbiAqIHZhciBlbGVtZW50cyA9IF8uYXR0ZW1wdChmdW5jdGlvbihzZWxlY3Rvcikge1xuICogICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gKiB9LCAnPl8+Jyk7XG4gKlxuICogaWYgKF8uaXNFcnJvcihlbGVtZW50cykpIHtcbiAqICAgZWxlbWVudHMgPSBbXTtcbiAqIH1cbiAqL1xudmFyIGF0dGVtcHQgPSBiYXNlUmVzdChmdW5jdGlvbihmdW5jLCBhcmdzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHVuZGVmaW5lZCwgYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gaXNFcnJvcihlKSA/IGUgOiBuZXcgRXJyb3IoZSk7XG4gIH1cbn0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTgsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbihyb290KSB7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IC9eIHswLDN9KGB7Myx9fH57Myx9KShbXmB+XFxuXSopXFxuKD86fChbXFxzXFxTXSo/KVxcbikoPzogezAsM31cXDFbfmBdKiAqKD86XFxuK3wkKXwkKS8sXG4gIGhyOiAvXiB7MCwzfSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXCogKil7Myx9KSg/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiB7MCwzfSgjezEsNn0pICsoW15cXG5dKj8pKD86ICsjKyk/ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oIHswLDN9PiA/KHBhcmFncmFwaHxbXlxcbl0qKSg/OlxcbnwkKSkrLyxcbiAgbGlzdDogL14oIHswLDN9KShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogJ14gezAsM30oPzonIC8vIG9wdGlvbmFsIGluZGVudGF0aW9uXG4gICAgKyAnPChzY3JpcHR8cHJlfHN0eWxlKVtcXFxccz5dW1xcXFxzXFxcXFNdKj8oPzo8L1xcXFwxPlteXFxcXG5dKlxcXFxuK3wkKScgLy8gKDEpXG4gICAgKyAnfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpJyAvLyAoMilcbiAgICArICd8PFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz5cXFxcbionIC8vICgzKVxuICAgICsgJ3w8IVtBLVpdW1xcXFxzXFxcXFNdKj8+XFxcXG4qJyAvLyAoNClcbiAgICArICd8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+XFxcXG4qJyAvLyAoNSlcbiAgICArICd8PC8/KHRhZykoPzogK3xcXFxcbnwvPz4pW1xcXFxzXFxcXFNdKj8oPzpcXFxcbnsyLH18JCknIC8vICg2KVxuICAgICsgJ3w8KD8hc2NyaXB0fHByZXxzdHlsZSkoW2Etel1bXFxcXHctXSopKD86YXR0cmlidXRlKSo/ICovPz4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/OlxcXFxuezIsfXwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/OlxcXFxuezIsfXwkKScgLy8gKDcpIGNsb3NpbmcgdGFnXG4gICAgKyAnKScsXG4gIGRlZjogL14gezAsM31cXFsobGFiZWwpXFxdOiAqXFxuPyAqPD8oW15cXHM+XSspPj8oPzooPzogK1xcbj8gKnwgKlxcbiAqKSh0aXRsZSkpPyAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgLy8gcmVnZXggdGVtcGxhdGUsIHBsYWNlaG9sZGVycyB3aWxsIGJlIHJlcGxhY2VkIGFjY29yZGluZyB0byBkaWZmZXJlbnQgcGFyYWdyYXBoXG4gIC8vIGludGVycnVwdGlvbiBydWxlcyBvZiBjb21tb25tYXJrIGFuZCB0aGUgb3JpZ2luYWwgbWFya2Rvd24gc3BlYzpcbiAgX3BhcmFncmFwaDogL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sKVteXFxuXSspKikvLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5fbGFiZWwgPSAvKD8hXFxzKlxcXSkoPzpcXFxcW1xcW1xcXV18W15cXFtcXF1dKSsvO1xuYmxvY2suX3RpdGxlID0gLyg/OlwiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCdbXidcXG5dKig/OlxcblteJ1xcbl0rKSpcXG4/J3xcXChbXigpXSpcXCkpLztcbmJsb2NrLmRlZiA9IGVkaXQoYmxvY2suZGVmKVxuICAucmVwbGFjZSgnbGFiZWwnLCBibG9jay5fbGFiZWwpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGJsb2NrLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVxcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSA/W15cXG5dKig/Olxcbig/IVxcMWJ1bGwgPylbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IGVkaXQoYmxvY2suaXRlbSwgJ2dtJylcbiAgLnJlcGxhY2UoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2subGlzdCA9IGVkaXQoYmxvY2subGlzdClcbiAgLnJlcGxhY2UoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAucmVwbGFjZSgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86KD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKSknKVxuICAucmVwbGFjZSgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suX3RhZyA9ICdhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbidcbiAgKyAnfGNlbnRlcnxjb2x8Y29sZ3JvdXB8ZGR8ZGV0YWlsc3xkaWFsb2d8ZGlyfGRpdnxkbHxkdHxmaWVsZHNldHxmaWdjYXB0aW9uJ1xuICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgKyAnfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb24nXG4gICsgJ3xwfHBhcmFtfHNlY3Rpb258c291cmNlfHN1bW1hcnl8dGFibGV8dGJvZHl8dGR8dGZvb3R8dGh8dGhlYWR8dGl0bGV8dHInXG4gICsgJ3x0cmFja3x1bCc7XG5ibG9jay5fY29tbWVudCA9IC88IS0tKD8hLT8+KVtcXHNcXFNdKj8tLT4vO1xuYmxvY2suaHRtbCA9IGVkaXQoYmxvY2suaHRtbCwgJ2knKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZylcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC8gK1thLXpBLVo6X11bXFx3LjotXSooPzogKj0gKlwiW15cIlxcbl0qXCJ8ICo9IConW14nXFxuXSonfCAqPSAqW15cXHNcIic9PD5gXSspPy8pXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gKycpXG4gIC5yZXBsYWNlKCd8bGhlYWRpbmcnLCAnJykgLy8gc2V0ZXggaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfXx+ezMsfSlbXmBcXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gZWRpdChibG9jay5ibG9ja3F1b3RlKVxuICAucmVwbGFjZSgncGFyYWdyYXBoJywgYmxvY2sucGFyYWdyYXBoKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIG5wdGFibGU6IC9eICooW158XFxuIF0uKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKSg/OlxcbigoPzouKltePlxcbiBdLiooPzpcXG58JCkpKilcXG4qfCQpLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHw/KCAqWy06XStbLXwgOl0qKSg/OlxcbigoPzogKltePlxcbiBdLiooPzpcXG58JCkpKilcXG4qfCQpL1xufSk7XG5cbi8qKlxuICogUGVkYW50aWMgZ3JhbW1hciAob3JpZ2luYWwgSm9obiBHcnViZXIncyBsb29zZSBtYXJrZG93biBzcGVjaWZpY2F0aW9uKVxuICovXG5cbmJsb2NrLnBlZGFudGljID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBodG1sOiBlZGl0KFxuICAgICdeICooPzpjb21tZW50ICooPzpcXFxcbnxcXFxccyokKSdcbiAgICArICd8PCh0YWcpW1xcXFxzXFxcXFNdKz88L1xcXFwxPiAqKD86XFxcXG57Mix9fFxcXFxzKiQpJyAvLyBjbG9zZWQgdGFnXG4gICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAgIC5yZXBsYWNlKC90YWcvZywgJyg/ISg/OidcbiAgICAgICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlfHZhcnxzYW1wfGtiZHxzdWInXG4gICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICsgJ1xcXFxiKVxcXFx3Kyg/ITp8W15cXFxcd1xcXFxzQF0qQClcXFxcYicpXG4gICAgLmdldFJlZ2V4KCksXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICsoW1wiKF1bXlxcbl0rW1wiKV0pKT8gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKig/OiMrICopPyg/Olxcbit8JCkvLFxuICBmZW5jZXM6IG5vb3AsIC8vIGZlbmNlcyBub3Qgc3VwcG9ydGVkXG4gIHBhcmFncmFwaDogZWRpdChibG9jay5ub3JtYWwuX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAucmVwbGFjZSgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnfGZlbmNlcycsICcnKVxuICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgIC5yZXBsYWNlKCd8aHRtbCcsICcnKVxuICAgIC5nZXRSZWdleCgpXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGJsb2NrLnBlZGFudGljO1xuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCkge1xuICBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpO1xuICB2YXIgbmV4dCxcbiAgICAgIGxvb3NlLFxuICAgICAgY2FwLFxuICAgICAgYnVsbCxcbiAgICAgIGIsXG4gICAgICBpdGVtLFxuICAgICAgbGlzdFN0YXJ0LFxuICAgICAgbGlzdEl0ZW1zLFxuICAgICAgdCxcbiAgICAgIHNwYWNlLFxuICAgICAgaSxcbiAgICAgIHRhZyxcbiAgICAgIGwsXG4gICAgICBpc29yZGVyZWQsXG4gICAgICBpc3Rhc2ssXG4gICAgICBpc2NoZWNrZWQ7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgdmFyIGxhc3RUb2tlbiA9IHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIC8vIEFuIGluZGVudGVkIGNvZGUgYmxvY2sgY2Fubm90IGludGVycnVwdCBhIHBhcmFncmFwaC5cbiAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgY2FwWzBdLnRyaW1SaWdodCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgICBjb2RlQmxvY2tTdHlsZTogJ2luZGVudGVkJyxcbiAgICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IHJ0cmltKGNhcCwgJ1xcbicpXG4gICAgICAgICAgICA6IGNhcFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlc1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0gPyBjYXBbMl0udHJpbSgpIDogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkge1xuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBzcGxpdENlbGxzKGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdID8gY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpdGVtLmNlbGxzW2ldID0gc3BsaXRDZWxscyhpdGVtLmNlbGxzW2ldLCBpdGVtLmhlYWRlci5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcbiAgICAgIGlzb3JkZXJlZCA9IGJ1bGwubGVuZ3RoID4gMTtcblxuICAgICAgbGlzdFN0YXJ0ID0ge1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGlzb3JkZXJlZCxcbiAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsIDogJycsXG4gICAgICAgIGxvb3NlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaChsaXN0U3RhcnQpO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBsaXN0SXRlbXMgPSBbXTtcbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICovLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwubGVuZ3RoID4gMSA/IGIubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA6IChiLmxlbmd0aCA+IDEgfHwgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGIgIT09IGJ1bGwpKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb29zZSkge1xuICAgICAgICAgIGxpc3RTdGFydC5sb29zZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgdGFzayBsaXN0IGl0ZW1zXG4gICAgICAgIGlzdGFzayA9IC9eXFxbWyB4WF1cXF0gLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpc2NoZWNrZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChpc3Rhc2spIHtcbiAgICAgICAgICBpc2NoZWNrZWQgPSBpdGVtWzFdICE9PSAnICc7XG4gICAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXlxcW1sgeFhdXFxdICsvLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0ID0ge1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fc3RhcnQnLFxuICAgICAgICAgIHRhc2s6IGlzdGFzayxcbiAgICAgICAgICBjaGVja2VkOiBpc2NoZWNrZWQsXG4gICAgICAgICAgbG9vc2U6IGxvb3NlXG4gICAgICAgIH07XG5cbiAgICAgICAgbGlzdEl0ZW1zLnB1c2godCk7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2godCk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdFN0YXJ0Lmxvb3NlKSB7XG4gICAgICAgIGwgPSBsaXN0SXRlbXMubGVuZ3RoO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBsaXN0SXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogdGhpcy5vcHRpb25zLnNhbml0aXplID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSkgOiBlc2NhcGUoY2FwWzBdKSkgOiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbM10pIGNhcFszXSA9IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpO1xuICAgICAgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0YWddKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3RhZ10gPSB7XG4gICAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSB7XG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IHNwbGl0Q2VsbHMoY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykpLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10gPyBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXVxuICAgICAgfTtcblxuICAgICAgaWYgKGl0ZW0uaGVhZGVyLmxlbmd0aCA9PT0gaXRlbS5hbGlnbi5sZW5ndGgpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBzcGxpdENlbGxzKFxuICAgICAgICAgICAgaXRlbS5jZWxsc1tpXS5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJyksXG4gICAgICAgICAgICBpdGVtLmhlYWRlci5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS8sXG4gIGF1dG9saW5rOiAvXjwoc2NoZW1lOlteXFxzXFx4MDAtXFx4MWY8Pl0qfGVtYWlsKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogJ15jb21tZW50J1xuICAgICsgJ3xePC9bYS16QS1aXVtcXFxcdzotXSpcXFxccyo+JyAvLyBzZWxmLWNsb3NpbmcgdGFnXG4gICAgKyAnfF48W2EtekEtWl1bXFxcXHctXSooPzphdHRyaWJ1dGUpKj9cXFxccyovPz4nIC8vIG9wZW4gdGFnXG4gICAgKyAnfF48XFxcXD9bXFxcXHNcXFxcU10qP1xcXFw/PicgLy8gcHJvY2Vzc2luZyBpbnN0cnVjdGlvbiwgZS5nLiA8P3BocCA/PlxuICAgICsgJ3xePCFbYS16QS1aXStcXFxcc1tcXFxcc1xcXFxTXSo/PicgLy8gZGVjbGFyYXRpb24sIGUuZy4gPCFET0NUWVBFIGh0bWw+XG4gICAgKyAnfF48IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/XFxcXF1cXFxcXT4nLCAvLyBDREFUQSBzZWN0aW9uXG4gIGxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFwoXFxzKihocmVmKSg/OlxccysodGl0bGUpKT9cXHMqXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhsYWJlbClcXF1cXFsoPyFcXHMqXFxdKSgoPzpcXFxcW1xcW1xcXV0/fFteXFxbXFxdXFxcXF0pKylcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoPyFcXHMqXFxdKSgoPzpcXFtbXlxcW1xcXV0qXFxdfFxcXFxbXFxbXFxdXXxbXlxcW1xcXV0pKilcXF0oPzpcXFtcXF0pPy8sXG4gIHN0cm9uZzogL15fXyhbXlxcc19dKV9fKD8hXyl8XlxcKlxcKihbXlxccypdKVxcKlxcKig/IVxcKil8Xl9fKFteXFxzXVtcXHNcXFNdKj9bXlxcc10pX18oPyFfKXxeXFwqXFwqKFteXFxzXVtcXHNcXFNdKj9bXlxcc10pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oW15cXHNfXSlfKD8hXyl8XlxcKihbXlxccyo8XFxbXSlcXCooPyFcXCopfF5fKFteXFxzPF1bXFxzXFxTXSo/W15cXHNfXSlfKD8hX3xbXlxcc3B1bmN0dWF0aW9uXSl8Xl8oW15cXHNfPF1bXFxzXFxTXSo/W15cXHNdKV8oPyFffFteXFxzcHVuY3R1YXRpb25dKXxeXFwqKFteXFxzPFwiXVtcXHNcXFNdKj9bXlxcc1xcKl0pXFwqKD8hXFwqfFteXFxzcHVuY3R1YXRpb25dKXxeXFwqKFteXFxzKlwiPFxcW11bXFxzXFxTXSo/W15cXHNdKVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14oIHsyLH18XFxcXClcXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eKGArfFteYF0pKD86W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl18XFxiX3wkKXxbXiBdKD89IHsyLH1cXG4pKXwoPz0gezIsfVxcbikpL1xufTtcblxuLy8gbGlzdCBvZiBwdW5jdHVhdGlvbiBtYXJrcyBmcm9tIGNvbW1vbiBtYXJrIHNwZWNcbi8vIHdpdGhvdXQgYCBhbmQgXSB0byB3b3JrYXJvdW5kIFJ1bGUgMTcgKGlubGluZSBjb2RlIGJsb2Nrcy9saW5rcylcbmlubGluZS5fcHVuY3R1YXRpb24gPSAnIVwiIyQlJlxcJygpKissXFxcXC0uLzo7PD0+P0BcXFxcW15fe3x9fic7XG5pbmxpbmUuZW0gPSBlZGl0KGlubGluZS5lbSkucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgaW5saW5lLl9wdW5jdHVhdGlvbikuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9lc2NhcGVzID0gL1xcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pL2c7XG5cbmlubGluZS5fc2NoZW1lID0gL1thLXpBLVpdW2EtekEtWjAtOSsuLV17MSwzMX0vO1xuaW5saW5lLl9lbWFpbCA9IC9bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dKyhAKVthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrKD8hWy1fXSkvO1xuaW5saW5lLmF1dG9saW5rID0gZWRpdChpbmxpbmUuYXV0b2xpbmspXG4gIC5yZXBsYWNlKCdzY2hlbWUnLCBpbmxpbmUuX3NjaGVtZSlcbiAgLnJlcGxhY2UoJ2VtYWlsJywgaW5saW5lLl9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fYXR0cmlidXRlID0gL1xccytbYS16QS1aOl9dW1xcdy46LV0qKD86XFxzKj1cXHMqXCJbXlwiXSpcInxcXHMqPVxccyonW14nXSonfFxccyo9XFxzKlteXFxzXCInPTw+YF0rKT8vO1xuXG5pbmxpbmUudGFnID0gZWRpdChpbmxpbmUudGFnKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgaW5saW5lLl9hdHRyaWJ1dGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2xhYmVsID0gLyg/OlxcW1teXFxbXFxdXSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5pbmxpbmUuX2hyZWYgPSAvPCg/OlxcXFxbPD5dP3xbXlxcczw+XFxcXF0pKj58W15cXHNcXHgwMC1cXHgxZl0qLztcbmlubGluZS5fdGl0bGUgPSAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLztcblxuaW5saW5lLmxpbmsgPSBlZGl0KGlubGluZS5saW5rKVxuICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAucmVwbGFjZSgnaHJlZicsIGlubGluZS5faHJlZilcbiAgLnJlcGxhY2UoJ3RpdGxlJywgaW5saW5lLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5yZWZsaW5rID0gZWRpdChpbmxpbmUucmVmbGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopLyxcbiAgbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKCguKj8pXFwpLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpLFxuICByZWZsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKVxufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogZWRpdChpbmxpbmUuZXNjYXBlKS5yZXBsYWNlKCddKScsICd+fF0pJykuZ2V0UmVnZXgoKSxcbiAgX2V4dGVuZGVkX2VtYWlsOiAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvLFxuICB1cmw6IC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLyxcbiAgX2JhY2twZWRhbDogLyg/OltePyEuLDo7Kl9+KCkmXSt8XFwoW14pXSpcXCl8Jig/IVthLXpBLVowLTldKzskKXxbPyEuLDo7Kl9+KV0rKD8hJCkpKy8sXG4gIGRlbDogL15+Kyg/PVxcUykoW1xcc1xcU10qP1xcUyl+Ky8sXG4gIHRleHQ6IC9eKGArfFteYF0pKD86W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKn5dfFxcYl98aHR0cHM/OlxcL1xcL3xmdHA6XFwvXFwvfHd3d1xcLnwkKXxbXiBdKD89IHsyLH1cXG4pfFteYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dKD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKSl8KD89IHsyLH1cXG58W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKSkvXG59KTtcblxuaW5saW5lLmdmbS51cmwgPSBlZGl0KGlubGluZS5nZm0udXJsLCAnaScpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5nZm0uX2V4dGVuZGVkX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IGVkaXQoaW5saW5lLmJyKS5yZXBsYWNlKCd7Mix9JywgJyonKS5nZXRSZWdleCgpLFxuICB0ZXh0OiBlZGl0KGlubGluZS5nZm0udGV4dClcbiAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAucmVwbGFjZSgvXFx7MixcXH0vZywgJyonKVxuICAgIC5nZXRSZWdleCgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcigpO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJyxcbiAgICAgIGxpbmssXG4gICAgICB0ZXh0LFxuICAgICAgaHJlZixcbiAgICAgIHRpdGxlLFxuICAgICAgY2FwLFxuICAgICAgcHJldkNhcFplcm87XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pblJhd0Jsb2NrICYmIC9ePChwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pblJhd0Jsb2NrICYmIC9ePFxcLyhwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgdmFyIGxhc3RQYXJlbkluZGV4ID0gZmluZENsb3NpbmdCcmFja2V0KGNhcFsyXSwgJygpJyk7XG4gICAgICBpZiAobGFzdFBhcmVuSW5kZXggPiAtMSkge1xuICAgICAgICB2YXIgbGlua0xlbiA9IDQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgaHJlZiA9IGNhcFsyXTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgbGluayA9IC9eKFteJ1wiXSpbXlxcc10pXFxzKyhbJ1wiXSkoLiopXFwyLy5leGVjKGhyZWYpO1xuXG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgaHJlZiA9IGxpbmtbMV07XG4gICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpdGxlID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgfVxuICAgICAgaHJlZiA9IGhyZWYudHJpbSgpLnJlcGxhY2UoL148KFtcXHNcXFNdKik+JC8sICckMScpO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogSW5saW5lTGV4ZXIuZXNjYXBlcyhocmVmKSxcbiAgICAgICAgdGl0bGU6IElubGluZUxleGVyLmVzY2FwZXModGl0bGUpXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzRdIHx8IGNhcFszXSB8fCBjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFs2XSB8fCBjYXBbNV0gfHwgY2FwWzRdIHx8IGNhcFszXSB8fCBjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLnRyaW0oKSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5tYW5nbGUoY2FwWzFdKSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICBkbyB7XG4gICAgICAgICAgcHJldkNhcFplcm8gPSBjYXBbMF07XG4gICAgICAgICAgY2FwWzBdID0gdGhpcy5ydWxlcy5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKVswXTtcbiAgICAgICAgfSB3aGlsZSAocHJldkNhcFplcm8gIT09IGNhcFswXSk7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgaWYgKGNhcFsxXSA9PT0gJ3d3dy4nKSB7XG4gICAgICAgICAgaHJlZiA9ICdodHRwOi8vJyArIHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKHRoaXMuaW5SYXdCbG9jaykge1xuICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KHRoaXMub3B0aW9ucy5zYW5pdGl6ZSA/ICh0aGlzLm9wdGlvbnMuc2FuaXRpemVyID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pIDogZXNjYXBlKGNhcFswXSkpIDogY2FwWzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbklubGluZUxleGVyLmVzY2FwZXMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0ID8gdGV4dC5yZXBsYWNlKElubGluZUxleGVyLnJ1bGVzLl9lc2NhcGVzLCAnJDEnKSA6IHRleHQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gbGluay5ocmVmLFxuICAgICAgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJycsXG4gICAgICBsID0gdGV4dC5sZW5ndGgsXG4gICAgICBpID0gMCxcbiAgICAgIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGluZm9zdHJpbmcsIGVzY2FwZWQpIHtcbiAgdmFyIGxhbmcgPSAoaW5mb3N0cmluZyB8fCAnJykubWF0Y2goL1xcUyovKVswXTtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdywgc2x1Z2dlcikge1xuICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcklkcykge1xuICAgIHJldHVybiAnPGgnXG4gICAgICArIGxldmVsXG4gICAgICArICcgaWQ9XCInXG4gICAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICAgICsgc2x1Z2dlci5zbHVnKHJhdylcbiAgICAgICsgJ1wiPidcbiAgICAgICsgdGV4dFxuICAgICAgKyAnPC9oJ1xuICAgICAgKyBsZXZlbFxuICAgICAgKyAnPlxcbic7XG4gIH1cbiAgLy8gaWdub3JlIElEc1xuICByZXR1cm4gJzxoJyArIGxldmVsICsgJz4nICsgdGV4dCArICc8L2gnICsgbGV2ZWwgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQsIHN0YXJ0KSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnLFxuICAgICAgc3RhcnRhdHQgPSAob3JkZXJlZCAmJiBzdGFydCAhPT0gMSkgPyAoJyBzdGFydD1cIicgKyBzdGFydCArICdcIicpIDogJyc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgc3RhcnRhdHQgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jaGVja2JveCA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcbiAgcmV0dXJuICc8aW5wdXQgJ1xuICAgICsgKGNoZWNrZWQgPyAnY2hlY2tlZD1cIlwiICcgOiAnJylcbiAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiJ1xuICAgICsgKHRoaXMub3B0aW9ucy54aHRtbCA/ICcgLycgOiAnJylcbiAgICArICc+ICc7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIGlmIChib2R5KSBib2R5ID0gJzx0Ym9keT4nICsgYm9keSArICc8L3Rib2R5Pic7XG5cbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIGFsaWduPVwiJyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgZXNjYXBlKGhyZWYpICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuLyoqXG4gKiBUZXh0UmVuZGVyZXJcbiAqIHJldHVybnMgb25seSB0aGUgdGV4dHVhbCBwYXJ0IG9mIHRoZSB0b2tlblxuICovXG5cbmZ1bmN0aW9uIFRleHRSZW5kZXJlcigpIHt9XG5cbi8vIG5vIG5lZWQgZm9yIGJsb2NrIGxldmVsIHJlbmRlcmVyc1xuXG5UZXh0UmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9XG5UZXh0UmVuZGVyZXIucHJvdG90eXBlLmVtID1cblRleHRSZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPVxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPVxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cblRleHRSZW5kZXJlci5wcm90b3R5cGUubGluayA9XG5UZXh0UmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgcmV0dXJuICcnICsgdGV4dDtcbn07XG5cblRleHRSZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICcnO1xufTtcblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cblxuZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbiA9IG51bGw7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyKCk7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgdGhpcy5zbHVnZ2VyID0gbmV3IFNsdWdnZXIoKTtcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICByZXR1cm4gcGFyc2VyLnBhcnNlKHNyYyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExvb3BcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc3JjKSB7XG4gIHRoaXMuaW5saW5lID0gbmV3IElubGluZUxleGVyKHNyYy5saW5rcywgdGhpcy5vcHRpb25zKTtcbiAgLy8gdXNlIGFuIElubGluZUxleGVyIHdpdGggYSBUZXh0UmVuZGVyZXIgdG8gZXh0cmFjdCBwdXJlIHRleHRcbiAgdGhpcy5pbmxpbmVUZXh0ID0gbmV3IElubGluZUxleGVyKFxuICAgIHNyYy5saW5rcyxcbiAgICBtZXJnZSh7fSwgdGhpcy5vcHRpb25zLCB7IHJlbmRlcmVyOiBuZXcgVGV4dFJlbmRlcmVyKCkgfSlcbiAgKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbiAgcmV0dXJuIHRoaXMudG9rZW47XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHVuZXNjYXBlKHRoaXMuaW5saW5lVGV4dC5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSksXG4gICAgICAgIHRoaXMuc2x1Z2dlcik7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJyxcbiAgICAgICAgICBib2R5ID0gJycsXG4gICAgICAgICAgaSxcbiAgICAgICAgICByb3csXG4gICAgICAgICAgY2VsbCxcbiAgICAgICAgICBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICBib2R5ID0gJyc7XG4gICAgICB2YXIgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZCxcbiAgICAgICAgICBzdGFydCA9IHRoaXMudG9rZW4uc3RhcnQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIGJvZHkgPSAnJztcbiAgICAgIHZhciBsb29zZSA9IHRoaXMudG9rZW4ubG9vc2U7XG4gICAgICB2YXIgY2hlY2tlZCA9IHRoaXMudG9rZW4uY2hlY2tlZDtcbiAgICAgIHZhciB0YXNrID0gdGhpcy50b2tlbi50YXNrO1xuXG4gICAgICBpZiAodGhpcy50b2tlbi50YXNrKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci5jaGVja2JveChjaGVja2VkKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9ICFsb29zZSAmJiB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHksIHRhc2ssIGNoZWNrZWQpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgLy8gVE9ETyBwYXJzZSBpbmxpbmUgY29udGVudCBpZiBwYXJhbWV0ZXIgbWFya2Rvd249MVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbCh0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB2YXIgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdGhpcy50b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyTXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTbHVnZ2VyIGdlbmVyYXRlcyBoZWFkZXIgaWRcbiAqL1xuXG5mdW5jdGlvbiBTbHVnZ2VyKCkge1xuICB0aGlzLnNlZW4gPSB7fTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHN0cmluZyB0byB1bmlxdWUgaWRcbiAqL1xuXG5TbHVnZ2VyLnByb3RvdHlwZS5zbHVnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIHNsdWcgPSB2YWx1ZVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5yZXBsYWNlKC9bXFx1MjAwMC1cXHUyMDZGXFx1MkUwMC1cXHUyRTdGXFxcXCchXCIjJCUmKCkqKywuLzo7PD0+P0BbXFxdXmB7fH1+XS9nLCAnJylcbiAgICAucmVwbGFjZSgvXFxzL2csICctJyk7XG5cbiAgaWYgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSkge1xuICAgIHZhciBvcmlnaW5hbFNsdWcgPSBzbHVnO1xuICAgIGRvIHtcbiAgICAgIHRoaXMuc2VlbltvcmlnaW5hbFNsdWddKys7XG4gICAgICBzbHVnID0gb3JpZ2luYWxTbHVnICsgJy0nICsgdGhpcy5zZWVuW29yaWdpbmFsU2x1Z107XG4gICAgfSB3aGlsZSAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKTtcbiAgfVxuICB0aGlzLnNlZW5bc2x1Z10gPSAwO1xuXG4gIHJldHVybiBzbHVnO1xufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICBpZiAoZW5jb2RlKSB7XG4gICAgaWYgKGVzY2FwZS5lc2NhcGVUZXN0LnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlLmVzY2FwZVJlcGxhY2UsIGZ1bmN0aW9uKGNoKSB7IHJldHVybiBlc2NhcGUucmVwbGFjZW1lbnRzW2NoXTsgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlc2NhcGUuZXNjYXBlVGVzdE5vRW5jb2RlLnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlLmVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZnVuY3Rpb24oY2gpIHsgcmV0dXJuIGVzY2FwZS5yZXBsYWNlbWVudHNbY2hdOyB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaHRtbDtcbn1cblxuZXNjYXBlLmVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuZXNjYXBlLmVzY2FwZVJlcGxhY2UgPSAvWyY8PlwiJ10vZztcbmVzY2FwZS5yZXBsYWNlbWVudHMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5cbmVzY2FwZS5lc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hIz9cXHcrOykvO1xuZXNjYXBlLmVzY2FwZVJlcGxhY2VOb0VuY29kZSA9IC9bPD5cIiddfCYoPyEjP1xcdys7KS9nO1xuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWcsIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVkaXQocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZSB8fCByZWdleDtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4ge1xuICAgIHJlcGxhY2U6IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICAgICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRSZWdleDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsZWFuVXJsKHNhbml0aXplLCBiYXNlLCBocmVmKSB7XG4gIGlmIChzYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaWYgKGJhc2UgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybChiYXNlLCBocmVmKTtcbiAgfVxuICB0cnkge1xuICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gaHJlZjtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmICgvXlteOl0rOlxcLypbXi9dKiQvLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBydHJpbShiYXNlLCAnLycsIHRydWUpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG5cbiAgaWYgKGhyZWYuc2xpY2UoMCwgMikgPT09ICcvLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC86W1xcc1xcU10qLywgJzonKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyg6XFwvKlteL10qKVtcXHNcXFNdKi8sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cbnZhciBiYXNlVXJscyA9IHt9O1xudmFyIG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxLFxuICAgICAgdGFyZ2V0LFxuICAgICAga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBzcGxpdENlbGxzKHRhYmxlUm93LCBjb3VudCkge1xuICAvLyBlbnN1cmUgdGhhdCBldmVyeSBjZWxsLWRlbGltaXRpbmcgcGlwZSBoYXMgYSBzcGFjZVxuICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgdmFyIHJvdyA9IHRhYmxlUm93LnJlcGxhY2UoL1xcfC9nLCBmdW5jdGlvbihtYXRjaCwgb2Zmc2V0LCBzdHIpIHtcbiAgICAgICAgdmFyIGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIGN1cnIgPSBvZmZzZXQ7XG4gICAgICAgIHdoaWxlICgtLWN1cnIgPj0gMCAmJiBzdHJbY3Vycl0gPT09ICdcXFxcJykgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgIC8vIG9kZCBudW1iZXIgb2Ygc2xhc2hlcyBtZWFucyB8IGlzIGVzY2FwZWRcbiAgICAgICAgICAvLyBzbyB3ZSBsZWF2ZSBpdCBhbG9uZVxuICAgICAgICAgIHJldHVybiAnfCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYWRkIHNwYWNlIGJlZm9yZSB1bmVzY2FwZWQgfFxuICAgICAgICAgIHJldHVybiAnIHwnO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGNlbGxzID0gcm93LnNwbGl0KC8gXFx8LyksXG4gICAgICBpID0gMDtcblxuICBpZiAoY2VsbHMubGVuZ3RoID4gY291bnQpIHtcbiAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChjZWxscy5sZW5ndGggPCBjb3VudCkgY2VsbHMucHVzaCgnJyk7XG4gIH1cblxuICBmb3IgKDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgIGNlbGxzW2ldID0gY2VsbHNbaV0udHJpbSgpLnJlcGxhY2UoL1xcXFxcXHwvZywgJ3wnKTtcbiAgfVxuICByZXR1cm4gY2VsbHM7XG59XG5cbi8vIFJlbW92ZSB0cmFpbGluZyAnYydzLiBFcXVpdmFsZW50IHRvIHN0ci5yZXBsYWNlKC9jKiQvLCAnJykuXG4vLyAvYyokLyBpcyB2dWxuZXJhYmxlIHRvIFJFRE9TLlxuLy8gaW52ZXJ0OiBSZW1vdmUgc3VmZml4IG9mIG5vbi1jIGNoYXJzIGluc3RlYWQuIERlZmF1bHQgZmFsc2V5LlxuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgaWYgKHN0ci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvLyBMZW5ndGggb2Ygc3VmZml4IG1hdGNoaW5nIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICB2YXIgc3VmZkxlbiA9IDA7XG5cbiAgLy8gU3RlcCBsZWZ0IHVudGlsIHdlIGZhaWwgdG8gbWF0Y2ggdGhlIGludmVydCBjb25kaXRpb24uXG4gIHdoaWxlIChzdWZmTGVuIDwgc3RyLmxlbmd0aCkge1xuICAgIHZhciBjdXJyQ2hhciA9IHN0ci5jaGFyQXQoc3RyLmxlbmd0aCAtIHN1ZmZMZW4gLSAxKTtcbiAgICBpZiAoY3VyckNoYXIgPT09IGMgJiYgIWludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSBpZiAoY3VyckNoYXIgIT09IGMgJiYgaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHIuc3Vic3RyKDAsIHN0ci5sZW5ndGggLSBzdWZmTGVuKTtcbn1cblxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICBpZiAoc3RyLmluZGV4T2YoYlsxXSkgPT09IC0xKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIHZhciBsZXZlbCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0cltpXSA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMF0pIHtcbiAgICAgIGxldmVsKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgIGxldmVsLS07XG4gICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpIHtcbiAgaWYgKG9wdCAmJiBvcHQuc2FuaXRpemUgJiYgIW9wdC5zaWxlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oJ21hcmtlZCgpOiBzYW5pdGl6ZSBhbmQgc2FuaXRpemVyIHBhcmFtZXRlcnMgYXJlIGRlcHJlY2F0ZWQgc2luY2UgdmVyc2lvbiAwLjcuMCwgc2hvdWxkIG5vdCBiZSB1c2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS4gUmVhZCBtb3JlIGhlcmU6IGh0dHBzOi8vbWFya2VkLmpzLm9yZy8jL1VTSU5HX0FEVkFOQ0VELm1kI29wdGlvbnMnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgLy8gdGhyb3cgZXJyb3IgaW4gY2FzZSBvZiBub24gc3RyaW5nIGlucHV0XG4gIGlmICh0eXBlb2Ygc3JjID09PSAndW5kZWZpbmVkJyB8fCBzcmMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwnKTtcbiAgfVxuICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgb2YgdHlwZSAnXG4gICAgICArIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzcmMpICsgJywgc3RyaW5nIGV4cGVjdGVkJyk7XG4gIH1cblxuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuICAgIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHQsXG4gICAgICAgIHRva2VucyxcbiAgICAgICAgcGVuZGluZyxcbiAgICAgICAgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBiYXNlVXJsOiBudWxsLFxuICAgIGJyZWFrczogZmFsc2UsXG4gICAgZ2ZtOiB0cnVlLFxuICAgIGhlYWRlcklkczogdHJ1ZSxcbiAgICBoZWFkZXJQcmVmaXg6ICcnLFxuICAgIGhpZ2hsaWdodDogbnVsbCxcbiAgICBsYW5nUHJlZml4OiAnbGFuZ3VhZ2UtJyxcbiAgICBtYW5nbGU6IHRydWUsXG4gICAgcGVkYW50aWM6IGZhbHNlLFxuICAgIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIoKSxcbiAgICBzYW5pdGl6ZTogZmFsc2UsXG4gICAgc2FuaXRpemVyOiBudWxsLFxuICAgIHNpbGVudDogZmFsc2UsXG4gICAgc21hcnRMaXN0czogZmFsc2UsXG4gICAgc21hcnR5cGFudHM6IGZhbHNlLFxuICAgIHhodG1sOiBmYWxzZVxuICB9O1xufTtcblxubWFya2VkLmRlZmF1bHRzID0gbWFya2VkLmdldERlZmF1bHRzKCk7XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xubWFya2VkLlRleHRSZW5kZXJlciA9IFRleHRSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQuU2x1Z2dlciA9IFNsdWdnZXI7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICByb290Lm1hcmtlZCA9IG1hcmtlZDtcbn1cbn0pKHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSk7XG4iLCJpbXBvcnQgdW5lc2NhcGUgZnJvbSBcImxvZGFzaC51bmVzY2FwZVwiO1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gXCJsb2Rhc2gudGVtcGxhdGVcIjtcbmltcG9ydCBtYXJrZWQgZnJvbSBcIm1hcmtlZFwiO1xuXG5jb25zdCBCTE9DS19DT01NRU5UID0gL1xcL1xcKi4qP1xcKlxcLy9nO1xuY29uc3QgSU5MSU5FX0NPTU1FTlQgPSAvXlxcL1xcLy4qKFxcclxcbj98XFxuKS9nO1xuY29uc3QgSVNfRVhURVJOQUxfVVJMID0gL15cXHcrOlxcL1xcL1xcLz9cXHcvaTtcbmNvbnN0IExJTktfUEFUVEVSTiA9IC9cXFtcXFsoLio/KVxcXVxcXS9nO1xuXG5jb25zdCBmaW5kU3RvcnkgPSB3aW4gPT4ge1xuICBpZiAod2luICYmIHdpbi5zdG9yeSkge1xuICAgIHJldHVybiB3aW4uc3Rvcnk7XG4gIH1cbiAgcmV0dXJuIHsgc3RhdGU6IHt9IH07XG59O1xuXG5jb25zdCBub21hcmsgPSBzID0+IHM7XG5cbmNvbnN0IHJlbmRlclBhc3NhZ2UgPSBwYXNzYWdlID0+IHtcbiAgY29uc3Qgc291cmNlID0gcGFzc2FnZS5zb3VyY2U7XG4gIGNvbnN0IHN0b3J5ID0gcGFzc2FnZS5zdG9yeTtcbiAgY29uc3QgbWFya3VwID1cbiAgICBwYXNzYWdlLmhhc1RhZyhcInN5c3RlbVwiKSB8fCBwYXNzYWdlLmhhc1RhZyhcIm5vLW1hcmtkb3duXCIpID8gbm9tYXJrIDogbWFya2VkO1xuXG4gIGxldCByZXN1bHQgPSB0ZW1wbGF0ZShzb3VyY2UpKHtcbiAgICBzdGF0ZTogc3Rvcnkuc3RhdGVcbiAgfSk7XG5cbiAgaWYgKHBhc3NhZ2UpIHtcbiAgICAvLyByZW1vdmUgbGlua3MgaWYgc2V0IHByZXZpb3VzbHlcbiAgICBwYXNzYWdlLmxpbmtzID0gW107XG4gIH1cblxuICAvLyByZW1vdmUgY29tbWVudHNcbiAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoQkxPQ0tfQ09NTUVOVCwgXCJcIikucmVwbGFjZShJTkxJTkVfQ09NTUVOVCwgXCJcIik7XG5cbiAgLy8gW1tsaW5rc11dXG4gIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKExJTktfUEFUVEVSTiwgKG1hdGNoLCB0KSA9PiB7XG4gICAgbGV0IGRpc3BsYXkgPSB0O1xuICAgIGxldCB0YXJnZXQgPSB0O1xuXG4gICAgLy8gZGlzcGxheXx0YXJnZXQgZm9ybWF0XG4gICAgY29uc3QgYmFySW5kZXggPSB0LmluZGV4T2YoXCJ8XCIpO1xuICAgIGNvbnN0IHJpZ2h0QXJySW5kZXggPSB0LmluZGV4T2YoXCItPlwiKTtcbiAgICBjb25zdCBsZWZ0QXJySW5kZXggPSB0LmluZGV4T2YoXCI8LVwiKTtcblxuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSBiYXJJbmRleCA+PSAwOlxuICAgICAgICBkaXNwbGF5ID0gdC5zdWJzdHIoMCwgYmFySW5kZXgpO1xuICAgICAgICB0YXJnZXQgPSB0LnN1YnN0cihiYXJJbmRleCArIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgcmlnaHRBcnJJbmRleCA+PSAwOlxuICAgICAgICBkaXNwbGF5ID0gdC5zdWJzdHIoMCwgcmlnaHRBcnJJbmRleCk7XG4gICAgICAgIHRhcmdldCA9IHQuc3Vic3RyKHJpZ2h0QXJySW5kZXggKyAyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGxlZnRBcnJJbmRleCA+PSAwOlxuICAgICAgICBkaXNwbGF5ID0gdC5zdWJzdHIobGVmdEFyckluZGV4ICsgMik7XG4gICAgICAgIHRhcmdldCA9IHQuc3Vic3RyKDAsIGxlZnRBcnJJbmRleCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIHJlbmRlciBhbiBleHRlcm5hbCBsaW5rICYgc3RvcD9cbiAgICBpZiAoSVNfRVhURVJOQUxfVVJMLnRlc3QodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuICc8YSBocmVmPVwiJyArIHRhcmdldCArICdcIj4nICsgZGlzcGxheSArIFwiPC9hPlwiO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBwYXNzYWdlXG4gICAgaWYgKHBhc3NhZ2UpIHtcbiAgICAgIHBhc3NhZ2UubGlua3MucHVzaCh7IGRpc3BsYXksIHRhcmdldCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gXCJcIjsgLy8gcmVuZGVyIG5vdGhpbmcgaWYgaXQncyBhIHR3ZWUgbGlua1xuICB9KTtcblxuICAvLyBpZiBwcm9tcHQgdGFnIGlzIHNldCwgbm90aWZ5IHRoZSBzdG9yeVxuICBpZiAocGFzc2FnZSkge1xuICAgIGNvbnN0IHByb21wdHMgPSBwYXNzYWdlLnByZWZpeFRhZyhcInByb21wdFwiKTtcbiAgICBpZiAocHJvbXB0cy5sZW5ndGgpIHtcbiAgICAgIHBhc3NhZ2Uuc3RvcnkucHJvbXB0KHByb21wdHNbMF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoaXMgaXMgYSBtdWx0aWxpbmUgaXRlbSwgdHJpbSwgc3BsaXQsIGFuZCBtYXJrIGVhY2ggaXRlbVxuICAvLyByZXR1cm4gdGhlIGFycmF5XG4gIGlmIChwYXNzYWdlLmhhc1RhZyhcIm11bHRpbGluZVwiKSkge1xuICAgIHJlc3VsdCA9IHJlc3VsdC50cmltKCk7XG4gICAgcmV0dXJuIHJlc3VsdC5zcGxpdCgvW1xcclxcbl0rL2cpLm1hcChsaW5lID0+IG1hcmt1cChsaW5lKSk7XG4gIH1cblxuICAvLyBpZiBhIHNpbmdsZSBpdGVtLCBhbmQgdGhlIHN5c3RlbSB0YWcgaXMgc2V0LCBmZW5jZSB0aGUgYmxvY2tcbiAgaWYgKHBhc3NhZ2UuaGFzVGFnKFwic3lzdGVtXCIpKSB7XG4gICAgcmVzdWx0ID0gYDxwcmU+PGNvZGU+JHtyZXN1bHQudHJpbSgpfTwvY29kZT48L3ByZT5gO1xuICB9XG5cbiAgLy8gZWxzZSByZXR1cm5zIGFuIGFycmF5IG9mIDFcbiAgcmV0dXJuIFttYXJrdXAocmVzdWx0KV07XG59O1xuXG5jbGFzcyBQYXNzYWdlIHtcbiAgaWQgPSBudWxsO1xuICBuYW1lID0gbnVsbDtcbiAgdGFncyA9IG51bGw7XG4gIHRhZ0RpY3QgPSB7fTtcbiAgc291cmNlID0gbnVsbDtcbiAgbGlua3MgPSBbXTtcblxuICBjb25zdHJ1Y3RvcihpZCwgbmFtZSwgdGFncywgc291cmNlLCBzdG9yeSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudGFncyA9IHRhZ3M7XG4gICAgdGhpcy5zb3VyY2UgPSB1bmVzY2FwZShzb3VyY2UpO1xuICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcblxuICAgIHRoaXMudGFncy5mb3JFYWNoKHQgPT4gKHRoaXMudGFnRGljdFt0XSA9IDEpKTtcbiAgfVxuXG4gIGdldFNwZWFrZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3BlYWtlclRhZyA9IHRoaXMudGFncy5maW5kKHQgPT4gdC5pbmRleE9mKFwic3BlYWtlci1cIikgPT09IDApIHx8IFwiXCI7XG4gICAgY29uc3Qgc3lzdGVtVGFnID0gdGhpcy5oYXNUYWcoXCJzeXN0ZW1cIik7XG4gICAgaWYgKHNwZWFrZXJUYWcpIHJldHVybiBzcGVha2VyVGFnLnJlcGxhY2UoL15zcGVha2VyLS8sIFwiXCIpO1xuICAgIGlmIChzeXN0ZW1UYWcpIHJldHVybiBcInN5c3RlbVwiO1xuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIHByZWZpeFRhZyA9IChwZngsIGFzRGljdCkgPT5cbiAgICB0aGlzLnRhZ3NcbiAgICAgIC5maWx0ZXIodCA9PiB0LmluZGV4T2YoYCR7cGZ4fS1gKSA9PT0gMClcbiAgICAgIC5tYXAodCA9PiB0LnJlcGxhY2UoYCR7cGZ4fS1gLCBcIlwiKSlcbiAgICAgIC5yZWR1Y2UoXG4gICAgICAgIChhLCB0KSA9PiB7XG4gICAgICAgICAgaWYgKGFzRGljdClcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLmEsXG4gICAgICAgICAgICAgIFt0XTogMVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiBbLi4uYSwgdF07XG4gICAgICAgIH0sXG4gICAgICAgIGFzRGljdCA/IHt9IDogW11cbiAgICAgICk7XG5cbiAgaGFzVGFnID0gdCA9PiB0aGlzLnRhZ0RpY3RbdF07XG5cbiAgLy8gc3RhdGljIGFuZCBpbnN0YW5jZSByZW5kZXJzXG4gIHN0YXRpYyByZW5kZXIgPSBzdHIgPT5cbiAgICByZW5kZXJQYXNzYWdlKFxuICAgICAgbmV3IFBhc3NhZ2UobnVsbCwgbnVsbCwgbnVsbCwgc3RyLCBmaW5kU3Rvcnkod2luZG93IHx8IG51bGwpKVxuICAgICk7XG4gIHJlbmRlciA9ICgpID0+IHJlbmRlclBhc3NhZ2UodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhc3NhZ2U7XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMuICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gL1smPD5cIidgXS9nLFxuICAgIHJlSGFzVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cChyZVVuZXNjYXBlZEh0bWwuc291cmNlKTtcblxuLyoqIFVzZWQgdG8gbWFwIGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7JyxcbiAgJ2AnOiAnJiM5NjsnXG59O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5T2Yob2JqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuLyoqXG4gKiBVc2VkIGJ5IGBfLmVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaHIgVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSBiYXNlUHJvcGVydHlPZihodG1sRXNjYXBlcyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgY2hhcmFjdGVycyBcIiZcIiwgXCI8XCIsIFwiPlwiLCAnXCInLCBcIidcIiwgYW5kIFwiXFxgXCIgaW4gYHN0cmluZ2AgdG9cbiAqIHRoZWlyIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiAqKk5vdGU6KiogTm8gb3RoZXIgY2hhcmFjdGVycyBhcmUgZXNjYXBlZC4gVG8gZXNjYXBlIGFkZGl0aW9uYWxcbiAqIGNoYXJhY3RlcnMgdXNlIGEgdGhpcmQtcGFydHkgbGlicmFyeSBsaWtlIFtfaGVfXShodHRwczovL210aHMuYmUvaGUpLlxuICpcbiAqIFRob3VnaCB0aGUgXCI+XCIgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2VcbiAqIFwiPlwiIGFuZCBcIi9cIiBkb24ndCBuZWVkIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nXG4gKiB1bmxlc3MgdGhleSdyZSBwYXJ0IG9mIGEgdGFnIG9yIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS4gU2VlXG4gKiBbTWF0aGlhcyBCeW5lbnMncyBhcnRpY2xlXShodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMpXG4gKiAodW5kZXIgXCJzZW1pLXJlbGF0ZWQgZnVuIGZhY3RcIikgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBCYWNrdGlja3MgYXJlIGVzY2FwZWQgYmVjYXVzZSBpbiBJRSA8IDksIHRoZXkgY2FuIGJyZWFrIG91dCBvZlxuICogYXR0cmlidXRlIHZhbHVlcyBvciBIVE1MIGNvbW1lbnRzLiBTZWUgWyM1OV0oaHR0cHM6Ly9odG1sNXNlYy5vcmcvIzU5KSxcbiAqIFsjMTAyXShodHRwczovL2h0bWw1c2VjLm9yZy8jMTAyKSwgWyMxMDhdKGh0dHBzOi8vaHRtbDVzZWMub3JnLyMxMDgpLCBhbmRcbiAqIFsjMTMzXShodHRwczovL2h0bWw1c2VjLm9yZy8jMTMzKSBvZiB0aGVcbiAqIFtIVE1MNSBTZWN1cml0eSBDaGVhdHNoZWV0XShodHRwczovL2h0bWw1c2VjLm9yZy8pIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogV2hlbiB3b3JraW5nIHdpdGggSFRNTCB5b3Ugc2hvdWxkIGFsd2F5c1xuICogW3F1b3RlIGF0dHJpYnV0ZSB2YWx1ZXNdKGh0dHA6Ly93b25rby5jb20vcG9zdC9odG1sLWVzY2FwaW5nKSB0byByZWR1Y2VcbiAqIFhTUyB2ZWN0b3JzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBTdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnKTtcbiAqIC8vID0+ICdmcmVkLCBiYXJuZXksICZhbXA7IHBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZShzdHJpbmcpIHtcbiAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgcmV0dXJuIChzdHJpbmcgJiYgcmVIYXNVbmVzY2FwZWRIdG1sLnRlc3Qoc3RyaW5nKSlcbiAgICA/IHN0cmluZy5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpXG4gICAgOiBzdHJpbmc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlO1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gXCJsb2Rhc2gudGVtcGxhdGVcIjtcblxuY29uc3QgVFdFRV9URU1QTEFURSA9IHRlbXBsYXRlKGBcbjo6IFN0b3J5VGl0bGVcbjwlPSBzdG9yeS50aXRsZSAlPlxuXG5cbjo6IFN0b3J5RGF0YVxue1xuXHRcImlmaWRcIjogXCI8JT0gc3RvcnkuaWZpZCAlPlwiLFxuXHRcImZvcm1hdFwiOiBcIkNoYXRib29rXCIsXG5cdFwiZm9ybWF0LXZlcnNpb25cIjogXCI8JT0gc3RvcnkuZm9ybWF0VmVyc2lvbiAlPlwiLFxuXHRcInN0YXJ0XCI6IFwiPCU9IHN0b3J5LnN0YXJ0ICU+XCIsXG5cdFwidGFnLWNvbG9yc1wiOiA8JT0gSlNPTi5zdHJpbmdpZnkoc3RvcnkudGFncywgbnVsbCwgMikgJT4sXG5cdFwiem9vbVwiOiAxXG59XG5cbjwlPSBzdG9yeS5wYXNzYWdlcy5qb2luKFwiXCIpICU+XG5gKTtcblxuY29uc3QgUEFTU0FHRV9URU1QTEFURSA9IHRlbXBsYXRlKGBcbjo6IDwlPSBwYXNzYWdlLm5hbWUgJT4gWzwlPSBwYXNzYWdlLnRhZ3MgJT5dIHtcInBvc2l0aW9uXCI6XCI8JT0gcGFzc2FnZS5wb3NpdGlvbiAlPlwiLFwic2l6ZVwiOlwiPCU9IHBhc3NhZ2Uuc2l6ZSAlPlwifVxuPCU9IHBhc3NhZ2UuY29udGVudHMgJT5cblxuXG5gKTtcblxuZXhwb3J0IHsgVFdFRV9URU1QTEFURSwgUEFTU0FHRV9URU1QTEFURSB9O1xuIiwiaW1wb3J0IFBhc3NhZ2UgZnJvbSBcIi4vUGFzc2FnZVwiO1xuaW1wb3J0IGVzY2FwZSBmcm9tIFwibG9kYXNoLmVzY2FwZVwiO1xuaW1wb3J0IHVuZXNjYXBlIGZyb20gXCJsb2Rhc2gudW5lc2NhcGVcIjtcbmltcG9ydCBwa2cgZnJvbSBcIi4uLy4uL3BhY2thZ2UuanNvblwiO1xuXG5pbXBvcnQgeyBUV0VFX1RFTVBMQVRFLCBQQVNTQUdFX1RFTVBMQVRFIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmNvbnN0IHNlbGVjdFBhc3NhZ2VzID0gXCJ0dy1wYXNzYWdlZGF0YVwiO1xuY29uc3Qgc2VsZWN0Q3NzID0gJypbdHlwZT1cInRleHQvdHdpbmUtY3NzXCJdJztcbmNvbnN0IHNlbGVjdEpzID0gJypbdHlwZT1cInRleHQvdHdpbmUtamF2YXNjcmlwdFwiXSc7XG5jb25zdCBzZWxlY3RBY3RpdmVMaW5rID0gXCIjdXNlci1yZXNwb25zZS1wYW5lbCBhW2RhdGEtcGFzc2FnZV1cIjtcbmNvbnN0IHNlbGVjdEFjdGl2ZUJ1dHRvbiA9IFwiI3VzZXItcmVzcG9uc2UtcGFuZWwgYnV0dG9uW2RhdGEtcGFzc2FnZV1cIjtcbmNvbnN0IHNlbGVjdEFjdGl2ZUlucHV0ID0gXCIjdXNlci1yZXNwb25zZS1wYW5lbCBpbnB1dFwiO1xuY29uc3Qgc2VsZWN0QWN0aXZlID0gXCIuY2hhdC1wYW5lbCAuYWN0aXZlXCI7XG5jb25zdCBzZWxlY3RIaXN0b3J5ID0gXCIuY2hhdC1wYW5lbCAuaGlzdG9yeVwiO1xuY29uc3Qgc2VsZWN0UmVzcG9uc2VzID0gXCIjdXNlci1yZXNwb25zZS1wYW5lbFwiO1xuY29uc3QgdHlwaW5nSW5kaWNhdG9yID0gXCIjYW5pbWF0aW9uLWNvbnRhaW5lclwiO1xuXG5jb25zdCBJU19OVU1FUklDID0gL15bXFxkXSskLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSBwcm92aWRlZCBzdHJpbmcgY29udGFpbnMgb25seSBudW1iZXJzXG4gKiBJbiB0aGUgY2FzZSBvZiBgcGlkYCB2YWx1ZXMgZm9yIHBhc3NhZ2VzLCB0aGlzIGlzIHRydWVcbiAqL1xuY29uc3QgaXNOdW1lcmljID0gZCA9PiBJU19OVU1FUklDLnRlc3QoZCk7XG5cbi8qKlxuICogRm9ybWF0IGEgdXNlciBwYXNzYWdlIChzdWNoIGFzIGEgcmVzcG9uc2UpXG4gKi9cbmNvbnN0IFVTRVJfUEFTU0FHRV9UTVBMID0gKHsgaWQsIHRleHQgfSkgPT4gYFxuICA8ZGl2IGNsYXNzPVwiY2hhdC1wYXNzYWdlLXdyYXBwZXJcIiBkYXRhLXNwZWFrZXI9XCJ5b3VcIj5cbiAgICA8ZGl2IGNsYXNzPVwiY2hhdC1wYXNzYWdlIHBoaXN0b3J5XCIgZGF0YS1zcGVha2VyPVwieW91XCIgZGF0YS11cGFzc2FnZT1cIiR7aWR9XCI+XG4gICAgICAke3RleHR9XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuLyoqXG4gKiBGb3JtYXQgYSBtZXNzYWdlIGZyb20gYSBub24tdXNlclxuICovXG5jb25zdCBPVEhFUl9QQVNTQUdFX1RNUEwgPSAoeyBzcGVha2VyLCB0YWdzLCB0ZXh0IH0pID0+IGBcbiAgPGRpdiBkYXRhLXNwZWFrZXI9XCIke3NwZWFrZXJ9XCIgY2xhc3M9XCJjaGF0LXBhc3NhZ2Utd3JhcHBlciAke3RhZ3Muam9pbihcIiBcIil9XCI+XG4gICAgPGRpdiBkYXRhLXNwZWFrZXI9XCIke3NwZWFrZXJ9XCIgY2xhc3M9XCJjaGF0LXBhc3NhZ2VcIj5cbiAgICAgICR7dGV4dH1cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG4vKipcbiAqIEZvcmNlcyBhIGRlbGF5IHZpYSBwcm9taXNlcyBpbiBvcmRlciB0byBzcHJlYWQgb3V0IG1lc3NhZ2VzXG4gKi9cbmNvbnN0IGRlbGF5ID0gYXN5bmMgKHQgPSAwKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdCkpO1xuXG4vLyBGaW5kIG9uZS9tYW55IG5vZGVzIHdpdGhpbiBhIGNvbnRleHQuIFdlIFsuLi5maW5kQWxsXSB0byBlbnN1cmUgd2UncmUgY2FzdCBhcyBhbiBhcnJheVxuLy8gbm90IGFzIGEgbm9kZSBsaXN0XG5jb25zdCBmaW5kID0gKGN0eCwgcykgPT4gY3R4LnF1ZXJ5U2VsZWN0b3Iocyk7XG5jb25zdCBmaW5kQWxsID0gKGN0eCwgcykgPT4gWy4uLmN0eC5xdWVyeVNlbGVjdG9yQWxsKHMpXSB8fCBbXTtcblxuLy8gZXhwb3J0IGEgc3RvcnkgYmFjayB0byB0d2VlIGZvcm1hdFxuY29uc3QgZXhwb3J0VHdlZSA9IHMgPT4ge1xuICBjb25zdCBzdG9yeURhdGEgPSBmaW5kKHMuZG9jdW1lbnQsIFwidHctc3RvcnlkYXRhXCIpO1xuICBjb25zdCBwYXNzYWdlcyA9IGZpbmRBbGwocy5kb2N1bWVudCwgXCJ0dy1wYXNzYWdlZGF0YVwiKTtcbiAgY29uc3Qgc3RvcnkgPSB7XG4gICAgdGl0bGU6IHMubmFtZSxcbiAgICBpZmlkOiBzdG9yeURhdGEuZ2V0QXR0cmlidXRlKFwiaWZpZFwiKSxcbiAgICBmb3JtYXRWZXJzaW9uOiBwa2cudmVyc2lvbixcbiAgICBzdGFydDogcy5wYXNzYWdlc1tzLnN0YXJ0c0F0XS5pZCxcbiAgICB0YWdzOiBmaW5kQWxsKHMuZG9jdW1lbnQsIFwidHctdGFnXCIpLnJlZHVjZShcbiAgICAgIChhLCB0KSA9PiAoe1xuICAgICAgICAuLi5hLFxuICAgICAgICBbdC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpXTogdC5nZXRBdHRyaWJ1dGUoXCJjb2xvclwiKVxuICAgICAgfSksXG4gICAgICB7fVxuICAgICksXG4gICAgcGFzc2FnZXM6IFtdXG4gIH07IC8vIG91ciBvdXRwdXQgc3RvcnlcblxuICBwYXNzYWdlcy5mb3JFYWNoKHAgPT4ge1xuICAgIC8vIDx0dy1wYXNzYWdlZGF0YSBwaWQ9XCIxXCIgbmFtZT1cImdxbCByZWZlcmVuY2VzXCIgdGFncz1cInN5c3RlbSBwcm9sb2d1ZVwiIHBvc2l0aW9uPVwiMjUsMTI1XCIgc2l6ZT1cIjIwMCwxMDBcIj5cbiAgICBjb25zdCBwYXNzYWdlID0ge1xuICAgICAgbmFtZTogcC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuICAgICAgdGFnczogcC5nZXRBdHRyaWJ1dGUoXCJ0YWdzXCIpLFxuICAgICAgcG9zaXRpb246IHAuZ2V0QXR0cmlidXRlKFwicG9zaXRpb25cIiksXG4gICAgICBzaXplOiBwLmdldEF0dHJpYnV0ZShcInNpemVcIiksXG4gICAgICBjb250ZW50czogdW5lc2NhcGUocC5pbm5lckhUTUwpXG4gICAgfTtcbiAgICBjb25zdCBibG9jayA9IFBBU1NBR0VfVEVNUExBVEUoeyBwYXNzYWdlIH0pO1xuICAgIHN0b3J5LnBhc3NhZ2VzLnB1c2goYmxvY2spO1xuICB9KTtcblxuICBjb25zb2xlLmxvZyhUV0VFX1RFTVBMQVRFKHsgc3RvcnkgfSkpO1xufTtcblxuLyoqXG4gKiBTdGFuZGFyZCBUd2luZSBGb3JtYXQgU3RvcnkgT2JqZWN0XG4gKi9cbmNsYXNzIFN0b3J5IHtcbiAgdmVyc2lvbiA9IDI7XG5cbiAgZG9jdW1lbnQgPSBudWxsO1xuICBzdG9yeSA9IG51bGw7XG4gIG5hbWUgPSBcIlwiO1xuICBjcmVhdG9yID0gXCJcIjtcbiAgY3JlYXRvclZlcnNpb24gPSBcIlwiO1xuICBzdGFydHNBdCA9IDA7XG4gIGhpc3RvcnkgPSBbXTtcbiAgY3VycmVudCA9IDA7XG4gIHN0YXRlID0ge307XG4gIHBhc3NhZ2VzID0ge307XG4gIGlnbm9yZUVycm9ycyA9IGZhbHNlO1xuICBzaG93RGVsYXkgPSBmYWxzZTtcbiAgc2hvd1Byb21wdCA9IGZhbHNlO1xuICBlcnJvck1lc3NhZ2UgPSBcIlxcdTI2YTAgJXNcIjtcblxuICBlbGVtZW50cyA9IHt9O1xuXG4gIHVzZXJTY3JpcHRzID0gW107XG4gIHVzZXJTdHlsZXMgPSBbXTtcblxuICBjb25zdHJ1Y3Rvcih3aW4sIHNyYykge1xuICAgIHRoaXMud2luZG93ID0gd2luO1xuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudChcbiAgICAgICAgXCJDaGF0Ym9vayBJbmplY3RlZCBDb250ZW50XCJcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICB9XG5cbiAgICB0aGlzLnN0b3J5ID0gZmluZCh0aGlzLmRvY3VtZW50LCBcInR3LXN0b3J5ZGF0YVwiKTtcblxuICAgIC8vIGVsZW1lbnRzXG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgIGFjdGl2ZTogZmluZCh0aGlzLmRvY3VtZW50LCBzZWxlY3RBY3RpdmUpLFxuICAgICAgaGlzdG9yeTogZmluZCh0aGlzLmRvY3VtZW50LCBzZWxlY3RIaXN0b3J5KVxuICAgIH07XG5cbiAgICAvLyBwcm9wZXJ0aWVzIG9mIHN0b3J5IG5vZGVcbiAgICB0aGlzLm5hbWUgPSB0aGlzLnN0b3J5LmdldEF0dHJpYnV0ZShcIm5hbWVcIikgfHwgXCJcIjtcbiAgICB0aGlzLnN0YXJ0c0F0ID0gdGhpcy5zdG9yeS5nZXRBdHRyaWJ1dGUoXCJzdGFydG5vZGVcIikgfHwgMDtcbiAgICB0aGlzLmNyZWF0b3IgPSB0aGlzLnN0b3J5LmdldEF0dHJpYnV0ZShcImNyZWF0b3JcIik7XG4gICAgdGhpcy5jcmVhdG9yVmVyc2lvbiA9IHRoaXMuc3RvcnkuZ2V0QXR0cmlidXRlKFwiY3JlYXRvci12ZXJzaW9uXCIpO1xuXG4gICAgZmluZEFsbCh0aGlzLnN0b3J5LCBzZWxlY3RQYXNzYWdlcykuZm9yRWFjaChwID0+IHtcbiAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQocC5nZXRBdHRyaWJ1dGUoXCJwaWRcIikpO1xuICAgICAgY29uc3QgbmFtZSA9IHAuZ2V0QXR0cmlidXRlKFwibmFtZVwiKTtcbiAgICAgIGNvbnN0IHRhZ3MgPSAocC5nZXRBdHRyaWJ1dGUoXCJ0YWdzXCIpIHx8IFwiXCIpLnNwbGl0KC9cXHMrL2cpO1xuICAgICAgY29uc3QgcGFzc2FnZSA9IHAuaW5uZXJIVE1MIHx8IFwiXCI7XG5cbiAgICAgIHRoaXMucGFzc2FnZXNbaWRdID0gbmV3IFBhc3NhZ2UoaWQsIG5hbWUsIHRhZ3MsIHBhc3NhZ2UsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgZmluZCh0aGlzLmRvY3VtZW50LCBcInRpdGxlXCIpLmlubmVySFRNTCA9IHRoaXMubmFtZTtcbiAgICBmaW5kKHRoaXMuZG9jdW1lbnQsIFwiI3B0aXRsZVwiKS5pbm5lckhUTUwgPSB0aGlzLm5hbWU7XG5cbiAgICB0aGlzLnVzZXJTY3JpcHRzID0gKGZpbmRBbGwodGhpcy5kb2N1bWVudCwgc2VsZWN0SnMpIHx8IFtdKS5tYXAoXG4gICAgICBlbCA9PiBlbC5pbm5lckhUTUxcbiAgICApO1xuICAgIHRoaXMudXNlclN0eWxlcyA9IChmaW5kQWxsKHRoaXMuZG9jdW1lbnQsIHNlbGVjdENzcykgfHwgW10pLm1hcChcbiAgICAgIGVsID0+IGVsLmlubmVySFRNTFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBzdG9yeSBieSBzZXR0aW5nIHVwIGxpc3RlbmVycyBhbmQgdGhlbiBhZHZhbmNpbmdcbiAgICogdG8gdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIHN0YWNrXG4gICAqL1xuICBzdGFydCA9ICgpID0+IHtcbiAgICAvLyBhY3RpdmF0ZSB1c2Vyc2NyaXB0cyBhbmQgc3R5bGVzXG4gICAgdGhpcy51c2VyU3R5bGVzLmZvckVhY2gocyA9PiB7XG4gICAgICBjb25zdCB0ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICB0LmlubmVySFRNTCA9IHM7XG4gICAgICB0aGlzLmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodCk7XG4gICAgfSk7XG4gICAgdGhpcy51c2VyU2NyaXB0cy5mb3JFYWNoKHMgPT4ge1xuICAgICAgZXZhbChzKTtcbiAgICB9KTtcblxuICAgIC8vIHdoZW4geW91IGNsaWNrIG9uIGFbZGF0YS1wYXNzYWdlXSAocmVzcG9uc2UgbGluaykuLi5cbiAgICB0aGlzLmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xuICAgICAgaWYgKCFlLnRhcmdldC5tYXRjaGVzKHNlbGVjdEFjdGl2ZUxpbmspKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZHZhbmNlKFxuICAgICAgICB0aGlzLmZpbmRQYXNzYWdlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtcGFzc2FnZVwiKSksXG4gICAgICAgIGUudGFyZ2V0LmlubmVySFRNTFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIHdoZW4geW91IGNsaWNrIG9uIGJ1dHRvbltkYXRhLXBhc3NhZ2VdIChyZXNwb25zZSBpbnB1dCkuLi5cbiAgICB0aGlzLmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xuICAgICAgaWYgKCFlLnRhcmdldC5tYXRjaGVzKHNlbGVjdEFjdGl2ZUJ1dHRvbikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjYXB0dXJlIGFuZCBkaXNhYmxlIHNob3dQcm9tcHQgZmVhdHVyZVxuICAgICAgY29uc3QgdmFsdWUgPSBmaW5kKHRoaXMuZG9jdW1lbnQsIHNlbGVjdEFjdGl2ZUlucHV0KS52YWx1ZTtcbiAgICAgIHRoaXMuc3RhdGVbdGhpcy5zaG93UHJvbXB0LnNhdmVBc10gPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2hvd1Byb21wdCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLmFkdmFuY2UoXG4gICAgICAgIHRoaXMuZmluZFBhc3NhZ2UoZS50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1wYXNzYWdlXCIpKSxcbiAgICAgICAgdmFsdWVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkdmFuY2UodGhpcy5maW5kUGFzc2FnZSh0aGlzLnN0YXJ0c0F0KSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBwYXNzYWdlIGJhc2VkIG9uIGl0cyBpZCBvciBuYW1lXG4gICAqL1xuICBmaW5kUGFzc2FnZSA9IGlkT3JOYW1lID0+IHtcbiAgICBpZiAoaXNOdW1lcmljKGlkT3JOYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzc2FnZXNbaWRPck5hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBoYW5kbGUgcGFzc2FnZXMgd2l0aCAnIGFuZCBcIiAoY2FuJ3QgdXNlIGEgY3NzIHNlbGVjdG9yIGNvbnNpc3RlbnRseSlcbiAgICAgIGNvbnN0IHAgPSBmaW5kQWxsKHRoaXMuc3RvcnksIFwidHctcGFzc2FnZWRhdGFcIikuZmlsdGVyKFxuICAgICAgICBwID0+IHAuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSA9PT0gaWRPck5hbWVcbiAgICAgIClbMF07XG4gICAgICBpZiAoIXApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMucGFzc2FnZXNbcC5nZXRBdHRyaWJ1dGUoXCJwaWRcIildO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQWR2YW5jZSB0aGUgc3RvcnkgdG8gdGhlIHBhc3NhZ2Ugc3BlY2lmaWVkLCBvcHRpb25hbGx5IGFkZGluZyB1c2VyVGV4dFxuICAgKi9cbiAgYWR2YW5jZSA9IGFzeW5jIChwYXNzYWdlLCB1c2VyVGV4dCA9IG51bGwpID0+IHtcbiAgICB0aGlzLmhpc3RvcnkucHVzaChwYXNzYWdlLmlkKTtcbiAgICBjb25zdCBsYXN0ID0gdGhpcy5jdXJyZW50O1xuXG4gICAgLy8gLmFjdGl2ZSBpcyBjYXB0dXJlZCAmIGNsZWFyZWRcbiAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuZWxlbWVudHMuYWN0aXZlLmlubmVySFRNTDtcbiAgICB0aGlzLmVsZW1lbnRzLmFjdGl2ZS5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgLy8gd2hhdGV2ZXIgd2FzIGluIGFjdGl2ZSBpcyBtb3ZlZCB1cCBpbnRvIGhpc3RvcnlcbiAgICB0aGlzLmVsZW1lbnRzLmhpc3RvcnkuaW5uZXJIVE1MICs9IGV4aXN0aW5nO1xuXG4gICAgLy8gaWYgdGhlcmUgaXMgdXNlclRleHQsIGl0IGlzIGFkZGVkIHRvIC5oaXN0b3J5XG4gICAgaWYgKHVzZXJUZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlclVzZXJNZXNzYWdlKFxuICAgICAgICBsYXN0LFxuICAgICAgICB1c2VyVGV4dCxcbiAgICAgICAgcyA9PiAodGhpcy5lbGVtZW50cy5oaXN0b3J5LmlubmVySFRNTCArPSBzKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbmV3IHBhc3NhZ2UgaXMgcmVuZGVyZWQgYW5kIHBsYWNlZCBpbiAuYWN0aXZlXG4gICAgLy8gYWZ0ZXIgYWxsIHJlbmRlcnMsIHVzZXIgb3B0aW9ucyBhcmUgZGlzcGxheWVkXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJQYXNzYWdlKFxuICAgICAgcGFzc2FnZSxcbiAgICAgIHMgPT4gKHRoaXMuZWxlbWVudHMuYWN0aXZlLmlubmVySFRNTCArPSBzKVxuICAgICk7XG4gICAgaWYgKHBhc3NhZ2UuaGFzVGFnKFwiYXV0b1wiKSkge1xuICAgICAgLy8gYXV0byBhZHZhbmNlIGlmIHRoZSBhdXRvIHRhZyBpcyBzZXQsIHNraXBwaW5nIGFueXRoaW5nIHRoYXRcbiAgICAgIC8vIGNvdWxkIHBhdXNlIG91ciBvcGVyYXRpb25cbiAgICAgIHRoaXMuYWR2YW5jZSh0aGlzLmZpbmRQYXNzYWdlKHBhc3NhZ2UubGlua3NbMF0udGFyZ2V0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWYgcHJvbXB0IGlzIHNldCBmcm9tIHRoZSBjdXJyZW50IG5vZGUsIGVuYWJsZSBmcmVldGV4dFxuICAgIGlmICh0aGlzLnNob3dQcm9tcHQpIHtcbiAgICAgIHRoaXMucmVuZGVyVGV4dElucHV0KHBhc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlckNob2ljZXMocGFzc2FnZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGV4dCBhcyBpZiBpdCBjYW1lIGZyb20gdGhlIHVzZXJcbiAgICovXG4gIHJlbmRlclVzZXJNZXNzYWdlID0gYXN5bmMgKHBpZCwgdGV4dCwgcmVuZGVyZXIpID0+IHtcbiAgICBhd2FpdCByZW5kZXJlcihcbiAgICAgIFVTRVJfUEFTU0FHRV9UTVBMKHtcbiAgICAgICAgcGlkLFxuICAgICAgICB0ZXh0XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVuZGVyIGEgVHdpbmUrQ2hhdGJvb2sgcGFzc2FnZSBvYmplY3RcbiAgICovXG4gIHJlbmRlclBhc3NhZ2UgPSBhc3luYyAocGFzc2FnZSwgcmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBzcGVha2VyID0gcGFzc2FnZS5nZXRTcGVha2VyKCk7XG4gICAgbGV0IHN0YXRlbWVudHMgPSBwYXNzYWdlLnJlbmRlcigpO1xuICAgIGxldCBuZXh0ID0gc3RhdGVtZW50cy5zaGlmdCgpO1xuICAgIHRoaXMuc2hvd1R5cGluZygpO1xuICAgIHdoaWxlIChuZXh0KSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gT1RIRVJfUEFTU0FHRV9UTVBMKHtcbiAgICAgICAgc3BlYWtlcixcbiAgICAgICAgdGFnczogcGFzc2FnZS50YWdzLFxuICAgICAgICB0ZXh0OiBuZXh0XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGRlbGF5KHRoaXMuY2FsY3VsYXRlRGVsYXkobmV4dCkpOyAvLyB0b2RvXG4gICAgICBhd2FpdCByZW5kZXJlcihjb250ZW50KTtcbiAgICAgIG5leHQgPSBzdGF0ZW1lbnRzLnNoaWZ0KCk7XG4gICAgfVxuICAgIHRoaXMuaGlkZVR5cGluZygpO1xuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfTtcblxuICAvKipcbiAgICogQSByb3VnaCBmdW5jdGlvbiBmb3IgZGV0ZXJtaW5pbmcgYSB3YWl0aW5nIHBlcmlvZCBiYXNlZCBvbiBzdHJpbmcgbGVuZ3RoXG4gICAqL1xuICBjYWxjdWxhdGVEZWxheSA9IHR4dCA9PiB7XG4gICAgY29uc3QgdHlwaW5nRGVsYXlSYXRpbyA9IDAuMztcbiAgICBjb25zdCByYXRlID0gMjA7IC8vIG1zXG4gICAgcmV0dXJuIHR4dC5sZW5ndGggKiByYXRlICogdHlwaW5nRGVsYXlSYXRpbztcbiAgfTtcblxuICAvKipcbiAgICogU2hvd3MgdGhlIHR5cGluZyBpbmRpY2F0b3JcbiAgICovXG4gIHNob3dUeXBpbmcgPSAoKSA9PiB7XG4gICAgZmluZCh0aGlzLmRvY3VtZW50LCB0eXBpbmdJbmRpY2F0b3IpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgfTtcblxuICAvKipcbiAgICogSGlkZXMgdGhlIHR5cGluZyBpbmRpY2F0b3JcbiAgICovXG4gIGhpZGVUeXBpbmcgPSAoKSA9PiB7XG4gICAgZmluZCh0aGlzLmRvY3VtZW50LCB0eXBpbmdJbmRpY2F0b3IpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRoZSBkb2N1bWVudCBhcyBmYXIgYXMgcG9zc2libGUgKGJhc2VkIG9uIGhpc3RvcnkgY29udGFpbmVyJ3MgaGVpZ2h0KVxuICAgKi9cbiAgc2Nyb2xsVG9Cb3R0b20gPSAoKSA9PiB7XG4gICAgY29uc3QgaGlzdCA9IGZpbmQodGhpcy5kb2N1bWVudCwgXCIjcGhpc3RvcnlcIik7XG4gICAgZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgPSBoaXN0Lm9mZnNldEhlaWdodDtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXJzIHRoZSBjaG9pY2VzIHBhbmVsXG4gICAqL1xuICByZW1vdmVDaG9pY2VzID0gKCkgPT4ge1xuICAgIGNvbnN0IHBhbmVsID0gZmluZCh0aGlzLmRvY3VtZW50LCBzZWxlY3RSZXNwb25zZXMpO1xuICAgIHBhbmVsLmlubmVySFRNTCA9IFwiXCI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIGNob2ljZXMgcGFuZWwgd2l0aCBhIHNldCBvZiBvcHRpb25zIGJhc2VkIG9uIHBhc3NhZ2UgbGlua3NcbiAgICovXG4gIHJlbmRlckNob2ljZXMgPSBwYXNzYWdlID0+IHtcbiAgICB0aGlzLnJlbW92ZUNob2ljZXMoKTtcbiAgICBjb25zdCBwYW5lbCA9IGZpbmQodGhpcy5kb2N1bWVudCwgc2VsZWN0UmVzcG9uc2VzKTtcbiAgICBwYXNzYWdlLmxpbmtzLmZvckVhY2gobCA9PiB7XG4gICAgICBwYW5lbC5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInVzZXItcmVzcG9uc2VcIiBkYXRhLXBhc3NhZ2U9XCIke2VzY2FwZShcbiAgICAgICAgbC50YXJnZXRcbiAgICAgICl9XCI+JHtsLmRpc3BsYXl9PC9hPmA7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgYSBmcmVlLXRleHQgaW5wdXQgYmFzZWQgb24gc2hvd1Byb21wdCBzZXR0aW5nc1xuICAgKi9cbiAgcmVuZGVyVGV4dElucHV0ID0gcGFzc2FnZSA9PiB7XG4gICAgdGhpcy5yZW1vdmVDaG9pY2VzKCk7XG4gICAgY29uc3QgcGFuZWwgPSBmaW5kKHRoaXMuZG9jdW1lbnQsIHNlbGVjdFJlc3BvbnNlcyk7XG4gICAgcGFuZWwuaW5uZXJIVE1MID0gYDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwidXNlci1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiJHtcbiAgICAgIHRoaXMuc2hvd1Byb21wdC5wbGFjZWhvbGRlclxuICAgIH1cIiAvPjxidXR0b24gZGF0YS1wYXNzYWdlPVwiJHtlc2NhcGUoXG4gICAgICBwYXNzYWdlLmxpbmtzWzBdLnRhcmdldFxuICAgICl9XCI+Jmd0OzwvYnV0dG9uPmA7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgdGhlIHRleHQtaW5wdXQgaW5zdGVhZCBvZiBzdGFuZGFyZCBjaG9pY2VzXG4gICAqL1xuICBwcm9tcHQgPSAoc2F2ZUFzLCBwbGFjZWhvbGRlcikgPT4gKHRoaXMuc2hvd1Byb21wdCA9IHsgc2F2ZUFzLCBwbGFjZWhvbGRlciB9KTtcblxuICAvKipcbiAgICogRXhwb3J0IHRoZSBzdG9yeSBiYWNrIGludG8gYSAudHdlZSBmaWxlXG4gICAqL1xuICBleHBvcnRUd2VlID0gKCkgPT4gZXhwb3J0VHdlZSh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgU3Rvcnk7XG4iLCJpbXBvcnQgU3RvcnkgZnJvbSBcIi4vdHdpbmUvU3RvcnlcIjtcblxuKHdpbiA9PiB7XG4gIGlmICh0eXBlb2Ygd2luICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB3aW5kb3cuc3RvcnkgPSBuZXcgU3Rvcnkod2luKTtcbiAgICAgIHdpbmRvdy5zdG9yeS5zdGFydCgpO1xuICAgIH0pO1xuICB9XG59KSh3aW5kb3cgfHwgdW5kZWZpbmVkKTtcbiJdLCJuYW1lcyI6WyJ1bmRlZmluZWQiLCJyZXF1aXJlJCQwIiwiZ2xvYmFsIiwiU3ltYm9sIiwiSU5GSU5JVFkiLCJzeW1ib2xUYWciLCJmcmVlR2xvYmFsIiwiZnJlZVNlbGYiLCJyb290IiwiYmFzZVByb3BlcnR5T2YiLCJvYmplY3RQcm90byIsInN5bWJvbFByb3RvIiwic3ltYm9sVG9TdHJpbmciLCJyZUludGVycG9sYXRlIiwib2JqZWN0VG9TdHJpbmciLCJiYXNlVG9TdHJpbmciLCJpc1N5bWJvbCIsImlzT2JqZWN0TGlrZSIsInRvU3RyaW5nIiwidGVtcGxhdGVTZXR0aW5ncyIsInRoaXMiLCJCTE9DS19DT01NRU5UIiwiSU5MSU5FX0NPTU1FTlQiLCJJU19FWFRFUk5BTF9VUkwiLCJMSU5LX1BBVFRFUk4iLCJmaW5kU3RvcnkiLCJ3aW4iLCJzdG9yeSIsInN0YXRlIiwibm9tYXJrIiwicyIsInJlbmRlclBhc3NhZ2UiLCJwYXNzYWdlIiwic291cmNlIiwibWFya3VwIiwiaGFzVGFnIiwibWFya2VkIiwicmVzdWx0IiwidGVtcGxhdGUiLCJsaW5rcyIsInJlcGxhY2UiLCJtYXRjaCIsInQiLCJkaXNwbGF5IiwidGFyZ2V0IiwiYmFySW5kZXgiLCJpbmRleE9mIiwicmlnaHRBcnJJbmRleCIsImxlZnRBcnJJbmRleCIsInN1YnN0ciIsInRlc3QiLCJwdXNoIiwicHJvbXB0cyIsInByZWZpeFRhZyIsImxlbmd0aCIsInByb21wdCIsInRyaW0iLCJzcGxpdCIsIm1hcCIsImxpbmUiLCJQYXNzYWdlIiwiaWQiLCJuYW1lIiwidGFncyIsInNwZWFrZXJUYWciLCJmaW5kIiwic3lzdGVtVGFnIiwicGZ4IiwiYXNEaWN0IiwiZmlsdGVyIiwicmVkdWNlIiwiYSIsInRhZ0RpY3QiLCJ1bmVzY2FwZSIsImZvckVhY2giLCJzdHIiLCJ3aW5kb3ciLCJyZVVuZXNjYXBlZEh0bWwiLCJyZUhhc1VuZXNjYXBlZEh0bWwiLCJodG1sRXNjYXBlcyIsImVzY2FwZUh0bWxDaGFyIiwiZXNjYXBlIiwiVFdFRV9URU1QTEFURSIsIlBBU1NBR0VfVEVNUExBVEUiLCJzZWxlY3RQYXNzYWdlcyIsInNlbGVjdENzcyIsInNlbGVjdEpzIiwic2VsZWN0QWN0aXZlTGluayIsInNlbGVjdEFjdGl2ZUJ1dHRvbiIsInNlbGVjdEFjdGl2ZUlucHV0Iiwic2VsZWN0QWN0aXZlIiwic2VsZWN0SGlzdG9yeSIsInNlbGVjdFJlc3BvbnNlcyIsInR5cGluZ0luZGljYXRvciIsIklTX05VTUVSSUMiLCJpc051bWVyaWMiLCJkIiwiVVNFUl9QQVNTQUdFX1RNUEwiLCJ0ZXh0IiwiT1RIRVJfUEFTU0FHRV9UTVBMIiwic3BlYWtlciIsImpvaW4iLCJkZWxheSIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsImN0eCIsInF1ZXJ5U2VsZWN0b3IiLCJmaW5kQWxsIiwiX3RvQ29uc3VtYWJsZUFycmF5IiwicXVlcnlTZWxlY3RvckFsbCIsImV4cG9ydFR3ZWUiLCJzdG9yeURhdGEiLCJkb2N1bWVudCIsInBhc3NhZ2VzIiwidGl0bGUiLCJpZmlkIiwiZ2V0QXR0cmlidXRlIiwiZm9ybWF0VmVyc2lvbiIsInBrZyIsInZlcnNpb24iLCJzdGFydCIsInN0YXJ0c0F0IiwicCIsInBvc2l0aW9uIiwic2l6ZSIsImNvbnRlbnRzIiwiaW5uZXJIVE1MIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiU3RvcnkiLCJzcmMiLCJ1c2VyU3R5bGVzIiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInVzZXJTY3JpcHRzIiwiZXZhbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwibWF0Y2hlcyIsImFkdmFuY2UiLCJmaW5kUGFzc2FnZSIsInZhbHVlIiwic2hvd1Byb21wdCIsInNhdmVBcyIsImlkT3JOYW1lIiwidXNlclRleHQiLCJoaXN0b3J5IiwibGFzdCIsImN1cnJlbnQiLCJleGlzdGluZyIsImVsZW1lbnRzIiwiYWN0aXZlIiwicmVuZGVyVXNlck1lc3NhZ2UiLCJyZW5kZXJUZXh0SW5wdXQiLCJyZW5kZXJDaG9pY2VzIiwicGlkIiwicmVuZGVyZXIiLCJzY3JvbGxUb0JvdHRvbSIsImdldFNwZWFrZXIiLCJzdGF0ZW1lbnRzIiwicmVuZGVyIiwibmV4dCIsInNoaWZ0Iiwic2hvd1R5cGluZyIsImNvbnRlbnQiLCJjYWxjdWxhdGVEZWxheSIsImhpZGVUeXBpbmciLCJ0eHQiLCJ0eXBpbmdEZWxheVJhdGlvIiwicmF0ZSIsInN0eWxlIiwidmlzaWJpbGl0eSIsImhpc3QiLCJzY3JvbGxpbmdFbGVtZW50Iiwic2Nyb2xsVG9wIiwib2Zmc2V0SGVpZ2h0IiwicGFuZWwiLCJyZW1vdmVDaG9pY2VzIiwibCIsInBsYWNlaG9sZGVyIiwiaW1wbGVtZW50YXRpb24iLCJjcmVhdGVIVE1MRG9jdW1lbnQiLCJjcmVhdG9yIiwiY3JlYXRvclZlcnNpb24iLCJwYXJzZUludCIsImVsIiwiZXZlbnQiXSwibWFwcGluZ3MiOiI7Ozs7O0VBQUEsU0FBUyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtJQUM5QyxJQUFJLEVBQUUsUUFBUSxZQUFZLFdBQVcsQ0FBQyxFQUFFO01BQ3RDLE1BQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztLQUMxRDtHQUNGOztFQUVELGtCQUFjLEdBQUcsZUFBZTs7RUNOaEMsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7SUFDeEMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFO01BQ2QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO1FBQzlCLEtBQUssRUFBRSxLQUFLO1FBQ1osVUFBVSxFQUFFLElBQUk7UUFDaEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsUUFBUSxFQUFFLElBQUk7T0FDZixDQUFDLENBQUM7S0FDSixNQUFNO01B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RyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxTQUFTO09BQ1Y7OztNQUdELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNqQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9GLFNBQVM7T0FDVjs7O01BR0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ25DLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELFNBQVM7T0FDVjs7O01BR0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2pDLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQixTQUFTO09BQ1Y7OztNQUdELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxTQUFTO09BQ1Y7OztNQUdELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN2QyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1VBQ2xCLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ25DLElBQUksR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3pCLE1BQU07VUFDTCxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3RCLElBQUksR0FBRyxJQUFJLENBQUM7U0FDYjtRQUNELEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFD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
