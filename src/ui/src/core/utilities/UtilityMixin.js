import Backbone from 'backbone';
import { isHoliday } from './RtbHolidaysUtil';;

// Generic utility methods to be used as mixins  in any class, or statically from anywhere
export default {
  util_moveModelsTo(modelsToMove, toCollection, options) {
    options = options || {};
    _.each(modelsToMove, function(model) {
      if (model.collection) {
        model.collection.remove(model, options);
      }
    });
    toCollection.add(modelsToMove, options);
  },

  util_getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  util_removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');
    if (urlparts.length>=2) {
      var prefix= encodeURIComponent(parameter)+'=';
      var pars= urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (var i= pars.length; i-- > 0;) {
        //idiom for string.startsWith
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }
      url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
    }
    return url;
  },

  // Runs sequence of promises, wrapping in promise
  util_clearQueue(q, options) {
    options = options || {};
    const p = $.Deferred();
    setTimeout(p.resolve.bind(p), 0);

    let cancelled = false;
    const cancellables = [];
    const queue = q.reduce(function(prev,cur) {
      if (cancelled) {
        // If the process was cancelled, do not let any further functions fire
        return;
      }
      function cancellablePromise() {    
        let resolve, reject, _cancelled;
        function wrapWithCancel(fn) {
          return (data) => {
            if (!_cancelled) {
              return fn(data);
            }
          };
        };
        const promise = new Promise((resolveFromPromise, rejectFromPromise) => {
          resolve = resolveFromPromise;
          reject = rejectFromPromise;
        });
        
        prev
          .then(wrapWithCancel(cur), options.stop_on_error ? wrapWithCancel(cur) : () => {})
          .then(resolve)
          .then(reject);
        
        return {
          promise,
          cancel: () => {
            _cancelled = true;
            reject({ reason: 'cancelled' });
          }
        };
      };

      const { promise, cancel } = cancellablePromise();
      cancellables.push(cancel);
      return promise;
      //return options.stop_on_error ? $.when(promise).then(cur) : $.when(promise).then(cur, cur);
    }, p);

    if (options.add_cancel_listener) {
      _.extend(queue, Backbone.Events);
      queue.on('cancel:all', function() {
        cancelled = true;
        // Run the cancel functions
        cancellables.forEach(fn => fn());
      });
    }
    
    return queue;
  },

  util_debounce(method, delay) {
    clearTimeout(method._tId);
    method._tId= setTimeout(function() {
      method();
    }, delay);
  },

  util_generateUUIDv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  },

  util_hash(str) {
    str = str || '';
    let hash = 0;
    let chr;
    for (let i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },

  util_numToWords(number) {
    const arr = x => Array.from(x);
    const num = x => Number(x) || 0;
    const isEmpty = xs => xs.length === 0;
    const take = n => xs => xs.slice(0,n);
    const drop = n => xs => xs.slice(n);
    const reverse = xs => xs.slice(0).reverse();
    const comp = f => g => x => f (g (x));
    const not = x => !x;
    const chunk = n => xs =>
      isEmpty(xs) ? [] : [take(n)(xs), ...chunk (n) (drop (n) (xs))];

    const numToWords = n => {
      const a = [
        '', 'one', 'two', 'three', 'four',
        'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
        'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
      ];
      const b = [
        '', '', 'twenty', 'thirty', 'forty',
        'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
      ];
      const g = [
        '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion',
        'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'
      ];
      // this part is really nasty still
      // it might edit this again later to show how Monoids could fix this up
      const makeGroup = ([ones,tens,huns]) => {
        return [
          num(huns) === 0 ? '' : a[huns] + ' hundred ',
          num(ones) === 0 ? b[tens] : b[tens] && b[tens] + '-' || '',
          a[tens+ones] || a[ones]
        ].join('');
      };
      // "thousands" constructor; no real good names for this, i guess
      const thousand = (group,i) => group === '' ? group : `${group} ${g[i]}`;
      // execute !
      if (typeof n === 'number') return numToWords(String(n));
      if (n === '0')             return 'zero';
      return comp (chunk(3)) (reverse) (arr(n))
        .map(makeGroup)
        .map(thousand)
        .filter(comp(not)(isEmpty))
        .reverse()
        .join(' ');
    };

    return numToWords(number);
  },

  /**
   * Executes Promises sequentially.
   * @param {funcs} An array of funcs that return promises.
   */
  util_serial(funcs) {
    return funcs.reduce((promise, func) =>
        promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));
  },

  util_getFirstBusinessDay(momentStartDate) {
    const isBusinessDayFn = (momentDate) => {
      const isWeekend = [6,7].indexOf(momentDate.isoWeekday()) !== -1;
      return !isWeekend && !isHoliday(momentDate);
    }
    let dateCursor = Moment(momentStartDate);
    while (!isBusinessDayFn(dateCursor)) {
      dateCursor = dateCursor.add(1, 'day');
    }

    return dateCursor;
  },

  util_loadDataURL(resourceUrl) {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.onerror = () => rej(reader?.result);
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => rej(false);
      xhr.open('GET', resourceUrl);
      xhr.responseType = 'blob';
      xhr.send();
    });
    
  },

  util_reverseSortBy(sortByFunction) {
    return function(left, right) {
      var l = sortByFunction(left);
      var r = sortByFunction(right);

      if (l === void 0) return -1;
      if (r === void 0) return 1;

      return l < r ? 1 : l > r ? -1 : 0;
    };
  },

  util_isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  util_getCookie(cookieName) {
    const name = cookieName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded .split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
  },

  util_setCookie(cookieData={}) {
    if (!cookieData?.cookie) {
      console.log('[WARNING] Cannot set cookie, no cookie data provided');
      return;
    }
    const cookieStr = `${cookieData?.cookie};${cookieData?.expiryDate ? ` expires=${cookieData?.expiryDate}` : ''}`;
    document.cookie = cookieStr;
  }
};
